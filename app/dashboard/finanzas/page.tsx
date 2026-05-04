"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowUpRight,
    Activity,
    PieChart as PieChartIcon,
    ArrowDownRight,
    Zap,
    RefreshCw,
    TrendingUp,
    Calendar,
    Clock,
    BarChart3,
    Filter,
    ShoppingCart,
    Wallet,
    CreditCard,
    DollarSign,
    Search
} from 'lucide-react';
import { 
    Bar, 
    BarChart, 
    ResponsiveContainer, 
    XAxis, 
    YAxis, 
    Tooltip as RechartsTooltip, 
    Cell, 
    Pie, 
    PieChart,
    Sector,
    Line,
    LineChart,
    CartesianGrid
} from 'recharts';
import {
    ChartConfig,
} from "@/components/ui/chart";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/currency";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

interface PaymentStats {
    currency: string;
    summary: {
        total_revenue: number;
        total_transactions: number;
    };
    revenue_by_source?: {
        orders: number;
        gift_cards: number;
        memberships: number;
        total_combined: number;
    };
    today: {
        revenue: number;
        count: number;
    };
    this_month: {
        revenue: number;
        count: number;
    };
    by_method: {
        [key: string]: {
            revenue: number;
            count: number;
        };
    };
    recent_transactions: any[];
    recent_gift_cards?: any[];
    recent_memberships?: any[];
    recent_webhooks?: any[];
}

export default function FinanzasPage() {
    const { toast } = useToast();
    const { token, user } = useAuth();
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Filters
    const [locationId, setLocationId] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [locations, setLocations] = useState<Array<{ id: number; name: string }>>([]);

    // Load locations
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                if (!token) return;
                const response = await api.userCompanies.getLocations(token);
                if (response.success && response.data?.locations) {
                    setLocations(response.data.locations);
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };
        fetchLocations();
    }, [token]);

    const fetchStats = async () => {
        if (!token || !user?.company_id) return;

        try {
            setLoading(true);
            const params = {
                location_id: locationId,
                date_from: dateFrom,
                date_to: dateTo
            };

            const response = await api.companies.getPaymentStats(String(user.company_id), params, token);
            if (response.success && response.data) {
                // Handle complex nesting if present: { status: 'success', data: {stats} } vs { status: 'success', ...stats }
                const rawData = response.data;
                const statsData = (rawData.data && typeof rawData.data === 'object' && 'summary' in rawData.data)
                    ? rawData.data
                    : rawData;
                setStats(statsData);
            } else {
                throw new Error(response.message || 'Error al cargar estadísticas');
            }
        } catch (error) {
            console.error('Error fetching payment stats:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar las estadísticas financieras',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [token, user?.company_id, locationId, dateFrom, dateTo]);

    const handleClearFilters = () => {
        setLocationId('');
        setDateFrom('');
        setDateTo('');
    };

    const getMethodIcon = (method: string) => {
        switch (method.toLowerCase()) {
            case 'stripe': return <CreditCard className="h-4 w-4 text-indigo-500" />;
            case 'mercadopago': return <Wallet className="h-4 w-4 text-blue-500" />;
            case 'cash': return <DollarSign className="h-4 w-4 text-emerald-500" />;
            default: return <CreditCard className="h-4 w-4 text-slate-500" />;
        }
    };

    const getMethodName = (method: string) => {
        switch (method.toLowerCase()) {
            case 'stripe': return 'Stripe';
            case 'mercadopago': return 'Mercado Pago';
            case 'cash': return 'Efectivo';
            default: return method;
        }
    };

    const allTransactions = stats ? [
        ...(stats.recent_transactions || []).map(tx => ({ ...tx, source_type: 'order' })),
        ...(stats.recent_gift_cards || []).map(gc => ({ ...gc, source_type: 'gift_card' })),
        ...(stats.recent_memberships || []).map(ms => ({ ...ms, source_type: 'membership' }))
    ].filter(tx => {
        const txDate = new Date(tx.date || tx.created_at);
        if (dateFrom && txDate < new Date(dateFrom)) return false;
        if (dateTo) {
            const end = new Date(dateTo);
            end.setHours(23, 59, 59, 999);
            if (txDate > end) return false;
        }
        return true;
    }).sort((a, b) => {
        const dateA = new Date(a.date || a.created_at || 0).getTime();
        const dateB = new Date(b.date || b.created_at || 0).getTime();
        return dateB - dateA;
    }) : [];

    const sourceData = [
        { name: 'Órdenes', value: allTransactions.filter(t => t.source_type === 'order').reduce((acc, t) => acc + Number(t.amount), 0), fill: '#10b981' },
        { name: 'Gift Cards', value: allTransactions.filter(t => t.source_type === 'gift_card').reduce((acc, t) => acc + Number(t.amount), 0), fill: '#3b82f6' },
        { name: 'Membresías', value: allTransactions.filter(t => t.source_type === 'membership').reduce((acc, t) => acc + Number(t.amount), 0), fill: '#6366f1' },
    ];

    const methodData = allTransactions.reduce((acc: any[], tx: any) => {
        const methodName = getMethodName(tx.method || 'cash');
        const existing = acc.find(i => i.name === methodName);
        if (existing) {
            existing.value += Number(tx.amount || 0);
        } else {
            acc.push({
                name: methodName,
                value: Number(tx.amount || 0),
                fill: tx.method === 'stripe' ? '#6366f1' : tx.method === 'mercadopago' ? '#3b82f6' : '#10b981'
            });
        }
        return acc;
    }, []);

    const totalFilteredRevenue = allTransactions.reduce((acc, tx) => acc + Number(tx.amount), 0);

    // Trend data calculation (group by day from allTransactions)
    const trendData = stats ? [...allTransactions].reverse().reduce((acc: any[], tx: any) => {
        const date = new Date(tx.date || tx.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
        const existing = acc.find(i => i.date === date);
        if (existing) {
            existing.revenue += Number(tx.amount || 0);
        } else {
            acc.push({ date, revenue: Number(tx.amount || 0) });
        }
        return acc;
    }, []) : [];

    const handleMonthChange = (monthIdx: string) => {
        if (monthIdx === 'all') {
            handleClearFilters();
            return;
        }
        const year = new Date().getFullYear();
        const firstDay = new Date(year, parseInt(monthIdx), 1).toISOString().split('T')[0];
        const lastDay = new Date(year, parseInt(monthIdx) + 1, 0).toISOString().split('T')[0];
        setDateFrom(firstDay);
        setDateTo(lastDay);
    };

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Dashboard de Finanzas</h2>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500" /> 
                        Monitoreo de ingresos y m&eacute;todos de pago en tiempo real
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">7d</Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold bg-white shadow-sm">30d</Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold">1y</Button>
                    </div>
                    <Button
                        variant="outline"
                        onClick={fetchStats}
                        disabled={loading}
                        className="gap-2 border-slate-200 shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Actualizar</span>
                    </Button>
                    <Button className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-md">
                        <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
                        Exportar Reporte
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <TrendingUp className="h-20 w-20" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Ingresos Totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && !stats ? (
                            <div className="h-10 bg-emerald-500/50 animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-3xl font-black">
                                    {formatCurrency(totalFilteredRevenue, 'MXN')}
                                </div>
                                <div className="flex items-center mt-2 text-emerald-100 text-xs font-medium bg-white/10 w-fit px-2 py-1 rounded-full">
                                    <ArrowUpRight className="h-3 w-3 mr-1" /> +12.5% vs mes anterior
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Calendar className="h-20 w-20" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Ventas Este Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && !stats ? (
                            <div className="h-10 bg-indigo-500/50 animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-3xl font-black">
                                    {formatCurrency(totalFilteredRevenue, 'MXN')}
                                </div>
                                <div className="flex items-center mt-2 text-indigo-100 text-xs font-medium">
                                    <span className="font-bold mr-1">{allTransactions.length}</span> operaciones detectadas
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg bg-white border border-slate-100">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-slate-500 text-xs font-bold uppercase tracking-widest">Ingresos Hoy</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading && !stats ? (
                            <div className="h-10 bg-slate-100 animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-3xl font-black text-slate-900">
                                    {formatCurrency(allTransactions.filter(tx => new Date(tx.date || tx.created_at).toDateString() === new Date().toDateString()).reduce((acc, tx) => acc + Number(tx.amount), 0), 'MXN')}
                                </div>
                                <div className="flex items-center mt-2 text-slate-500 text-xs font-medium">
                                    <span className="text-emerald-600 font-bold mr-1">{allTransactions.filter(tx => new Date(tx.date || tx.created_at).toDateString() === new Date().toDateString()).length}</span> ventas hoy
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg bg-white border border-slate-100">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-slate-500 text-xs font-bold uppercase tracking-widest">Volumen Global</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading && !stats ? (
                            <div className="h-10 bg-slate-100 animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-3xl font-black text-slate-900">{stats?.summary.total_transactions || 0}</div>
                                <div className="flex items-center mt-2 text-slate-500 text-xs font-medium">
                                    Total de transacciones procesadas
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros Avanzados
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mes de Consulta</label>
                            <Select defaultValue="all" onValueChange={handleMonthChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar mes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todo el año</SelectItem>
                                    {months.map((m, i) => (
                                        <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sucursal</label>
                            <Select value={locationId || 'all'} onValueChange={(v) => setLocationId(v === 'all' ? '' : v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las sucursales" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {locations.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.id.toString()}>
                                            {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha Desde</label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha Hasta</label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium invisible">Acciones</label>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleClearFilters}
                            >
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Trend Chart */}
            <Card className="border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black">Tendencia de Ingresos</CardTitle>
                            <CardDescription>Evoluci&oacute;n diaria de todas las fuentes de ingreso</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-3 rounded-full bg-indigo-500" />
                                <span className="text-xs font-bold text-slate-500">Ingresos Reales</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-10">
                    <div className="h-[300px] w-full">
                        {isMounted && trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <RechartsTooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-slate-900 text-white p-4 shadow-2xl rounded-2xl border-none">
                                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">{payload[0].payload.date}</p>
                                                        <p className="text-xl font-black">{formatCurrency(Number(payload[0].value), 'MXN')}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#6366f1" 
                                        strokeWidth={4} 
                                        dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                <Activity className="h-10 w-10 opacity-20" />
                                <p className="font-medium">Esperando datos de tendencia...</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Revenue Source Visual Chart */}
                <Card className="lg:col-span-2 overflow-hidden border-none shadow-lg">
                    <CardHeader className="border-b border-slate-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Distribución de Ingresos</CardTitle>
                                <CardDescription>Desglose por canal de venta</CardDescription>
                            </div>
                            <PieChartIcon className="h-5 w-5 text-indigo-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="w-full md:w-1/2 h-[220px]">
                                {isMounted && stats ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={sourceData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {sourceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white p-3 shadow-xl rounded-lg border border-slate-100">
                                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{payload[0].name}</p>
                                                                <p className="text-lg font-black text-slate-900">{formatCurrency(Number(payload[0].value), 'MXN')}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">Cargando gráfico...</div>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 space-y-4 px-4">
                                {sourceData.map((item) => (
                                    <div key={item.name} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                                <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{formatCurrency(item.value, 'MXN')}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-500" 
                                                style={{ 
                                                    backgroundColor: item.fill, 
                                                    width: `${totalFilteredRevenue > 0 ? (item.value / totalFilteredRevenue) * 100 : 0}%` 
                                                }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue by Method Chart */}
                <Card className="lg:col-span-2 overflow-hidden border-none shadow-lg">
                    <CardHeader className="border-b border-slate-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Métodos de Pago</CardTitle>
                                <CardDescription>Preferencia de cobro</CardDescription>
                            </div>
                            <CreditCard className="h-5 w-5 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[220px] w-full">
                            {isMounted && stats ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={methodData}>
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                        />
                                        <YAxis hide />
                                        <RechartsTooltip 
                                            cursor={{ fill: '#f1f5f9' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white p-3 shadow-xl rounded-lg border border-slate-100">
                                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{payload[0].payload.name}</p>
                                                            <p className="text-lg font-black text-slate-900">{formatCurrency(Number(payload[0].value), 'MXN')}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar 
                                            dataKey="value" 
                                            radius={[6, 6, 0, 0]}
                                            barSize={40}
                                        >
                                            {methodData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">Cargando gráfico de barras...</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions with Tabs - Full Width */}
                <Card className="lg:col-span-4 shadow-xl border-none">
                    <Tabs defaultValue="all" className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Transacciones Detalladas</CardTitle>
                                <CardDescription>&Uacute;ltimos movimientos por categor&iacute;a</CardDescription>
                            </div>
                            <TabsList className="bg-slate-100">
                                <TabsTrigger value="all" className="data-[state=active]:bg-white">Todas</TabsTrigger>
                                <TabsTrigger value="orders" className="data-[state=active]:bg-white">Órdenes</TabsTrigger>
                                <TabsTrigger value="gift_cards" className="data-[state=active]:bg-white">Gift Cards</TabsTrigger>
                                <TabsTrigger value="memberships" className="data-[state=active]:bg-white">Membresías</TabsTrigger>
                            </TabsList>
                        </CardHeader>
                        
                        <CardContent className="p-0">
                            <TabsContent value="all" className="m-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Concepto</th>
                                                <th className="px-6 py-4">Cliente / Ref</th>
                                                <th className="px-6 py-4">Fecha</th>
                                                <th className="px-6 py-4 text-right">Monto</th>
                                                <th className="px-6 py-4">M&eacute;todo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {allTransactions.length > 0 ? (
                                                allTransactions.map((tx: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {tx.source_type === 'order' && <ShoppingCart className="h-4 w-4 text-emerald-500" />}
                                                                {tx.source_type === 'gift_card' && <Wallet className="h-4 w-4 text-blue-500" />}
                                                                {tx.source_type === 'membership' && <CreditCard className="h-4 w-4 text-indigo-500" />}
                                                                <span className="font-bold text-slate-700 capitalize">
                                                                    {tx.source_type === 'order' ? 'Órden' : tx.source_type === 'gift_card' ? 'Gift Card' : 'Membresía'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-900 font-medium">{tx.customer_name || tx.customer?.name || 'Cliente'}</span>
                                                                <span className="text-slate-400 text-xs font-mono">{tx.reference || (tx.id ? `#${tx.id}` : `ID-${idx + 1}`)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                                            {new Date(tx.date || tx.created_at || new Date()).toLocaleString('es-MX', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                                                            {formatCurrency(Number(tx.amount || 0), 'MXN')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {getMethodIcon(tx.method || 'cash')}
                                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{tx.method || 'Cash'}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                        No hay movimientos recientes.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>
                            <TabsContent value="orders" className="m-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">ID / Ref</th>
                                                <th className="px-6 py-4">Cliente</th>
                                                <th className="px-6 py-4">M&eacute;todo</th>
                                                <th className="px-6 py-4">Fecha</th>
                                                <th className="px-6 py-4 text-right">Monto</th>
                                                <th className="px-6 py-4">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {stats?.recent_transactions && stats.recent_transactions.length > 0 ? (
                                                stats.recent_transactions.map((tx: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                                                            {tx.id ? `#${tx.id}` : tx.reference ? `${tx.reference}` : `ORD-${idx + 1}`}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                                            {tx.customer_name || tx.customer?.name || 'Cliente General'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {getMethodIcon(tx.method || 'cash')}
                                                                <span className="text-slate-700 font-medium">
                                                                    {getMethodName(tx.method || 'cash')}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                                            {new Date(tx.date || tx.created_at || new Date()).toLocaleString('es-MX', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                                                            {formatCurrency(Number(tx.amount || 0), 'MXN')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                                Completado
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                                        No hay órdenes recientes.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            <TabsContent value="gift_cards" className="m-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Código</th>
                                                <th className="px-6 py-4">Cliente</th>
                                                <th className="px-6 py-4">Fecha</th>
                                                <th className="px-6 py-4 text-right">Monto Pagado</th>
                                                <th className="px-6 py-4">M&eacute;todo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {stats?.recent_gift_cards && stats.recent_gift_cards.length > 0 ? (
                                                stats.recent_gift_cards.map((gc: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 text-indigo-600 font-bold font-mono text-sm">
                                                            {gc.reference}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                                            {gc.customer_name}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                                            {new Date(gc.date || gc.created_at || new Date()).toLocaleString('es-MX', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                                                            {formatCurrency(Number(gc.amount || 0), 'MXN')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {getMethodIcon(gc.method || 'cash')}
                                                                <span className="text-xs text-slate-500 uppercase tracking-tighter font-bold">
                                                                    {gc.method}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                        No hay ventas de gift cards recientes.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            <TabsContent value="memberships" className="m-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Ref</th>
                                                <th className="px-6 py-4">Cliente</th>
                                                <th className="px-6 py-4">Fecha</th>
                                                <th className="px-6 py-4 text-right">Monto Pagado</th>
                                                <th className="px-6 py-4">M&eacute;todo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {stats?.recent_memberships && stats.recent_memberships.length > 0 ? (
                                                stats.recent_memberships.map((ms: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                                            #{ms.reference}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                                            {ms.customer_name}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                                            {new Date(ms.date || ms.created_at || new Date()).toLocaleString('es-MX', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                                                            {formatCurrency(Number(ms.amount || 0), 'MXN')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {getMethodIcon(ms.method || 'cash')}
                                                                <span className="text-xs text-slate-500 uppercase tracking-tighter font-bold">
                                                                    {ms.method}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                        No hay ventas de membresías recientes.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>

            {/* Webhook Events Section */}
            <Card className="shadow-lg border-slate-100 mt-6">
                <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-600" /> Eventos de Webhooks (Logs en tiempo real)
                        </CardTitle>
                        <CardDescription>Seguimiento t&eacute;cnico de notificaciones enviadas por las pasarelas de pago.</CardDescription>
                    </div>
                    {stats?.recent_webhooks && stats.recent_webhooks.length > 0 && (
                        <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold animate-pulse">
                            {stats.recent_webhooks.length} eventos recientes
                        </span>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Pasarela</th>
                                    <th className="px-6 py-4">Evento</th>
                                    <th className="px-6 py-4">Resource ID</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats?.recent_webhooks && stats.recent_webhooks.length > 0 ? (
                                    stats.recent_webhooks.map((webhook, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 capitalize italic">
                                                {webhook.gateway}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                                    {webhook.event_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 font-mono text-sm">
                                                {webhook.resource_id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${webhook.status === 'processed'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {webhook.status === 'processed' ? 'Procesado' : webhook.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {new Date(webhook.created_at).toLocaleString('es-MX', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    day: '2-digit',
                                                    month: '2-digit'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            No hay eventos de webhooks recientes para mostrar. Simula una notificaci&oacute;n en Mercado Pago para verla aqu&iacute;.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
