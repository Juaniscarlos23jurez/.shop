'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { CouponType, CouponCreateInput } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Check, ArrowLeft, Copy } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProducts } from '@/lib/api/products';
import type { Product } from '@/types/product';


export default function NewCouponPage() {
  const [date, setDate] = useState<{
    from: Date;
    to?: Date;
  } | undefined>({
    from: new Date(),
    to: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  });

  type FormData = {
    code: string;
    name: string;
    description: string;
    type: CouponType;
    is_active: boolean;
    is_public: boolean;
    is_single_use: boolean;
    usage_limit: string;
    usage_limit_per_user: string;
    min_purchase_amount: string;
    discount_percentage: string;
    discount_amount: string;
    buy_quantity: string;
    get_quantity: string;
    item_id: string;
  };

  const { token, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    is_active: true,
    is_public: true,
    is_single_use: false,
    usage_limit: '',
    usage_limit_per_user: '',
    min_purchase_amount: '',
    discount_percentage: '',
    discount_amount: '',
    buy_quantity: '',
    get_quantity: '',
    item_id: ''
  });

  // Followers/Users state
  const [followers, setFollowers] = useState<Array<{
    customer_id: number;
    customer_name: string;
    customer_email: string;
    customer_fcm_token?: string | null;
    has_active_membership?: number;
    membership_plan_name?: string | null;
  }>>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'membership_only' | 'no_membership'>('all');
  const [followersLoading, setFollowersLoading] = useState(false);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | undefined>(
    user?.company_id ? String(user.company_id) : undefined
  );

  // Products state for "free_item" coupon type
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Filtered followers based on membership filter
  const filteredFollowers = useMemo(() => {
    // Ensure followers is always an array
    if (!Array.isArray(followers)) return [];
    
    if (filterMode === 'all') return followers;
    if (filterMode === 'membership_only') {
      return followers.filter(f => f.has_active_membership === 1);
    }
    if (filterMode === 'no_membership') {
      return followers.filter(f => f.has_active_membership === 0);
    }
    return followers;
  }, [followers, filterMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Load followers on component mount
  useEffect(() => {
    const loadFollowers = async () => {
      if (!token) return;
      
      try {
        setFollowersLoading(true);
        
        // Get companyId
        let cid = resolvedCompanyId;
        if (!cid) {
          const companyResponse = await api.userCompanies.get(token);
          if (companyResponse.success && companyResponse.data) {
            const data = companyResponse.data;
            cid = String(
              data.id || 
              data.company_id || 
              data.company?.id || 
              data.data?.id ||
              ''
            );
            if (cid && cid !== 'undefined') {
              setResolvedCompanyId(cid);
            }
          }
        }
        
        if (!cid) {
          console.error('No se pudo obtener el ID de la compañía');
          return;
        }

        const res = await api.companies.listFollowers(cid, token, { per_page: 100 });
        
        console.log('[DEBUG] Followers API Response:', {
          success: res.success,
          dataKeys: res.data ? Object.keys(res.data) : [],
          fullData: res.data
        });
        
        // Try to normalize different possible response shapes
        let raw: any[] = [];
        const d = res.data;
        if (d?.followers && Array.isArray(d.followers)) {
          raw = d.followers;
        } else if (d?.data?.data && Array.isArray(d.data.data)) {
          raw = d.data.data;
        } else if (d?.data && Array.isArray(d.data)) {
          raw = d.data;
        } else if (Array.isArray(d)) {
          raw = d;
        }

        const mapped = raw.map((f: any) => ({
          customer_id: f.customer_id ?? f.id,
          customer_name: f.customer_name ?? f.name ?? '',
          customer_email: f.customer_email ?? f.email ?? '',
          customer_fcm_token: f.customer_fcm_token ?? f.fcm_token ?? null,
          has_active_membership: Number(f.has_active_membership ?? 0),
          membership_plan_name: f.membership_plan_name ?? null,
        }));
        
        console.log('[DEBUG] Mapped followers:', mapped.length, mapped);
        setFollowers(mapped);
      } catch (error) {
        console.error('Error loading followers:', error);
      } finally {
        setFollowersLoading(false);
      }
    };

    loadFollowers();
  }, [token, resolvedCompanyId]);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      code: result
    }));
  };

  const toggleRecipient = (customerId: number) => {
    setSelectedRecipients(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAll = () => {
    setSelectedRecipients(filteredFollowers.map(f => f.customer_id));
  };

  const deselectAll = () => {
    setSelectedRecipients([]);
  };

  // Load products when needed for free_item type
  useEffect(() => {
    const loadProducts = async () => {
      if (!token) return;
      if (formData.type !== 'free_item') return;

      try {
        setProductsLoading(true);
        // Ensure company id is resolved
        let cid = resolvedCompanyId;
        if (!cid) {
          const companyResponse = await api.userCompanies.get(token);
          if (companyResponse.success && companyResponse.data) {
            const data = companyResponse.data;
            cid = String(
              data.id ||
              data.company_id ||
              data.company?.id ||
              data.data?.id ||
              ''
            );
            if (cid && cid !== 'undefined') setResolvedCompanyId(cid);
          }
        }
        if (!cid) return;

        const resp = await getProducts(cid, token, { page: 1, per_page: 100 });
        // Normalize like productos/page.tsx
        const payload: any = resp?.data;
        const normalized: Product[] = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.products)
            ? payload.products
            : Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.data?.products)
                ? payload.data.products
                : [];
        setProducts(normalized);
      } catch (e) {
        console.error('[Cupones] Error loading products:', e);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [formData.type, token, resolvedCompanyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const companyResponse = await api.userCompanies.get(token);
      console.log('[Cupones] Company response:', companyResponse);
      
      if (!companyResponse.success || !companyResponse.data?.data?.id) {
        throw new Error('Error al obtener datos de la compañía');
      }

      const companyId = companyResponse.data.data.id;

      // Build payload with user_ids directly (NEW BACKEND FORMAT)
      const payload: any = {
        company_id: companyId,  // ← AGREGAR company_id explícitamente
        code: formData.code,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        is_active: formData.is_active,
        is_public: formData.is_public,
        is_single_use: formData.is_single_use,
        starts_at: date?.from?.toISOString() || new Date().toISOString(),
        expires_at: date?.to?.toISOString() || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      };

      // Add optional numeric fields
      if (formData.usage_limit) {
        payload.usage_limit = parseInt(formData.usage_limit);
      }
      if (formData.usage_limit_per_user) {
        payload.usage_limit_per_user = parseInt(formData.usage_limit_per_user);
      }
      if (formData.min_purchase_amount) {
        payload.min_purchase_amount = parseFloat(formData.min_purchase_amount);
      }

      // Add type-specific fields
      if (formData.type === 'percentage' && formData.discount_percentage) {
        payload.discount_percentage = parseFloat(formData.discount_percentage);
      }
      if (formData.type === 'fixed_amount' && formData.discount_amount) {
        payload.discount_amount = parseFloat(formData.discount_amount);
      }
      if (formData.type === 'buy_x_get_y') {
        if (formData.buy_quantity) payload.buy_quantity = parseInt(formData.buy_quantity);
        if (formData.get_quantity) payload.get_quantity = parseInt(formData.get_quantity);
        if (formData.item_id) payload.item_id = formData.item_id;
      }
      if (formData.type === 'free_item' && formData.item_id) {
        payload.item_id = formData.item_id;
      }

      // Add user_ids if there are selected recipients (NEW: sent in creation payload)
      if (selectedRecipients.length > 0) {
        payload.user_ids = selectedRecipients;
      }

      // TODO: Add membership_plan_ids selector in UI
      // payload.membership_plan_ids = [];

      console.log('[Cupones] Payload to send:', JSON.stringify(payload, null, 2));

      const response = await api.coupons.createCoupon(
        companyId,
        payload,
        token
      );

      console.log('[Cupones] Create response:', response);

      if (!response.success) {
        throw new Error(response.error || 'Error creating cupón');
      }

      const createdCoupon: any = response.data?.coupon || response.data;
      console.log('[Cupones] Created coupon:', createdCoupon);

      // Show success message
      const userCount = createdCoupon?.user_assignments?.length || selectedRecipients.length;
      const membershipCount = createdCoupon?.membership_plans?.length || 0;
      
      let description = 'El cupón se ha creado correctamente';
      if (userCount > 0) {
        description += ` y asignado a ${userCount} usuario(s)`;
      }
      if (membershipCount > 0) {
        description += ` con ${membershipCount} plan(es) de membresía`;
      }

      toast({
        title: 'Cupón creado',
        description,
      });
      
      router.push('/dashboard/cupones');
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear el cupón',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Cupón</h1>
          <p className="text-muted-foreground">
            Crea un nuevo cupón de descuento para tus clientes
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>
                Configura los detalles principales del cupón
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="code">Código del cupón</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={generateRandomCode}
                    >
                      Generar código
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="code"
                      name="code"
                      placeholder="Ej: VERANO25"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      className="font-mono"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => formData.code && navigator.clipboard.writeText(formData.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Descuento de verano"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de descuento</Label>
                  <select
                    id="type"
                    name="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Porcentaje de descuento</option>
                    <option value="fixed_amount">Monto fijo</option>
                    <option value="free_shipping">Envío gratuito</option>
                    <option value="buy_x_get_y">Compra X Lleva Y</option>
                    <option value="free_item">Producto gratis</option>
                  </select>
                </div>

                {(formData.type === 'percentage' || formData.type === 'fixed_amount') && (
                  <div className="space-y-2">
                    <Label htmlFor="discount">
                      {formData.type === 'percentage' ? 'Porcentaje de descuento' : 'Monto de descuento'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="discount"
                        name={formData.type === 'percentage' ? 'discount_percentage' : 'discount_amount'}
                        type="number"
                        min="0"
                        max={formData.type === 'percentage' ? '100' : undefined}
                        step={formData.type === 'percentage' ? '1' : '0.01'}
                        value={formData.type === 'percentage' ? formData.discount_percentage : formData.discount_amount}
                        onChange={handleInputChange}
                        required
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-2.5 text-muted-foreground">
                        {formData.type === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="minPurchase">Compra mínima (opcional)</Label>
                  <div className="relative">
                    <Input
                      id="min_purchase_amount"
                      name="min_purchase_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.min_purchase_amount}
                      onChange={handleInputChange}
                      className="pl-8"
                    />
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Límite de usos (opcional)</Label>
                  <Input
                    id="usage_limit"
                    name="usage_limit"
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={handleInputChange}
                    placeholder="Ilimitado si se deja en blanco"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usage_limit_per_user">Límite por usuario (opcional)</Label>
                  <Input
                    id="usage_limit_per_user"
                    name="usage_limit_per_user"
                    type="number"
                    min="1"
                    value={formData.usage_limit_per_user}
                    onChange={handleInputChange}
                    placeholder="Ilimitado si se deja en blanco"
                  />
                </div>

                {formData.type === 'buy_x_get_y' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="buy_quantity">Cantidad a comprar</Label>
                      <Input
                        id="buy_quantity"
                        name="buy_quantity"
                        type="number"
                        min="1"
                        value={formData.buy_quantity}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="get_quantity">Cantidad a llevar</Label>
                      <Input
                        id="get_quantity"
                        name="get_quantity"
                        type="number"
                        min="1"
                        value={formData.get_quantity}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </>
                )}

                {formData.type === 'free_item' && (
                  <div className="space-y-2">
                    <Label htmlFor="item_id">Producto gratis</Label>
                    <Select
                      value={formData.item_id}
                      onValueChange={(val) => setFormData(prev => ({ ...prev, item_id: val }))}
                      disabled={productsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={productsLoading ? 'Cargando productos...' : 'Selecciona un producto'} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.length > 0 ? (
                          products.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} {p.price ? `- $${parseFloat(String(p.price)).toFixed(2)}` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">No hay productos disponibles</div>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Selecciona el producto que será gratuito con esta promoción.</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Vigencia</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-normal text-muted-foreground">Fecha de inicio</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date?.from ? (
                            format(date.from, "PPP")
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date?.from}
                          onSelect={(selectedDate) => 
                            setDate({
                              from: selectedDate || new Date(),
                              to: date?.to
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-normal text-muted-foreground">Fecha de expiración</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date?.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date?.to ? (
                            format(date.to, "PPP")
                          ) : (
                            <span>Sin fecha de expiración</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date?.to}
                          onSelect={(selectedDate) => 
                            setDate({
                              from: date?.from || new Date(),
                              to: selectedDate
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Ej: 20% de descuento en productos seleccionados"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Estado</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.is_active ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_active: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cupón público</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.is_public ? 'Visible para todos' : 'Solo para usuarios seleccionados'}
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_public}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_public: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Un solo uso por usuario</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.is_single_use ? 'Sí' : 'No'}
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_single_use}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_single_use: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Segmentation Card - Only show for non-public coupons */}
          {!formData.is_public && (
            <Card>
              <CardHeader>
                <CardTitle>Segmentación de Usuarios</CardTitle>
                <CardDescription>
                  Selecciona los usuarios que podrán usar este cupón privado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filter */}
                <div className="space-y-2">
                  <Label>Filtrar usuarios</Label>
                  <Select value={filterMode} onValueChange={(value: any) => setFilterMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      <SelectItem value="membership_only">Solo con membresía</SelectItem>
                      <SelectItem value="no_membership">Sin membresía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selection controls */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedRecipients.length} de {filteredFollowers.length} seleccionados
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAll}
                      disabled={followersLoading}
                    >
                      Seleccionar todos
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={deselectAll}
                      disabled={followersLoading}
                    >
                      Deseleccionar
                    </Button>
                  </div>
                </div>

                {/* Users list */}
                {followersLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground mt-2">Cargando usuarios...</p>
                  </div>
                ) : filteredFollowers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay usuarios disponibles</p>
                  </div>
                ) : (
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {filteredFollowers.map((follower) => (
                      <div
                        key={follower.customer_id}
                        className="flex items-center space-x-3 p-3 hover:bg-muted/50 border-b last:border-b-0"
                      >
                        <Checkbox
                          id={`follower-${follower.customer_id}`}
                          checked={selectedRecipients.includes(follower.customer_id)}
                          onCheckedChange={() => toggleRecipient(follower.customer_id)}
                        />
                        <label
                          htmlFor={`follower-${follower.customer_id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{follower.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{follower.customer_email}</p>
                            </div>
                            {follower.has_active_membership === 1 && (
                              <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {follower.membership_plan_name || 'Membresía'}
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {selectedRecipients.length > 0 && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium">
                      El cupón se asignará automáticamente a {selectedRecipients.length} usuario(s) seleccionado(s)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/cupones')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Guardar cupón
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
