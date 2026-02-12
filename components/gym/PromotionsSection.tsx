import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Lucide from 'lucide-react';
const { Calendar, Clock, ArrowRight, Loader2, Dumbbell } = Lucide as any;
import { Button } from "@/components/ui/button";
import { clientAuthApi } from '@/lib/api/client-auth';

interface PromotionsSectionProps {
    companyId?: number;
}

export function PromotionsSection({ companyId }: PromotionsSectionProps) {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPromotions = async () => {
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

                const res = await clientAuthApi.getProductPromotions(token, {
                    company_id: companyId.toString(),
                    per_page: 15
                });

                if (res.success && res.data) {
                    setPromotions(res.data.items || []);
                } else {
                    setError(res.error || 'Error al cargar promociones');
                }
            } catch (e) {
                setError('Error inesperado al cargar promociones');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, [companyId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 bg-zinc-950/50 rounded-3xl border border-zinc-900">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-[2rem]">
                <p className="text-red-400 font-bold mb-4">{error}</p>
                <Button className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl" onClick={() => window.location.reload()}>
                    REINTENTAR ACCESO
                </Button>
            </div>
        );
    }

    if (promotions.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-[2.5rem]">
                <Dumbbell className="h-16 w-16 mx-auto mb-4 text-zinc-800" />
                <p className="font-black text-zinc-600 uppercase tracking-widest text-sm">Sin promociones élite activas</p>
            </div>
        );
    }

    return (
        <div className="pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Eventos Especiales</h2>
                <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/20 font-black px-3 py-1 uppercase text-[10px] tracking-widest shadow-xl">
                    {promotions.length} ACTIVOS
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {promotions.map((promo) => (
                    <Card key={promo.id} className="overflow-hidden bg-zinc-900 border-zinc-800 rounded-[2rem] border-2 group cursor-pointer hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
                        <div className="relative h-60 overflow-hidden">
                            {promo.image_url ? (
                                <img
                                    src={promo.image_url}
                                    alt={promo.name || promo.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                                    <Dumbbell className="h-12 w-12 text-zinc-900" />
                                </div>
                            )}

                            {promo.tag && (
                                <div className="absolute top-6 right-6 z-20">
                                    <Badge className="bg-blue-600 text-white border border-white/10 shadow-[0_10px_30px_rgba(37,99,235,0.4)] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl">
                                        {promo.tag}
                                    </Badge>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent z-10" />
                            <div className="absolute bottom-6 left-8 right-8 text-white z-20">
                                <h3 className="text-3xl font-black mb-1 uppercase tracking-tighter group-hover:text-blue-400 transition-colors uppercase">{promo.name || promo.title}</h3>
                                {promo.valid_until && (
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-blue-500" />
                                            <span>Límite: {new Date(promo.valid_until).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <CardContent className="p-8">
                            <p className="text-zinc-400 text-lg font-medium mb-8 line-clamp-2 leading-relaxed italic">
                                "{promo.description}"
                            </p>
                            <Button className="w-full bg-zinc-950 text-white font-black uppercase tracking-widest h-14 rounded-2xl border border-zinc-800 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300 shadow-xl group-hover:shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
                                OBTENER BENEFICIO <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
