'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Check, Loader2 } from 'lucide-react';

type Benefit = {
  id: string;
  text: string;
};

type MembershipData = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  discount: number;
  benefits: string[];
  memberCount: number;
  status: 'active' | 'inactive';
};

export default function EditMembershipPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '1',
    discount: '0',
    status: 'active' as const,
  });

  // Fetch membership data
  useEffect(() => {
    const fetchMembership = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - in a real app, this would come from your API
        const mockMembership: MembershipData = {
          id: id as string,
          name: 'Membresía Premium',
          description: 'Acceso a todas las clases y beneficios exclusivos',
          price: 999.99,
          duration: 6,
          discount: 10,
          benefits: [
            'Acceso ilimitado a todas las clases',
            'Descuento en productos',
            'Clases privadas incluidas',
            'Acceso a eventos exclusivos'
          ],
          memberCount: 42,
          status: 'active'
        };
        
        setFormData({
          name: mockMembership.name,
          description: mockMembership.description,
          price: mockMembership.price.toString(),
          duration: mockMembership.duration.toString(),
          discount: mockMembership.discount.toString(),
          status: mockMembership.status
        });
        
        setBenefits(mockMembership.benefits.map((text, index) => ({
          id: index.toString(),
          text
        })));
        
      } catch (error) {
        console.error('Error fetching membership:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMembership();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, { id: Date.now().toString(), text: newBenefit }]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (id: string) => {
    setBenefits(benefits.filter(benefit => benefit.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate API call
      console.log('Updating membership:', {
        ...formData,
        benefits: benefits.map(b => b.text),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        discount: parseInt(formData.discount)
      });
      
      // Redirect to memberships list after update
      router.push('/dashboard/membresias');
    } catch (error) {
      console.error('Error updating membership:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando membresía...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar membresía</h1>
        <p className="text-muted-foreground">
          Actualiza los detalles de la membresía
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>
                Actualiza la información principal de la membresía
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

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                </select>
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
                  <Label htmlFor="duration">Duración (meses)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
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
              </div>

              <div className="space-y-2">
                <Label>Beneficios</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: Envío gratuito"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  />
                  <Button type="button" onClick={addBenefit} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                
                {benefits.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {benefits.map((benefit) => (
                      <div key={benefit.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span>{benefit.text}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeBenefit(benefit.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {formData.status === 'active' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 mr-1.5 rounded-full bg-green-500"></span>
                  Activa - {formData.duration} {formData.duration === '1' ? 'mes' : 'meses'} de duración
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <span className="w-2 h-2 mr-1.5 rounded-full bg-gray-500"></span>
                  Inactiva
                </span>
              )}
            </div>
            <div className="flex gap-4">
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
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
