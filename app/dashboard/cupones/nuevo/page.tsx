'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

type DiscountType = 'percentage' | 'fixed' | 'free_shipping';

export default function NewCouponPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<{
    from: Date;
    to?: Date;
  } | undefined>({
    from: new Date(),
    to: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  });

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as DiscountType,
    discount: '',
    minPurchase: '',
    maxUses: '',
    isActive: true,
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
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating coupon:', {
        ...formData,
        validFrom: date?.from,
        validUntil: date?.to,
      });
      
      // Redirect to coupons list after creation
      router.push('/dashboard/cupones');
    } catch (error) {
      console.error('Error creating coupon:', error);
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
                      value={formData.minPurchase}
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
                    value={formData.maxUses}
                    onChange={handleInputChange}
                    placeholder="Ilimitado si se deja en blanco"
                  />
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
