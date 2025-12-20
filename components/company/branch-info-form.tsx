"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Autocomplete, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/api';

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
    // New optional fields for geo IDs and coordinates
    country_id?: number | string;
    state_id?: number | string;
    city_id?: number | string;
    latitude?: number;
    longitude?: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isFirstBranch?: boolean;
}

export const BranchInfoForm: React.FC<BranchInfoFormProps> = ({ formData, handleInputChange, isFirstBranch = true }) => {
  const router = useRouter();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [countries, setCountries] = useState<Array<{ id: number; name: string }>>([]);
  const [states, setStates] = useState<Array<{ id: number; name: string }>>([]);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);

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
      // persist into form
      synthChange('location.latitude', String(lat));
      synthChange('location.longitude', String(lng));
    }
  };

  // Load countries on mount
  useEffect(() => {
    let ignore = false;
    api.publicGeo.getCountries(true)
      .then(res => {
        if (!ignore) {
          const list = (res as any)?.data?.data || [];
          setCountries(Array.isArray(list) ? list : []);
          // debug
          console.debug('[BranchInfoForm] countries loaded:', list?.length ?? 0);
        }
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  // Load states when country changes
  useEffect(() => {
    const cId = formData.country_id || '';
    if (!cId) { setStates([]); setCities([]); return; }
    let ignore = false;
    api.publicGeo.getStates(cId, true)
      .then(res => {
        if (!ignore) {
          const list = (res as any)?.data?.data || [];
          setStates(Array.isArray(list) ? list : []);
          console.debug('[BranchInfoForm] states loaded:', list?.length ?? 0, 'for country', String(cId));
        }
      })
      .catch(() => {});
    // Reset dependent selections
    synthChange('location.state_id', '');
    synthChange('location.city_id', '');
    return () => { ignore = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.country_id]);

  // Load cities when state changes
  useEffect(() => {
    const sId = formData.state_id || '';
    if (!sId) { setCities([]); return; }
    let ignore = false;
    api.publicGeo.getCities(sId, true)
      .then(res => {
        if (!ignore) {
          const list = (res as any)?.data?.data || [];
          setCities(Array.isArray(list) ? list : []);
          console.debug('[BranchInfoForm] cities loaded:', list?.length ?? 0, 'for state', String(sId));
        }
      })
      .catch(() => {});
    // Reset dependent selection
    synthChange('location.city_id', '');
    return () => { ignore = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.state_id]);

  const stateMissing = Boolean(formData.country_id) && !formData.state_id;
  const cityMissing = Boolean(formData.state_id) && !formData.city_id;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-slate-900">Agregar Sucursal</h3>
        <p className="text-sm text-slate-500 mt-1">{isFirstBranch ? 'Agrega tu primera sucursal' : 'Agrega una nueva sucursal'}</p>
      </div>
      
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
          <label className="block text-sm font-medium text-slate-700 mb-1">País</label>
          <select
            name="location.country_id"
            value={String(formData.country_id || '')}
            onChange={(e) => {
              handleInputChange(e);
              // Also update the text field
              const selectedCountry = countries.find(c => String(c.id) === e.target.value);
              if (selectedCountry) {
                synthChange('location.country', selectedCountry.name);
              }
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Selecciona un país</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estado/Provincia <span className="text-red-500">*</span></label>
          <select
            name="location.state_id"
            value={String(formData.state_id || '')}
            onChange={(e) => {
              handleInputChange(e);
              // Also update the text field
              const selectedState = states.find(s => String(s.id) === e.target.value);
              if (selectedState) {
                synthChange('location.state', selectedState.name);
              }
            }}
            disabled={!formData.country_id}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100"
          >
            <option value="">Selecciona un estado</option>
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {stateMissing && (
            <p className="mt-1 text-sm text-red-600">Estado/Provincia es requerido</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad <span className="text-red-500">*</span></label>
          <select
            name="location.city_id"
            value={String(formData.city_id || '')}
            onChange={(e) => {
              handleInputChange(e);
              // Also update the text field
              const selectedCity = cities.find(ci => String(ci.id) === e.target.value);
              if (selectedCity) {
                synthChange('location.city', selectedCity.name);
              }
            }}
            disabled={!formData.state_id}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100"
          >
            <option value="">Selecciona una ciudad</option>
            {cities.map(ci => (
              <option key={ci.id} value={ci.id}>{ci.name}</option>
            ))}
          </select>
          {cityMissing && (
            <p className="mt-1 text-sm text-red-600">Ciudad es requerida</p>
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