'use client';

import { useState } from 'react';
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

  const { token } = useAuth();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const companyResponse = await api.userCompanies.get(token);
      if (!companyResponse.success || !companyResponse.data?.data?.id) {
        throw new Error('Error al obtener datos de la compañía');
      }

      const payload = {
        ...formData,
        starts_at: date?.from?.toISOString() || new Date().toISOString(),
        expires_at: date?.to?.toISOString() || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
        usage_limit_per_user: formData.usage_limit_per_user ? parseInt(formData.usage_limit_per_user) : undefined,
        min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount) : undefined,
        discount_percentage: formData.type === 'percentage' ? parseFloat(formData.discount_percentage) : undefined,
        discount_amount: formData.type === 'fixed_amount' ? parseFloat(formData.discount_amount) : undefined,
        buy_quantity: formData.type === 'buy_x_get_y' ? parseInt(formData.buy_quantity) : undefined,
        get_quantity: formData.type === 'buy_x_get_y' ? parseInt(formData.get_quantity) : undefined,
        item_id: formData.type === 'free_item' ? formData.item_id : undefined
      } as CouponCreateInput;

      const response = await api.coupons.createCoupon(
        companyResponse.data.data.id,
        payload,
        token
      );

      if (!response.success) {
        throw new Error(response.error || 'Error creating cupón');
      }
      
      toast({
        title: 'Cupón creado',
        description: 'El cupón se ha creado correctamente',
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
                    <Label htmlFor="item_id">ID del producto</Label>
                    <Input
                      id="item_id"
                      name="item_id"
                      value={formData.item_id}
                      onChange={handleInputChange}
                      required
                    />
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
