"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { Search as SearchIcon, Building2, AlignLeft, Mail, Phone, MapPin, Hash, Briefcase } from 'lucide-react';
import { api } from '@/lib/api/api';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';

interface OnboardingCompanyInfoFormProps {
  formData: {
    name?: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    website?: string;
    business_type_id?: number | string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onLocationChange?: (coords: { latitude: number; longitude: number }) => void;
}

export const OnboardingCompanyInfoForm: React.FC<OnboardingCompanyInfoFormProps> = ({ formData, handleInputChange, onLocationChange }) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [businessTypes, setBusinessTypes] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [loadingBusinessTypes, setLoadingBusinessTypes] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isManualAddress, setIsManualAddress] = useState<boolean>(false);

  const filteredBusinessTypes = useMemo(() => {
    if (!searchTerm) return businessTypes;
    const term = searchTerm.toLowerCase();
    return businessTypes.filter(bt => 
      bt.name.toLowerCase().includes(term) || 
      (bt.slug && bt.slug.toLowerCase().includes(term))
    );
  }, [businessTypes, searchTerm]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = Boolean(apiKey);
  const { isLoaded } = useJsApiLoader(
    hasApiKey
      ? {
          id: 'google-maps-script',
          googleMapsApiKey: apiKey,
          libraries: ['places'],
        }
      : { id: 'google-maps-script-skip', googleMapsApiKey: 'invalid', libraries: [] }
  );

  const mapCenter = useMemo(() => {
    if (markerPos) return markerPos;
    return { lat: 19.4326, lng: -99.1332 }; 
  }, [markerPos]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoadingBusinessTypes(true);
        const res = await api.publicGeo.getBusinessTypes();
        if (mounted && res.success) {
          const list = Array.isArray(res.data) ? res.data : (res as any).data?.data || [];
          setBusinessTypes(list);
        }
      } catch (err) {
        console.error('Error fetching business types:', err);
      } finally {
        setLoadingBusinessTypes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const synthChange = (name: string, value: string) => {
    const event = {
      target: { name, value },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place) return;

    const comp = (place.address_components || []) as google.maps.GeocoderAddressComponent[];
    const get = (type: string) => comp.find(c => c.types.includes(type))?.long_name || '';

    const streetNumber = get('street_number');
    const route = get('route');
    const address = [route, streetNumber].filter(Boolean).join(' ');
    const city = get('locality') || get('sublocality') || get('administrative_area_level_2');
    const state = get('administrative_area_level_1');
    const postal = get('postal_code');

    if (address) synthChange('address', address);
    if (city) synthChange('city', city);
    if (state) synthChange('state', state);
    if (postal) synthChange('postal_code', postal);

    const location = place.geometry?.location;
    if (location) {
      const lat = location.lat();
      const lng = location.lng();
      setMarkerPos({ lat, lng });
      onLocationChange?.({ latitude: lat, longitude: lng });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
      
      {/* LEFT COLUMN: Identity & Activity */}
      <div className="space-y-6">
        <div>
          <h4 className="flex items-center text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 mr-2" /> Identidad y Actividad
          </h4>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                Nombre de la Empresa <span className="text-emerald-500">*</span>
              </label>
              <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
                  placeholder="Ej. TechCorp S.A. de C.V."
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
                Descripción
              </label>
              <div className="flex items-start px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
                <AlignLeft className="w-5 h-5 text-slate-400 mr-2 mt-0.5" />
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400 resize-none"
                  placeholder="Cuéntanos un poco sobre lo que hace tu empresa..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Tipo de negocio
              </label>
              <Select.Root 
                value={formData.business_type_id ? String(formData.business_type_id) : undefined}
                onValueChange={(value) => {
                  const event = {
                    target: {
                      name: 'business_type_id',
                      value: value === '' ? '' : Number(value)
                    }
                  } as React.ChangeEvent<HTMLSelectElement>;
                  handleInputChange(event);
                }}
                onOpenChange={(open) => {
                  if (!open) setSearchTerm('');
                }}
              >
                <Select.Trigger 
                  className="flex items-center justify-between w-full px-3 py-2.5 text-left bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white shadow-sm transition-all"
                  aria-label="Seleccionar tipo de negocio"
                >
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 text-slate-400 mr-2" />
                    <Select.Value placeholder={loadingBusinessTypes ? 'Cargando...' : 'Selecciona industria...'} />
                  </div>
                  <Select.Icon className="ml-2">
                    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </Select.Icon>
                </Select.Trigger>
                
                <Select.Portal>
                  <Select.Content 
                    className="z-[999] overflow-hidden bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 w-[var(--radix-select-trigger-width)] animate-in fade-in-80 slide-in-from-top-1"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    position="popper"
                    sideOffset={8}
                  >
                    <div className="p-3 border-b border-slate-100/50">
                      <div className="relative flex items-center">
                        <SearchIcon className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Busca tu industria..."
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') return;
                            if (e.key === 'Escape') setSearchTerm('');
                            else if (e.key === 'Enter') e.preventDefault();
                            else e.stopPropagation();
                          }}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <Select.Viewport className="p-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                      {filteredBusinessTypes.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-center text-slate-500">
                          {loadingBusinessTypes ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Cargando...
                            </span>
                          ) : 'Sin resultados'}
                        </div>
                      ) : (
                        filteredBusinessTypes.map((bt) => (
                          <Select.Item 
                            key={bt.id} 
                            value={String(bt.id)}
                            className="relative flex items-center px-9 py-2.5 text-sm font-medium text-slate-700 rounded-lg cursor-pointer select-none hover:bg-emerald-50 focus:bg-emerald-50 focus:text-emerald-700 focus:outline-none transition-colors mb-0.5 last:mb-0"
                          >
                            <Select.ItemText>{bt.name}</Select.ItemText>
                            <Select.ItemIndicator className="absolute left-3 text-emerald-600">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))
                      )}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Contact & Location */}
      <div className="space-y-6">
        <div>
          <h4 className="flex items-center text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 mr-2" /> Contacto y Ubicación
          </h4>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Correo Electrónico <span className="text-emerald-500">*</span>
                </label>
                <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400 min-w-0"
                    placeholder="contacto@emp.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
                  Teléfono
                </label>
                <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
                  <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400 min-w-0"
                    placeholder="+52 55 1234..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-center">
                <label htmlFor="address" className="block text-sm font-semibold text-slate-700">
                  Dirección
                </label>
                {hasApiKey && isLoaded && (
                  <button
                    type="button"
                    onClick={() => setIsManualAddress(!isManualAddress)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                  >
                    {isManualAddress ? 'Usar buscador' : 'Manual'}
                  </button>
                )}
              </div>
              
              <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
                <MapPin className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                {hasApiKey && isLoaded && !isManualAddress ? (
                  <Autocomplete
                    onLoad={(ac) => (autocompleteRef.current = ac)}
                    onPlaceChanged={onPlaceChanged}
                    options={{ fields: ['address_components', 'geometry', 'name', 'formatted_address'] }}
                    className="w-full"
                  >
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
                      placeholder="Ingresa la calle y número..."
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
                    placeholder="Av. Principal 123"
                  />
                )}
              </div>

              {hasApiKey && isLoaded && !isManualAddress && markerPos && (
                <div className="mt-4 h-32 w-full overflow-hidden rounded-xl border border-slate-200 shadow-md transition-all duration-500 ease-in-out transform">
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={16}
                    options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }] }}
                  >
                    <Marker position={markerPos} animation={google.maps.Animation.DROP} />
                  </GoogleMap>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-1">
                <label htmlFor="city" className="block text-sm font-semibold text-slate-700">
                  Ciudad
                </label>
                <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400 min-w-0"
                    placeholder="CDMX"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <label htmlFor="state" className="block text-sm font-semibold text-slate-700">
                  Estado
                </label>
                <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400 min-w-0"
                    placeholder="Edo Mex."
                  />
                </div>
              </div>

              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label htmlFor="postal_code" className="block text-sm font-semibold text-slate-700">
                  C.P.
                </label>
                <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
                  <Hash className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code || ''}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400 min-w-0"
                    placeholder="06000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};
