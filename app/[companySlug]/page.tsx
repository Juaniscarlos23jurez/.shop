"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { publicWebApiClient } from '@/lib/api/public-web';
import { PublicCompany, PublicCompanyLocation, Announcement, PublicItem, BusinessHour } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      let companyId: string | null = null; // Declare companyId here

      try {
        // 1. Get company ID from slug using search
        const searchRes = await publicWebApiClient.searchCompaniesByName(companySlug);
        if (searchRes.success && searchRes.data && searchRes.data.length > 0) {
          const foundCompany = searchRes.data.find(c => c.slug === companySlug || c.name.toLowerCase() === companySlug.toLowerCase());
          if (foundCompany) {
            companyId = foundCompany.id;
          } else {
            throw new Error('Compañía no encontrada por slug.');
          }
        } else {
          throw new Error(searchRes.error || 'Fallo al buscar la compañía por slug.');
        }

        if (!companyId) {
          throw new Error('No se pudo obtener el ID de la compañía.');
        }

        // 2. Fetch company details by ID
        const companyRes = await publicWebApiClient.getCompanyById(companyId);
        if (companyRes.success && companyRes.data) {
          setCompany(companyRes.data);
        } else {
          throw new Error(companyRes.error || 'Fallo al obtener los detalles de la compañía.');
        }

        // 3. Fetch locations by company ID
        const locationsRes = await publicWebApiClient.getCompanyLocationsById(companyId);
        if (locationsRes.success && locationsRes.data) {
          setLocations(locationsRes.data);
        }

        // 4. Fetch announcements by company ID
        const announcementsRes = await publicWebApiClient.getCompanyAnnouncementsById(companyId);
        if (announcementsRes.success && announcementsRes.data?.data) {
          setAnnouncements(announcementsRes.data.data);
        }

        // 5. Fetch business hours by company ID
        const businessHoursRes = await publicWebApiClient.getCompanyBusinessHoursById(companyId);
        if (businessHoursRes.success && businessHoursRes.data) {
          setBusinessHours(businessHoursRes.data);
        }

      } catch (err: any) {
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          {company.logo_url && (
            <img src={company.logo_url} alt={`${company.name} logo`} className="w-24 h-24 object-contain rounded-full border p-1" />
          )}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{company.name}</h1>
            {company.business_type && (
              <p className="text-md text-gray-600">{company.business_type.name}</p>
            )}
            {company.description && (
              <p className="mt-2 text-gray-700">{company.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {company.phone && (
                <p className="flex items-center text-gray-700"><Phone className="mr-2 h-4 w-4 text-gray-500" /> {company.phone}</p>
              )}
              {company.email && (
                <p className="flex items-center text-gray-700"><Mail className="mr-2 h-4 w-4 text-gray-500" /> {company.email}</p>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                  <Globe className="mr-2 h-4 w-4 text-blue-500" /> {company.website}
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dirección Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {company.address && (
                <p className="flex items-center text-gray-700"><MapPin className="mr-2 h-4 w-4 text-gray-500" /> {company.address}, {company.city}, {company.state}, {company.country}, {company.postal_code}</p>
              )}
              {locations.length > 0 && (
                <p className="text-sm text-gray-600">Ver {locations.length} sucursales más.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="announcements" className="w-full"> {/* Changed default to announcements */}
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="announcements">Anuncios</TabsTrigger>
            <TabsTrigger value="locations">Sucursales</TabsTrigger>
            <TabsTrigger value="hours">Horarios</TabsTrigger>
          </TabsList>
          
          {/* Products tab is removed from here */}
          
          <TabsContent value="announcements" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Anuncios y Promociones</CardTitle>
                <CardDescription>Mantente al tanto de nuestras últimas novedades.</CardDescription>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <p>No hay anuncios disponibles en este momento.</p>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <Card key={announcement.id} className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{announcement.title}</h3>
                        {announcement.subtitle && <p className="text-md text-gray-700">{announcement.subtitle}</p>}
                        {announcement.text && <p className="text-sm text-gray-600 mt-1">{announcement.text}</p>}
                        {announcement.image_url && (
                          <img src={announcement.image_url} alt={announcement.title} className="w-full h-48 object-cover rounded-md mt-2" />
                        )}
                        {announcement.link_url && (
                          <Button variant="link" className="pl-0 pt-2" asChild>
                            <a href={announcement.link_url} target="_blank" rel="noopener noreferrer">Ver más</a>
                          </Button>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Válido hasta: {new Date(announcement.ends_at || '').toLocaleDateString()}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="locations" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Nuestras Sucursales</CardTitle>
                <CardDescription>Encuéntranos en nuestras diferentes ubicaciones.</CardDescription>
              </CardHeader>
              <CardContent>
                {locations.length === 0 ? (
                  <p>No hay sucursales registradas para esta compañía.</p>
                ) : (
                  <div className="space-y-4">
                    {locations.map((location) => (
                      <Card key={location.id} className="p-4">
                        <h3 className="font-semibold text-lg">{location.name}</h3>
                        <p className="text-gray-700 mb-2"><MapPin className="inline-block mr-2 h-4 w-4 text-gray-500" /> {location.address}, {location.city}, {location.state}, {location.country}</p>
                        <Button variant="outline" asChild>
                          <a href={`/${companySlug}/${location.id}`}>Ver Productos</a>
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="hours" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Horarios de Atención</CardTitle>
                <CardDescription>Conoce nuestros horarios de apertura y cierre.</CardDescription>
              </CardHeader>
              <CardContent>
                {businessHours.length === 0 ? (
                  <p>No hay horarios de atención disponibles.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => {
                      const hour = businessHours.find(bh => bh.day_of_week === day);
                      return (
                        <Card key={day} className="p-3 flex justify-between items-center">
                          <p className="font-medium">{day}:</p>
                          {hour?.is_open ? (
                            <p>{hour.open_time} - {hour.close_time}</p>
                          ) : (
                            <p className="text-red-600">Cerrado</p>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
