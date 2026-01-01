"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import * as Lucide from "lucide-react";
const { Monitor, TrendingUp, Users, Eye, Clock, Zap, MapPin, Smartphone, Tablet } = Lucide as any;
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";

// Tipos
type TimeSeriesData = {
  date: string;
  views: number;
  users: number;
  events: number;
};

type TotalMetrics = {
  views: number;
  activeUsers: number;
  viewsPerUser: number;
  avgEngagementTime: string;
  eventCount: number;
  keyEvents: number;
  totalRevenue: number;
};

type RealtimeData = {
  activeUsersLast30Min: number;
  activeUsersLast5Min: number;
  topSources: { source: string; users: number; percent: number }[];
  topEvents: { name: string; count: number; percent: number }[];
};

type LocationData = {
  city: string;
  country: string;
  users: number;
  views: number;
};

type DeviceBreakdown = {
  desktop: number;
  mobile: number;
  tablet: number;
};

// Lista de páginas disponibles será cargada dinámicamente
// const AVAILABLE_PAGES = ...

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function WebShopStorePage() {
  const { token } = useAuth();
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [companySlug, setCompanySlug] = useState<string>("");
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all' | 'custom'>('7d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Cargar sucursales y slug de la compañía
  useEffect(() => {
    if (!token) return;

    const loadCompanyData = async () => {
      try {
        console.log('[WebShopStore] Iniciando carga de datos...');
        const [compRes, locRes] = await Promise.all([
          api.userCompanies.get(token),
          api.userCompanies.getLocations(token)
        ]);

        console.log('[WebShopStore] Company Response:', compRes);
        console.log('[WebShopStore] Locations Response:', locRes);

        let slug = "";
        if (compRes.success && compRes.data) {
          const d = compRes.data as any;
          // Extraer slug con múltiples fallbacks según la estructura del API
          slug = d.company?.slug || d.data?.company?.slug || d.slug || d.data?.slug || "";
          console.log('[WebShopStore] Slug detectado:', slug);
          if (slug) setCompanySlug(slug);
        }

        if (locRes.success && locRes.data) {
          const d = locRes.data as any;
          // Extraer locations: puede venir en .locations, .data.locations, o ser el array directo en .data
          const fetchedLocations = d.locations || d.data?.locations || (Array.isArray(d) ? d : (Array.isArray(d.data) ? d.data : []));

          console.log('[WebShopStore] Sucursales detectadas:', fetchedLocations.length, fetchedLocations);
          setAvailableLocations(fetchedLocations);

          // Si hay sucursales y slug, seleccionar la primera por defecto
          if (fetchedLocations.length > 0 && slug) {
            const firstPage = `/rewin/${slug}/${fetchedLocations[0].id}`;
            console.log('[WebShopStore] Seleccionando página inicial:', firstPage);
            setSelectedPage(firstPage);
          }
        } else if (locRes.success && (locRes as any).locations) {
          // Caso borde donde locations está en la raíz del response
          const fetchedLocations = (locRes as any).locations;
          setAvailableLocations(fetchedLocations);
          if (fetchedLocations.length > 0 && slug) {
            setSelectedPage(`/rewin/${slug}/${fetchedLocations[0].id}`);
          }
        }
      } catch (err) {
        console.error("[WebShopStore] Error al cargar datos de la tienda web:", err);
      }
    };

    loadCompanyData();
  }, [token]);

  // Estados para datos del API
  const [pageMetrics, setPageMetrics] = useState<TimeSeriesData[]>([]);
  const [totalMetrics, setTotalMetrics] = useState<TotalMetrics | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdown>({ desktop: 0, mobile: 0, tablet: 0 });
  const [checkoutWhatsappCount, setCheckoutWhatsappCount] = useState<number>(0);
  const [allEvents, setAllEvents] = useState<{ name: string; count: number; percent: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cache para evitar re-consultas innecesarias
  const [analyticsCache, setAnalyticsCache] = useState<Record<string, any>>({});

  // Calcular el count de checkout desde allEvents como fallback
  const checkoutEventFromList = allEvents.find(e => e.name === 'click_proceder_pago_whatsapp');
  const finalCheckoutCount = checkoutWhatsappCount > 0 ? checkoutWhatsappCount : (checkoutEventFromList?.count || 0);

  const shareUrl = `https://fynlink.shop${selectedPage}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Enlace copiado al portapapeles');
    } catch (error) {
      console.error("No se pudo copiar el enlace", error);
    }
  };

  // Calcular fechas según el rango seleccionado
  const getDateRangeParams = () => {
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }

    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case '7d': start.setDate(end.getDate() - 7); break;
      case '30d': start.setDate(end.getDate() - 30); break;
      case '90d': start.setDate(end.getDate() - 90); break;
      case 'all': start.setFullYear(end.getFullYear() - 1); break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  // Fetch data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedPage) return;

      const { startDate, endDate } = getDateRangeParams();
      const cacheKey = `${selectedPage}-${startDate}-${endDate}`;

      // Intentar cargar desde cache primero
      if (analyticsCache[cacheKey]) {
        console.log('[Analytics Cache] Usando datos cacheados para:', cacheKey);
        const cached = analyticsCache[cacheKey];
        setPageMetrics(cached.pageMetrics);
        setTotalMetrics(cached.totalMetrics);
        setRealtimeData(cached.realtimeData);
        setLocations(cached.locations);
        setDeviceBreakdown(cached.deviceBreakdown);
        setCheckoutWhatsappCount(cached.checkoutWhatsappCount);
        setAllEvents(cached.allEvents);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          pagePath: selectedPage,
          startDate,
          endDate,
        });

        const response = await fetch(`/api/analytics/web-shop?${params}`);
        if (!response.ok) {
          throw new Error('Error al obtener datos de analytics');
        }

        const data = await response.json();
        console.log('[Frontend Debug] API Response:', data);

        // Actualizar estados
        setPageMetrics(data.pageMetrics || []);
        setTotalMetrics(data.totalMetrics);
        setRealtimeData(data.realtimeData);
        setLocations(data.locations || []);
        setDeviceBreakdown(data.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0 });
        setCheckoutWhatsappCount(data.checkoutWhatsappCount || 0);
        setAllEvents(data.allEvents || []);

        // Guardar en cache
        setAnalyticsCache(prev => ({
          ...prev,
          [cacheKey]: {
            ...data,
            pageMetrics: data.pageMetrics || [],
            locations: data.locations || [],
            deviceBreakdown: data.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0 },
            allEvents: data.allEvents || []
          }
        }));
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPage, dateRange, customStartDate, customEndDate, analyticsCache]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Datos en tiempo real de Google Analytics
              </p>
            </div>
          </div>
        </div>

        {/* Selector de página */}
        <Card className="mb-8 shadow-sm border border-slate-200 bg-white">
          <CardHeader className="border-b bg-slate-50/60 dark:bg-slate-900/40">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Monitor className="h-6 w-6 text-blue-600" />
              Seleccionar Página
            </CardTitle>
            <CardDescription className="text-base">Elige una URL de /rewin para ver sus métricas detalladas</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="w-full md:w-96 h-12 text-base border border-slate-200 hover:border-emerald-500 transition-colors">
                <SelectValue placeholder="Selecciona una página" />
              </SelectTrigger>
              <SelectContent>
                {availableLocations.map((loc) => {
                  const path = `/rewin/${companySlug}/${loc.id}`;
                  return (
                    <SelectItem key={loc.id} value={path} className="text-base">
                      {loc.name} ({path})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.5fr_minmax(0,1fr)] items-start">
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">URL pública</p>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
                  <span className="truncate">{shareUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="ml-auto inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    Copiar enlace
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">QR de la URL</p>
                <div className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`}
                    alt="QR de la URL pública"
                    className="h-28 w-28"
                  />
                </div>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shareUrl)}`}
                  download="qr-fynlink.png"
                  className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
                >
                  Descargar QR
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros de rango de fechas */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
              Rango de fechas
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Afecta las métricas y gráficas mostradas
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-3">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === '7d'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === '30d'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
            >
              Últimos 30 días
            </button>
            <button
              onClick={() => setDateRange('90d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === '90d'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
            >
              Últimos 90 días
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === 'custom'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
            >
              Personalizado
            </button>
          </div>
        </div>

        {dateRange === 'custom' && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fecha inicio</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fecha fin</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-slate-600">Cargando datos de Google Analytics...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {error && !loading && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-red-600 font-semibold mb-2">Error al cargar datos</p>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No data state */}
        {!loading && !error && !totalMetrics && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-slate-600">No hay datos disponibles para esta página en el rango de fechas seleccionado.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Métricas totales */}
        {!loading && !error && totalMetrics && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="shadow-sm border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    Vistas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{totalMetrics.views}</div>
                  <p className="text-xs text-slate-500 mt-1">{totalMetrics.viewsPerUser.toFixed(2)} por usuario</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    Usuarios Activos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{totalMetrics.activeUsers}</div>
                  <p className="text-xs text-slate-500 mt-1">Usuarios únicos</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    Tiempo de Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{totalMetrics.avgEngagementTime}</div>
                  <p className="text-xs text-slate-500 mt-1">Promedio por usuario</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{totalMetrics.eventCount}</div>
                  <p className="text-xs text-slate-500 mt-1">{totalMetrics.keyEvents} conversiones</p>
                </CardContent>
              </Card>
            </div>

            {/* Dispositivos */}
            <Card className="mb-8 shadow-sm border border-slate-200">
              <CardHeader className="border-b bg-slate-50/60">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Monitor className="h-6 w-6 text-blue-600" />
                  Dispositivos
                </CardTitle>
                <CardDescription>Distribución de usuarios por tipo de dispositivo</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50">
                    <div className="flex items-center justify-between mb-3">
                      <Monitor className="h-8 w-8 text-blue-600" />
                      <Badge className="bg-blue-600 text-white">Desktop</Badge>
                    </div>
                    <div className="text-4xl font-bold text-blue-900 mb-1">{deviceBreakdown.desktop}</div>
                    <p className="text-sm text-blue-700">usuarios</p>
                  </div>

                  <div className="p-6 rounded-xl border-2 border-green-200 bg-green-50">
                    <div className="flex items-center justify-between mb-3">
                      <Smartphone className="h-8 w-8 text-green-600" />
                      <Badge className="bg-green-600 text-white">Mobile</Badge>
                    </div>
                    <div className="text-4xl font-bold text-green-900 mb-1">{deviceBreakdown.mobile}</div>
                    <p className="text-sm text-green-700">usuarios</p>
                  </div>

                  <div className="p-6 rounded-xl border-2 border-orange-200 bg-orange-50">
                    <div className="flex items-center justify-between mb-3">
                      <Tablet className="h-8 w-8 text-orange-600" />
                      <Badge className="bg-orange-600 text-white">Tablet</Badge>
                    </div>
                    <div className="text-4xl font-bold text-orange-900 mb-1">{deviceBreakdown.tablet}</div>
                    <p className="text-sm text-orange-700">usuarios</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráfica de serie temporal */}
            {pageMetrics.length > 0 && (
              <Card className="mb-8 shadow-sm border border-slate-200">
                <CardHeader className="border-b bg-slate-50/60">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                    Tendencia Temporal
                  </CardTitle>
                  <CardDescription>Vistas, usuarios y eventos por día</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={pageMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} name="Vistas" />
                      <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} name="Usuarios" />
                      <Line type="monotone" dataKey="events" stroke="#f59e0b" strokeWidth={2} name="Eventos" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Actividad en tiempo real */}
        {!loading && !error && realtimeData && (
          <Card className="mb-8 shadow-sm border border-slate-200 bg-white">
            <CardHeader className="border-b bg-slate-50/60 dark:bg-slate-900/40">
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
                Actividad en tiempo real
              </CardTitle>
              <CardDescription className="text-base">
                Usuarios activos y eventos recientes de la tienda web
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Usuarios activos */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Usuarios activos</h3>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:bg-slate-900 dark:border-slate-800">
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Últimos 30 min</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                      {realtimeData.activeUsersLast30Min}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-wide text-slate-500 mb-1">Últimos 5 min</p>
                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {realtimeData.activeUsersLast5Min}
                    </p>
                  </div>
                </div>

                {/* Fuentes principales */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Fuentes principales</h3>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 dark:bg-slate-900 dark:border-slate-800">
                    {realtimeData.topSources.map((source) => (
                      <div key={source.source} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-200">{source.source}</span>
                        <span className="text-xs text-slate-500">{source.users} usuarios · {source.percent}%</span>
                      </div>
                    ))}
                    {realtimeData.topSources.length === 0 && (
                      <p className="text-xs text-slate-500">Sin datos recientes de fuentes.</p>
                    )}
                  </div>
                </div>

                {/* Eventos principales */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Eventos principales</h3>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 max-h-60 overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
                    {realtimeData.topEvents.map((event) => (
                      <div key={event.name} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-200">{event.name}</span>
                        <span className="text-xs text-slate-500">{event.count} · {event.percent}%</span>
                      </div>
                    ))}
                    {realtimeData.topEvents.length === 0 && (
                      <p className="text-xs text-slate-500">Sin eventos recientes.</p>
                    )}
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        {/* Evento especial: Checkout WhatsApp */}
        {!loading && !error && totalMetrics && (
          <Card className="mb-8 shadow-sm border-2 border-emerald-200 bg-emerald-50">
            <CardHeader className="border-b border-emerald-200 bg-emerald-100/50">
              <CardTitle className="flex items-center gap-2 text-xl text-emerald-900">
                <Zap className="h-6 w-6 text-emerald-600" />
                Clicks en Checkout WhatsApp
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Usuarios que iniciaron el proceso de pago por WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-emerald-600 mb-2">{finalCheckoutCount}</div>
                  <p className="text-sm text-emerald-700">
                    {finalCheckoutCount === 0
                      ? "No hay clicks registrados en este período"
                      : "Clicks totales en el período seleccionado"}
                  </p>
                  {checkoutEventFromList && checkoutWhatsappCount === 0 && (
                    <p className="text-xs text-emerald-600 mt-2">
                      ℹ️ Dato obtenido de la lista de eventos
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Todos los eventos del período */}
        {!loading && !error && allEvents.length > 0 && (
          <Card className="mb-8 shadow-sm border border-slate-200">
            <CardHeader className="border-b bg-slate-50/60">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-6 w-6 text-orange-600" />
                Todos los Eventos del Período
              </CardTitle>
              <CardDescription>Eventos registrados en el rango de fechas seleccionado</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {allEvents.map((event, idx) => (
                  <div
                    key={`${event.name}-${idx}`}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${event.name === 'click_proceder_pago_whatsapp'
                      ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${event.name === 'click_proceder_pago_whatsapp'
                        ? 'bg-emerald-200 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                        }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${event.name === 'click_proceder_pago_whatsapp'
                          ? 'text-emerald-900'
                          : 'text-slate-900'
                          }`}>
                          {event.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg text-slate-900">{event.count}</p>
                        <p className="text-xs text-slate-500">eventos</p>
                      </div>
                      <Badge className={
                        event.name === 'click_proceder_pago_whatsapp'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-600 text-white'
                      }>
                        {event.percent}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ciudades */}
        {!loading && !error && locations.length > 0 && (
          <Card className="mb-8 shadow-sm border border-slate-200">
            <CardHeader className="border-b bg-slate-50/60">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-6 w-6 text-purple-600" />
                Ubicaciones Principales
              </CardTitle>
              <CardDescription>Ciudades desde donde se visita esta página</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {locations.map((location, idx) => (
                  <div
                    key={`${location.city}-${location.country}-${idx}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{location.city}</p>
                        <p className="text-xs text-slate-500">{location.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-900">{location.views}</p>
                      <p className="text-xs text-slate-500">{location.users} usuarios</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
