import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Branch } from "@/types/branch";
import { Autocomplete, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { api } from '@/lib/api/api';

const branchFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  email: z.string().email('Correo electrónico inválido'),
  address: z.string().min(5, 'La dirección es requerida'),
  city: z.string().min(2, 'La ciudad es requerida'),
  state: z.string().min(2, 'El estado es requerido'),
  country: z.string().min(2, 'El país es requerido'),
  zipCode: z.string().min(3, 'El código postal es requerido'),
  isActive: z.boolean().default(true)
});

type BranchFormValues = z.infer<typeof branchFormSchema>;

interface BranchFormProps {
  branch: Branch;
  onSave: (data: Branch & { postal_code?: string }) => void;
  onCancel: () => void;
}

export function BranchForm({ branch, onSave, onCancel }: BranchFormProps) {
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: branch.name,
      description: branch.description || '',
      phone: branch.phone,
      email: branch.email,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      country: branch.country,
      zipCode: (branch as any).postal_code || (branch as any).zipCode || '',
      isActive: branch.isActive
    }
  });

  // Google Maps loader (match id with other components)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = Boolean(apiKey);
  const { isLoaded } = useJsApiLoader(
    hasApiKey
      ? { id: 'google-maps-script', googleMapsApiKey: apiKey, libraries: ['places'] }
      : { id: 'google-maps-script-skip', googleMapsApiKey: 'invalid', libraries: [] }
  );

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null);
  const [countries, setCountries] = useState<Array<{ id: number; name: string }>>([]);
  const [states, setStates] = useState<Array<{ id: number; name: string }>>([]);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [countryId, setCountryId] = useState<string>('');
  const [stateId, setStateId] = useState<string>('');
  const [cityId, setCityId] = useState<string>('');
  const mapCenter = useMemo(() => {
    if (markerPos) return markerPos;
    return { lat: 19.4326, lng: -99.1332 };
  }, [markerPos]);

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place) return;

    const comps = (place.address_components || []) as google.maps.GeocoderAddressComponent[];
    const get = (type: string) => comps.find(c => c.types.includes(type))?.long_name || '';

    const streetNumber = get('street_number');
    const route = get('route');
    const address = [route, streetNumber].filter(Boolean).join(' ');
    const city = get('locality') || get('sublocality') || get('administrative_area_level_2');
    const state = get('administrative_area_level_1');
    const country = get('country');
    const zip = get('postal_code');

    if (address) form.setValue('address', address, { shouldValidate: true, shouldDirty: true });
    if (city) form.setValue('city', city, { shouldValidate: true, shouldDirty: true });
    if (state) form.setValue('state', state, { shouldValidate: true, shouldDirty: true });
    if (country) form.setValue('country', country, { shouldValidate: true, shouldDirty: true });
    if (zip) form.setValue('zipCode', zip, { shouldValidate: true, shouldDirty: true });

    const loc = place.geometry?.location;
    if (loc) {
      setMarkerPos({ lat: loc.lat(), lng: loc.lng() });
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
          console.debug('[BranchForm] countries loaded:', list?.length ?? 0);
        }
      })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  // Initialize from existing branch (IDs preferred)
  useEffect(() => {
    // Initialize marker from existing branch coords if present
    if (!markerPos && (branch as any)?.latitude && (branch as any)?.longitude) {
      setMarkerPos({ lat: Number((branch as any).latitude), lng: Number((branch as any).longitude) });
    }
  }, [branch, markerPos]);

  // When countries load, preselect country by id or by name
  useEffect(() => {
    if (countryId) return; // already set
    const brCountryId = (branch as any)?.country_id;
    if (brCountryId) {
      setCountryId(String(brCountryId));
      return;
    }
    if (countries.length && branch.country) {
      const match = countries.find(c => c.name.toLowerCase() === branch.country.toLowerCase());
      if (match) setCountryId(String(match.id));
    }
  }, [countries, branch, countryId]);

  // Load states when country changes
  useEffect(() => {
    if (!countryId) { setStates([]); setCities([]); setStateId(''); setCityId(''); return; }
    let ignore = false;
    api.publicGeo.getStates(countryId, true)
      .then(res => {
        if (!ignore) {
          const list = (res as any)?.data?.data || [];
          setStates(Array.isArray(list) ? list : []);
          console.debug('[BranchForm] states loaded:', list?.length ?? 0, 'for country', countryId);
        }
      })
      .catch(() => {});
    setStateId('');
    setCityId('');
    return () => { ignore = true; };
  }, [countryId]);

  // When states load, preselect by id or name
  useEffect(() => {
    if (!states.length || stateId) return;
    const brStateId = (branch as any)?.state_id;
    if (brStateId) {
      setStateId(String(brStateId));
      return;
    }
    if (branch.state) {
      const match = states.find(s => s.name.toLowerCase() === branch.state.toLowerCase());
      if (match) setStateId(String(match.id));
    }
  }, [states, branch, stateId]);

  // Load cities when state changes
  useEffect(() => {
    if (!stateId) { setCities([]); setCityId(''); return; }
    let ignore = false;
    api.publicGeo.getCities(stateId, true)
      .then(res => {
        if (!ignore) {
          const list = (res as any)?.data?.data || [];
          setCities(Array.isArray(list) ? list : []);
          console.debug('[BranchForm] cities loaded:', list?.length ?? 0, 'for state', stateId);
        }
      })
      .catch(() => {});
    setCityId('');
    return () => { ignore = true; };
  }, [stateId]);

  // When cities load, preselect by id or name
  useEffect(() => {
    if (!cities.length || cityId) return;
    const brCityId = (branch as any)?.city_id;
    if (brCityId) {
      setCityId(String(brCityId));
      return;
    }
    if (branch.city) {
      const match = cities.find(ci => ci.name.toLowerCase() === branch.city.toLowerCase());
      if (match) setCityId(String(match.id));
    }
  }, [cities, branch, cityId]);

  const onSubmit = (data: BranchFormValues) => {
    const payload = {
      ...branch,
      ...data,
      // Map frontend field to backend expected key
      postal_code: data.zipCode,
      // Send IDs and coordinates as per backend requirements
      country_id: countryId ? Number(countryId) : undefined,
      state_id: stateId ? Number(stateId) : undefined,
      city_id: cityId ? Number(cityId) : undefined,
      latitude: markerPos?.lat,
      longitude: markerPos?.lng,
      updatedAt: new Date().toISOString()
    };
     
    onSave(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la sucursal</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Descripción" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Teléfono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  {hasApiKey && isLoaded ? (
                    <Autocomplete
                      onLoad={(ac) => (autocompleteRef.current = ac)}
                      onPlaceChanged={onPlaceChanged}
                      options={{ fields: ['address_components', 'geometry', 'name', 'formatted_address'] }}
                    >
                      <Input placeholder="Dirección" {...field} />
                    </Autocomplete>
                  ) : (
                    <Input placeholder="Dirección" {...field} />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {hasApiKey && isLoaded && markerPos && (
            <div className="md:col-span-2 h-48 w-full overflow-hidden rounded-md border border-slate-200">
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
          
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <select
                    value={countryId}
                    onChange={(e) => {
                      setCountryId(e.target.value);
                      field.onChange(countries.find(c => String(c.id) === e.target.value)?.name || '');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="">Selecciona un país</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <select
                    value={stateId}
                    onChange={(e) => {
                      setStateId(e.target.value);
                      field.onChange(states.find(s => String(s.id) === e.target.value)?.name || '');
                    }}
                    disabled={!countryId}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md disabled:bg-slate-100"
                  >
                    <option value="">Selecciona un estado</option>
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad</FormLabel>
                <FormControl>
                  <select
                    value={cityId}
                    onChange={(e) => {
                      setCityId(e.target.value);
                      field.onChange(cities.find(ci => String(ci.id) === e.target.value)?.name || '');
                    }}
                    disabled={!stateId}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md disabled:bg-slate-100"
                  >
                    <option value="">Selecciona una ciudad</option>
                    {cities.map(ci => (
                      <option key={ci.id} value={ci.id}>{ci.name}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código postal</FormLabel>
                <FormControl>
                  <Input placeholder="Código postal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Estado de la sucursal</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {field.value ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button type="submit">
            Guardar cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
