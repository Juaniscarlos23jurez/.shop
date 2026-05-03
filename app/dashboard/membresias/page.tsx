'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { Plus, User, Clock, Tag, Percent, CheckSquare, Edit, Star } from 'lucide-react';

// Icon aliases for readability
const UserIcon = User;
const ClockIcon = Clock;
const TagIcon = Tag;
const PercentIcon = Percent;
const CheckIcon = CheckSquare;
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';

import { Benefit, Membership } from '@/types/api';
import { MembershipCard } from '@/components/membresias/MembershipCard';

export default function MembershipsPage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token, user } = useAuth();

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        if (!token) {
          throw new Error('No estás autenticado');
        }

        // Get user profile with company data
        const companyResponse = await api.userCompanies.get(token);
        console.log('Company response:', companyResponse);
        
        if (!companyResponse.success || !companyResponse.data?.data?.id) {
          console.error('Company response structure:', companyResponse);
          throw new Error('No se encontró ninguna compañía asociada a tu cuenta');
        }
        
        const companyId = companyResponse.data.data.id;

        if (!companyId) {
          console.error('Invalid company ID:', companyId);
          throw new Error('No se encontró ninguna compañía asociada a tu cuenta');
        }

        const response = await api.memberships.getMemberships(companyId, token);
        
        if (!response.success) {
          throw new Error(response.message || 'Error al obtener las membresías');
        }
        
        if (response.data?.data?.data) {
          setMemberships(response.data.data.data);
        } else {
          setMemberships([]);
        }
      } catch (error) {
        console.error('Error fetching memberships:', error);
        // TODO: Mostrar mensaje de error al usuario
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
              {memberships.filter(m => m.is_active).length} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membresías Activas</CardTitle>
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
              <path d="M12 2v4" />
              <path d="m16 4-2 2" />
              <path d="M18 12h4" />
              <path d="m20 8-2-2" />
              <path d="M4 12H0" />
              <path d="m2 8 2-2" />
              <path d="M2 16l2 2" />
              <path d="M12 22v-4" />
              <path d="m8 20 2-2" />
              <path d="m16 20-2 2" />
              <path d="M22 12h-4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberships.filter(m => m.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              {memberships.length > 0 ? Math.round((memberships.filter(m => m.is_active).length / memberships.length) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
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
              {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                memberships.reduce((total, m) => total + (m.price || 0), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {memberships.length > 0 ? Math.round(memberships.reduce((sum, m) => sum + (m.price || 0), 0) / memberships.length) : 0} promedio por membresía
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memberships.length > 0 
                ? Math.round(memberships.reduce((sum, m) => sum + (m.duration || 0), 0) / memberships.length) 
                : 0} meses
            </div>
            <p className="text-xs text-muted-foreground">
              {memberships.filter(m => m.is_recurring).length} con renovación automática
            </p>
          </CardContent>
        </Card>
      </div>      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {memberships.map((membership) => (
          <MembershipCard
            key={membership.id}
            name={membership.name}
            description={membership.description || ''}
            price={membership.price}
            duration={membership.duration}
            durationUnit={membership.duration_unit}
            badgeText={membership.badge_text || ''}
            isPopular={membership.is_popular}
            maxUsers={membership.max_users}
            welcomeGift={membership.welcome_gift}
            birthdayGift={membership.birthday_gift}
            benefits={membership.benefits}
            cardColorHex={membership.card_color_hex}
            textColorHex={membership.text_color_hex}
            accentColorHex={membership.accent_color_hex}
            backgroundImageUrl={membership.background_image_url}
            imageUrl={membership.image_url}
          >
            <div className="flex gap-2.5 mt-2">
              <Button variant="outline" className="flex-1 bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm transition-colors" onClick={() => router.push(`/dashboard/membresias/${membership.id}`)}>
                <Edit className="w-4 h-4 mr-2 opacity-70" />
                Gestionar
              </Button>
              {membership.is_popular && (
                <Button className="bg-amber-400 hover:bg-amber-500 text-amber-950 border-none shadow-sm transition-colors font-semibold">
                  <Star className="w-4 h-4 mr-1.5 fill-amber-950" />
                  Destacar
                </Button>
              )}
            </div>
          </MembershipCard>
        ))}
      </div>
    </div>
  );
}
