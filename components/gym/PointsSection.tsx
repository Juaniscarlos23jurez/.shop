import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import * as Lucide from 'lucide-react';
const { Award, History, ShoppingBag, Calendar, Loader2, TrendingUp, Gift, Activity } = Lucide as any;
import { clientAuthApi } from '@/lib/api/client-auth';
import { Badge } from "@/components/ui/badge";

interface PointRule {
    id: number;
    company_id: number;
    spend_amount: string | number;
    points: number;
    is_active: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
    metadata?: any;
}

interface PointsSectionProps {
    companyId?: number;
    pointRules?: PointRule[] | null;
}

export function PointsSection({ companyId, pointRules }: PointsSectionProps) {
    const [pointsBalance, setPointsBalance] = useState<number>(0);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPointsData = async () => {
            if (!companyId) {
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('customer_token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const res = await clientAuthApi.getFollowedCompanies(token);

                if (res.success && Array.isArray(res.data)) {
                    const currentCompany = res.data.find((c: any) => String(c.id) === String(companyId));
                    if (currentCompany) {
                        setPointsBalance(currentCompany.points_balance || 0);
                        setPurchases(currentCompany.purchases || []);
                    }
                }
            } catch (e) {
                console.error("Error fetching points data", e);
                setError("No se pudo cargar la información de puntos");
            } finally {
                setLoading(false);
            }
        };

        fetchPointsData();
    }, [companyId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 bg-zinc-950/50 rounded-3xl border border-zinc-900">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    const getActivePointRule = (): PointRule | null => {
        if (!pointRules || pointRules.length === 0) return null;
        const now = new Date();
        const activeRules = pointRules
            .filter((rule) => rule?.is_active !== false)
            .filter((rule) => {
                const startsOk = !rule.starts_at || new Date(rule.starts_at) <= now;
                const endsOk = !rule.ends_at || new Date(rule.ends_at) >= now;
                return startsOk && endsOk;
            });
        return activeRules.length > 0 ? activeRules[0] : null;
    };

    const activeRule = getActivePointRule();
    const spendAmount = activeRule ? (typeof activeRule.spend_amount === 'string' ? parseFloat(activeRule.spend_amount) : activeRule.spend_amount) : 0;
    const pointsEarned = activeRule ? activeRule.points : 0;

    return (
        <div className="pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Points Summary Card - Gym Styled */}
            <Card className="bg-zinc-900 border-zinc-800 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative rounded-[2.5rem] border-2">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity className="h-48 w-48 text-blue-500" />
                </div>
                <CardContent className="pt-10 pb-10 relative z-10 px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-xs mb-2">Power Level</p>
                            <h2 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">
                                {pointsBalance}
                                <span className="text-2xl text-blue-500 ml-2">PTS</span>
                            </h2>
                        </div>
                        <div className="bg-blue-600/10 p-4 rounded-3xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                            <Activity className="h-12 w-12 text-blue-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Points Earning Rules */}
            {activeRule && (
                <Card className="border-2 border-zinc-800 bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                                <TrendingUp className="h-7 w-7 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-black text-2xl text-white uppercase tracking-tight">¿Cómo subir nivel?</h3>
                                <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Gana puntos en cada sesión</p>
                            </div>
                        </div>

                        <div className="bg-zinc-950 rounded-[2rem] p-6 border border-zinc-800 shadow-inner relative overflow-hidden group">
                            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                                <Gift className="h-24 w-24 text-blue-400 rotate-12" />
                            </div>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="bg-blue-600 text-white rounded-2xl h-16 w-16 flex items-center justify-center font-black text-2xl shadow-lg border border-white/10">
                                        +{pointsEarned}
                                    </div>
                                    <div>
                                        <p className="font-black text-3xl text-white tracking-tighter">{pointsEarned} PUNTOS</p>
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">por cada ${spendAmount} inversión</p>
                                    </div>
                                </div>
                            </div>

                            {/* Example conversion */}
                            <div className="mt-6 pt-6 border-t border-zinc-900 relative z-10">
                                <p className="text-[10px] text-zinc-600 mb-4 font-black uppercase tracking-[0.3em]">Proyección de Ganancia:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[100, 500, 1000].map((amount) => {
                                        const earnedPoints = Math.round((amount / spendAmount) * pointsEarned * 10) / 10;
                                        return (
                                            <div key={amount} className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50 flex flex-col items-center">
                                                <span className="text-xs text-zinc-500 font-bold">${amount}</span>
                                                <span className="font-black text-blue-400">+{earnedPoints} PTS</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {activeRule.metadata?.nota && (
                            <div className="mt-6 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                <p className="text-sm text-blue-300 font-medium italic">
                                    <strong className="text-blue-500 uppercase not-italic font-black text-xs tracking-widest mr-2">Tip:</strong> {activeRule.metadata.nota}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Purchase History */}
            <div className="px-1">
                <h3 className="font-black text-2xl mb-6 flex items-center gap-3 text-white uppercase tracking-tight">
                    <History className="h-7 w-7 text-zinc-600" />
                    Registro de Actividad
                </h3>

                {purchases.length > 0 ? (
                    <div className="space-y-4">
                        {purchases.map((purchase) => (
                            <Card key={purchase.id} className="overflow-hidden bg-zinc-900 border-zinc-800 rounded-2xl border-2 hover:border-zinc-700 transition-all duration-300 group">
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-blue-500 transition-colors">
                                                <ShoppingBag className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white uppercase tracking-tighter">ORDEN #{purchase.id}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(purchase.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-xl text-white tracking-tighter">${purchase.total}</p>
                                            <Badge variant="outline" className={`mt-1 font-black uppercase tracking-widest text-[9px] border-none ${purchase.points_earned > 0 ? 'bg-blue-600/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                                {purchase.points_earned > 0 ? '+' : ''}{purchase.points_earned} PTS
                                            </Badge>
                                        </div>
                                    </div>

                                    {purchase.items && purchase.items.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-zinc-950">
                                            <ul className="space-y-2">
                                                {purchase.items.map((item: any, idx: number) => (
                                                    <li key={idx} className="text-[11px] text-zinc-400 font-bold uppercase flex justify-between tracking-wide">
                                                        <span>{item.quantity}X {item.product_name}</span>
                                                        <span className="text-zinc-500">${item.subtotal}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-zinc-950 border-dashed border-zinc-800 rounded-[2rem]">
                        <CardContent className="p-16 text-center text-zinc-700">
                            <Activity className="h-16 w-16 mx-auto mb-4 opacity-10" />
                            <p className="font-black uppercase tracking-widest text-sm">Sin actividad regltrada</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
