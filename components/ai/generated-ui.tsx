import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, ShoppingBag, Copy, Ticket, ImageIcon } from "lucide-react";

export function StatsCard({ data }: { data: any }) {
    return (
        <div className="grid grid-cols-2 gap-2 mt-4">
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-4">
                    <DollarSign className="w-4 h-4 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">Ventas</p>
                    <p className="text-xl font-bold">{data.totalSales}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-4">
                    <Users className="w-4 h-4 text-blue-500 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">Nuevos</p>
                    <p className="text-xl font-bold">{data.newCustomers}</p>
                </CardContent>
            </Card>
        </div>
    );
}

export function ProductList({ products }: { products: any[] }) {
    return (
        <div className="flex flex-col gap-2 mt-4">
            {products.map((product: any) => (
                <Card key={product.id} className="flex flex-row items-center p-2 gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-slate-400" />
                        {/* Placeholder for product image */}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">${product.price}</p>
                    </div>
                    <div className="text-xs font-medium text-emerald-600">
                        {product.matchScore}% Match
                    </div>
                    <Button size="sm" variant="outline">Ver</Button>
                </Card>
            ))}
        </div>
    );
}

export function CouponCard({ coupon }: { coupon: any }) {
    return (
        <Card className="mt-4 border-dashed border-2 border-emerald-500 bg-emerald-50/50">
            <CardContent className="flex flex-col items-center p-6 text-center gap-2">
                <div className="p-3 bg-emerald-100 rounded-full">
                    <Ticket className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-emerald-900">¡Cupón Generado!</h3>
                    <p className="text-sm text-emerald-700">Descuento del {coupon.discount}</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded border mt-2">
                    <code className="text-lg font-mono font-bold tracking-widest">{coupon.code}</code>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Válido hasta: {coupon.validUntil}</p>
            </CardContent>
        </Card>
    );
}

export function GeneratedImageCard({ data }: { data: any }) {
    return (
        <Card className="mt-4 overflow-hidden">
            <CardContent className="p-0">
                <div className="relative aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.imageUrl} alt={data.prompt} className="object-cover w-full h-full" />
                </div>
                <div className="p-3">
                    <p className="text-xs text-muted-foreground italic">
                        Generated from: "{data.prompt}"
                    </p>
                    <Button size="sm" className="w-full mt-2 gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Usar en Campaña
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
