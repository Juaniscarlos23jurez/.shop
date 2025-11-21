import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as Lucide from 'lucide-react';
const { Award, TrendingUp, History } = Lucide as any;
import { Button } from "@/components/ui/button";

export function PointsSection() {
    return (
        <div className="pb-16 space-y-6">
            {/* Points Summary Card */}
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-xl">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-emerald-100 font-medium mb-1">Mis Puntos</p>
                            <h2 className="text-4xl font-bold">0</h2>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Award className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-emerald-100">
                            <span>Nivel Bronce</span>
                            <span>0 / 1000 para Plata</span>
                        </div>
                        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-[0%] rounded-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-sm">Ganar Puntos</span>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <History className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-sm">Historial</span>
                    </CardContent>
                </Card>
            </div>

            {/* Rewards Catalog Preview */}
            <div>
                <h3 className="font-bold text-lg mb-4 px-1">Recompensas Disponibles</h3>
                <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                        <Award className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No tienes suficientes puntos para canjear recompensas aún.</p>
                        <Button variant="link" className="mt-2 text-emerald-600">
                            Ver catálogo completo
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
