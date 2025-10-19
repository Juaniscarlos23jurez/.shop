'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { CouponType, CouponUpdateInput, Coupon } from '@/types/api';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Check, ArrowLeft, Copy, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProducts } from '@/lib/api/products';
import type { Product } from '@/types/product';

export default function EditCouponPage() {
  const router = useRouter();
  const { id } = useParams();
  const [date, setDate] = useState<{
    from: Date;
    to?: Date;
  } | undefined>();

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalCoupon, setOriginalCoupon] = useState<Coupon | null>(null);
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

  // Fetch coupon data
  useEffect(() => {
    const fetchCoupon = async () => {
      if (!token || !id) return;
      
      try {
        setIsLoading(true);
        
        // Get company ID
        const companyResponse = await api.userCompanies.get(token);
        if (!companyResponse.success || !companyResponse.data?.data?.id) {
          throw new Error('Error al obtener datos de la compañía');
        }
        const companyId = companyResponse.data.data.id;
        setResolvedCompanyId(companyId);

        // Fetch coupon
        const response = await api.coupons.getCoupon(companyId, id as string, token);
        console.log('[EditCoupon] Coupon response:', response);
        
        if (!response.success || !response.data?.coupon) {
          throw new Error('Error al obtener el cupón');
        }

        const coupon = response.data.coupon;
        setOriginalCoupon(coupon);

        // Populate form
        setFormData({
          code: coupon.code || '',
          name: coupon.name || '',
          description: coupon.description || '',
          type: coupon.type || 'percentage',
          is_active: coupon.is_active ?? true,
          is_public: coupon.is_public ?? true,
          is_single_use: coupon.is_single_use ?? false,
          usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
          usage_limit_per_user: coupon.usage_limit_per_user ? String(coupon.usage_limit_per_user) : '',
          min_purchase_amount: coupon.min_purchase_amount ? String(coupon.min_purchase_amount) : '',
          discount_percentage: coupon.discount_percentage ? String(coupon.discount_percentage) : '',
          discount_amount: coupon.discount_amount ? String(coupon.discount_amount) : '',
          buy_quantity: coupon.buy_quantity ? String(coupon.buy_quantity) : '',
          get_quantity: coupon.get_quantity ? String(coupon.get_quantity) : '',
          item_id: coupon.item_id ? String(coupon.item_id) : ''
        });

        setDate({
          from: coupon.starts_at ? new Date(coupon.starts_at) : new Date(),
          to: coupon.expires_at ? new Date(coupon.expires_at) : undefined
        });

        // Load assigned users if not public
        if (!coupon.is_public && coupon.user_assignments) {
          const assignedIds = coupon.user_assignments.map((ua: any) => ua.customer_id || ua.user_id);
          setSelectedRecipients(assignedIds);
        }
      } catch (error) {
        console.error('Error fetching coupon:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Error al cargar el cupón',
          variant: 'destructive',
        });
        router.push('/dashboard/cupones');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupon();
  }, [id, token, router, toast]);

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
        
        // Normalize different possible response shapes
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
        console.error('[EditCoupon] Error loading products:', e);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [formData.type, token, resolvedCompanyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (!token || !id) {
        throw new Error('No se encontró el token de autenticación');
      }

      const companyResponse = await api.userCompanies.get(token);
      console.log('[EditCoupon] Company response:', companyResponse);
      
      if (!companyResponse.success || !companyResponse.data?.data?.id) {
        throw new Error('Error al obtener datos de la compañía');
      }

      const companyId = companyResponse.data.data.id;

      // Build update payload
      const payload: any = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        is_active: formData.is_active,
        is_public: formData.is_public,
        is_single_use: formData.is_single_use,
        starts_at: date?.from?.toISOString() || new Date().toISOString(),
        expires_at: date?.to?.toISOString() || null,
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

      // Add user_ids if there are selected recipients
      if (!formData.is_public && selectedRecipients.length > 0) {
        payload.user_ids = selectedRecipients;
      }

      console.log('[EditCoupon] Payload to send:', JSON.stringify(payload, null, 2));

      const response = await api.coupons.updateCoupon(
        companyId,
        id as string,
        payload,
        token
      );

      console.log('[EditCoupon] Update response:', response);

      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar el cupón');
      }

      toast({
        title: 'Cupón actualizado',
        description: 'El cupón se ha actualizado correctamente',
      });
      
      router.push('/dashboard/cupones');
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al actualizar el cupón',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = () => {
    if (!date?.from) return null;
    
    const now = new Date();
    const startsAt = new Date(date.from);
    const expiresAt = date.to ? new Date(date.to) : null;
    
    if (!formData.is_active) {
      return <Badge variant="outline">Inactivo</Badge>;
    }
    if (startsAt > now) {
      return <Badge className="bg-blue-100 text-blue-800">Programado</Badge>;
    }
    if (expiresAt && now > expiresAt) {
      return <Badge variant="outline">Expirado</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando cupón...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Editar Cupón</h1>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground">
            Actualiza los detalles del cupón
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>
                Actualiza los detalles principales del cupón
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">Código del cupón</Label>
                  <div className="relative">
                    <Input
                      id="code"
                      name="code"
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
                  <Label htmlFor="discountType">Tipo de descuento</Label>
                  <select
                    id="discountType"
                    name="discountType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.discountType}
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Porcentaje de descuento</option>
                    <option value="fixed">Monto fijo</option>
                    <option value="free_shipping">Envío gratuito</option>
                  </select>
                </div>

                {formData.discountType !== 'free_shipping' && (
                  <div className="space-y-2">
                    <Label htmlFor="discount">
                      {formData.discountType === 'percentage' ? 'Porcentaje de descuento' : 'Monto de descuento'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="discount"
                        name="discount"
                        type="number"
                        min="0"
                        max={formData.discountType === 'percentage' ? '100' : undefined}
                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                        value={formData.discount}
                        onChange={handleInputChange}
                        required
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-2.5 text-muted-foreground">
                        {formData.discountType === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="minPurchase">Compra mínima (opcional)</Label>
                  <div className="relative">
                    <Input
                      id="minPurchase"
                      name="minPurchase"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minPurchase || ''}
                      onChange={handleInputChange}
                      className="pl-8"
                    />
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUses">Límite de usos (opcional)</Label>
                  <Input
                    id="maxUses"
                    name="maxUses"
                    type="number"
                    min="1"
                    value={formData.maxUses || ''}
                    onChange={handleInputChange}
                    placeholder="Ilimitado si se deja en blanco"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Usos actuales</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${(formData.maxUses ? (127 / formData.maxUses * 100) : 0)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {127}{formData.maxUses > 0 ? `/${formData.maxUses}` : ''}
                    </span>
                  </div>
                </div>
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

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Estado</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.isActive ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Última actualización: {format(new Date(), "PPp")}
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/cupones')}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
