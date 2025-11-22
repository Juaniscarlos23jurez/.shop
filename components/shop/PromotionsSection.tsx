import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Lucide from 'lucide-react';
const { Calendar, Clock, ArrowRight, Loader2 } = Lucide as any;
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
                    // If no token, we might want to show a login prompt or empty state
                    // For now, let's just stop loading
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
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500">
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Reintentar
                </Button>
            </div>
        );
    }

    if (promotions.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No hay promociones activas en este momento.</p>
            </div>
        );
    }

    return (
        <div className="pb-16 space-y-6">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-2xl font-bold">Promociones Activas</h2>
                <Badge variant="secondary">{promotions.length} Disponibles</Badge>
            </div>

            <div className="space-y-4">
                {promotions.map((promo) => (
                    <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                        <div className="relative h-48">
                            {promo.image_url ? (
                                <img
                                    src={promo.image_url}
                                    alt={promo.name || promo.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">Sin imagen</span>
                                </div>
                            )}

                            {promo.tag && (
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg">
                                        {promo.tag}
                                    </Badge>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="text-xl font-bold mb-1">{promo.name || promo.title}</h3>
                                {promo.valid_until && (
                                    <div className="flex items-center gap-4 text-xs opacity-90">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>Válido hasta {new Date(promo.valid_until).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {promo.description}
                            </p>
                            <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 group-hover:bg-emerald-600 transition-colors">
                                Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
