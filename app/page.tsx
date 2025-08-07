"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, DollarSign, Users, ShoppingCart, MessageSquare, Home, Package, Settings, Star, ArrowUpRight, ArrowDownRight, Search, Bell, Menu, BarChart3, PieChart, Activity } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, LineChart, Line } from "recharts"

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
]

const conversionData = [
  { day: "Lun", conversions: 65 },
  { day: "Mar", conversions: 78 },
  { day: "Mié", conversions: 82 },
  { day: "Jue", conversions: 74 },
  { day: "Vie", conversions: 89 },
  { day: "Sáb", conversions: 95 },
  { day: "Dom", conversions: 71 },
]

const activityData = [
  {
    id: 1,
    type: "sale",
    title: "Nueva venta realizada",
    description: "Producto vendido por $299",
    time: "Hace 2 min",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    user: "Carlos M."
  },
  {
    id: 2,
    type: "comment",
    title: "Nuevo comentario recibido",
    description: "5 estrellas en producto #123",
    time: "Hace 15 min",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    user: "Ana L."
  },
  {
    id: 3,
    type: "user",
    title: "Usuario registrado",
    description: "Nuevo cliente desde Instagram",
    time: "Hace 1 hora",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    user: "Miguel R."
  },
  {
    id: 4,
    type: "order",
    title: "Pedido procesado",
    description: "Orden #1234 enviada",
    time: "Hace 2 horas",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    user: "Sofia P."
  },
  {
    id: 5,
    type: "sale",
    title: "Venta completada",
    description: "Producto premium vendido",
    time: "Hace 3 horas",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    user: "David K."
  }
]

const metrics = [
  {
    title: "Ventas Totales",
    value: "$45,231",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    description: "vs mes anterior"
  },
  {
    title: "Nuevos Usuarios",
    value: "2,350",
    change: "+15.3%",
    trend: "up",
    icon: Users,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    description: "este mes"
  },
  {
    title: "Pedidos",
    value: "1,234",
    change: "-2.4%",
    trend: "down",
    icon: ShoppingCart,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    description: "últimos 30 días"
  },
  {
    title: "Comentarios",
    value: "573",
    change: "+8.2%",
    trend: "up",
    icon: MessageSquare,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    description: "promedio 4.8★"
  }
]

const sidebarItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: Package, label: "Productos", active: false },
  { icon: MessageSquare, label: "Comentarios", active: false },
  { icon: Users, label: "Clientes", active: false },
  { icon: PieChart, label: "Reportes", active: false },
  { icon: Settings, label: "Configuración", active: false },
]

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
              <p className="text-xs text-slate-500">Panel de control</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start h-11 ${
                item.active 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-emerald-100 text-emerald-600">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">John Doe</p>
              <p className="text-xs text-slate-500 truncate">john@empresa.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Principal</h1>
                <p className="text-sm text-slate-600">Bienvenido de vuelta, aquí tienes un resumen de tu negocio</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-emerald-500 text-white text-xs">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <Card key={index} className="bg-white border-slate-100 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                      <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-medium px-2 py-1 ${
                        metric.trend === 'up' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {metric.change}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {metric.value}
                    </p>
                    <p className="text-xs text-slate-400">
                      {metric.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart */}
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      Ventas Mensuales
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      Evolución de ventas en los últimos 12 meses
                    </CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                    +12.5%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sales: {
                      label: "Ventas",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Conversion Chart */}
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      Conversiones Semanales
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      Tasa de conversión por día de la semana
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    82% avg
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    conversions: {
                      label: "Conversiones",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <LineChart data={conversionData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="conversions"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity - Takes 2 columns */}
            <Card className="lg:col-span-2 bg-white border-slate-100 shadow-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-900">
                  Actividad Reciente
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Últimas acciones en tu negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activityData.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`p-2 rounded-xl ${activity.bgColor} flex-shrink-0`}>
                      {activity.type === 'sale' && <DollarSign className={`h-4 w-4 ${activity.iconColor}`} />}
                      {activity.type === 'comment' && <Star className={`h-4 w-4 ${activity.iconColor}`} />}
                      {activity.type === 'user' && <Users className={`h-4 w-4 ${activity.iconColor}`} />}
                      {activity.type === 'order' && <ShoppingCart className={`h-4 w-4 ${activity.iconColor}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {activity.time}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Por {activity.user}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-900">
                  Resumen Rápido
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Métricas clave de hoy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Visitantes hoy</span>
                    <span className="text-sm font-bold text-slate-900">1,234</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Ventas hoy</span>
                    <span className="text-sm font-bold text-slate-900">$2,847</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Conversión</span>
                    <span className="text-sm font-bold text-slate-900">3.2%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                    Ver Reporte Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
