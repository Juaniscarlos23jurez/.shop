'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';

// Components
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MetricsCard } from "@/components/cards/metrics-card";
import { SalesChart } from "@/components/charts/sales-chart";
import { ConversionChart } from "@/components/charts/conversion-chart";
import { ActivityFeed, type ActivityItem } from "@/components/activity/activity-feed";
import { QuickStats } from "@/components/cards/quick-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

// Local state for API-driven data
type SalesPoint = { month: string; sales: number; revenue: number };

const defaultSalesData: SalesPoint[] = [];
const defaultConversionData = [
  { day: "Lun", conversions: 0 },
  { day: "Mar", conversions: 0 },
  { day: "Mié", conversions: 0 },
  { day: "Jue", conversions: 0 },
  { day: "Vie", conversions: 0 },
  { day: "Sáb", conversions: 0 },
  { day: "Dom", conversions: 0 },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, token } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [locations, setLocations] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<SalesPoint[]>(defaultSalesData);
  const [conversionData, setConversionData] = useState(defaultConversionData);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Array<{
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: 'dollar' | 'users' | 'shopping-cart' | 'message-square';
    bgColor: string;
    iconColor: string;
    description?: string;
  }>>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Load company, locations and dashboard stats
  useEffect(() => {
    const load = async () => {
      if (loading) return;
      if (!user || !token) return;
      setIsLoadingData(true);
      setError(null);

      try {
        // Determine company id
        let cId = user.company_id;
        if (!cId) {
          const compRes = await api.userCompanies.get(token);
          const cData: any = compRes.data;
          if (cData) {
            if (cData.data?.id !== undefined) cId = String(cData.data.id);
            else if (cData.id !== undefined) cId = String(cData.id);
            else if (cData.company?.id !== undefined) cId = String(cData.company.id);
          }
        }
        if (!cId) throw new Error('No company ID asociado al usuario.');
        setCompanyId(String(cId));

        // Parallel fetches (tolerant)
        const [locRes, salesStatsRes, orderStatsRes, followersRes, recentSalesRes] = await Promise.allSettled([
          api.userCompanies.getLocations(token),
          api.sales.getStatistics({}, token),
          api.orders.getOrderStatistics(String(cId), token),
          api.userCompanies.getFollowers(token),
          api.sales.listSales({ per_page: 10, page: 1 }, token)
        ]);

        // Locations shape as in reportes page
        if (locRes.status === 'fulfilled' && (locRes.value as any)?.success) {
          const locs = (locRes.value as any)?.data?.locations ?? [];
          setLocations(Array.isArray(locs) ? locs : []);
        }

        // Build metrics safely
        const salesDataObj = salesStatsRes.status === 'fulfilled' ? (salesStatsRes.value as any)?.data : null;
        // Support shapes like { total_revenue, total_sales, average_sale }
        const totalSales = Number(
          salesDataObj?.total_revenue ??
          salesDataObj?.total_sales_amount ??
          salesDataObj?.total_amount ??
          salesDataObj?.summary?.total_amount ?? 0
        );
        const totalSalesCount = Number(salesDataObj?.total_sales ?? salesDataObj?.count ?? 0);
        const averageSale = Number(salesDataObj?.average_sale ?? 0);

        const orderStatsObj = orderStatsRes.status === 'fulfilled' ? (orderStatsRes.value as any)?.data : null;
        const ordersCount = Number(orderStatsObj?.total_orders ?? orderStatsObj?.summary?.total ?? 0);
        const readyCount = Number(orderStatsObj?.status_counts?.ready ?? 0);
        const completedCount = Number(orderStatsObj?.status_counts?.completed ?? 0);

        // Followers: shape like clientes page -> response.data (wrapper) -> .data.summary.total_followers
        let followersCount = 0;
        if (followersRes.status === 'fulfilled') {
          const fw = followersRes.value as any;
          const wrapper = fw?.data; // { status, data, message }
          const summary = wrapper?.data?.summary || fw?.data?.summary; // try both shapes
          followersCount = Number(summary?.total_followers ?? 0);
        }

        const currency = (salesDataObj?.currency || 'MXN') as string;
        const fmtCurrency = (n: number) =>
          new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(Number(n || 0));

        setMetrics([
          {
            title: 'Ventas Totales',
            value: fmtCurrency(totalSales),
            change: '+0%',
            trend: 'up',
            icon: 'dollar',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            description: `ventas: ${totalSalesCount} • ticket prom: ${fmtCurrency(averageSale)}`
          },
          {
            title: 'Usuarios (Seguidores)',
            value: String(followersCount),
            change: '+0%',
            trend: 'up',
            icon: 'users',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            description: 'total seguidores'
          },
          {
            title: 'Pedidos',
            value: String(ordersCount),
            change: '+0%',
            trend: 'up',
            icon: 'shopping-cart',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
            description: `listos: ${readyCount} • completados: ${completedCount}`
          },
          {
            title: 'Sedes (Locations)',
            value: String(locations?.length || 0),
            change: '+0%',
            trend: 'up',
            icon: 'message-square',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
            description: 'total de sucursales'
          }
        ]);

        // Build chart data from statistics if available
        const monthly = (salesDataObj?.monthly || salesDataObj?.per_month || []) as Array<any>;
        if (Array.isArray(monthly) && monthly.length) {
          const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
          const points: SalesPoint[] = monthly.map((m: any) => ({
            month: m.month_name || monthNames[(Number(m.month) - 1 + 12) % 12] || String(m.month),
            sales: Number(m.total_sales || m.count || 0),
            revenue: Number(m.total_amount || m.revenue || 0)
          }));
          setSalesData(points);
        } else {
          setSalesData(defaultSalesData);
        }

        // Activities placeholder – could be mapped from recent orders/sales if endpoints exist
        setActivities([]);

        // Recent sales list
        if (recentSalesRes.status === 'fulfilled' && (recentSalesRes.value as any)?.success) {
          const list = (recentSalesRes.value as any)?.data?.data || [];
          setRecentSales(Array.isArray(list) ? list : []);
        } else {
          setRecentSales([]);
        }
      } catch (e: any) {
        console.error('[Dashboard] load error', e);
        setError(e?.message || 'Error al cargar el dashboard');
      } finally {
        setIsLoadingData(false);
      }
    };
    load();
  }, [loading, user, token]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          title="Dashboard Principal" 
          description="Bienvenido de vuelta, aquí tienes un resumen de tu negocio"
        >
          <button
            type="button"
            className="-m-2.5 p-2.5 rounded-md text-gray-700 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
          </button>
        </Header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {isLoadingData && (
            <div className="mb-6 p-4 rounded-md bg-white border border-gray-200">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-500"></div>
                <span>Cargando datos...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {metrics.map((metric, index) => (
              <MetricsCard
                key={index}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={metric.icon}
                bgColor={metric.bgColor}
                iconColor={metric.iconColor}
                description={metric.description || ''}
              />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SalesChart 
              data={salesData}
              title="Ventas Mensuales"
              description="Evolución de ventas"
              change=""
            />

            <ConversionChart 
              data={conversionData}
              title="Conversiones Semanales"
              description="Tasa de conversión (placeholder)"
              average="-"
            />
          </div>

          {/* Recent Sales */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <div className="text-sm text-gray-500">No hay ventas recientes.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Fecha</th>
                        <th className="py-2 px-3">Sucursal</th>
                        <th className="py-2 px-3 text-right">Total</th>
                        <th className="py-2 px-3">Pago</th>
                        <th className="py-2 px-3">Venta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSales.map((s, idx) => {
                        const currency = (s.currency || 'MXN') as string;
                        const total = Number(s.total_amount ?? s.total ?? s.amount ?? 0);
                        const totalFmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(total);
                        const dateStr = s.created_at || s.date || s.createdAt || null;
                        const dateFmt = dateStr ? format(new Date(dateStr), 'dd/MM/yyyy HH:mm') : '-';
                        const locationName = s.location?.name || s.location_name || '-';
                        const paymentStatus = (s.payment_status || '').toString();
                        const saleStatus = (s.sale_status || '').toString();

                        const paymentBadgeClass = paymentStatus === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700';

                        const saleBadgeClass = saleStatus === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : saleStatus === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700';

                        return (
                          <tr key={s.id ?? idx} className="border-b last:border-0">
                            <td className="py-2 px-3">{s.id ?? idx + 1}</td>
                            <td className="py-2 px-3">{dateFmt}</td>
                            <td className="py-2 px-3">{locationName}</td>
                            <td className="py-2 px-3 text-right font-medium">{totalFmt}</td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${paymentBadgeClass}`}>
                                {paymentStatus || '—'}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${saleBadgeClass}`}>
                                {saleStatus || '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityFeed activities={activities} />
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
