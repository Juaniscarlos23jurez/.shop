'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Package, Clock, Wrench, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { deleteProduct } from '@/lib/api/products';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/currency';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api/api';
import { InventoryMovements } from '@/components/inventory/inventory-movements';

export default function DetalleProductoPage() {
  const router = useRouter();
  const { id } = useParams();
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [stockToAdd, setStockToAdd] = useState<string>('');
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  
  const fetchProduct = useCallback(async () => {
    if (!token || !id) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`https://laravel-pkpass-backend-development-pfaawl.laravel.cloud/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // If data is an array, take the first item, otherwise use the data directly
        const productData = Array.isArray(data.data) ? data.data[0] : data.data;
        setProduct(productData);
      } else {
        throw new Error('No se pudo obtener la información del producto');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del producto',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  // Fetch product data on component mount
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'physical':
        return { label: 'Producto Físico', icon: <Package className="h-5 w-5" /> };
      case 'made_to_order':
        return { label: 'Bajo Pedido', icon: <Clock className="h-5 w-5" /> };
      case 'service':
        return { label: 'Servicio', icon: <Wrench className="h-5 w-5" /> };
      default:
        return { label: type, icon: null };
    }
  };

  const handleDelete = async () => {
    if (!id || !token || !user?.company_id) return;
    const confirmed = window.confirm('¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const response = await deleteProduct(String(user.company_id), String(id), token);

      if (response?.success) {
        toast({
          title: 'Producto eliminado',
          description: 'El producto se eliminó correctamente.',
        });
        router.push('/dashboard/productos');
      } else {
        toast({
          title: 'No se pudo eliminar',
          description: response?.message || 'Intenta nuevamente en unos momentos.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error al eliminar',
        description: 'Ocurrió un problema al conectar con el servidor.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-800">Producto no encontrado</h2>
        <p className="mt-2 text-slate-600">El producto que estás buscando no existe o no tienes permiso para verlo.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/productos')}>
          Volver a la lista de productos
        </Button>
      </div>
    );
  }

  const { label: typeLabel, icon: typeIcon } = getTypeLabel(product.product_type);
  const totalStock = product.locations?.reduce(
    (sum: number, loc: any) => sum + (Number(loc?.pivot?.stock) || 0),
    0
  ) || 0;

  const handleSubmitStock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.company_id || !token || !id) return;
    const stockAmount = Number(stockToAdd);

    if (!selectedLocationId || Number.isNaN(stockAmount) || stockAmount <= 0) {
      toast({
        title: 'Datos incompletos',
        description: 'Selecciona la ubicación y la cantidad que deseas agregar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUpdatingStock(true);
      const location = product.locations.find((loc: any) => loc.id === selectedLocationId);
      const currentStock = Number(location?.pivot?.stock) || 0;
      const newStockTotal = currentStock + stockAmount;

      const response = await api.products.updateProductStock(
        String(user.company_id),
        String(id),
        selectedLocationId,
        newStockTotal,
        token
      );

      if (!response.success) {
        throw new Error(response.message || 'No se pudo actualizar el stock');
      }

      toast({
        title: 'Stock actualizado',
        description: `Ahora hay ${newStockTotal} unidades en ${location?.name || 'la ubicación seleccionada'}.`,
      });

      setIsStockModalOpen(false);
      setStockToAdd('');
      await fetchProduct();
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el stock',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStock(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/productos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{product.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                {product.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                {typeIcon}
                {typeLabel}
              </Badge>
              {product.sku && (
                <span className="text-sm text-slate-500">SKU: {product.sku}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/productos/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Descripción</h3>
                  <p className="text-slate-800 whitespace-pre-line">{product.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Precio</h3>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(Number(product.price))}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Puntos</h3>
                  <p className="text-lg font-semibold text-blue-600">{product.points || 0}</p>
                </div>
                {product.product_type === 'physical' && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Stock Total</h3>
                    <p className="text-lg font-semibold text-slate-900">{totalStock} unidades</p>
                  </div>
                )}
                {product.product_type === 'made_to_order' && product.lead_time_days && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Tiempo de Entrega</h3>
                    <p className="text-lg font-semibold text-slate-900">{product.lead_time_days} días</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {product.product_type === 'physical' && product.locations?.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Inventario por Ubicación</CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setSelectedLocationId(null);
                      setStockToAdd('');
                      setIsStockModalOpen(true);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Agregar stock
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.locations.map((location: any) => (
                    <div key={location.id} className="flex flex-col gap-3 p-3 border rounded-lg md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">{location.name}</h4>
                        <p className="text-sm text-slate-500">Disponible: {Number(location?.pivot?.stock) || 0} unidades</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <Badge variant={location?.pivot?.is_available ? 'default' : 'secondary'}>
                          {location?.pivot?.is_available ? 'Disponible' : 'No disponible'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLocationId(location.id);
                            setStockToAdd('');
                            setIsStockModalOpen(true);
                          }}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Agregar cantidad
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Inventory Movements - Only for physical products that track stock */}
          {product.product_type === 'physical' && product.track_stock && token && (
            <InventoryMovements
              companyId={user?.company_id || ''}
              productId={product.id}
              token={token}
            />
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagen del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-slate-400">
                    <Package className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Sin imagen</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Categoría</h3>
                <p className="text-slate-900 capitalize">
                  {(() => {
                    if (product.category) return product.category;
                    const cats = product.categories?.filter((c: any) => c?.name)?.map((c: any) => c.name) || [];
                    if (cats.length === 1) return cats[0];
                    if (cats.length > 1) return cats.join(', ');
                    return 'Sin categoría';
                  })()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Creado</h3>
                <p className="text-slate-900">
                  {new Date(product.created_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Última actualización</h3>
                <p className="text-slate-900">
                  {new Date(product.updated_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
        <DialogContent>
          <form onSubmit={handleSubmitStock}>
            <DialogHeader>
              <DialogTitle>Agregar stock</DialogTitle>
              <DialogDescription>
                Incrementa la cantidad disponible en una sucursal específica.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <select
                  id="location"
                  value={selectedLocationId ? String(selectedLocationId) : ''}
                  onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : null)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Selecciona una ubicación</option>
                  {product.locations?.map((location: any) => (
                    <option key={location.id} value={location.id}>
                      {location.name} (Stock actual: {Number(location?.pivot?.stock) || 0})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockToAdd">Cantidad a agregar</Label>
                <Input
                  id="stockToAdd"
                  type="number"
                  min="1"
                  className="appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={stockToAdd}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setStockToAdd('');
                      return;
                    }
                    const numericValue = Math.max(0, Number(value));
                    setStockToAdd(Number.isNaN(numericValue) ? '' : numericValue.toString());
                  }}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStockModalOpen(false)} disabled={isUpdatingStock}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdatingStock}>
                {isUpdatingStock ? 'Actualizando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
