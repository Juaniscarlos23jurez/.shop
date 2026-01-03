"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    CreditCard,
    Wallet,
    Clock,
    RefreshCw,
    BarChart3,
    Calendar,
    ArrowUpRight,
    Activity
} from 'lucide-react';
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

interface PaymentStats {
    currency: string;
    summary: {
        total_revenue: number;
        total_transactions: number;
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
    recent_webhooks?: any[];
}

export default function FinanzasPage() {
    const { toast } = useToast();
    const { token, user } = useAuth();
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard de Finanzas</h2>
                    <p className="text-muted-foreground">Monitoreo de ingresos y m&eacute;todos de pago</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchStats}
                        disabled={loading}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                    <Button variant="outline" className="gap-2">
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading && !stats ? (
                            <div className="h-8 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(Number(stats?.summary.total_revenue || 0), 'MXN')}
                                </div>
                                <p className="text-xs text-muted-foreground">MXN Acumulado</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading && !stats ? (
                            <div className="h-8 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(Number(stats?.this_month.revenue || 0), 'MXN')}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.this_month.count || 0} transacciones
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hoy</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading && !stats ? (
                            <div className="h-8 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(Number(stats?.today.revenue || 0), 'MXN')}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.today.count || 0} ventas hoy
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading && !stats ? (
                            <div className="h-8 bg-gray-200 animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.summary.total_transactions || 0}</div>
                                <p className="text-xs text-muted-foreground">operaciones procesadas</p>
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
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue by Method */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>M&eacute;todos de Cobro</CardTitle>
                        <CardDescription>Distribuci&oacute;n por canal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {stats ? Object.entries(stats.by_method).map(([method, data]) => {
                                const totalRevenue = Number(stats.summary.total_revenue || 1);
                                const methodRevenue = Number(data.revenue || 0);
                                const percentage = (methodRevenue / totalRevenue) * 100;
                                return (
                                    <div key={method} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getMethodIcon(method)}
                                                <span className="font-semibold text-slate-700">{getMethodName(method)}</span>
                                            </div>
                                            <span className="font-bold text-slate-900">
                                                {formatCurrency(methodRevenue, 'MXN')}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${method === 'stripe' ? 'bg-indigo-500' :
                                                    method === 'mercadopago' ? 'bg-blue-500' :
                                                        'bg-emerald-500'
                                                    }`}
                                                style={{ width: `${Math.max(percentage, 5)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-400">
                                            <span>{data.count} txs</span>
                                            <span>{percentage.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-4 text-muted-foreground">Cargando...</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Transacciones Recientes</CardTitle>
                            <CardDescription>&Uacute;ltimos movimientos</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-emerald-600">
                            Ver todas
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">M&eacute;todo</th>
                                        <th className="px-6 py-4 text-right">Monto</th>
                                        <th className="px-6 py-4">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats?.recent_transactions && stats.recent_transactions.length > 0 ? (
                                        stats.recent_transactions.map((tx: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                                                    #{tx.id || `TX-${Math.floor(Math.random() * 10000)}`}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {getMethodIcon(tx.method || 'cash')}
                                                        <span className="text-slate-700 font-medium">
                                                            {getMethodName(tx.method || 'cash')}
                                                        </span>
                                                    </div>
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
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                No hay transacciones recientes para mostrar.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
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
