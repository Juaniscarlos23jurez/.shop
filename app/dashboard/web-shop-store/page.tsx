"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, TrendingUp, Users, Eye, Clock, Zap, DollarSign, MapPin } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

type LocationData = {
  city: string;
  state: string;
  country: string;
  users: number;
  views: number;
  avgEngagementTime: string;
  lat: number;
  lng: number;
};

type TimeSeriesData = {
  date: string;
  views: number;
  users: number;
};

type PageMetrics = {
  pagePath: string;
  views: number;
  viewsPercent: number;
  activeUsers: number;
  activeUsersPercent: number;
  viewsPerUser: number;
  avgEngagementTime: string;
  eventCount: number;
  eventCountPercent: number;
  keyEvents: number;
  totalRevenue: number;
  bounceRate: number;
  newUsers: number;
  returningUsers: number;
  avgSessionDuration: string;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  locations: LocationData[];
  timeSeries: TimeSeriesData[];
};

const mockData: PageMetrics[] = [
  {
    pagePath: "/rewin/miel-de-sol/1",
    views: 12,
    viewsPercent: 4.56,
    activeUsers: 4,
    activeUsersPercent: 23.53,
    viewsPerUser: 3.0,
    avgEngagementTime: "55 s",
    eventCount: 24,
    eventCountPercent: 4.44,
    keyEvents: 0,
    totalRevenue: 0.0,
    bounceRate: 25.0,
    newUsers: 3,
    returningUsers: 1,
    avgSessionDuration: "1 min 15 s",
    deviceBreakdown: {
      desktop: 8,
      mobile: 3,
      tablet: 1,
    },
    locations: [
      { city: "Tehuacán", state: "Puebla", country: "México", users: 2, views: 6, avgEngagementTime: "1 min 2 s", lat: 18.4628, lng: -97.3931 },
      { city: "Puebla", state: "Puebla", country: "México", users: 1, views: 4, avgEngagementTime: "45 s", lat: 19.0414, lng: -98.2063 },
      { city: "Ciudad de México", state: "CDMX", country: "México", users: 1, views: 2, avgEngagementTime: "30 s", lat: 19.4326, lng: -99.1332 },
    ],
    timeSeries: [
      { date: "18 Nov", views: 2, users: 1 },
      { date: "19 Nov", views: 1, users: 1 },
      { date: "20 Nov", views: 3, users: 2 },
      { date: "21 Nov", views: 2, users: 1 },
      { date: "22 Nov", views: 3, users: 2 },
      { date: "23 Nov", views: 1, users: 1 },
    ],
  },
  {
    pagePath: "/rewin/miel-de-sol/2",
    views: 18,
    viewsPercent: 6.84,
    activeUsers: 6,
    activeUsersPercent: 35.29,
    viewsPerUser: 3.0,
    avgEngagementTime: "1 min 12 s",
    eventCount: 36,
    eventCountPercent: 6.67,
    keyEvents: 2,
    totalRevenue: 150.0,
    bounceRate: 33.3,
    newUsers: 4,
    returningUsers: 2,
    avgSessionDuration: "1 min 45 s",
    deviceBreakdown: {
      desktop: 12,
      mobile: 5,
      tablet: 1,
    },
    locations: [
      { city: "Tehuacán", state: "Puebla", country: "México", users: 3, views: 10, avgEngagementTime: "1 min 20 s", lat: 18.4628, lng: -97.3931 },
      { city: "Oaxaca", state: "Oaxaca", country: "México", users: 2, views: 6, avgEngagementTime: "1 min 5 s", lat: 17.0732, lng: -96.7266 },
      { city: "Veracruz", state: "Veracruz", country: "México", users: 1, views: 2, avgEngagementTime: "50 s", lat: 19.1738, lng: -96.1342 },
    ],
    timeSeries: [
      { date: "18 Nov", views: 3, users: 2 },
      { date: "19 Nov", views: 2, users: 1 },
      { date: "20 Nov", views: 4, users: 2 },
      { date: "21 Nov", views: 3, users: 2 },
      { date: "22 Nov", views: 4, users: 3 },
      { date: "23 Nov", views: 2, users: 1 },
    ],
  },
  {
    pagePath: "/rewin/cafe-aroma/1",
    views: 25,
    viewsPercent: 9.51,
    activeUsers: 8,
    activeUsersPercent: 47.06,
    viewsPerUser: 3.13,
    avgEngagementTime: "2 min 5 s",
    eventCount: 50,
    eventCountPercent: 9.26,
    keyEvents: 3,
    totalRevenue: 320.5,
    bounceRate: 20.0,
    newUsers: 5,
    returningUsers: 3,
    avgSessionDuration: "2 min 30 s",
    deviceBreakdown: {
      desktop: 15,
      mobile: 8,
      tablet: 2,
    },
    locations: [
      { city: "Guadalajara", state: "Jalisco", country: "México", users: 4, views: 12, avgEngagementTime: "2 min 15 s", lat: 20.6597, lng: -103.3496 },
      { city: "Monterrey", state: "Nuevo León", country: "México", users: 2, views: 8, avgEngagementTime: "2 min 0 s", lat: 25.6866, lng: -100.3161 },
      { city: "Zapopan", state: "Jalisco", country: "México", users: 2, views: 5, avgEngagementTime: "1 min 50 s", lat: 20.7214, lng: -103.3918 },
    ],
    timeSeries: [
      { date: "18 Nov", views: 4, users: 2 },
      { date: "19 Nov", views: 3, users: 2 },
      { date: "20 Nov", views: 5, users: 3 },
      { date: "21 Nov", views: 4, users: 2 },
      { date: "22 Nov", views: 6, users: 4 },
      { date: "23 Nov", views: 3, users: 2 },
    ],
  },
];

const totalMetrics = {
  views: 263,
  activeUsers: 17,
  viewsPerUser: 15.47,
  avgEngagementTime: "5 min y 25 s",
  eventCount: 540,
  keyEvents: 0,
  totalRevenue: 0.0,
};

const realtimeData = {
  activeUsersLast30Min: 1,
  activeUsersLast5Min: 1,
  activeUsersByMinute: [
    { minute: "-30 min", users: 0 },
    { minute: "-25 min", users: 0 },
    { minute: "-20 min", users: 1 },
    { minute: "-15 min", users: 0 },
    { minute: "-10 min", users: 1 },
    { minute: "-5 min", users: 0 },
    { minute: "-1 min", users: 1 },
  ],
  topSources: [
    { source: "(direct)", users: 1, percent: 100 },
  ],
  topAudiences: [
    { audience: "All Users", users: 1, percent: 100 },
  ],
  topPages: [
    { title: "Fideliza", views: 8, percent: 100 },
  ],
  topEvents: [
    { name: "page_view", count: 13, percent: 46.43 },
    { name: "scroll", count: 5, percent: 17.86 },
    { name: "debug_event", count: 3, percent: 10.71 },
    { name: "user_engagement", count: 3, percent: 10.71 },
    { name: "view_web_shop_device_analytics", count: 3, percent: 10.71 },
    { name: "session_start", count: 1, percent: 3.57 },
  ],
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function WebShopStorePage() {
  const [selectedPage, setSelectedPage] = useState<string>(mockData[0].pagePath);
  const currentMetrics = mockData.find((m) => m.pagePath === selectedPage) || mockData[0];

  // Calcular el centro del mapa basado en las ubicaciones
  const centerLat = currentMetrics.locations.reduce((sum, loc) => sum + loc.lat, 0) / currentMetrics.locations.length;
  const centerLng = currentMetrics.locations.reduce((sum, loc) => sum + loc.lng, 0) / currentMetrics.locations.length;

  // Encontrar el valor máximo de vistas para normalizar
  const maxViews = Math.max(...currentMetrics.locations.map(loc => loc.views));

  const shareUrl = `https://fynlink.shop${selectedPage}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error("No se pudo copiar el enlace", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50">
                Analytics Dashboard
              </h1>
            </div>
          </div>
        </div>

        {/* Selector de página mejorado */}
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
                {mockData.map((page) => (
                  <SelectItem key={page.pagePath} value={page.pagePath} className="text-base">
                    {page.pagePath}
                  </SelectItem>
                ))}
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
        {/* Actividad en tiempo real */}
        <Card className="mb-8 shadow-sm border border-slate-200 bg-white">
          <CardHeader className="border-b bg-slate-50/60 dark:bg-slate-900/40">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
              Actividad en tiempo real
            </CardTitle>
            <CardDescription className="text-base">
              Usuarios activos y eventos recientes de la tienda web.
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

        {/* Métricas principales con iconos y colores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Tasa de Rebote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 dark:text-slate-50">{currentMetrics.bounceRate}%</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Porcentaje de rebote</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Nuevos Usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{currentMetrics.newUsers}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {currentMetrics.returningUsers} recurrentes
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duración de Sesión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 dark:text-slate-50">{currentMetrics.avgSessionDuration}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Tiempo promedio</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{currentMetrics.views}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {currentMetrics.viewsPercent}% del total
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuarios Activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 dark:text-slate-50">{currentMetrics.activeUsers}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {currentMetrics.activeUsersPercent}% del total
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vistas/Usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 dark:text-slate-50">{currentMetrics.viewsPerUser.toFixed(2)}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Promedio por usuario</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tiempo de Interacción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 dark:text-slate-50">{currentMetrics.avgEngagementTime}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400/70 mt-2">Por usuario activo</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 dark:text-slate-50">{currentMetrics.eventCount}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {currentMetrics.eventCountPercent}% del total
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Eventos Clave
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 dark:text-slate-50">{currentMetrics.keyEvents}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Conversiones</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardDescription className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Ingresos Totales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">${currentMetrics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">USD</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfica de vistas en el tiempo mejorada */}
        <Card className="mb-8 shadow-sm border border-slate-200 bg-white">
          <CardHeader className="border-b bg-slate-50/60 dark:bg-slate-900/40">
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Tendencia Temporal
            </CardTitle>
            <CardDescription className="text-base">Evolución de vistas y usuarios en los últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={currentMetrics.timeSeries}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '13px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '13px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(15,23,42,0.12)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fill="url(#colorViews)" name="Vistas" dot={{ fill: '#3b82f6', r: 6 }} />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} fill="url(#colorUsers)" name="Usuarios" dot={{ fill: '#10b981', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Desglose por dispositivo mejorado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-sm border border-slate-200 bg-white">
            <CardHeader className="border-b bg-slate-50/60 dark:bg-slate-900/40">
              <CardTitle className="text-xl flex items-center gap-2">
                <Monitor className="h-6 w-6 text-blue-600" />
                Dispositivos
              </CardTitle>
              <CardDescription className="text-base">Distribución de visitas por tipo de dispositivo</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-5 border border-slate-200 rounded-xl bg-white hover:shadow-md transition-all">
                  <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                    <Monitor className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground font-semibold">Escritorio</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{currentMetrics.deviceBreakdown.desktop}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="text-base px-3 py-1 bg-blue-600 text-white">
                      {((currentMetrics.deviceBreakdown.desktop / currentMetrics.views) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 border border-slate-200 rounded-xl bg-white hover:shadow-md transition-all">
                  <div className="h-14 w-14 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
                    <Smartphone className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground font-semibold">Móvil</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{currentMetrics.deviceBreakdown.mobile}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="text-base px-3 py-1 bg-emerald-600 text-white">
                      {((currentMetrics.deviceBreakdown.mobile / currentMetrics.views) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 border border-slate-200 rounded-xl bg-white hover:shadow-md transition-all">
                  <div className="h-14 w-14 rounded-xl bg-purple-600 flex items-center justify-center shadow-sm">
                    <Tablet className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground font-semibold">Tablet</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{currentMetrics.deviceBreakdown.tablet}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="text-base px-3 py-1 bg-purple-600 text-white">
                      {((currentMetrics.deviceBreakdown.tablet / currentMetrics.views) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfica de pie para dispositivos */}
          <Card className="shadow-sm border border-slate-200 bg-white">
            <CardHeader className="border-b bg-slate-50/60 dark:bg-slate-900/40">
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                Distribución Visual
              </CardTitle>
              <CardDescription className="text-base">Proporción de cada tipo de dispositivo</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Escritorio", value: currentMetrics.deviceBreakdown.desktop, color: '#3b82f6' },
                      { name: "Móvil", value: currentMetrics.deviceBreakdown.mobile, color: '#10b981' },
                      { name: "Tablet", value: currentMetrics.deviceBreakdown.tablet, color: '#8b5cf6' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: "Escritorio", value: currentMetrics.deviceBreakdown.desktop, color: '#3b82f6' },
                      { name: "Móvil", value: currentMetrics.deviceBreakdown.mobile, color: '#10b981' },
                      { name: "Tablet", value: currentMetrics.deviceBreakdown.tablet, color: '#8b5cf6' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Ubicaciones geográficas con MAPA INTERACTIVO */}
        <Card className="mb-8 shadow-sm border border-slate-200 bg-white">
         
          <CardContent className="pt-6 space-y-8">
           

            {/* Tarjetas de calor por ubicación */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-50">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Desglose por Ciudad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentMetrics.locations
                  .sort((a, b) => b.views - a.views)
                  .map((loc, idx) => {
                    const intensity = loc.views / maxViews;
                    const getHeatLabel = () => {
                      if (intensity < 0.33) return "Baja";
                      if (intensity < 0.66) return "Media";
                      return "Alta";
                    };

                    return (
                      <div
                        key={idx}
                        className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-800"
                      >
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                          >
                            {getHeatLabel()}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">{loc.city}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">{loc.state}, {loc.country}</div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg p-3 bg-slate-50 dark:bg-slate-800/80">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Vistas</div>
                            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{loc.views}</div>
                          </div>
                          <div className="rounded-lg p-3 bg-slate-50 dark:bg-slate-800/80">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Usuarios</div>
                            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{loc.users}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 rounded-lg p-2 bg-slate-50 dark:bg-slate-800/80">
                          <Clock className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{loc.avgEngagementTime}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Tabla detallada */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                      <th className="text-left py-4 px-4 font-bold">Ciudad</th>
                      <th className="text-left py-4 px-4 font-bold">Estado</th>
                      <th className="text-left py-4 px-4 font-bold">País</th>
                      <th className="text-right py-4 px-4 font-bold">Usuarios</th>
                      <th className="text-right py-4 px-4 font-bold">Vistas</th>
                      <th className="text-right py-4 px-4 font-bold">Tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMetrics.locations.map((loc, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="py-4 px-4 font-bold text-blue-600">{loc.city}</td>
                        <td className="py-4 px-4">{loc.state}</td>
                        <td className="py-4 px-4">{loc.country}</td>
                        <td className="text-right py-4 px-4 font-bold text-green-600">{loc.users}</td>
                        <td className="text-right py-4 px-4 font-bold text-purple-600">{loc.views}</td>
                        <td className="text-right py-4 px-4 font-semibold text-orange-600">{loc.avgEngagementTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparación con el total */}
        <Card className="shadow-sm border border-slate-200 bg-white">
          <CardHeader className="border-b bg-slate-50/60 dark:bg-slate-900/40">
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              Comparación Global
            </CardTitle>
            <CardDescription className="text-base">
              Métricas totales de todas las páginas /rewin vs. la página seleccionada
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                    <th className="text-left py-4 px-4 font-bold text-base">Métrica</th>
                    <th className="text-right py-4 px-4 font-bold text-base">Total General</th>
                    <th className="text-right py-4 px-4 font-bold text-base">Página Actual</th>
                    <th className="text-right py-4 px-4 font-bold text-base">% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                    <td className="py-4 px-4 font-semibold">Vistas</td>
                    <td className="text-right py-4 px-4 font-bold text-lg">{totalMetrics.views}</td>
                    <td className="text-right py-4 px-4 font-bold text-lg text-blue-600">{currentMetrics.views}</td>
                    <td className="text-right py-4 px-4">
                      <Badge className="text-base px-3 py-1 bg-blue-600">{currentMetrics.viewsPercent}%</Badge>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-green-50 dark:hover:bg-green-950 transition-colors">
                    <td className="py-4 px-4 font-semibold">Usuarios activos</td>
                    <td className="text-right py-4 px-4 font-bold text-lg">{totalMetrics.activeUsers}</td>
                    <td className="text-right py-4 px-4 font-bold text-lg text-green-600">{currentMetrics.activeUsers}</td>
                    <td className="text-right py-4 px-4">
                      <Badge className="text-base px-3 py-1 bg-green-600">{currentMetrics.activeUsersPercent}%</Badge>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors">
                    <td className="py-4 px-4 font-semibold">Número de eventos</td>
                    <td className="text-right py-4 px-4 font-bold text-lg">{totalMetrics.eventCount}</td>
                    <td className="text-right py-4 px-4 font-bold text-lg text-purple-600">{currentMetrics.eventCount}</td>
                    <td className="text-right py-4 px-4">
                      <Badge className="text-base px-3 py-1 bg-purple-600">{currentMetrics.eventCountPercent}%</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}