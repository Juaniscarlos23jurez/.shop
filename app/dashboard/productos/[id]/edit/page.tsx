'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Package as Box, Clock as ClockIcon, Wrench as WrenchIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getProduct, updateProduct } from '@/lib/api/products';
import { toast } from '@/components/ui/use-toast';
import { Product } from '@/types/product';

export default function EditarProductoPage() {
  const router = useRouter();
  const { id } = useParams();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [locations, setLocations] = useState<Array<{id: number, name: string}>>([]);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [product, setProduct] = useState<Partial<Product>>({});
  const [productType, setProductType] = useState<'physical' | 'made_to_order' | 'service'>('physical');
  
  // Fetch product data, company and locations on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch company first
        const companyResponse = await fetch('https://laravel-pkpass-backend-development-pfaawl.laravel.cloud/api/auth/profile/company', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          if (companyData.company_id) {
            setCompanyId(companyData.company_id);
            
            // Fetch product data
            const productResponse = await getProduct(companyData.company_id, id as string, token);
            if (productResponse.success && productResponse.product) {
              const productData = productResponse.product;
              setProduct(productData);
              setProductType(productData.product_type);
              
              // Set selected locations
              if (productData.locations && productData.locations.length > 0) {
                setSelectedLocations(productData.locations.map(loc => loc.id));
              }
            }
            
            // Fetch locations
            const locationsResponse = await fetch('https://laravel-pkpass-backend-development-pfaawl.laravel.cloud/api/locations', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              },
            });
            
            if (locationsResponse.ok) {
              const locationsData = await locationsResponse.json();
              setLocations(locationsData.locations || []);
            }
          } else {
            throw new Error('No se encontró una compañía asignada a tu usuario');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Error al cargar los datos del producto',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [token, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !companyId) {
      toast({
        title: 'Error',
        description: 'No se pudo autenticar. Por favor, inicia sesión de nuevo.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      const productData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string || '',
        price: parseFloat(formData.get('price') as string),
        points: parseInt(formData.get('points') as string, 10) || 0,
        product_type: productType,
        sku: formData.get('sku') as string || undefined,
        category: formData.get('category') as string || 'otros',
        is_active: formData.get('is_active') === 'on',
        track_stock: productType === 'physical',
        ...(productType === 'physical' && {
          stock: parseInt(formData.get('stock') as string, 10) || 0,
        }),
        ...(productType === 'made_to_order' && {
          lead_time_days: parseInt(formData.get('lead_time') as string, 10) || 1,
        }),
        locations: selectedLocations.map(locationId => ({
          id: locationId,
          is_available: true,
          ...(productType === 'physical' && { 
            stock: parseInt(formData.get(`stock_${locationId}`) as string, 10) || 0 
          })
        }))
      };

      const response = await updateProduct(companyId, id as string, productData, token);
      
      if (response.success) {
        toast({
          title: '¡Éxito!',
          description: 'El producto se ha actualizado correctamente',
        });
        router.push('/dashboard/productos');
      } else {
        throw new Error(response.message || 'Error al actualizar el producto');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ocurrió un error al actualizar el producto',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/productos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Editar Producto</h1>
          <p className="text-slate-600 mt-1">Actualiza la información del producto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Producto</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={product.name}
                    placeholder="Ej: Camiseta de Algodón" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Código)</Label>
                  <Input 
                    id="sku" 
                    name="sku" 
                    defaultValue={product.sku}
                    placeholder="Ej: PROD-001" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={product.description}
                  placeholder="Describe el producto" 
                  rows={4} 
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="block">Tipo de Producto</Label>
                  <RadioGroup 
                    value={productType}
                    onValueChange={(value) => setProductType(value as 'physical' | 'made_to_order' | 'service')}
                    className="grid gap-4 md:grid-cols-3"
                  >
                    <div>
                      <RadioGroupItem value="physical" id="physical" className="peer sr-only" />
                      <Label
                        htmlFor="physical"
                        className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                          productType === 'physical' ? 'border-primary' : ''
                        }`}
                      >
                        <Box className="mb-2 h-6 w-6" />
                        <span>Producto Físico</span>
                        <span className="text-sm text-muted-foreground">Con inventario</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="made_to_order" id="made_to_order" className="peer sr-only" />
                      <Label
                        htmlFor="made_to_order"
                        className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                          productType === 'made_to_order' ? 'border-primary' : ''
                        }`}
                      >
                        <ClockIcon className="mb-2 h-6 w-6" />
                        <span>Bajo Pedido</span>
                        <span className="text-sm text-muted-foreground">Se fabrica al momento</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="service" id="service" className="peer sr-only" />
                      <Label
                        htmlFor="service"
                        className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                          productType === 'service' ? 'border-primary' : ''
                        }`}
                      >
                        <WrenchIcon className="mb-2 h-6 w-6" />
                        <span>Servicio</span>
                        <span className="text-sm text-muted-foreground">Sin inventario</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-8"
                        placeholder="0.00"
                        defaultValue={product.price}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="points">Puntos</Label>
                    <Input 
                      id="points" 
                      name="points" 
                      type="number" 
                      min="0" 
                      defaultValue={product.points || 0}
                      placeholder="0" 
                    />
                  </div>
                  
                  {productType === 'physical' && (
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Total</Label>
                      <Input 
                        id="stock" 
                        name="stock" 
                        type="number" 
                        min="0" 
                        defaultValue={product.stock || 0}
                        placeholder="0" 
                        required 
                      />
                    </div>
                  )}
                  
                  {productType === 'made_to_order' && (
                    <div className="space-y-2">
                      <Label htmlFor="lead_time">Tiempo de Entrega (días)</Label>
                      <Input 
                        id="lead_time" 
                        name="lead_time" 
                        type="number" 
                        min="1" 
                        defaultValue={product.lead_time_days || 1}
                        placeholder="Ej: 7" 
                        required 
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={product.category || ''}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="ropa">Ropa</option>
                    <option value="accesorios">Accesorios</option>
                    <option value="hogar">Hogar</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Ubicaciones Disponibles</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                  {locations.length > 0 ? (
                    locations.map((location) => {
                      const productLocation = product.locations?.find(loc => loc.id === location.id);
                      const stock = productLocation?.stock || 0;
                      
                      return (
                        <div key={location.id} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`location-${location.id}`}
                              checked={selectedLocations.includes(location.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedLocations([...selectedLocations, location.id]);
                                } else {
                                  setSelectedLocations(selectedLocations.filter(id => id !== location.id));
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor={`location-${location.id}`} className="text-sm font-medium leading-none">
                              {location.name}
                            </Label>
                          </div>
                          
                          {productType === 'physical' && selectedLocations.includes(location.id) && (
                            <div className="ml-6 mb-2">
                              <Label htmlFor={`stock_${location.id}`} className="text-xs text-muted-foreground">
                                Stock en {location.name}:
                              </Label>
                              <Input 
                                id={`stock_${location.id}`}
                                name={`stock_${location.id}`}
                                type="number"
                                min="0"
                                defaultValue={stock}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay ubicaciones disponibles</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecciona las ubicaciones donde estará disponible este producto
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_active" 
                  name="is_active" 
                  defaultChecked={product.is_active !== false} 
                />
                <Label htmlFor="is_active">Producto activo</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imágenes del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="max-h-40 max-w-full mb-4 rounded-md"
                      />
                    ) : (
                      <>
                        <svg
                          className="w-8 h-8 mb-4 text-slate-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-slate-500">
                          <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                        </p>
                        <p className="text-xs text-slate-500">SVG, PNG, JPG o GIF (MAX. 10MB)</p>
                      </>
                    )}
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" multiple />
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/productos')}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
