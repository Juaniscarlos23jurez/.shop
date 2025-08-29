'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Mock data for coupons
const mockCoupons = [
  {
    id: '1',
    code: 'WELCOME20',
    description: '20% de descuento en la primera compra',
    discount: 20,
    discountType: 'percentage',
    minPurchase: 500,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    maxUses: 100,
    used: 45,
    status: 'active',
  },
  {
    id: '2',
    code: 'FREESHIP',
    description: 'Envío gratuito en compras superiores a $1000',
    discount: 0,
    discountType: 'free_shipping',
    minPurchase: 1000,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    maxUses: 200,
    used: 123,
    status: 'active',
  },
  {
    id: '3',
    code: 'SUMMER25',
    description: '25% de descuento en productos de verano',
    discount: 25,
    discountType: 'percentage',
    minPurchase: 0,
    validFrom: '2024-06-01',
    validUntil: '2024-08-31',
    maxUses: 500,
    used: 0,
    status: 'scheduled',
  },
  {
    id: '4',
    code: 'FRIEND10',
    description: '10% de descuento para referidos',
    discount: 10,
    discountType: 'percentage',
    minPurchase: 0,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    maxUses: 1000,
    used: 1000,
    status: 'expired',
  },
];

export default function CuponesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCoupons = mockCoupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Programado</Badge>;
      case 'expired':
        return <Badge variant="outline">Expirado</Badge>;
      case 'disabled':
        return <Badge variant="outline">Deshabilitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDiscountText = (coupon: any) => {
    if (coupon.discountType === 'free_shipping') {
      return 'Envío Gratis';
    }
    return `${coupon.discount}% de descuento`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cupones</h1>
          <p className="text-muted-foreground">
            Gestiona los cupones de descuento para tus clientes
          </p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={() => router.push('/dashboard/cupones/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cupón
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cupones..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtrar</span>
              </Button>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="scheduled">Programados</option>
                <option value="expired">Expirados</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCoupons.length > 0 ? (
            <div className="space-y-4">
              {filteredCoupons.map((coupon) => (
                <Card key={coupon.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">{coupon.code}</h3>
                          {getStatusBadge(coupon.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{coupon.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-foreground font-medium">{getDiscountText(coupon)}</span>
                          {coupon.minPurchase > 0 && (
                            <span>Mín. compra: ${coupon.minPurchase}</span>
                          )}
                          <span>Usos: {coupon.used}/{coupon.maxUses}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/cupones/${coupon.id}`)}
                        >
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron cupones que coincidan con tu búsqueda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
