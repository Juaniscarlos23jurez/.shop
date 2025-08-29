'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { Plus, User as UserIcon, Clock as ClockIcon, Tag as TagIcon, Percent as PercentIcon, Check as CheckIcon } from 'lucide-react';

type Membership = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in months
  discount: number; // percentage
  benefits: string[];
  memberCount: number;
  isActive: boolean;
  createdAt: string;
};

export default function MembershipsPage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchMemberships = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - replace with actual API call
        const mockMemberships: Membership[] = [
          {
            id: '1',
            name: 'Premium',
            description: 'Acceso completo a todos los beneficios',
            price: 299,
            duration: 12,
            discount: 15,
            benefits: ['15% de descuento en compras', 'Envío gratuito', 'Acceso prioritario'],
            memberCount: 45,
            isActive: true,
            createdAt: '2023-01-15T00:00:00Z'
          },
          {
            id: '2',
            name: 'Básica',
            description: 'Beneficios básicos para empezar',
            price: 99,
            duration: 6,
            discount: 5,
            benefits: ['5% de descuento en compras', 'Ofertas exclusivas'],
            memberCount: 120,
            isActive: true,
            createdAt: '2023-03-10T00:00:00Z'
          }
        ];
        
        setMemberships(mockMemberships);
      } catch (error) {
        console.error('Error fetching memberships:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  const handleCreateMembership = () => {
    router.push('/dashboard/membresias/nueva');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Membresías</h1>
          <p className="text-muted-foreground">
            Gestiona las membresías de tu negocio
          </p>
        </div>
        <Button onClick={handleCreateMembership}>
          <Plus className="mr-2 h-4 w-4" />
          Crear membresía
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Membresías</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberships.length}</div>
            <p className="text-xs text-muted-foreground">
              {memberships.filter(m => m.isActive).length} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memberships.reduce((sum, m) => sum + m.memberCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memberships
                .reduce((sum, m) => sum + (m.price * m.memberCount / m.duration), 0)
                .toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </div>
            <p className="text-xs text-muted-foreground">
              +8.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Anuales</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memberships
                .reduce((sum, m) => sum + (m.price * m.memberCount * 12 / m.duration), 0)
                .toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </div>
            <p className="text-xs text-muted-foreground">
              +19% desde el año pasado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {memberships.map((membership) => (
          <Card key={membership.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">{membership.name}</CardTitle>
                  <CardDescription>{membership.description}</CardDescription>
                </div>
                <div className="rounded-full bg-emerald-100 p-3">
                  <CheckIcon className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  {membership.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  <span className="text-sm font-normal text-muted-foreground">/{membership.duration} meses</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{membership.memberCount} miembros</span>
                </div>
                <div className="flex items-center text-sm">
                  <PercentIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{membership.discount}% de descuento</span>
                </div>
                <div className="pt-2">
                  <h4 className="mb-2 text-sm font-medium">Beneficios:</h4>
                  <ul className="space-y-2">
                    {membership.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/membresias/${membership.id}`)}>
                    Editar membresía
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
