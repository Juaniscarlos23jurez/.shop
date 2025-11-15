'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { Coupon } from '@/types/api';
import { toast } from '@/hooks/use-toast';

interface ExtendedCoupon extends Coupon {
  used?: number;
}

export default function CuponesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coupons, setCoupons] = useState<ExtendedCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        // First fetch company data
        const companyResponse = await api.userCompanies.get(token);
        console.log('Company Response:', JSON.stringify(companyResponse, null, 2));
        if (!companyResponse.success || !companyResponse.data?.data?.id) {
          throw new Error('Error al obtener datos de la compañía');
        }

        // Then fetch coupons with the company ID
        const companyId = companyResponse.data.data.id;
        setCompanyId(companyId);
        console.log('Fetching coupons for company ID:', companyId);
        
        try {
          const response = await api.coupons.getCoupons(companyId, token);
          console.log('Coupons API Response (stringified):', JSON.stringify(response, null, 2));
          
          if (response.success) {
            if (response.data?.data?.data) {
              // The API returns a paginated response with the actual data in the 'data' property
              console.log('Found coupons:', response.data.data.data);
              setCoupons(response.data.data.data);
            } else if (response.data?.data && Array.isArray(response.data.data)) {
              // Handle case where the response structure might be different
              console.log('Found coupons (alternative structure):', response.data.data);
              setCoupons(response.data.data);
            } else {
              console.warn('No coupons found in the response');
              setCoupons([]); // Set empty array instead of throwing error
            }
          } else {
            console.error('API returned success:false with data:', response);
            throw new Error(response.message || 'Error al obtener los cupones');
          }
        } catch (error) {
          console.error('Error fetching coupons:', error);
          throw new Error('Error al conectar con el servidor');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getCouponStatus = (coupon: ExtendedCoupon): string => {
    const now = new Date();
    const startsAt = new Date(coupon.starts_at);
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

    if (!coupon.is_active) return 'disabled';
    if (startsAt > now) return 'scheduled';
    if (expiresAt && expiresAt < now) return 'expired';
    return 'active';
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const status = getCouponStatus(coupon);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
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

  const getDiscountText = (coupon: ExtendedCoupon) => {
    if (coupon.type === 'free_shipping') {
      return 'Envío Gratis';
    } else if (coupon.type === 'fixed_amount' && coupon.discount_amount) {
      return `$${coupon.discount_amount} de descuento`;
    } else if (coupon.type === 'percentage' && coupon.discount_percentage) {
      return `${coupon.discount_percentage}% de descuento`;
    } else if (coupon.type === 'buy_x_get_y' && coupon.buy_quantity && coupon.get_quantity) {
      return `Compra ${coupon.buy_quantity} y lleva ${coupon.get_quantity}`;
    } else if (coupon.type === 'free_item') {
      return 'Producto gratis';
    }
    return 'Descuento';
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!token || !companyId) return;
    const confirmed = window.confirm('¿Seguro que deseas eliminar este cupón? Esta acción no se puede deshacer.');
    if (!confirmed) return;
    try {
      setDeletingId(id);
      await api.coupons.deleteCoupon(companyId, id, token);
      setCoupons((prev) => prev.filter((c) => String(c.id) !== id));
      toast({ title: 'Cupón eliminado', description: 'El cupón se eliminó correctamente.' });
    } catch (e) {
      console.error('Error deleting coupon', e);
      toast({ title: 'Error', description: 'No se pudo eliminar el cupón.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
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
          {loading && <p>Cargando datos de la compañía y cupones...</p>}
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredCoupons.length > 0 ? (
            <div className="space-y-4">
              {filteredCoupons.map((coupon) => (
                <Card key={coupon.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">{coupon.code}</h3>
                          {getStatusBadge(getCouponStatus(coupon))}
                        </div>
                        <p className="text-sm text-muted-foreground">{coupon.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-foreground font-medium">{getDiscountText(coupon)}</span>
                          {coupon.min_purchase_amount && coupon.min_purchase_amount > 0 && (
                            <span>Mín. compra: ${coupon.min_purchase_amount}</span>
                          )}
                          {coupon.usage_limit && (
                            <span>Usos: {coupon.used || 0}/{coupon.usage_limit}</span>
                          )}
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
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCoupon(String(coupon.id))}
                          disabled={deletingId === String(coupon.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === String(coupon.id) ? 'Eliminando...' : 'Eliminar'}
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
