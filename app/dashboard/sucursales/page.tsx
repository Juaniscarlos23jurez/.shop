'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Search, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company_id: number;
}

export default function SucursalesPage() {
  const { token } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        
        // Get the company data from the user's profile
        const companyResponse = await api.userCompanies.get(token);
        console.log('Company API Response:', companyResponse); // Log the full response
        
        if (!companyResponse.success) {
          throw new Error(companyResponse.message || 'Failed to fetch company data');
        }
        
        // The company data is nested in response.data.data
        const companyData = companyResponse.data?.data;
        console.log('Company Data:', companyData);
        
        if (!companyData || !companyData.id) {
          console.error('Invalid company data structure:', companyResponse);
          throw new Error('No se pudo obtener el ID de la compañía');
        }
        
        const companyId = companyData.id;
        
        // Get the locations for this company using the user's companies API
        const locationsResponse = await api.userCompanies.getLocations(token);
        console.log('Locations API Raw Response:', locationsResponse);
        
        if (!locationsResponse.success) {
          throw new Error(locationsResponse.message || 'Failed to fetch locations');
        }
        
        // The locations might be in response.data.locations or response.data.data.locations
        const locations = locationsResponse.data?.locations || 
                         locationsResponse.data?.data?.locations || [];
        
        console.log('Extracted Locations:', locations);
        
        if (!Array.isArray(locations)) {
          console.error('Unexpected locations data structure:', locationsResponse);
          throw new Error('Formato de datos de sucursales no válido');
        }
        
        setBranches(locations);
        setCompany(companyData);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las sucursales. Por favor, inténtalo de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [token]);

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sucursales</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sucursales</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las sucursales de tu empresa
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar sucursal..."
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link href="/dashboard/sucursales/nueva" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Sucursal
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            <span className="ml-2">Cargando sucursales...</span>
          </div>
        </div>
      ) : filteredBranches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-1">No hay sucursales</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">
              {searchTerm ? 'No se encontraron sucursales que coincidan con tu búsqueda.' : 'Aún no hay sucursales registradas.'}
            </p>
            <Button asChild>
              <Link href="/dashboard/sucursales/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Sucursal
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((branch) => (
            <Card key={branch.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{branch.name}</CardTitle>
                  <span className={`px-2 py-1 text-xs rounded-full ${branch.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {branch.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {branch.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                      <p className="text-gray-700">{branch.address}</p>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-center gap-2">
                      <a href={`tel:${branch.phone}`} className="text-blue-600 hover:underline">
                        {branch.phone}
                      </a>
                    </div>
                  )}
                  {branch.email && (
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${branch.email}`} className="text-blue-600 hover:underline">
                        {branch.email}
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Creada: {new Date(branch.created_at).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/sucursales/${branch.id}`}>
                      Ver detalles1
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
