"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { api } from '@/lib/api/api';
import { Store, MapPin, Globe, Map, Building, Phone, Mail, User, Hash, Clock } from 'lucide-react';

interface OnboardingBranchInfoFormProps {
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
    country_id?: number | string;
    state_id?: number | string;
    city_id?: number | string;
    latitude?: number;
    longitude?: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isFirstBranch?: boolean;
}

export const OnboardingBranchInfoForm: React.FC<OnboardingBranchInfoFormProps> = ({ formData, handleInputChange, isFirstBranch = true }) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [countries, setCountries] = useState<Array<{ id: number; name: string }>>([]);
  const [states, setStates] = useState<Array<{ id: number; name: string }>>([]);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [isManualAddress, setIsManualAddress] = useState<boolean>(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = Boolean(apiKey);
  const { isLoaded } = useJsApiLoader(
    hasApiKey
      ? { id: 'google-maps-script', googleMapsApiKey: apiKey, libraries: ['places'] }
      : { id: 'google-maps-script-skip', googleMapsApiKey: 'invalid', libraries: [] }
  );

  const mapCenter = useMemo(() => {
    if (markerPos) return markerPos;
    return { lat: 19.4326, lng: -99.1332 };
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
      synthChange('location.latitude', String(lat));
      synthChange('location.longitude', String(lng));
    }
  };

  useEffect(() => {
    let ignore = false;
    api.publicGeo.getCountries(true)
      .then(res => {
        if (!ignore) {
          const list = (res as any)?.data?.data || [];
          setCountries(Array.isArray(list) ? list : []);
        }
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    const cId = formData.country_id || '';
    if (!cId) { setStates([]); setCities([]); return; }
    let ignore = false;
    api.publicGeo.getStates(cId, true)
      .then(res => {
        if (!ignore) {
          const list = (res as any)?.data?.data || [];
          setStates(Array.isArray(list) ? list : []);
        }
      })
      .catch(() => {});
    synthChange('location.state_id', '');
    synthChange('location.city_id', '');
    return () => { ignore = true; };
  }, [formData.country_id]);

  useEffect(() => {
    const sId = formData.state_id || '';
    if (!sId) { setCities([]); return; }
    let ignore = false;
    api.publicGeo.getCities(sId, true)
      .then(res => {
        if (!ignore) {
          const list = (res as any)?.data?.data || [];
          setCities(Array.isArray(list) ? list : []);
        }
      })
      .catch(() => {});
    synthChange('location.city_id', '');
    return () => { ignore = true; };
  }, [formData.state_id]);

  const stateMissing = Boolean(formData.country_id) && !formData.state_id;
  const cityMissing = Boolean(formData.state_id) && !formData.city_id;

  return (
    <div className="space-y-6 pt-2">
      <div className="mb-6 pb-4 border-b border-slate-100 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Agregar Sucursal</h3>
          <p className="text-sm font-medium text-slate-500">{isFirstBranch ? 'Configura rápidamente tu primera sucursal' : 'Agrega una nueva sucursal a tu empresa'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="locationName" className="block text-sm font-semibold text-slate-700">
            Nombre de la Sucursal <span className="text-emerald-500">*</span>
          </label>
          <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
            <Store className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="text"
              id="locationName"
              name="location.name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
              placeholder="Ej. Matriz CDMX"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="locationAddress" className="block text-sm font-semibold text-slate-700">
              Dirección <span className="text-emerald-500">*</span>
            </label>
            {hasApiKey && isLoaded && (
              <button
                type="button"
                onClick={() => setIsManualAddress(!isManualAddress)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
              >
                {isManualAddress ? 'Usar buscador de Google' : 'Ingresar manualmente'}
              </button>
            )}
          </div>
          <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
            <MapPin className="w-5 h-5 text-slate-400 mr-2" />
            {hasApiKey && isLoaded && !isManualAddress ? (
              <Autocomplete
                onLoad={(ac) => (autocompleteRef.current = ac)}
                onPlaceChanged={onPlaceChanged}
                options={{ fields: ['address_components', 'geometry', 'name', 'formatted_address'] }}
                className="w-full"
              >
                <input
                  type="text"
                  id="locationAddress"
                  name="location.address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
                  placeholder="Busca la dirección..."
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
                className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
                placeholder="Ingresa la calle y número"
                required
              />
            )}
          </div>
          {hasApiKey && isLoaded && !isManualAddress && markerPos && (
            <div className="mt-4 h-48 w-full overflow-hidden rounded-xl border border-slate-200 shadow-md transition-all duration-500 ease-in-out transform">
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

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-slate-700">País</label>
          <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
            <Globe className="w-5 h-5 text-slate-400 mr-2" />
            <select
              name="location.country_id"
              value={String(formData.country_id || '')}
              onChange={(e) => {
                handleInputChange(e);
                const selectedCountry = countries.find(c => String(c.id) === e.target.value);
                if (selectedCountry) {
                  synthChange('location.country', selectedCountry.name);
                }
              }}
              className="w-full bg-transparent border-none focus:outline-none text-slate-800 appearance-none"
            >
              <option value="" disabled className="text-slate-400">Selecciona el país...</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-slate-700">Estado/Provincia <span className="text-emerald-500">*</span></label>
          <div className={`flex items-center px-3 py-2.5 border rounded-xl transition-all shadow-sm ${!formData.country_id ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-50 border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white text-slate-800'}`}>
            <Map className={`w-5 h-5 mr-2 ${!formData.country_id ? 'text-slate-300' : 'text-slate-400'}`} />
            <select
              name="location.state_id"
              value={String(formData.state_id || '')}
              onChange={(e) => {
                handleInputChange(e);
                const selectedState = states.find(s => String(s.id) === e.target.value);
                if (selectedState) {
                  synthChange('location.state', selectedState.name);
                }
              }}
              disabled={!formData.country_id}
              className="w-full bg-transparent border-none focus:outline-none appearance-none disabled:cursor-not-allowed"
            >
              <option value="" disabled>Selecciona un estado...</option>
              {states.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {stateMissing && (
            <p className="mt-1.5 text-xs text-red-500 font-medium px-1">Se requiere seleccionar un estado</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-slate-700">Ciudad <span className="text-emerald-500">*</span></label>
          <div className={`flex items-center px-3 py-2.5 border rounded-xl transition-all shadow-sm ${!formData.state_id ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-50 border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white text-slate-800'}`}>
            <Building className={`w-5 h-5 mr-2 ${!formData.state_id ? 'text-slate-300' : 'text-slate-400'}`} />
            <select
              name="location.city_id"
              value={String(formData.city_id || '')}
              onChange={(e) => {
                handleInputChange(e);
                const selectedCity = cities.find(ci => String(ci.id) === e.target.value);
                if (selectedCity) {
                  synthChange('location.city', selectedCity.name);
                }
              }}
              disabled={!formData.state_id}
              className="w-full bg-transparent border-none focus:outline-none appearance-none disabled:cursor-not-allowed"
            >
              <option value="" disabled>Selecciona una ciudad...</option>
              {cities.map(ci => (
                <option key={ci.id} value={ci.id}>{ci.name}</option>
              ))}
            </select>
          </div>
          {cityMissing && (
            <p className="mt-1.5 text-xs text-red-500 font-medium px-1">Se requiere seleccionar una ciudad</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="locationPostalCode" className="block text-sm font-semibold text-slate-700">
            Código Postal <span className="text-emerald-500">*</span>
          </label>
          <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
            <Hash className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="text"
              id="locationZipCode"
              name="location.zip_code"
              value={formData.zip_code || ''}
              onChange={handleInputChange}
              className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
              placeholder="06000"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="locationPhone" className="block text-sm font-semibold text-slate-700">
            Teléfono
          </label>
          <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
            <Phone className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="tel"
              id="locationPhone"
              name="location.phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
              placeholder="+52 55 1234 5678"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="locationEmail" className="block text-sm font-semibold text-slate-700">
            Correo Electrónico
          </label>
          <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
            <Mail className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="email"
              id="locationEmail"
              name="location.email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
              placeholder="sucursal@empresa.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="locationContact" className="block text-sm font-semibold text-slate-700">
            Persona de Contacto
          </label>
          <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
            <User className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="text"
              id="locationContact"
              name="location.contact_person"
              value={formData.contact_person || ''}
              onChange={handleInputChange}
              className="w-full bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
              placeholder="Nombre del gerente o contacto..."
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="locationTimezone" className="block text-sm font-semibold text-slate-700">
            Zona Horaria
          </label>
          <div className="flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all shadow-sm">
            <Clock className="w-5 h-5 text-slate-400 mr-2" />
            <select
              id="locationTimezone"
              name="location.timezone"
              value={formData.timezone || ''}
              onChange={handleInputChange}
              className="w-full bg-transparent border-none focus:outline-none text-slate-800 appearance-none"
            >
              <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
              <option value="America/Monterrey">Monterrey (UTC-6)</option>
              <option value="America/Tijuana">Tijuana (UTC-8)</option>
              <option value="America/New_York">Nueva York (UTC-5)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
