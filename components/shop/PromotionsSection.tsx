import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Lucide from 'lucide-react';
const { Calendar, Clock, ArrowRight } = Lucide as any;
import { Button } from "@/components/ui/button";

export function PromotionsSection() {
    // Placeholder data
    const promotions = [
        {
            id: 1,
            title: "2x1 en Hamburguesas Clásicas",
            description: "Compra una hamburguesa clásica y llévate la segunda totalmente gratis. Válido solo los martes.",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
            validUntil: "2024-12-31",
            tag: "2x1"
        },
        {
            id: 2,
            title: "Combo Familiar -20%",
            description: "Descuento especial en el combo familiar de fin de semana. Incluye 4 hamburguesas, 4 papas y refresco.",
            image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
            validUntil: "2024-11-30",
            tag: "Descuento"
        }
    ];

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
                            <img
                                src={promo.image}
                                alt={promo.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg">
                                    {promo.tag}
                                </Badge>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="text-xl font-bold mb-1">{promo.title}</h3>
                                <div className="flex items-center gap-4 text-xs opacity-90">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>Válido hasta {promo.validUntil}</span>
                                    </div>
                                </div>
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
