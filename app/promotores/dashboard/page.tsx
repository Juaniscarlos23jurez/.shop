"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Users, DollarSign, Activity, Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from "react"
import { api } from "@/lib/api/api"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"

export default function PromoterDashboard() {
    const { token, loading } = useAuth();
    const [stats, setStats] = useState({
        total_referrals: 0,
        total_commissions: 0,
        pending_commissions: 0,
        conversion_rate: 0 // Not in API yet, can calculate later or mock
    });
    const [referrals, setReferrals] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                // 1. Fetch Profile/Stats
                const profileRes = await api.promoters.getProfile(token);
                if (profileRes.success && profileRes.data) {
                    setStats(prev => ({ ...prev, ...profileRes.data?.stats }));
                }

                // 2. Fetch Referrals (Companies)
                const referralsRes = await api.promoters.getReferrals(token);
                if (referralsRes.success && referralsRes.data) {
                    setReferrals(referralsRes.data.referrals);
                }

                // 3. Fetch Commissions (for Chart)
                const commissionsRes = await api.promoters.getCommissions(token);
                if (commissionsRes.success && commissionsRes.data) {
                    const comms = commissionsRes.data.commissions;

                    // Process commissions for chart (group by month)
                    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                    const grouped = comms.reduce((acc: any, curr) => {
                        const date = new Date(curr.created_at);
                        const month = monthNames[date.getMonth()];
                        acc[month] = (acc[month] || 0) + Number(curr.amount);
                        return acc;
                    }, {});

                    // Fill data array
                    const processedData = monthNames.map(name => ({
                        name,
                        comisiones: grouped[name] || 0
                    }));
                    // Simple filter to show mostly relevant months (e.g., current year) could be added
                    // For now showing all 12 months or just the ones with data?
                    // Let's filter to remove months with 0 if we want cleaner look, or just last 6 months.
                    // Let's just create a sliding window of last 6 months relative to now
                    const today = new Date();
                    const last6Months = [];
                    for (let i = 5; i >= 0; i--) {
                        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                        const mName = monthNames[d.getMonth()];
                        last6Months.push({
                            name: mName,
                            comisiones: grouped[mName] || 0
                        });
                    }

                    setChartData(last6Months);
                }

            } catch (error) {
                console.error("Error fetching promoter data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [token]);


    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative">
                            <Image src="/logorewa.png" alt="Fynlink+" fill className="object-contain" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg">Panel de Promotor</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden sm:inline-block">Bienvenido</span>
                        <Link href="/auth/login">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600 hover:bg-red-50">Cerrar Sesión</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {isLoadingData && !token ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                    </div>
                ) : (
                    <>
                        {/* Welcome Banner */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Resumen de Actividad</h1>
                                <p className="text-gray-500">Aquí tienes el rendimiento de tu código de referido.</p>
                            </div>
                            <Button className="bg-[#22c55e] hover:bg-green-600 text-white shadow-md">
                                Copiar Código de Referido
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border-none shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Comisiones Totales</CardTitle>
                                    <DollarSign className="h-4 w-4 text-green-600 bg-green-100 rounded-full p-0.5 w-6 h-6" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-gray-900">
                                        ${Number(stats.total_commissions).toFixed(2)}
                                    </div>
                                    <p className="text-xs text-green-600 font-bold mt-1">
                                        +${Number(stats.pending_commissions).toFixed(2)} <span className="text-gray-400 font-normal">pendientes</span>
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Clientes Referidos</CardTitle>
                                    <Users className="h-4 w-4 text-blue-600 bg-blue-100 rounded-full p-0.5 w-6 h-6" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-gray-900">{stats.total_referrals}</div>
                                    <p className="text-xs text-green-600 font-bold mt-1">Totales</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Tasa de Conversión</CardTitle>
                                    <Activity className="h-4 w-4 text-orange-600 bg-orange-100 rounded-full p-0.5 w-6 h-6" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-gray-900">--%</div>
                                    <p className="text-xs text-gray-400 mt-1">De clics a registros</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Chart */}
                            <Card className="lg:col-span-2 border-none shadow-md">
                                <CardHeader>
                                    <CardTitle>Rendimiento de Comisiones</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(value) => `$${value}`}
                                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#F3F4F6' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                formatter={(value) => [`$${value}`, "Comisiones"]}
                                            />
                                            <Bar dataKey="comisiones" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Recent Referrals */}
                            <Card className="lg:col-span-1 border-none shadow-md">
                                <CardHeader>
                                    <CardTitle>Clientes Recientes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {referrals.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">Aún no tienes referidos.</p>
                                        ) : (
                                            referrals.map((ref) => (
                                                <div key={ref.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                                            {ref.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-sm text-gray-900 truncate max-w-[120px]" title={ref.name}>{ref.name}</div>
                                                            <div className="text-[10px] text-gray-400">
                                                                {new Date(ref.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <div className="font-bold text-sm text-green-600">{ref.company_plan?.name || "Sin Plan"}</div>
                                                        <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-medium ${ref.company_plan_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {ref.company_plan_status === 'active' ? 'Activo' : 'Pendiente'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
