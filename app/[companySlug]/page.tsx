"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { publicWebApiClient } from '@/lib/api/public-web';
import { PublicCompany, PublicCompanyLocation, Announcement, PublicItem, BusinessHour } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Globe, Clock, Package, Megaphone } from 'lucide-react';

export default function PublicCompanyPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;

  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [locations, setLocations] = useState<PublicCompanyLocation[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [items, setItems] = useState<PublicItem[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          const rawAnnouncements: any = (announcementsRes as any).data?.data ?? announcementsRes.data;
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
    <div className="min-h-screen bg-slate-50">
      {/* Hero con banner */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900/80">
        {company.banner_url && (
          <img
            src={company.banner_url}
            alt={`${company.name} banner`}
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        )}
        <div className="relative z-10 flex h-full max-w-5xl mx-auto items-center px-6 md:px-8">
          <div className="flex items-center gap-4">
            {company.logo_url && (
              <img
                src={company.logo_url}
                alt={`${company.name} logo`}
                className="h-20 w-20 md:h-24 md:w-24 rounded-full border-2 border-white bg-white object-contain shadow-md"
              />
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm">
                {company.name}
              </h1>
              {company.business_type && (
                <p className="mt-1 text-sm md:text-base text-slate-100/90">
                  {company.business_type.name}
                </p>
              )}
              {company.description && (
                <p className="mt-2 max-w-xl text-xs md:text-sm text-slate-100/90 line-clamp-2 md:line-clamp-3">
                  {company.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 md:py-10">
        {/* Tarjetas de contacto / dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Contacto</CardTitle>
              <CardDescription>Cómo ponerte en contacto con la compañía.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm md:text-base">
              {company.phone && (
                <p className="flex items-center text-gray-700">
                  <Phone className="mr-2 h-4 w-4 text-gray-500" /> {company.phone}
                </p>
              )}
              {company.email && (
                <p className="flex items-center text-gray-700 break-all">
                  <Mail className="mr-2 h-4 w-4 text-gray-500" /> {company.email}
                </p>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline"
                >
                  <Globe className="mr-2 h-4 w-4 text-blue-500" /> {company.website}
                </a>
              )}
              {!company.phone && !company.email && !company.website && (
                <p className="text-gray-500 text-sm">No hay información de contacto pública.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Dirección principal</CardTitle>
              <CardDescription>Ubicación principal de la compañía.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm md:text-base">
              {company.address ? (
                <p className="flex items-start text-gray-700">
                  <MapPin className="mr-2 h-4 w-4 text-gray-500 mt-1" />
                  <span>
                    {company.address}
                    {company.city && `, ${company.city}`}
                    {company.state && `, ${company.state}`}
                    {company.country && `, ${company.country}`}
                    {company.postal_code && `, ${company.postal_code}`}
                  </span>
                </p>
              ) : (
                <p className="text-gray-500 text-sm">No hay dirección principal configurada.</p>
              )}
              {locations.length > 0 && (
                <p className="text-xs md:text-sm text-gray-500">
                  Esta compañía tiene {locations.length} sucursal{locations.length > 1 ? 'es' : ''}.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sección de sucursales */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Sucursales</h2>
              <p className="text-sm md:text-base text-gray-600">
                Encuentra esta compañía en sus diferentes ubicaciones.
              </p>
            </div>
            {locations.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs md:text-sm text-slate-700">
                {locations.length} sucursal{locations.length > 1 ? 'es' : ''}
              </span>
            )}
          </div>

          {locations.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-white/60">
              <CardContent className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                <MapPin className="h-6 w-6 text-slate-400" />
                <p className="text-sm md:text-base text-gray-700 font-medium">Aún no hay sucursales publicadas.</p>
                <p className="text-xs md:text-sm text-gray-500 max-w-md">
                  Cuando la compañía registre sucursales públicas, podrás ver aquí sus direcciones y acceder a sus productos.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-2">
              {locations.map((location) => (
                <Card key={location.id} className="h-full flex flex-col shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                        <MapPin className="h-3 w-3" />
                      </span>
                      {location.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between space-y-3 text-sm md:text-base">
                    <p className="text-gray-700">
                      {location.address}
                      {location.city && `, ${location.city}`}
                      {location.state && `, ${location.state}`}
                      {location.country && `, ${location.country}`}
                    </p>
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full justify-center text-sm md:text-base"
                        asChild
                      >
                        <a href={`/${companySlug}/${location.id}`}>
                          Ver productos de esta sucursal
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