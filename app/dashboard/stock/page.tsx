'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, Download, Package, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { api } from '@/lib/api/api';
import { InventoryMovement, LaravelPaginator } from '@/types/api';
import { Product } from '@/types/product';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function StockPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [pagination, setPagination] = useState<LaravelPaginator<InventoryMovement> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    from_date: string;
    to_date: string;
    type: 'sale' | 'purchase' | 'adjustment' | 'transfer' | 'all';
    location_id: string;
    product_id: string;
  }>({
    from_date: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    to_date: format(new Date(), 'yyyy-MM-dd'),
    type: 'all',
    location_id: '',
    product_id: 'all',
  });

  // Fetch products for filter
  const fetchProducts = async () => {
    if (!token || !user?.company_id) return;
    
    try {
      setLoadingProducts(true);
      const response = await api.products.getProducts(user.company_id, token);
      
      if (response.success && response.data) {
        const productsData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setProducts(Array.isArray(productsData) ? productsData.filter((p: Product) => p.track_stock) : []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchMovements = async (page = 1) => {
    if (!token || !user?.company_id) {
      console.error('Token or CompanyId is missing');
      return;
    }

    try {
      setLoading(true);
      const response = await api.products.getInventoryMovements(user.company_id, token, {
        page,
        per_page: 20,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.from_date && { from_date: filters.from_date }),
        ...(filters.to_date && { to_date: filters.to_date }),
        ...(filters.location_id && { location_id: Number(filters.location_id) }),
        ...(filters.product_id !== 'all' && { product_id: Number(filters.product_id) }),
      });

      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response data data:', response.data?.data);

      if (response.success && response.data) {
        const responseData = response.data.data as unknown as LaravelPaginator<InventoryMovement>;
        const movementsData = responseData?.data || [];
        console.log('Movements array:', movementsData);
        setMovements(Array.isArray(movementsData) ? movementsData : []);
        setPagination(responseData || null);
      } else {
        setMovements([]);
        toast({
          title: "Error",
          description: response.message || "No se pudieron cargar los movimientos de inventario",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      setMovements([]);
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los movimientos de inventario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token, user?.company_id]);

  useEffect(() => {
    fetchMovements();
  }, [filters]);

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'sale':
        return 'Venta';
      case 'purchase':
        return 'Compra';
      case 'adjustment':
        return 'Ajuste';
      case 'transfer':
        return 'Transferencia';
      default:
        return type;
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'destructive';
      case 'purchase':
        return 'default';
      case 'adjustment':
        return 'secondary';
      case 'transfer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Fecha', 'Tipo', 'Producto', 'Ubicación', 'Cantidad', 'Stock Anterior', 'Stock Nuevo', 'Referencia', 'Notas'],
      ...movements.map(m => [
        format(new Date(m.created_at), 'dd/MM/yyyy HH:mm', { locale: es }),
        getMovementTypeLabel(m.type),
        m.product?.name || '',
        m.location?.name || '',
        m.quantity_change.toString(),
        m.stock_before.toString(),
        m.stock_after.toString(),
        m.reference || '',
        m.notes || '',
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `movimientos_inventario_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // Filter movements by search term
  const filteredMovements = movements.filter(movement => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      movement.product?.name?.toLowerCase().includes(searchLower) ||
      movement.location?.name?.toLowerCase().includes(searchLower) ||
      movement.reference?.toLowerCase().includes(searchLower) ||
      movement.notes?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Movimientos de Inventario</h1>
          <p className="text-slate-600 mt-1">Historial completo de movimientos de stock </p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label htmlFor="from_date">Desde</Label>
              <Input
                id="from_date"
                type="date"
                value={filters.from_date}
                onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="to_date">Hasta</Label>
              <Input
                id="to_date"
                type="date"
                value={filters.to_date}
                onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={filters.type} onValueChange={(value: 'sale' | 'purchase' | 'adjustment' | 'transfer' | 'all') => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="purchase">Compra</SelectItem>
                  <SelectItem value="adjustment">Ajuste</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product">Producto</Label>
              <Select value={filters.product_id} onValueChange={(value) => setFilters({ ...filters, product_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los productos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los productos</SelectItem>
                  {loadingProducts ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : (
                    products.map((product) => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        {product.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Producto, ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Movimientos
            {filteredMovements.length > 0 && (
              <Badge variant="secondary">{filteredMovements.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay movimientos de inventario en el período seleccionado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-700">Fecha</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-700">Producto</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-700">Ubicación</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-slate-700">Movimiento</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-slate-700">Stock</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-700">Tipo</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-700">Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement) => (
                    <tr key={movement.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <div className="text-sm">
                          {format(new Date(movement.created_at), 'dd/MM/yyyy', { locale: es })}
                        </div>
                        <div className="text-xs text-slate-500">
                          {format(new Date(movement.created_at), 'HH:mm', { locale: es })}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-sm">{movement.product?.name || '-'}</div>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        {movement.location?.name || '-'}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-1">
                          {movement.quantity_change > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${movement.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-center text-sm">
                          <span className="text-slate-500">{movement.stock_before}</span>
                          <span className="mx-1">→</span>
                          <span className="font-medium">{movement.stock_after}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={getMovementTypeColor(movement.type) as any}>
                          {getMovementTypeLabel(movement.type)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        {movement.reference || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-slate-600">
                    Mostrando {pagination.from} a {pagination.to} de {pagination.total} movimientos
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.prev_page_url}
                      onClick={() => fetchMovements(pagination.current_page - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-3 text-sm text-slate-600">
                      Página {pagination.current_page} de {pagination.last_page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.next_page_url}
                      onClick={() => fetchMovements(pagination.current_page + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}