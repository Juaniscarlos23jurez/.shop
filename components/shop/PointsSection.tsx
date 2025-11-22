import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as Lucide from 'lucide-react';
const { Award, TrendingUp, History, ShoppingBag, Calendar, Loader2 } = Lucide as any;
import { Button } from "@/components/ui/button";
import { clientAuthApi } from '@/lib/api/client-auth';
import { Badge } from "@/components/ui/badge";

interface PointsSectionProps {
    companyId?: number;
}

export function PointsSection({ companyId }: PointsSectionProps) {
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

                // We get the points and history from the followed-companies endpoint
                // as per the user's JSON structure
                const res = await clientAuthApi.getFollowedCompanies(token);

                if (res.success && Array.isArray(res.data)) {
                    // Find the current company in the list
                    const currentCompany = res.data.find((c: any) => String(c.id) === String(companyId));

                    if (currentCompany) {
                        setPointsBalance(currentCompany.points_balance || 0);
                        setPurchases(currentCompany.purchases || []);
                    }
                } else {
                    // If we can't fetch followed companies, maybe we just show 0 points
                    // or handle error silently if it's just that they don't follow it yet
                    console.log("Could not fetch followed companies or user not following");
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
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="pb-24 space-y-6">
            {/* Points Summary Card */}
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Award className="h-32 w-32" />
                </div>
                <CardContent className="pt-8 pb-8 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-emerald-100 font-medium mb-1 text-lg">Mis Puntos</p>
                            <h2 className="text-6xl font-bold tracking-tight">{pointsBalance}</h2>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <Award className="h-10 w-10 text-white" />
                        </div>
                    </div>

                </CardContent>
            </Card>



            {/* Purchase History */}
            <div>
                <h3 className="font-bold text-xl mb-4 px-1 flex items-center gap-2">
                    <History className="h-5 w-5 text-gray-500" />
                    Historial de Compras
                </h3>

                {purchases.length > 0 ? (
                    <div className="space-y-3">
                        {purchases.map((purchase) => (
                            <Card key={purchase.id} className="overflow-hidden hover:shadow-md transition-shadow border-gray-100">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                                <ShoppingBag className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">Compra #{purchase.id}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(purchase.created_at).toLocaleDateString()}
                                                    <span className="mx-1">•</span>
                                                    {new Date(purchase.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">${purchase.total}</p>
                                            <Badge variant={purchase.points_earned > 0 ? "default" : "secondary"} className={`${purchase.points_earned > 0 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-700'}`}>
                                                {purchase.points_earned > 0 ? '+' : ''}{purchase.points_earned} pts
                                            </Badge>
                                        </div>
                                    </div>

                                    {purchase.items && purchase.items.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-50">
                                            <p className="text-xs text-gray-500 mb-2 font-medium">Detalle:</p>
                                            <ul className="space-y-1">
                                                {purchase.items.map((item: any, idx: number) => (
                                                    <li key={idx} className="text-sm text-gray-600 flex justify-between">
                                                        <span>{item.quantity}x {item.product_name}</span>
                                                        <span>${item.subtotal}</span>
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
                    <Card className="border-dashed">
                        <CardContent className="p-8 text-center text-gray-500">
                            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No hay historial de compras disponible.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
