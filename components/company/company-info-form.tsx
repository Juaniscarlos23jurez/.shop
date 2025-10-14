"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { Search as SearchIcon } from 'lucide-react';
import { api } from '@/lib/api/api';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';

interface CompanyInfoFormProps {
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

export const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({ formData, handleInputChange, onLocationChange }) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [businessTypes, setBusinessTypes] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [loadingBusinessTypes, setLoadingBusinessTypes] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter business types based on search term
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
    return { lat: 19.4326, lng: -99.1332 }; // CDMX fallback
  }, [markerPos]);

  // Fetch public business types for select
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
    <>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
          Nombre de la Empresa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Correo Electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
          Dirección
        </label>
        {hasApiKey && isLoaded ? (
          <Autocomplete
            onLoad={(ac) => (autocompleteRef.current = ac)}
            onPlaceChanged={onPlaceChanged}
            options={{ fields: ['address_components', 'geometry', 'name', 'formatted_address'] }}
          >
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ingresa una dirección y selecciona de la lista"
            />
          </Autocomplete>
        ) : (
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        )}
        {hasApiKey && isLoaded && markerPos && (
          <div className="mt-3 h-48 w-full overflow-hidden rounded-md border border-slate-200">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={15}
              options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
            >
              <Marker position={markerPos} />
            </GoogleMap>
          </div>
        )}
        {!hasApiKey && (
          <p className="mt-2 text-xs text-amber-600">Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local y reinicia el servidor para habilitar autocompletar y mapa.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
            Ciudad
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
            Estado/Provincia
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-slate-700 mb-1">
            Código Postal
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formData.postal_code || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 mb-1">
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
            className="flex items-center justify-between w-full px-3 py-2 text-left border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            aria-label="Seleccionar tipo de negocio"
          >
            <Select.Value placeholder={loadingBusinessTypes ? 'Cargando tipos...' : 'Selecciona un tipo'} />
            <Select.Icon className="ml-2">
              <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </Select.Icon>
          </Select.Trigger>
          
          <Select.Portal>
            <Select.Content 
              className="z-50 overflow-hidden bg-white rounded-md shadow-lg border border-slate-200 w-[var(--radix-select-trigger-width)]"
              onCloseAutoFocus={(e) => e.preventDefault()}
              position="popper"
              sideOffset={5}
            >
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar tipo..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        // Permitir navegación por teclado
                        return;
                      }
                      if (e.key === 'Escape') {
                        setSearchTerm('');
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                      } else {
                        e.stopPropagation();
                      }
                    }}
                    autoComplete="off"
                  />
                </div>
              </div>
              <Select.Viewport className="p-1 max-h-60 overflow-auto">
                {filteredBusinessTypes.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-slate-500">
                    {loadingBusinessTypes ? 'Cargando...' : 'No se encontraron resultados'}
                  </div>
                ) : (
                  filteredBusinessTypes.map((bt) => (
                    <Select.Item 
                      key={bt.id} 
                      value={String(bt.id)}
                      className="relative flex items-center px-8 py-1.5 text-sm text-slate-700 rounded cursor-pointer select-none hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                    >
                      <Select.ItemText>{bt.name}</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                        <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
          Sitio Web
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website || ''}
          onChange={handleInputChange}
          placeholder="https://ejemplo.com"
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>
    </>
  );
};