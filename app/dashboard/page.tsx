'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Components
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MetricsCard } from "@/components/cards/metrics-card";
import { SalesChart } from "@/components/charts/sales-chart";
import { ConversionChart } from "@/components/charts/conversion-chart";
import { ActivityFeed, type ActivityItem } from "@/components/activity/activity-feed";
import { QuickStats } from "@/components/cards/quick-stats";

// Data
const salesData = [
  { month: "Ene", sales: 4000, revenue: 2400 },
  { month: "Feb", sales: 3000, revenue: 1398 },
  { month: "Mar", sales: 2000, revenue: 9800 },
  { month: "Abr", sales: 2780, revenue: 3908 },
  { month: "May", sales: 1890, revenue: 4800 },
  { month: "Jun", sales: 2390, revenue: 3800 },
  { month: "Jul", sales: 3490, revenue: 4300 },
  { month: "Ago", sales: 4000, revenue: 2400 },
  { month: "Sep", sales: 3200, revenue: 3600 },
  { month: "Oct", sales: 4100, revenue: 4800 },
  { month: "Nov", sales: 3800, revenue: 4200 },
  { month: "Dic", sales: 4500, revenue: 5000 },
];

const conversionData = [
  { day: "Lun", conversions: 65 },
  { day: "Mar", conversions: 78 },
  { day: "Mié", conversions: 82 },
  { day: "Jue", conversions: 74 },
  { day: "Vie", conversions: 89 },
  { day: "Sáb", conversions: 95 },
  { day: "Dom", conversions: 71 },
];

const activities: ActivityItem[] = [
  {
    id: 1,
    type: 'sale',
    title: 'Nuevo pedido',
    description: 'Pedido #1234 por $120.00',
    time: 'Hace 2 min',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    user: 'Juan Pérez'
  },
  {
    id: 2,
    type: 'comment',
    title: 'Nuevo comentario',
    description: '¡Excelente servicio!',
    time: 'Hace 15 min',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    user: 'María García'
  },
  {
    id: 3,
    type: 'user',
    title: 'Nuevo usuario registrado',
    description: 'Carlos López se unió',
    time: 'Hace 1 hora',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    user: 'Carlos López'
  },
  {
    id: 4,
    type: 'order',
    title: 'Pedido completado',
    description: 'Pedido #1233 ha sido entregado',
    time: 'Hace 2 horas',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    user: 'Ana Martínez'
  },
  {
    id: 5,
    type: 'sale',
    title: 'Nuevo pedido',
    description: 'Pedido #1235 por $85.00',
    time: 'Hace 3 horas',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    user: 'Roberto Sánchez'
  },
];

const metrics = [
  {
    title: "Ventas Totales",
    value: "$45,231",
    change: "+20.1%",
    trend: "up" as const,
    icon: 'dollar' as const,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    description: "vs mes anterior"
  },
  {
    title: "Nuevos Usuarios",
    value: "2,350",
    change: "+15.3%",
    trend: "up" as const,
    icon: 'users' as const,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    description: "este mes"
  },
  {
    title: "Pedidos",
    value: "1,234",
    change: "-2.4%",
    trend: "down" as const,
    icon: 'shopping-cart' as const,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    description: "últimos 30 días"
  },
  {
    title: "Comentarios",
    value: "573",
    change: "+8.2%",
    trend: "up" as const,
    icon: 'message-square' as const,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    description: "promedio 4.8★"
  }
];

const quickStats = [
  { label: "Visitantes hoy", value: "1,234", percentage: 75, color: 'bg-emerald-500' },
  { label: "Ventas hoy", value: "$2,847", percentage: 60, color: 'bg-blue-500' },
  { label: "Conversión", value: "3.2%", percentage: 45, color: 'bg-purple-500' },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className={`fixed inset-0 z-40 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <Sidebar />
      </div>

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
                description={metric.description}
              />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SalesChart 
              data={salesData}
              title="Ventas Mensuales"
              description="Evolución de ventas en los últimos 12 meses"
              change="+12.5%"
            />

            <ConversionChart 
              data={conversionData}
              title="Conversiones Semanales"
              description="Tasa de conversión por día de la semana"
              average="82%"
            />
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityFeed activities={activities} />
            </div>
            <div>
              <QuickStats />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
