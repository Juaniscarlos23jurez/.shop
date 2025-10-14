"use client";

import React, { useMemo, useRef, useState } from 'react';
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
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLocationChange?: (coords: { latitude: number; longitude: number }) => void;
}

export const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({ formData, handleInputChange, onLocationChange }) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);

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
 