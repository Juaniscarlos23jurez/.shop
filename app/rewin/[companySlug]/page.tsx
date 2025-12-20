"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { publicWebApiClient } from '@/lib/api/public-web';
import { PublicCompany, PublicCompanyLocation, Announcement, PublicItem, BusinessHour } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Mail, Globe, Clock, Package, Megaphone } from 'lucide-react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

export default function PublicCompanyPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;

  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [locations, setLocations] = useState<PublicCompanyLocation[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  // Carousel navigation functions
  const nextAnnouncement = () => {
    if (announcements.length === 0) return;
    setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
  };

  const prevAnnouncement = () => {
    if (announcements.length === 0) return;
    setCurrentAnnouncementIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(nextAnnouncement, 5000);
    return () => clearInterval(interval);
  }, [announcements.length]);
  
  const [items, setItems] = useState<PublicItem[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyMarker, setCompanyMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [user, setUser] = useState<any>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasApiKey = Boolean(apiKey);
  const { isLoaded } = useJsApiLoader(
    hasApiKey
      ? {
          id: 'google-maps-script-public',
          googleMapsApiKey: apiKey,
        }
      : { id: 'google-maps-script-public-skip', googleMapsApiKey: 'invalid' }
  );

  const mapMarkers = useMemo(() => {
    const safeLocations = Array.isArray(locations) ? locations : [];
    return safeLocations
      .map((loc) => {
        const anyLoc = loc as any;
        const latRaw = anyLoc?.latitude ?? anyLoc?.lat;
        const lngRaw = anyLoc?.longitude ?? anyLoc?.lng;
        const lat = typeof latRaw === 'string' ? Number(latRaw) : latRaw;
        const lng = typeof lngRaw === 'string' ? Number(lngRaw) : lngRaw;
        if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) return null;
        return {
          id: loc.id,
          title: loc.name,
          position: { lat, lng },
        };
      })
      .filter(Boolean) as Array<{ id: string; title: string; position: { lat: number; lng: number } }>;
  }, [locations]);

  const mapCenter = useMemo(() => {
    if (mapMarkers.length > 0) return mapMarkers[0].position;
    if (companyMarker) return companyMarker;
    return { lat: 19.4326, lng: -99.1332 };
  }, [mapMarkers, companyMarker]);

  const mapsQuery = useMemo(() => {
    if (!company) return '';
    const parts = [company.address, company.city, company.state, company.country, company.postal_code].filter(Boolean);
    if (parts.length === 0) return '';
    return encodeURIComponent(parts.join(', '));
  }, [company]);

  useEffect(() => {
    if (!companySlug) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let companyId: string | null = null;
      let hasLocationsInCompany = false;

      try {
        console.log('[PublicCompanyPage] companySlug:', companySlug);

        const companyRes = await publicWebApiClient.getCompanyByName(companySlug);
        console.log('[PublicCompanyPage] companyRes:', companyRes);
        if (companyRes.success && companyRes.data) {
          console.log('[PublicCompanyPage] companyRes.data:', companyRes.data);
          const companyData: any = (companyRes as any).data?.data ?? companyRes.data;
          console.log('[PublicCompanyPage] companyData usado:', companyData);

          setCompany(companyData);
          companyId = companyData.id;
          
          // Si las locations vienen en la respuesta de company, usarlas directamente
          if (companyData.locations && Array.isArray(companyData.locations)) {
            console.log('[PublicCompanyPage] Usando locations de companyData:', companyData.locations);
            setLocations(companyData.locations);
            hasLocationsInCompany = companyData.locations.length > 0;
          }
          
          console.log('[PublicCompanyPage] companyId obtenido:', companyId);
        } else {
          console.log('[PublicCompanyPage] Error en companyRes:', companyRes.error, companyRes);
          throw new Error(companyRes.error || 'Fallo al obtener los detalles de la compañía por nombre.');
        }

        if (!companyId) {
          throw new Error('No se pudo obtener el ID de la compañía.');
        }

        // Solo hacer esta llamada si NO vinieron locations en companyData o vinieron vacías
        if (!hasLocationsInCompany) {
          const locationsRes = await publicWebApiClient.getCompanyLocationsById(companyId);
          console.log('[PublicCompanyPage] locationsRes:', locationsRes);
          if (locationsRes.success && locationsRes.data) {
            const rawLocations: any = (locationsRes as any).data?.data ?? locationsRes.data;
            const safeLocations = Array.isArray(rawLocations)
              ? rawLocations
              : Array.isArray((rawLocations as any)?.data)
              ? (rawLocations as any).data
              : [];
            console.log('[PublicCompanyPage] locations usadas:', safeLocations);
            if (safeLocations.length > 0) {
              setLocations(safeLocations);
            }
          } else {
            console.log('[PublicCompanyPage] Sin sucursales o formato inesperado, manteniendo locations actuales.');
          }
        }

        const announcementsRes = await publicWebApiClient.getCompanyAnnouncementsById(companyId);
        console.log('[PublicCompanyPage] announcementsRes:', announcementsRes);
        if (announcementsRes.success && announcementsRes.data) {
          const payload: any = (announcementsRes as any).data;
          const rawAnnouncements: any = payload?.data?.data ?? payload?.data ?? payload;
          const safeAnnouncements = Array.isArray(rawAnnouncements) ? rawAnnouncements : [];
          console.log('[PublicCompanyPage] announcements usados:', safeAnnouncements);
          setAnnouncements(safeAnnouncements);
        } else {
          console.log('[PublicCompanyPage] Sin anuncios o formato inesperado, usando [].');
          setAnnouncements([]);
        }

        const businessHoursRes = await publicWebApiClient.getCompanyBusinessHoursById(companyId);
        console.log('[PublicCompanyPage] businessHoursRes:', businessHoursRes);
        if (businessHoursRes.success && businessHoursRes.data) {
          setBusinessHours(businessHoursRes.data);
        }

      } catch (err: any) {
        console.error('[PublicCompanyPage] Error en fetchData:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companySlug]);

  useEffect(() => {
    if (!hasApiKey || !isLoaded || !company || mapMarkers.length > 0) return;

    const geocodeCompanyAddress = async () => {
      const parts = [company.address, company.city, company.state, company.country, company.postal_code].filter(Boolean);
      if (parts.length === 0) return;

      const address = parts.join(', ');
      const geocoder = new google.maps.Geocoder();

      try {
        const result = await geocoder.geocode({ address });
        if (result.results && result.results.length > 0) {
          const location = result.results[0].geometry.location;
          setCompanyMarker({ lat: location.lat(), lng: location.lng() });
        }
      } catch (err) {
        console.error('[PublicCompanyPage] Error geocoding company address:', err);
      }
    };

    geocodeCompanyAddress();
  }, [hasApiKey, isLoaded, company, mapMarkers]);

  // User management functions
  const handleLogout = () => {
    setUser(null);
    // Add actual logout logic here
  };

  const trackAnalyticsEvent = (eventName: string, params: any) => {
    // Add analytics tracking logic here
    console.log('Analytics Event:', eventName, params);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg">Cargando información de la compañía...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-lg">Error: {error}</div>;
  }

  if (!company) {
    return <div className="flex justify-center items-center h-screen text-lg">Compañía no encontrada.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Floating Action Buttons */}
      <div className="fixed top-16 right-6 z-50 flex items-center gap-3">
        {user ? (
          <>
            <Button
              className="gap-2 shadow-xl bg-emerald-600 text-white hover:bg-emerald-700 rounded-full h-12 px-5 text-sm font-semibold"
              onClick={() => {
                if (typeof window === 'undefined') return;

                trackAnalyticsEvent('download_app_click', {
                  location: 'top_right_logged_in',
                  company_slug: companySlug,
                  user_logged_in: !!user,
                });

                const IOS_URL = 'https://apps.apple.com/us/app/rewin-reward/id6748548104';
                const ANDROID_URL = process.env.NEXT_PUBLIC_ANDROID_URL ||
                  'https://play.google.com/store/apps/details?id=com.fynlink.BoostYou';

                const userAgent = window.navigator.userAgent || '';
                const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
                const isAndroid = /Android/i.test(userAgent);

                const targetUrl = isIOS ? IOS_URL : ANDROID_URL;
                window.location.href = targetUrl;
              }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
</svg>
              <span>Descargar app</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-3 shadow-xl bg-white text-emerald-600 hover:bg-gray-50 hover:text-emerald-700 border-2 border-emerald-100 rounded-full pl-3 pr-6 h-16 text-lg">
                  <Avatar className="h-11 w-11 border-2 border-emerald-200">
                    <AvatarImage src={user.profile_photo_path || user.avatar_url || user.photo_url} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold max-w-[140px] truncate text-base">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log("Navigate to profile")}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Navigate to orders")}>
                  Mis Pedidos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button
              className="gap-2 shadow-xl bg-emerald-600 text-white hover:bg-emerald-700 rounded-full h-12 px-5 text-sm font-semibold"
              onClick={() => {
                if (typeof window === 'undefined') return;

                trackAnalyticsEvent('download_app_click', {
                  location: 'top_right_guest',
                  company_slug: companySlug,
                  user_logged_in: !!user,
                });

                const IOS_URL = 'https://apps.apple.com/us/app/rewin-reward/id6748548104';
                const ANDROID_URL = process.env.NEXT_PUBLIC_ANDROID_URL ||
                  'https://play.google.com/store/apps/details?id=com.fynlink.BoostYou';

                const userAgent = window.navigator.userAgent || '';
                const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
                const isAndroid = /Android/i.test(userAgent);

                const targetUrl = isIOS ? IOS_URL : ANDROID_URL;
                window.location.href = targetUrl;
              }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
</svg>
              <span>Descargar app</span>
            </Button>

            <Button className="gap-3 shadow-xl bg-white text-emerald-600 hover:bg-gray-50 hover:text-emerald-700 border-2 border-emerald-100 rounded-full h-16 px-6 text-lg font-semibold">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
</svg>
              <span>Iniciar Sesión</span>
            </Button>
          </>
        )}
      </div>

      {/* Hero con banner mejorado */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {company.banner_url && (
          <img
            src={company.banner_url}
            alt={`${company.name} banner`}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 flex h-full max-w-6xl mx-auto items-end px-6 md:px-8 pb-8">
          <div className="flex items-end gap-6">
            {company.logo_url && (
              <div className="flex-shrink-0">
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-white bg-white object-contain shadow-2xl"
                />
              </div>
            )}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                  {company.name}
                </h1>
                {company.business_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30">
                    {company.business_type.name}
                  </span>
                )}
              </div>
              {company.description && (
                <p className="max-w-2xl text-sm md:text-base text-slate-100 line-clamp-2">
                  {company.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs md:text-sm text-slate-200">
                {company.city && company.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {company.city}, {company.state}
                  </span>
                )}
                {company.is_active && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    Activo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 md:py-12">
        {/* Stats rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 -mt-16 relative z-20">
          <Card className="shadow-lg border-slate-200/60 bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900">{locations.length}</p>
                  <p className="text-xs md:text-sm text-slate-600 mt-1">Sucursales</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-slate-200/60 bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900">{announcements.length}</p>
                  <p className="text-xs md:text-sm text-slate-600 mt-1">Anuncios</p>
                </div>
                <Megaphone className="h-8 w-8 text-amber-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-slate-200/60 bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900">{company.memberships_count || 0}</p>
                  <p className="text-xs md:text-sm text-slate-600 mt-1">Membresías</p>
                </div>
                <Package className="h-8 w-8 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Información de contacto mejorada */}
        <Card className="shadow-md border-slate-200/60 mb-8">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Información de Contacto
            </CardTitle>
            <CardDescription>Ponte en contacto con nosotros</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {company.phone && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Teléfono</p>
                    <p className="text-sm md:text-base font-medium text-slate-900 mt-1">{company.phone}</p>
                  </div>
                </div>
              )}
              {company.email && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</p>
                    <p className="text-sm md:text-base font-medium text-slate-900 mt-1 break-all">{company.email}</p>
                  </div>
                </div>
              )}
              {company.address && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dirección</p>
                    <p className="text-sm md:text-base font-medium text-slate-900 mt-1">
                      {company.address}
                      {company.city && `, ${company.city}`}
                      {company.state && `, ${company.state}`}
                    </p>
                  </div>
                </div>
              )}
              {company.website && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Sitio Web</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm md:text-base font-medium text-blue-600 hover:text-blue-700 mt-1 inline-block"
                    >
                      Visitar sitio
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-slate-200/60 mb-8">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Ubicación
            </CardTitle>
            <CardDescription>Encuéntranos en el mapa</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-80 md:h-96 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner">
              {hasApiKey && isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={mapMarkers.length > 0 || companyMarker ? 13 : 5}
                  options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                >
                  {mapMarkers.map((m) => (
                    <Marker key={m.id} position={m.position} title={m.title} />
                  ))}
                  {companyMarker && mapMarkers.length === 0 && (
                    <Marker 
                      position={companyMarker} 
                      title={company?.name || 'Ubicación principal'}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#3b82f6',
                        fillOpacity: 0.9,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                      }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center px-6 text-center">
                  <MapPin className="h-6 w-6 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-700 font-medium">Mapa no disponible</p>
                  {hasApiKey ? (
                    <p className="mt-1 text-xs text-slate-500">Cargando Google Maps…</p>
                  ) : (
                    <p className="mt-1 text-xs text-amber-600">
                      Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para mostrar el mapa embebido.
                    </p>
                  )}
                  {mapsQuery && (
                    <a
                      className="mt-3 text-sm text-blue-600 hover:underline"
                      href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver en Google Maps
                    </a>
                  )}
                </div>
              )}
            </div>
            {hasApiKey && isLoaded && mapMarkers.length === 0 && !companyMarker && (
              <p className="mt-2 text-xs text-slate-500">
                No se pudo determinar la ubicación. Verifica que la dirección sea válida.
              </p>
            )}
            {hasApiKey && isLoaded && companyMarker && mapMarkers.length === 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Mostrando ubicación aproximada de la dirección principal. Las sucursales aparecerán cuando tengan coordenadas.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sección de Anuncios */}
        <Card className="shadow-md border-slate-200/60 mb-8">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-600" /> Anuncios
            </CardTitle>
            <CardDescription>Promociones y avisos activos</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 text-sm md:text-base">
            {announcements.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay anuncios activos.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Carousel Container - Image focused */}
                <div className="overflow-hidden rounded-xl shadow-lg bg-gray-100">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentAnnouncementIndex * 100}%)` }}
                  >
                    {announcements.map((a) => (
                      <div key={a.id} className="w-full flex-shrink-0">
                        {a.image_url ? (
                          <img
                            src={a.image_url}
                            alt={a.title || 'Anuncio'}
                            className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] object-cover"
                          />
                        ) : (
                          <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <span className="text-gray-500">Anuncio</span>
                          </div>
                        )}

                        {/* Overlay with content */}
                        {(a.title || a.text) && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 sm:p-6 flex items-end">
                            <div className="text-white max-w-2xl">
                              {a.title && (
                                <h3 className="text-lg sm:text-2xl font-bold mb-2">
                                  {a.title}
                                </h3>
                              )}
                              {a.subtitle && (
                                <p className="text-sm sm:text-base opacity-90 mb-2">{a.subtitle}</p>
                              )}
                              {a.text && (
                                <p className="mt-1 text-xs sm:text-sm opacity-90 line-clamp-2">
                                  {a.text}
                                </p>
                              )}
                              {a.link_url && (
                                <a
                                  href={a.link_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block mt-3 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md shadow transition-colors"
                                >
                                  Ver más
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Controls */}
                {announcements.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={prevAnnouncement}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                      aria-label="Previous announcement"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={nextAnnouncement}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                      aria-label="Next announcement"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                      {announcements.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentAnnouncementIndex(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-colors ${
                            index === currentAnnouncementIndex 
                              ? 'bg-white' 
                              : 'bg-white/60 hover:bg-white'
                          }`}
                          aria-label={`Go to announcement ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección de sucursales mejorada */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="h-7 w-7 text-blue-600" />
                Nuestras Sucursales
              </h2>
              <p className="text-sm md:text-base text-gray-600 mt-2">
                Visítanos en cualquiera de nuestras ubicaciones
              </p>
            </div>
            {locations.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm md:text-base font-semibold text-blue-700">
                {locations.length} {locations.length > 1 ? 'Sucursales' : 'Sucursal'}
              </span>
            )}
          </div>

          {locations.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-base md:text-lg text-gray-700 font-semibold">Aún no hay sucursales publicadas</p>
                <p className="text-sm md:text-base text-gray-500 max-w-md">
                  Cuando la compañía registre sucursales públicas, podrás ver aquí sus direcciones y acceder a sus productos.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <Card key={location.id} className="h-full flex flex-col shadow-lg border-slate-200/60 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md overflow-hidden">
                        {company.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt={`${company.name} logo`}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <MapPin className="h-5 w-5 text-blue-600" />
                        )}
                      </span>
                      <span className="capitalize">{location.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between space-y-4 text-sm md:text-base">
                    <div className="space-y-3">
                      {/* Mapa de la sucursal */}
                      {location.latitude && location.longitude && hasApiKey && isLoaded && (
                        <div className="h-40 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={{
                              lat: typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude,
                              lng: typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude
                            }}
                            zoom={15}
                            options={{
                              streetViewControl: false,
                              mapTypeControl: false,
                              fullscreenControl: false,
                              zoomControl: true,
                              disableDefaultUI: false,
                            }}
                          >
                            <Marker
                              position={{
                                lat: typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude,
                                lng: typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude
                              }}
                              title={location.name}
                            />
                          </GoogleMap>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          {location.address}
                        </span>
                      </div>
                      {(location.city || location.state || location.country) && (
                        <div className="flex flex-wrap gap-2">
                          {location.city && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {location.city}
                            </span>
                          )}
                          {location.state && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              {location.state}
                            </span>
                          )}
                          {location.country && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              {location.country}
                            </span>
                          )}
                        </div>
                      )}
                      {location.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{location.phone}</span>
                        </div>
                      )}
                      {location.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="text-sm break-all">{location.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-3">
                      <Button
                        className="w-full justify-center text-sm md:text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md group-hover:shadow-lg transition-all"
                        asChild
                      >
                        <a href={`/rewin/${companySlug}/${location.id}`}>
                          Ver Productos →
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}