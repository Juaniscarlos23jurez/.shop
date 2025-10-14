'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from '@/components/ui/dialog';
// Loading indicator without external dependencies

export interface Location {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  contact_person: string | null;
  primary_color: string;
  secondary_color: string;
  timezone: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface BranchesListProps {
  companyId: string;
  onAddBranchClick: () => void;
  onLocationAdded?: () => void;
}

export function BranchesList({ 
  companyId, 
  onAddBranchClick,
  onLocationAdded 
}: BranchesListProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();

  const fetchLocations = useCallback(async () => {
    console.log('fetchLocations called');
    if (!token) {
      console.log('No token available, not fetching locations');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching all locations');
      const response = await api.userCompanies.getLocations(token);
      console.log('Locations API response:', response);
      
      // The API returns { status: "success", locations: [...] }
      const locationsData = response.data?.locations || [];
      console.log('Extracted locations data:', locationsData);
      setLocations(locationsData);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('No se pudieron cargar las sucursales');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    console.log('useEffect triggered with companyId:', companyId, 'and token:', token ? 'token exists' : 'no token');
    fetchLocations();
  }, [companyId, token]);

  // Refresh locations when a new one is added
  useEffect(() => {
    if (onLocationAdded) {
      fetchLocations();
    }
  }, [onLocationAdded]);

  console.log('Rendering BranchesList with:', { isLoading, error, locations });

  const renderLocationCards = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          </div>
          <span className="ml-2 text-slate-500">Cargando sucursales...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-4 text-center text-red-500">
          {error}
          <Button 
            variant="outline" 
            className="ml-4"
            onClick={fetchLocations}
          >
            Reintentar
          </Button>
        </div>
      );
    }
    
    if (locations.length === 0) {
      return (
        <div className="p-4 text-center text-slate-500">
          No hay sucursales registradas
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {locations.map((location) => (
          <div key={location.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{location.name}</h4>
                <p className="text-sm text-slate-500">{location.address}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {location.city}, {location.state} • {location.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500 hover:bg-slate-100"
                  onClick={() => {
                    setSelectedLocation(location);
                    setIsModalOpen(true);
                  }}
                >
                  Ver Detalles
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/sucursales/${location.id}?edit=true`}>
                    Editar
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 text-lg">👥</div>
            <div>
              <CardTitle className="text-xl text-slate-900">Sucursales</CardTitle>
              <CardDescription className="text-slate-600">
                {locations.length} {locations.length === 1 ? 'sucursal' : 'sucursales'} en tu empresa
              </CardDescription>
            </div>
          </div>
          <Button 
            className="bg-emerald-500 hover:bg-emerald-600"
            onClick={onAddBranchClick}
          >
            <span className="mr-2">+</span>
            Agregar Sucursal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderLocationCards()}
      </CardContent>
      
      {/* Location Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogOverlay className="bg-transparent" />
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900">
          {selectedLocation && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedLocation.name}</DialogTitle>
                <DialogDescription>
                  Detalles de la sucursal
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Información de contacto</h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><span className="font-medium">Dirección:</span> {selectedLocation.address}</p>
                    <p><span className="font-medium">Ciudad:</span> {selectedLocation.city}</p>
                    <p><span className="font-medium">Estado:</span> {selectedLocation.state}</p>
                    <p><span className="font-medium">Código Postal:</span> {selectedLocation.postal_code}</p>
                    <p><span className="font-medium">País:</span> {selectedLocation.country}</p>
                    <p><span className="font-medium">Teléfono:</span> {selectedLocation.phone || 'No especificado'}</p>
                    <p><span className="font-medium">Email:</span> {selectedLocation.email || 'No especificado'}</p>
                    <p><span className="font-medium">Zona horaria:</span> {selectedLocation.timezone}</p>
                    <p><span className="font-medium">Estado:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        selectedLocation.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLocation.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                </div>
                
                {selectedLocation.notes && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Notas</h4>
                    <p className="text-sm text-slate-600">{selectedLocation.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
} 