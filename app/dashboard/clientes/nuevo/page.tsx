'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Check, ArrowLeft, User, Mail, Phone, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'none';

export default function NewClientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [birthdate, setBirthdate] = useState<Date | undefined>(new Date(1990, 0, 1));
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
    membership: 'none' as MembershipTier,
    notes: '',
    isActive: true,
    acceptMarketing: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating client:', {
        ...formData,
        birthdate: birthdate?.toISOString(),
      });
      
      // Redirect to clients list after creation
      router.push('/dashboard/clientes');
    } catch (error) {
      console.error('Error creating client:', error);
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
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
          <p className="text-muted-foreground">
            Agrega un nuevo cliente a tu base de datos
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Datos básicos del cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre(s)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Ej: Juan"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Ej: Pérez López"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="cliente@ejemplo.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de nacimiento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !birthdate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthdate ? format(birthdate, "PPP") : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={birthdate}
                        onSelect={setBirthdate}
                        initialFocus
                        fromYear={1900}
                        toYear={new Date().getFullYear() - 18}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="membership">Membresía</Label>
                  <Select
                    value={formData.membership}
                    onValueChange={(value: MembershipTier) => 
                      setFormData(prev => ({ ...prev, membership: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una membresía" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin membresía</SelectItem>
                      <SelectItem value="bronze">Bronce</SelectItem>
                      <SelectItem value="silver">Plata</SelectItem>
                      <SelectItem value="gold">Oro</SelectItem>
                      <SelectItem value="platinum">Platino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dirección</CardTitle>
              <CardDescription>
                Dirección de envío del cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address">Calle y número</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      name="address"
                      placeholder="Av. Principal #123"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Ciudad de México"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Ciudad de México"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
              <CardDescription>
                Notas y preferencias del cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Alergias, preferencias, etc."
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Cliente activo</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.isActive ? 'El cliente puede realizar compras' : 'El cliente no puede realizar compras'}
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isActive: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Acepta marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.acceptMarketing 
                      ? 'El cliente acepta recibir promociones' 
                      : 'El cliente no desea recibir promociones'}
                  </p>
                </div>
                <Switch
                  checked={formData.acceptMarketing}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptMarketing: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/clientes')}
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
                  Guardar Cliente
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
