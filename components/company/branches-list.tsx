'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  Store, 
  ExternalLink,
  Search,
  MoreVertical,
  Activity
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

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
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.userCompanies.getLocations(token);
      const locationsData = response.data?.locations || [];
      setLocations(locationsData);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('No se pudieron cargar las sucursales');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLocations();
  }, [companyId, token, fetchLocations]);

  useEffect(() => {
    if (onLocationAdded) {
      fetchLocations();
    }
  }, [onLocationAdded, fetchLocations]);

  const renderLocationCards = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100">
          <p className="text-red-800 font-bold mb-4">{error}</p>
          <Button 
            variant="outline" 
            className="border-red-200 text-red-700 hover:bg-red-100"
            onClick={fetchLocations}
          >
            Reintentar Carga
          </Button>
        </div>
      );
    }
    
    if (locations.length === 0) {
      return (
        <div className="p-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <Store className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Sin sucursales activas</h3>
          <p className="text-slate-500 mt-1 mb-6 text-sm">Comienza agregando tu primera ubicación comercial.</p>
          <Button 
            onClick={onAddBranchClick}
            className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Sucursal
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((location) => (
          <div 
            key={location.id} 
            className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-emerald-200 hover:-translate-y-1 overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-colors group-hover:bg-emerald-50/50" />
            
            <div className="relative flex flex-col h-full space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                     <Store className="w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="font-black text-slate-900 tracking-tight text-lg">{location.name}</h4>
                     <div className="flex items-center gap-1.5 mt-0.5">
                       <span className={`w-2 h-2 rounded-full ${location.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                       <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none">
                         {location.status === 'active' ? 'Operativa' : 'Inactiva'}
                       </span>
                     </div>
                   </div>
                </div>
                <Badge variant="outline" className="bg-white border-slate-100 text-[10px] font-black uppercase text-slate-500 group-hover:border-emerald-200 group-hover:text-emerald-700 transition-colors">
                  {location.city}
                </Badge>
              </div>

              <div className="flex-1 space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-snug">{location.address}</p>
                </div>
                {location.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <p className="text-xs font-bold text-slate-700">{location.phone}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 rounded-xl text-xs font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 group-hover:text-emerald-700 transition-all"
                  onClick={() => {
                    setSelectedLocation(location);
                    setIsModalOpen(true);
                  }}
                >
                  <Search className="w-3.5 h-3.5 mr-2" />
                  Detalles
                </Button>
                <div className="h-6 w-px bg-slate-100" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="flex-1 rounded-xl text-xs font-bold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <Link href={`/dashboard/sucursales/${location.id}?edit=true`}>
                    <Edit className="w-3.5 h-3.5 mr-2" />
                    Gestionar
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Hover Decor */}
            <div className="absolute bottom-0 right-0 p-1 opacity-0 group-hover:opacity-10 transition-opacity">
              <Store className="w-16 h-16 text-emerald-900" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
      <CardHeader className="border-b border-slate-50 bg-slate-50/20 px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-100">
               <Store className="w-7 h-7" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Sucursales</CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Gestiona tus {locations.length} {locations.length === 1 ? 'punto de venta' : 'puntos de venta'} activos
              </CardDescription>
            </div>
          </div>
          <Button 
            className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
            onClick={onAddBranchClick}
          >
            <Plus className="w-5 h-5 mr-2" />
            Añadir Nueva
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8 pb-10">
        {renderLocationCards()}
      </CardContent>
      
      {/* Location Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogOverlay className="bg-slate-950/20 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-2xl bg-white rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden">
          {selectedLocation && (
            <div className="relative">
               {/* Modal Header Decor */}
               <div className="h-32 bg-gradient-to-br from-emerald-600 to-teal-500 p-8">
                  <div className="flex items-center gap-4 text-white">
                     <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Store className="w-6 h-6" />
                     </div>
                     <div>
                        <DialogTitle className="text-2xl font-black">{selectedLocation.name}</DialogTitle>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">{selectedLocation.city}, {selectedLocation.state}</p>
                     </div>
                  </div>
               </div>

               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dirección Completa</label>
                        <p className="text-slate-900 font-bold flex items-start gap-2">
                           <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                           {selectedLocation.address}
                        </p>
                        <p className="text-sm text-slate-500 ml-6">
                           {selectedLocation.city}, {selectedLocation.state} CJ {selectedLocation.postal_code}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contacto</label>
                        <div className="space-y-3 mt-2">
                           <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                             <Phone className="w-4 h-4 text-emerald-600" />
                             <span className="text-sm font-bold text-slate-700">{selectedLocation.phone || 'Sin teléfono'}</span>
                           </div>
                           <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                             <Mail className="w-4 h-4 text-emerald-600" />
                             <span className="text-sm font-bold text-slate-700 truncate">{selectedLocation.email || 'Sin correo'}</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative">
                         <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
                         <div className="relative">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estado Operativo</label>
                            <div className="flex items-center gap-3 mt-2">
                               <div className={`h-3 w-3 rounded-full ${selectedLocation.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                               <span className="text-xl font-black uppercase tracking-tighter italic">
                                 {selectedLocation.status === 'active' ? 'En Línea' : 'Inactiva'}
                               </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">
                               Zona Horaria: {selectedLocation.timezone}<br />
                               Matriz: {location.primary_color ? 'SÍ' : 'NO'}
                            </p>
                         </div>
                      </div>
                      
                      {selectedLocation.notes && (
                        <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 italic text-sm text-emerald-900">
                           "{selectedLocation.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                     <Button 
                        asChild
                        className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-200"
                     >
                        <Link href={`/dashboard/sucursales/${selectedLocation.id}?edit=true`}>
                           Ir al Panel de Sucursal
                        </Link>
                     </Button>
                     <Button 
                        variant="ghost"
                        className="h-14 px-8 rounded-2xl border border-slate-100 text-slate-400 font-bold hover:bg-slate-50"
                        onClick={() => setIsModalOpen(false)}
                     >
                        Cerrar
                     </Button>
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
} 
 