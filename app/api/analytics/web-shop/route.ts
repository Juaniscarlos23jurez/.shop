import { NextRequest, NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import * as fs from "fs";
import * as path from "path";
import { eachDayOfInterval, parseISO, format } from 'date-fns';

// Inicializar el cliente de GA4 Data API
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

function getAnalyticsClient() {
  if (!analyticsDataClient) {
    const credentialsPath = process.env.GA4_CREDENTIALS_PATH;
    if (!credentialsPath) {
      throw new Error("GA4_CREDENTIALS_PATH no está configurado en .env");
    }

    const absolutePath = path.resolve(process.cwd(), credentialsPath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Archivo de credenciales no encontrado: ${absolutePath}`);
    }

    const credentials = JSON.parse(fs.readFileSync(absolutePath, "utf8"));

    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });
  }

  return analyticsDataClient;
}

function formatEngagementTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const pagePath = searchParams.get("pagePath") ?? "";
    const startDate = searchParams.get("startDate") ?? "";
    const endDate = searchParams.get("endDate") ?? "";

    if (!pagePath || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Faltan parámetros obligatorios (pagePath, startDate, endDate)" },
        { status: 400 }
      );
    }

    const propertyId = process.env.GA4_PROPERTY_ID;
    if (!propertyId) {
      return NextResponse.json(
        { error: "GA4_PROPERTY_ID no está configurado" },
        { status: 500 }
      );
    }

    const client = getAnalyticsClient();

    // 1. Obtener métricas totales para el período
    const [totalResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "userEngagementDuration" },
        { name: "eventCount" },
        { name: "conversions" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "BEGINS_WITH",
            value: pagePath,
          },
        },
      },
    });

    let totalMetrics = null;
    if (totalResponse.rows && totalResponse.rows.length > 0) {
      const row = totalResponse.rows[0];
      const views = parseInt(row.metricValues?.[0]?.value || "0");
      const activeUsers = parseInt(row.metricValues?.[1]?.value || "0");
      const totalEngagementTime = parseInt(row.metricValues?.[2]?.value || "0");
      const eventCount = parseInt(row.metricValues?.[3]?.value || "0");
      const keyEvents = parseInt(row.metricValues?.[4]?.value || "0");

      totalMetrics = {
        views,
        activeUsers,
        viewsPerUser: activeUsers > 0 ? parseFloat((views / activeUsers).toFixed(2)) : 0,
        avgEngagementTime: formatEngagementTime(
          activeUsers > 0 ? totalEngagementTime / activeUsers : 0
        ),
        eventCount,
        keyEvents,
        totalRevenue: 0, // GA4 no tiene revenue directo sin ecommerce
      };
    }

    // 2. Obtener serie temporal (métricas por día)
    const [timeSeriesResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "eventCount" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "BEGINS_WITH",
            value: pagePath,
          },
        },
      },
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    });

    // Procesar la respuesta para llenar los días faltantes con ceros
    const dataMap = new Map();
    timeSeriesResponse.rows?.forEach((row) => {
      const dateStr = row.dimensionValues?.[0]?.value || "";
      // GA4 devuelve YYYYMMDD
      const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;

      dataMap.set(formattedDate, {
        views: parseInt(row.metricValues?.[0]?.value || "0"),
        users: parseInt(row.metricValues?.[1]?.value || "0"),
        events: parseInt(row.metricValues?.[2]?.value || "0"),
      });
    });

    let pageMetrics = [];

    try {
      // Generar todos los días en el rango
      const allDates = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate)
      });

      pageMetrics = allDates.map((dateObj) => {
        const date = format(dateObj, 'yyyy-MM-dd');
        const metrics = dataMap.get(date) || { views: 0, users: 0, events: 0 };

        return {
          date,
          ...metrics
        };
      });
    } catch (e) {
      console.error("Error generating date range:", e);
      // Fallback a los datos crudos si falla la generación de fechas
      pageMetrics = timeSeriesResponse.rows?.map((row) => {
        const dateStr = row.dimensionValues?.[0]?.value || "";
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);

        return {
          date: `${year}-${month}-${day}`,
          views: parseInt(row.metricValues?.[0]?.value || "0"),
          users: parseInt(row.metricValues?.[1]?.value || "0"),
          events: parseInt(row.metricValues?.[2]?.value || "0"),
        };
      }) || [];
    }

    // 3. Obtener ubicaciones (ciudades)
    const [locationsResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "city" }, { name: "country" }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "BEGINS_WITH",
            value: pagePath,
          },
        },
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    });

    const locations =
      locationsResponse.rows?.map((row) => ({
        city: row.dimensionValues?.[0]?.value || "Unknown",
        country: row.dimensionValues?.[1]?.value || "Unknown",
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        views: parseInt(row.metricValues?.[1]?.value || "0"),
      })) || [];

    // 4. Obtener dispositivos
    const [devicesResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "BEGINS_WITH",
            value: pagePath,
          },
        },
      },
    });

    const deviceBreakdown = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    };

    devicesResponse.rows?.forEach((row) => {
      const device = row.dimensionValues?.[0]?.value?.toLowerCase() || "";
      const users = parseInt(row.metricValues?.[0]?.value || "0");

      if (device === "desktop") deviceBreakdown.desktop = users;
      else if (device === "mobile") deviceBreakdown.mobile = users;
      else if (device === "tablet") deviceBreakdown.tablet = users;
    });

    // 5. Obtener evento específico de checkout WhatsApp (SIN filtro de página primero)
    const [checkoutEventAllPagesResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }, { name: "pagePath" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: {
            matchType: "EXACT",
            value: "click_proceder_pago_whatsapp",
          },
        },
      },
    });

    console.log('[Analytics Debug] Checkout Event (All Pages):', JSON.stringify(checkoutEventAllPagesResponse.rows, null, 2));

    // Ahora con filtro de página
    const [checkoutEventResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            {
              filter: {
                fieldName: "pagePath",
                stringFilter: {
                  matchType: "BEGINS_WITH",
                  value: pagePath,
                },
              },
            },
            {
              filter: {
                fieldName: "eventName",
                stringFilter: {
                  matchType: "EXACT",
                  value: "click_proceder_pago_whatsapp",
                },
              },
            },
          ],
        },
      },
    });

    const checkoutWhatsappCount = parseInt(
      checkoutEventResponse.rows?.[0]?.metricValues?.[0]?.value || "0"
    );

    console.log('[Analytics Debug] Checkout WhatsApp Count (filtered by page):', checkoutWhatsappCount);
    console.log('[Analytics Debug] Checkout Event Response (filtered):', JSON.stringify(checkoutEventResponse.rows, null, 2));
    console.log('[Analytics Debug] Page Path filter:', pagePath);

    // 6. Obtener todos los eventos del período
    const [allEventsResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "BEGINS_WITH",
            value: pagePath,
          },
        },
      },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 20,
    });

    const totalEvents = allEventsResponse.rows?.reduce(
      (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || "0"),
      0
    ) || 1;

    const allEvents =
      allEventsResponse.rows?.map((row) => {
        const count = parseInt(row.metricValues?.[0]?.value || "0");
        return {
          name: row.dimensionValues?.[0]?.value || "Unknown",
          count,
          percent: Math.round((count / totalEvents) * 100),
        };
      }) || [];

    // Asegurar que el evento de checkout esté en la lista si tiene datos
    if (checkoutWhatsappCount > 0) {
      const checkoutIndex = allEvents.findIndex(e => e.name === 'click_proceder_pago_whatsapp');

      if (checkoutIndex === -1) {
        // Si no está, lo agregamos
        allEvents.push({
          name: 'click_proceder_pago_whatsapp',
          count: checkoutWhatsappCount,
          percent: 0 // Se recalculará abajo
        });
      } else {
        // Si está, nos aseguramos que tenga el count correcto (el mayor de los dos)
        allEvents[checkoutIndex].count = Math.max(allEvents[checkoutIndex].count, checkoutWhatsappCount);
      }

      // Reordenar por count descendente
      allEvents.sort((a, b) => b.count - a.count);

      // Recalcular porcentajes con el nuevo total
      const newTotalEvents = allEvents.reduce((sum, e) => sum + e.count, 0);
      allEvents.forEach(e => {
        e.percent = Math.round((e.count / newTotalEvents) * 100);
      });
    }

    console.log('[Analytics Debug] All Events:', JSON.stringify(allEvents, null, 2));

    // 7. Obtener datos en tiempo real (últimos 30 minutos)
    let realtimeData = null;
    try {
      const [realtimeResponse] = await client.runRealtimeReport({
        property: `properties/${propertyId}`,
        dimensions: [],
        metrics: [{ name: "activeUsers" }],
        minuteRanges: [{ name: "0-30 minutes ago", startMinutesAgo: 30, endMinutesAgo: 0 }],
      });

      const activeUsersLast30Min = parseInt(
        realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || "0"
      );

      // Últimos 5 minutos
      const [realtime5MinResponse] = await client.runRealtimeReport({
        property: `properties/${propertyId}`,
        dimensions: [],
        metrics: [{ name: "activeUsers" }],
        minuteRanges: [{ name: "0-5 minutes ago", startMinutesAgo: 5, endMinutesAgo: 0 }],
      });

      const activeUsersLast5Min = parseInt(
        realtime5MinResponse.rows?.[0]?.metricValues?.[0]?.value || "0"
      );

      // Top sources en tiempo real
      const [realtimeSourcesResponse] = await client.runRealtimeReport({
        property: `properties/${propertyId}`,
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "activeUsers" }],
        minuteRanges: [{ name: "0-30 minutes ago", startMinutesAgo: 30, endMinutesAgo: 0 }],
        limit: 5,
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      });

      const totalRealtimeUsers = realtimeSourcesResponse.rows?.reduce(
        (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || "0"),
        0
      ) || 1;

      const topSources =
        realtimeSourcesResponse.rows?.map((row) => {
          const users = parseInt(row.metricValues?.[0]?.value || "0");
          return {
            source: row.dimensionValues?.[0]?.value || "Unknown",
            users,
            percent: Math.round((users / totalRealtimeUsers) * 100),
          };
        }) || [];

      // Top events en tiempo real
      const [realtimeEventsResponse] = await client.runRealtimeReport({
        property: `properties/${propertyId}`,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        minuteRanges: [{ name: "0-30 minutes ago", startMinutesAgo: 30, endMinutesAgo: 0 }],
        limit: 5,
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      });

      const totalRealtimeEvents = realtimeEventsResponse.rows?.reduce(
        (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || "0"),
        0
      ) || 1;

      const topEvents =
        realtimeEventsResponse.rows?.map((row) => {
          const count = parseInt(row.metricValues?.[0]?.value || "0");
          return {
            name: row.dimensionValues?.[0]?.value || "Unknown",
            count,
            percent: Math.round((count / totalRealtimeEvents) * 100),
          };
        }) || [];

      realtimeData = {
        activeUsersLast30Min,
        activeUsersLast5Min,
        topSources,
        topEvents,
      };
    } catch (realtimeError) {
      console.error("Error fetching realtime data:", realtimeError);
      // Si falla el realtime, continuamos sin esos datos
    }

    const responsePayload = {
      pageMetrics,
      totalMetrics,
      realtimeData,
      locations,
      deviceBreakdown,
      checkoutWhatsappCount,
      allEvents,
    };

    console.log('[Analytics Debug] Response Payload:', JSON.stringify({
      pageMetricsCount: pageMetrics.length,
      totalMetrics: totalMetrics ? 'present' : 'null',
      realtimeData: realtimeData ? 'present' : 'null',
      locationsCount: locations.length,
      deviceBreakdown,
      checkoutWhatsappCount,
      allEventsCount: allEvents.length,
    }, null, 2));

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Error en API de analytics:", error);
    return NextResponse.json(
      {
        error: "Error al obtener datos de Google Analytics",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
