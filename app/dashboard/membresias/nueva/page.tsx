'use client';

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Check, Package, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';

// Valid benefit types according to the API
type ValidBenefitType = 'shipping' | 'discount' | 'custom';

type Benefit = {
  id: string;
  text: string;
  type: ValidBenefitType;
  value?: number;
  description?: string;
};

export default function NewMembershipPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  interface FormData {
    name: string;
    description: string;
    price: string;
    duration: string;
    durationUnit: 'months' | 'years';
    discount: string;
    isRecurring: boolean;
    welcomeGift: boolean;
    birthdayGift: boolean;
    earlyRenewalDiscount: string;
    maxUsers: string;
    validFrom: string;
    validUntil: string;
  }

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    duration: '1',
    durationUnit: 'months',
    discount: '0',
    isRecurring: true,
    welcomeGift: false,
    birthdayGift: false,
    earlyRenewalDiscount: '',
    maxUsers: '',
    validFrom: new Date().toISOString().split('T')[0], // Default to today
    validUntil: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (e.target as HTMLInputElement).valueAsNumber || value : value
    }));
  };

  const addBenefit = (type: ValidBenefitType = 'custom', text: string = '') => {
    const benefit: Benefit = {
      id: Date.now().toString(),
      text: text || newBenefit,
      type: type as ValidBenefitType,
    };

    if (type === 'discount') {
      benefit.value = 10; // Default discount value
      benefit.description = 'Descuento en productos seleccionados';
    } else if (type === 'shipping') {
      benefit.text = 'Envío gratuito';
      benefit.description = 'Envío gratuito en todos los pedidos';
    } else if (type === 'custom') {
      benefit.description = benefit.description || 'Beneficio personalizado';
    }

    setBenefits([...benefits, benefit]);
    if (type === 'custom') {
      setNewBenefit('');
    }
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      addBenefit('custom', newBenefit);
      setNewBenefit('');
    }
  };

  const removeBenefit = (id: string) => {
    setBenefits(benefits.filter(benefit => benefit.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!token) {
        throw new Error('No estás autenticado. Por favor inicia sesión nuevamente.');
      }

      // Get company data from profile
      const companyResponse = await api.userCompanies.get(token);
      console.log('Company response:', companyResponse);
      
      if (!companyResponse.success) {
        console.error('API request failed:', companyResponse);
        throw new Error(companyResponse.message || 'Error al obtener los datos de la compañía');
      }
      
      if (!companyResponse.data || !companyResponse.data.data || !companyResponse.data.data.id) {
        console.error('Invalid company data structure:', companyResponse);
        throw new Error('No se pudo obtener el ID de la compañía. Por favor, verifica que tengas una compañía configurada.');
      }
      
      const companyId = companyResponse.data.data.id;
      
      // If we still don't have a company ID, throw an error
      if (!companyId) {
        throw new Error('No se encontró ninguna compañía asociada a tu cuenta.');
      }

      // Format the data according to the API
      const membershipData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        duration: parseInt(formData.duration) || 1,
        duration_unit: formData.durationUnit,
        is_recurring: formData.isRecurring,
        welcome_gift: formData.welcomeGift,
        birthday_gift: formData.birthdayGift,
        early_renewal_discount: formData.earlyRenewalDiscount ? parseInt(formData.earlyRenewalDiscount) : null,
        max_users: formData.maxUsers ? parseInt(formData.maxUsers) : null,
        valid_from: formData.validFrom ? `${formData.validFrom} 00:00:00` : null,
        valid_until: formData.validUntil ? `${formData.validUntil} 23:59:59` : null,
        benefits: benefits
          .filter(benefit => benefit.text.trim() !== '')
          .map(benefit => ({
            text: benefit.text,
            type: benefit.type,
            description: benefit.description || ''
          }))
      };
      
      console.log('Sending membership data:', membershipData);
      
      // Call the API
      const response = await api.memberships.createMembership(companyId.toString(), membershipData, token);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al crear la membresía');
      }
      
      // Redirect to memberships list on success
      router.push('/dashboard/membresias');
      
    } catch (error) {
      console.error('Error creating membership:', error);
      setError(error instanceof Error ? error.message : 'Ocurrió un error al crear la membresía');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crear nueva membresía</h1>
        <p className="text-muted-foreground">
          Completa los detalles de la nueva membresía
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>
                Ingresa la información principal de la membresía
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la membresía</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Premium"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (MXN)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-8"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe los beneficios generales de esta membresía"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                Define la duración, descuentos y beneficios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración</Label>
                  <div className="flex gap-2">
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-24"
                      required
                    />
                    <select
                      name="durationUnit"
                      value={formData.durationUnit}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="months">Meses</option>
                      <option value="years">Años</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Descuento en compras (%)</Label>
                  <div className="relative">
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="earlyRenewalDiscount">Descuento por renovación anticipada (%)</Label>
                  <div className="relative">
                    <Input
                      id="earlyRenewalDiscount"
                      name="earlyRenewalDiscount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.earlyRenewalDiscount}
                      onChange={handleInputChange}
                    />
                    <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Límite de usuarios (opcional)</Label>
                  <Input
                    id="maxUsers"
                    name="maxUsers"
                    type="number"
                    min="1"
                    value={formData.maxUsers}
                    onChange={handleInputChange}
                    placeholder="Sin límite si está vacío"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isRecurring">Suscripción recurrente (renovación automática)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="welcomeGift"
                    name="welcomeGift"
                    checked={formData.welcomeGift}
                    onChange={(e) => setFormData({...formData, welcomeGift: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="welcomeGift">Incluir regalo de bienvenida</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="birthdayGift"
                    name="birthdayGift"
                    checked={formData.birthdayGift}
                    onChange={(e) => setFormData({...formData, birthdayGift: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="birthdayGift">Incluir regalo de cumpleaños</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Beneficios predefinidos</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addBenefit('shipping')}
                      disabled={benefits.some(b => b.type === 'shipping')}
                    >
                      <Package size={16} className="mr-2" />
                      Envío gratuito
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addBenefit('discount')}
                      disabled={benefits.some(b => b.type === 'discount')}
                    >
                      <DollarSign size={16} className="mr-2" />
                      Descuento especial
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Beneficios personalizados</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={handleAddBenefit}
                      disabled={!newBenefit.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: Acceso prioritario a nuevos productos"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit('custom'))}
                    />
                  </div>
                </div>
              </div>
          {benefits.length > 0 && (
            <div className="mt-2 space-y-2">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="flex items-start justify-between p-3 bg-muted rounded-md">
                  <div>
                    <div className="font-medium">{benefit.text}</div>
                    {benefit.description && (
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    )}
                    {benefit.type === 'discount' && (
                      <div className="mt-1">
                        <Label className="text-xs">Valor del descuento</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            value={benefit.value}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              setBenefits(benefits.map(b => 
                                b.id === benefit.id 
                                  ? {...b, value: isNaN(value) ? 0 : value} 
                                  : b
                              ));
                            }}
                            className="h-8 w-20"
                            min="1"
                            max="100"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeBenefit(benefit.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/membresias')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2">Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Crear membresía
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
