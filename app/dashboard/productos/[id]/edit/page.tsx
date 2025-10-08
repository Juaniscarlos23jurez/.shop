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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Package as Box, Clock as ClockIcon, Wrench as WrenchIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { updateProduct } from '@/lib/api/products';
import { toast } from '@/components/ui/use-toast';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { api } from '@/lib/api/api';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Fetch product data, company and locations on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch company via API helper
        const companyRes = await api.userCompanies.get(token);
        const company = companyRes.success ? (companyRes.data?.data ?? companyRes.data) : null;
        if (!company || !company.id) {
          throw new Error('No se encontró una compañía asignada a tu usuario');
        }
        const resolvedCompanyId = String(company.id);
        setCompanyId(resolvedCompanyId);

        // Fetch product data using backend-supported route
        const productRes = await fetch(`https://laravel-pkpass-backend-development-pfaawl.laravel.cloud/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        if (productRes.ok) {
          const data = await productRes.json();
          const productData = Array.isArray(data.data) ? data.data[0] : data.data;
          if (!productData) {
            throw new Error('Producto no encontrado');
          }
          setProduct(productData);
          setProductType(productData.product_type);
          if (productData.locations && productData.locations.length > 0) {
            setSelectedLocations(productData.locations.map((loc: any) => loc.id));
          }
        } else {
          throw new Error('No se pudo cargar el producto');
        }

        // Fetch locations via API helper
        const locationsRes = await api.userCompanies.getLocations(token);
        if (locationsRes.success) {
          setLocations(locationsRes.data?.locations || []);
        }

        // Fetch categories
        await fetchCategories();
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

  // Revoke object URL when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setSelectedFile(file);
    }
  };

  const uploadImageIfNeeded = async (): Promise<string | null> => {
    if (!selectedFile || !companyId) return null;
    try {
      const filePath = `companies/${companyId}/products/${id || 'new'}/${Date.now()}_${selectedFile.name}`;
      const fileRef = storageRef(storage, filePath);
      await uploadBytes(fileRef, selectedFile);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (err) {
      console.error('Error uploading image to Firebase:', err);
      toast({
        title: 'Error al subir imagen',
        description: 'Continúo sin actualizar la imagen. Puedes intentar de nuevo.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const fetchCategories = async () => {
    if (!token) return;
    
    try {
      const response = await api.categories.getCategories(token);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Don't show error toast for categories - just log it
      // The form will still work with manual category input
    }
  };

  const handleCreateCategory = async () => {
    if (!token || !newCategoryName.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la categoría es requerido',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingCategory(true);
    
    try {
      await api.categories.createCategory(
        {
          name: newCategoryName,
          description: newCategoryDescription || undefined,
          is_active: true,
        },
        token
      );

      toast({
        title: '¡Éxito!',
        description: 'Categoría creada correctamente',
      });

      // Reset form and close modal
      setNewCategoryName('');
      setNewCategoryDescription('');
      setIsModalOpen(false);

      // Refresh categories
      await fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear la categoría',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id || !companyId) {
      toast({
        title: 'Error',
        description: 'Faltan datos necesarios para actualizar el producto',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    const uploadedUrl = await uploadImageIfNeeded();
      
    try {
      const formData = new FormData(e.target as HTMLFormElement);

      // Lead time conversion (minutes/hours/days -> days)
      const leadTimeValue = parseFloat((formData.get('lead_time') as string) || '0');
      const leadTimeUnit = (formData.get('lead_time_unit') as string) || 'days';
      const computeLeadTimeDays = (value: number, unit: string) => {
        if (!value || value <= 0) return undefined;
        switch (unit) {
          case 'minutes':
            return Math.max(1, Math.ceil(value / (60 * 24)));
          case 'hours':
            return Math.max(1, Math.ceil(value / 24));
          case 'days':
          default:
            return Math.max(1, Math.ceil(value));
        }
      };
      // Get stock data from form inputs
      const stockData: Record<string, number> = {};
      if (productType === 'physical') {
        selectedLocations.forEach((locId) => {
          const stockInput = document.querySelector(
            `input[name="stock-${locId}"]`
          ) as HTMLInputElement | null;
          if (stockInput) {
            stockData[locId] = parseInt(stockInput.value) || 0;
          }
        });
      }
      
      const updateData: any = {
        name: formData.get('name') as string,
        description: formData.get('description') as string || '',
        price: parseFloat(formData.get('price') as string) || 0,
        product_type: productType,
        sku: formData.get('sku') as string || undefined,
        category: formData.get('category') as string || '',
        is_active: formData.get('is_active') === 'on',
        image_url: uploadedUrl || product.image_url,
        points: formData.get('points') ? parseInt(formData.get('points') as string) : 0,
        locations: selectedLocations.map(locId => ({
          id: locId,
          is_available: true,
          ...(productType === 'physical' ? { stock: stockData[locId] || 0 } : {}),
        })),
        ...(productType === 'made_to_order' ? { lead_time_days: computeLeadTimeDays(leadTimeValue, leadTimeUnit) } : {}),
      };

      const response = await api.products.updateProduct(
        companyId,
        id as string,
        updateData,
        token
      );

      if (response.success) {
        toast({
          title: '¡Éxito!',
          description: 'Producto actualizado correctamente',
          variant: 'default',
        });
        router.push(`/dashboard/productos/${id}`);
      } else {
        throw new Error(response.message || 'Error al actualizar el producto');
      }
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar el producto',
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
                      <Label htmlFor="lead_time">Tiempo de Entrega</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          id="lead_time" 
                          name="lead_time" 
                          type="number" 
                          min="1" 
                          defaultValue={product.lead_time_days || 1}
                          placeholder="Ej: 7" 
                          required 
                        />
                        <select
                          id="lead_time_unit"
                          name="lead_time_unit"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          defaultValue="days"
                        >
                          <option value="minutes">Minutos</option>
                          <option value="hours">Horas</option>
                          <option value="days">Días</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category">Categoría</Label>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-8">
                          <Plus className="h-4 w-4 mr-1" />
                          Nueva Categoría
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear Nueva Categoría</DialogTitle>
                          <DialogDescription>
                            Agrega una nueva categoría para organizar tus productos
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-category-name">Nombre *</Label>
                            <Input
                              id="new-category-name"
                              placeholder="Ej: Bebidas"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-category-description">Descripción</Label>
                            <Textarea
                              id="new-category-description"
                              placeholder="Descripción de la categoría (opcional)"
                              value={newCategoryDescription}
                              onChange={(e) => setNewCategoryDescription(e.target.value)}
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsModalOpen(false);
                              setNewCategoryName('');
                              setNewCategoryDescription('');
                            }}
                            disabled={isCreatingCategory}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            onClick={handleCreateCategory}
                            disabled={isCreatingCategory || !newCategoryName.trim()}
                          >
                            {isCreatingCategory ? 'Creando...' : 'Crear Categoría'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <select
                    id="category"
                    name="category"
                    defaultValue={product.category || ''}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories
                      .filter(cat => cat.is_active)
                      .sort((a, b) => a.order - b.order)
                      .map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
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
                    {previewImage || product.image_url ? (
                      <img
                        src={previewImage || (product.image_url as string)}
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
                  <input
                    id="dropzone-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
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
