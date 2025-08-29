'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Check, ArrowLeft, Copy, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

type DiscountType = 'percentage' | 'fixed' | 'free_shipping';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discount: number;
  minPurchase: number;
  maxUses: number;
  used: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
}

export default function EditCouponPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState<{
    from: Date;
    to?: Date;
  }>();

  const [formData, setFormData] = useState<Omit<Coupon, 'id' | 'status' | 'used'>>({
    code: '',
    description: '',
    discountType: 'percentage',
    discount: 0,
    minPurchase: 0,
    maxUses: 0,
    validFrom: new Date().toISOString(),
    validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    isActive: true,
  });

  // Fetch coupon data
  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - in a real app, this would come from your API
        const mockCoupon: Coupon = {
          id: id as string,
          code: 'SUMMER25',
          description: '25% de descuento en productos de verano',
          discountType: 'percentage',
          discount: 25,
          minPurchase: 0,
          maxUses: 500,
          used: 127,
          validFrom: new Date().toISOString(),
          validUntil: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
          isActive: true,
          status: 'active',
        };

        setFormData({
          code: mockCoupon.code,
          description: mockCoupon.description,
          discountType: mockCoupon.discountType,
          discount: mockCoupon.discount,
          minPurchase: mockCoupon.minPurchase,
          maxUses: mockCoupon.maxUses,
          validFrom: mockCoupon.validFrom,
          validUntil: mockCoupon.validUntil,
          isActive: mockCoupon.isActive,
        });

        setDate({
          from: new Date(mockCoupon.validFrom),
          to: new Date(mockCoupon.validUntil)
        });
      } catch (error) {
        console.error('Error fetching coupon:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCoupon();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Updating coupon:', {
        ...formData,
        validFrom: date?.from.toISOString(),
        validUntil: date?.to?.toISOString(),
      });
      
      // Redirect to coupons list after update
      router.push('/dashboard/cupones');
    } catch (error) {
      console.error('Error updating coupon:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = () => {
    if (!date?.to) return null;
    
    const now = new Date();
    const validUntil = new Date(date.to);
    
    if (now > validUntil) {
      return <Badge variant="outline">Expirado</Badge>;
    }
    
    if (now < new Date(formData.validFrom)) {
      return <Badge className="bg-blue-100 text-blue-800">Programado</Badge>;
    }
    
    return formData.isActive 
      ? <Badge className="bg-green-100 text-green-800">Activo</Badge>
      : <Badge variant="outline">Inactivo</Badge>;
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
