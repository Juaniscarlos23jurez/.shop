"use client";

import React, { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Autocomplete, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';

interface BranchInfoFormProps {
  formData: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    contact_person?: string;
    timezone?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    notes?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const BranchInfoForm: React.FC<BranchInfoFormProps> = ({ formData, handleInputChange }) => {
  const router = useRouter();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = Boolean(apiKey);
  const { isLoaded } = useJsApiLoader(
    hasApiKey
      ? { id: 'google-maps-script', googleMapsApiKey: apiKey, libraries: ['places'] }
      : { id: 'google-maps-script-skip', googleMapsApiKey: 'invalid', libraries: [] }
  );

  const mapCenter = useMemo(() => {
    if (markerPos) return markerPos;
    return { lat: 19.4326, lng: -99.1332 }; // CDMX default
  }, [markerPos]);

  const synthChange = (name: string, value: string) => {
    const event = { target: { name, value } } as unknown as React.ChangeEvent<HTMLInputElement>;
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
    const country = get('country');
    const zip = get('postal_code');

    if (address) synthChange('location.address', address);
    if (city) synthChange('location.city', city);
    if (state) synthChange('location.state', state);
    if (country) synthChange('location.country', country);
    if (zip) synthChange('location.zip_code', zip);

    const location = place.geometry?.location;
    if (location) {
      const lat = location.lat();
      const lng = location.lng();
      setMarkerPos({ lat, lng });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">Agregar Sucursal</h3>
        <Button variant="outline" onClick={() => router.push('?edit=true&step=1')}>
          Editar información de compañía
        </Button>
      </div>
      <p className="text-sm text-slate-500 mb-4">Agrega tu primera sucursal</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="locationName" className="block text-sm font-medium text-slate-700 mb-1">
            Nombre de la Sucursal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="locationName"
            name="location.name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label htmlFor="locationAddress" className="block text-sm font-medium text-slate-700 mb-1">
            Dirección <span className="text-red-500">*</span>
          </label>
          {hasApiKey && isLoaded ? (
            <Autocomplete
              onLoad={(ac) => (autocompleteRef.current = ac)}
              onPlaceChanged={onPlaceChanged}
              options={{ fields: ['address_components', 'geometry', 'name', 'formatted_address'] }}
            >
              <input
                type="text"
                id="locationAddress"
                name="location.address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ingresa una dirección y selecciona de la lista"
                required
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              id="locationAddress"
              name="location.address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
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
        </div>

        <div>
          <label htmlFor="locationPhone" className="block text-sm font-medium text-slate-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            id="locationPhone"
            name="location.phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="locationEmail" className="block text-sm font-medium text-slate-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="locationEmail"
            name="location.email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="locationContact" className="block text-sm font-medium text-slate-700 mb-1">
            Persona de Contacto
          </label>
          <input
            type="text"
            id="locationContact"
            name="location.contact_person"
            value={formData.contact_person || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="locationPostalCode" className="block text-sm font-medium text-slate-700 mb-1">
            Código Postal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="locationZipCode"
            name="location.zip_code"
            value={formData.zip_code || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label htmlFor="locationTimezone" className="block text-sm font-medium text-slate-700 mb-1">
            Zona Horaria
          </label>
          <select
            id="locationTimezone"
            name="location.timezone"
            value={formData.timezone || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
            <option value="America/Monterrey">Monterrey (UTC-6)</option>
            <option value="America/Tijuana">Tijuana (UTC-8)</option>
            <option value="America/New_York">Nueva York (UTC-5)</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 