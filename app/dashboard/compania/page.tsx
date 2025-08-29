"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Icons removed due to import issues
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { toast } from '@/components/ui/use-toast';
import { StepNavigation } from '@/components/company/step-navigation';
import { CompanyInfoForm } from '@/components/company/company-info-form';
import { BusinessHoursForm } from '@/components/company/business-hours-form';
import { BranchInfoForm } from '@/components/company/branch-info-form';

interface CompanyData {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  business_type?: string; // Added business_type
  timezone?: string; // Added timezone
  currency?: string; // Added currency
  language?: string; // Added language
  logo_url?: string;
  business_hours?: Array<{
    day_of_week: string;
    is_open: boolean;
    open_time?: string;
    close_time?: string;
  }>;
  location?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    contact_person?: string;
    primary_color?: string;
    secondary_color?: string;
    timezone?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    notes?: string;
  };
}

export default function CompaniaPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Check for edit mode and step in URL
  const isEditing = searchParams.get('edit') === 'true';
  const urlStep = searchParams.get('step');
  
  // Set initial step from URL
  useEffect(() => {
    if (isLoading) return; // Don't update step while loading
    
    if (isEditing) {
      setCurrentStep(urlStep ? parseInt(urlStep) : 1);
    } else {
      setCurrentStep(0);
    }
  }, [urlStep, isEditing, isLoading]);
  // Map Spanish day names to English for API
  const dayNameMap: {[key: string]: string} = {
    'Lunes': 'monday',
    'Martes': 'tuesday',
    'Miércoles': 'wednesday',
    'Jueves': 'thursday',
    'Viernes': 'friday',
    'Sábado': 'saturday',
    'Domingo': 'sunday'
  };

  const [formData, setFormData] = useState<Partial<CompanyData>>({
    business_hours: [
      { day_of_week: 'monday', is_open: true, open_time: '09:00:00', close_time: '18:00:00' },
      { day_of_week: 'tuesday', is_open: true, open_time: '09:00:00', close_time: '18:00:00' },
      { day_of_week: 'wednesday', is_open: true, open_time: '09:00:00', close_time: '18:00:00' },
      { day_of_week: 'thursday', is_open: true, open_time: '09:00:00', close_time: '18:00:00' },
      { day_of_week: 'friday', is_open: true, open_time: '09:00:00', close_time: '18:00:00' },
      { day_of_week: 'saturday', is_open: false, open_time: '', close_time: '' },
      { day_of_week: 'sunday', is_open: false, open_time: '', close_time: '' },
    ],
    timezone: 'America/Mexico_City',
    currency: 'MXN',
    language: 'es',
    location: {
      name: '',
      address: '',
      timezone: 'America/Mexico_City',
    }
  });

  // Toggle edit mode
  const toggleEditMode = useCallback((edit: boolean, step: number = 1) => {
    if (isLoading) return; // Prevent toggling while loading
    
    if (edit) {
      const params = new URLSearchParams();
      params.set('edit', 'true');
      params.set('step', step.toString());
      router.push(`?${params.toString()}`, { scroll: false });
    } else {
      router.push('', { scroll: false });
    }
  }, [router, isLoading]);

  // Close edit mode when clicking back button
  useEffect(() => {
    const handleBackButton = () => {
      if (isEditing) {
        toggleEditMode(false);
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [isEditing, toggleEditMode]);

  // Fetch company data
  const fetchCompanyData = useCallback(async () => {
    console.log('Starting to fetch company data...');
    
    if (!token) {
      console.error('No token available');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Fetching companies...');
      const companyResponse = await api.companies.getAllCompanies(token);
      console.log('Company response:', companyResponse);
      
      if (companyResponse.success) {
        // Extract the companies array from the nested response
        const companies = companyResponse.data?.data?.data || companyResponse.data?.data || [];
        console.log('Companies array:', companies);
        
        if (Array.isArray(companies) && companies.length > 0) {
          const company = companies[0];
          console.log('Found company:', company);
          
          try {
            console.log('Fetching business hours for company:', company.id);
            const hoursResponse = await api.companies.getBusinessHours(company.id, token);
            console.log('Business hours response:', hoursResponse);
            
            // Extract business hours from the response
            let businessHours: any[] = [];
            if (hoursResponse?.success) {
              const responseData = hoursResponse.data as any; // Type assertion to handle API response
              if (Array.isArray(responseData)) {
                businessHours = responseData;
              } else if (responseData?.hours) {
                businessHours = Array.isArray(responseData.hours) ? responseData.hours : [];
              } else if (responseData?.data?.hours) {
                businessHours = Array.isArray(responseData.data.hours) ? responseData.data.hours : [];
              }
            }
            console.log('Business hours to set:', businessHours);
            
            const updatedCompany = {
              ...company,
              business_hours: businessHours || []
            };
            
            console.log('Setting company data:', updatedCompany);
            setCompanyData(updatedCompany);
            
            setFormData(prev => ({
              ...prev,
              ...company,
              business_hours: businessHours?.length ? businessHours : (prev.business_hours || []),
              location: company.location || prev.location
            }));
            
          } catch (hoursError) {
            console.error('Error fetching business hours:', hoursError);
            // Set company data even if hours fail
            setCompanyData(company);
          }
        } else {
          console.log('No companies found in response');
          // Set default company data if no companies found
          setCompanyData({
            id: 'default',
            name: 'Nueva Empresa',
            business_hours: []
          });
        }
      } else {
        console.error('Failed to fetch companies:', companyResponse);
      }
    } catch (error) {
      console.error('Error in fetchCompanyData:', error);
      toast({ 
        title: 'Error', 
        description: 'Error al cargar los datos de la empresa', 
        variant: 'destructive' 
      });
      setCompanyData(null); // Ensure we don't get stuck in loading state
    } finally {
      console.log('Finished loading company data');
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested state for location object
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...(prev.location || { name: '', address: '', timezone: '' }), // Ensure default values for required fields
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Save business hours
  const saveBusinessHours = async () => {
    if (!token || !companyData?.id || !formData.business_hours) return;
    
    try {
      // Format the business hours for the API
      const formattedHours = formData.business_hours.map(hour => {
        const formatTime = (time: string) => {
          if (!time) return null;
          // If time already has seconds, return as is, otherwise add seconds
          return time.split(':').length === 3 ? time : `${time}:00`;
        };
        
        return {
          ...hour,
          open_time: hour.is_open ? formatTime(hour.open_time || '') : null,
          close_time: hour.is_open ? formatTime(hour.close_time || '') : null
        };
      });
      
      const response = await api.companies.updateBusinessHours(
        companyData.id,
        { hours: formattedHours },
        token
      );
      
      if (response.success) {
        toast({
          title: '¡Éxito!',
          description: 'Horario comercial actualizado correctamente',
        });
        toggleEditMode(false);
      } else {
        throw new Error(response.message || 'Error al guardar los horarios');
      }
    } catch (error) {
      console.error('Error saving business hours:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar los horarios',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !companyData?.id) {
      toast({
        title: 'Error',
        description: 'No se encontró el token de autenticación o el ID de la compañía',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    console.log('Token being sent to companies API:', token);
    
    try {
      let currentCompanyId = companyData?.id;
      let companyResponseData = null;

      // Prepare the payload for company creation/update (only send relevant fields for step 1)
      const companyPayload: Partial<CompanyData> = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        business_type: formData.business_type,
        timezone: formData.timezone,
        currency: formData.currency,
        language: formData.language,
        logo_url: formData.logo_url,
      };

      // 1. Create or Update Company
      if (companyData) {
        // Update existing company
        const response = await api.companies.updateCompany(companyData.id, companyPayload, token);
        if (response.success && response.data) {
          companyResponseData = response.data.company || response.data;
        } else {
          throw new Error(response.message || 'Error al actualizar la compañía');
        }
      } else {
        // Create new company
        const response = await api.companies.createCompany(companyPayload, token);
        if (response.success && response.data) {
          companyResponseData = response.data.company || response.data;
          currentCompanyId = companyResponseData.id; // Get the new company ID
        } else {
          throw new Error(response.message || 'Error al crear la compañía');
        }
      }

      if (!currentCompanyId) {
        throw new Error('No se pudo obtener el ID de la compañía.');
      }

      // If we are in the first step, just save the company info and move to the next step
      if (currentStep === 1) {
        setCompanyData(companyResponseData);
        toggleEditMode(false);
        setCurrentStep(2); // Move to the next step
        toast({
          title: '¡Éxito!',
          description: 'Información de la compañía guardada correctamente. Continúa con los siguientes pasos.',
        });
        return;
      }

      // 2. Update Business Hours (only if there are business hours in formData and not in step 1)
      if (formData.business_hours && formData.business_hours.length > 0 && currentStep > 1) {
        const hoursPayload = { hours: formData.business_hours };
        const hoursResponse = await api.companies.updateBusinessHours(currentCompanyId, hoursPayload, token);
        if (!hoursResponse.success) {
          throw new Error(hoursResponse.message || 'Error al actualizar los horarios comerciales');
        }
      }

      // 3. Create Location/Branch (only if location data is provided and not in step 1 or 2)
      if (formData.location && formData.location.name && formData.location.address && currentStep > 2) {
        const locationPayload = {
          ...formData.location,
          timezone: formData.location.timezone || formData.timezone, // Use company timezone as fallback
        };
        const locationResponse = await api.companies.createLocation(currentCompanyId, locationPayload, token);
        if (!locationResponse.success) {
          throw new Error(locationResponse.message || 'Error al crear la sucursal');
        }
      }
      
      // After all API calls are successful
      setCompanyData(companyResponseData);
      toggleEditMode(false);
      
      toast({
        title: '¡Éxito!',
        description: 'La información de la compañía se ha guardado correctamente.',
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-lg animate-pulse">Cargando...</span>
      </div>
    );
  }

  // Debug log to check the current state
  console.log('Current state:', { companyData, isEditing, currentStep });
  
  // Only show the form if we're in edit mode
  const shouldShowForm = isEditing;
  
  // If we don't have company data yet, show loading
  if (!companyData) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-lg animate-pulse">Cargando datos de la empresa...</span>
      </div>
    );
  }
  
  if (shouldShowForm) {
    return (
      <div className="max-w-3xl mx-auto">
        <StepNavigation currentStep={currentStep} />

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 1 && 'Información de la Empresa'}
              {currentStep === 2 && 'Horario Comercial'}
              {currentStep === 3 && 'Agregar Sucursal'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Completa la información básica de tu empresa'}
              {currentStep === 2 && 'Configura los horarios de atención de tu negocio'}
              {currentStep === 3 && 'Agrega tu primera sucursal'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {currentStep === 1 && (
                  <CompanyInfoForm formData={formData} handleInputChange={handleInputChange} />
                )}

                {/* Business Hours Section */}
                {currentStep === 2 && (
                  <BusinessHoursForm 
                    businessHours={formData.business_hours}
                    setBusinessHours={setFormData}
                  />
                )}
              </div>

              {/* Branch Information Step */}
              {currentStep === 3 && (
                <BranchInfoForm 
                  formData={formData.location || { name: '', address: '', timezone: '' }} 
                  handleInputChange={handleInputChange} 
                />
              )}

              <div className="flex justify-end space-x-3">
                {currentStep === 1 ? (
                  <Button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading || !formData.name || !formData.email}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar Datos'}
                  </Button>
                ) : (
                  <div className="flex space-x-3">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Atrás
                    </Button>
                    {currentStep === 3 ? (
                      <Button 
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Guardando...' : 'Guardar Datos'}
                      </Button>
                    ) : (
                      <Button 
                        type="button"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={currentStep === 2 ? saveBusinessHours : () => setCurrentStep(currentStep + 1)}
                        disabled={isLoading}
                      >
                        {currentStep === 2 ? 'Guardar Horas' : 'Siguiente'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Compañía</h1>
          <p className="text-slate-600 mt-1">Administra la información de tu empresa</p>
        </div>
        {!isEditing && companyData?.business_hours?.some(bh => bh.is_open) && (
          <Button 
            variant="outline"
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            onClick={() => toggleEditMode(true, 2)}
          >
            {companyData.business_hours.some(bh => bh.is_open) ? 'Editar Horas' : 'No completado'}
          </Button>
        )}
        <Button 
          className="bg-emerald-500 hover:bg-emerald-600"
          onClick={() => router.push('/dashboard/sucursales/nueva')}
        >
          <span className="mr-2">+</span>
          Agregar Sucursal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Información Principal */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <span className="text-lg">🏢</span>
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">{companyData.name}</CardTitle>
                <CardDescription className="text-slate-600">Información general de la compañía</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nombre de la empresa</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Sitio Web</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="https://"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Descripción</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Dirección</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Ciudad</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => toggleEditMode(true)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="mr-2 animate-pulse">⏳</span>
                        Guardando...
                      </>
                    ) : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-slate-700">{companyData?.description || 'No hay descripción disponible'}</p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start space-x-3">
                    <span className="text-slate-400 mt-0.5 flex-shrink-0">📍</span>
                    <div>
                      <h4 className="font-medium text-slate-900">Dirección</h4>
                      <p className="text-slate-600">
                        {companyData?.address || 'No especificada'}
                        {companyData?.city && `, ${companyData.city}`}
                        {companyData?.state && `, ${companyData.state}`}
                        {companyData?.postal_code && `, ${companyData.postal_code}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-slate-400 mt-0.5 flex-shrink-0">📞</span>
                    <div>
                      <h4 className="font-medium text-slate-900">Teléfono</h4>
                      <p className="text-slate-600">{companyData?.phone || 'No especificado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-slate-400 mt-0.5 flex-shrink-0">✉️</span>
                    <div>
                      <h4 className="font-medium text-slate-900">Correo Electrónico</h4>
                      <p className="text-slate-600">{companyData?.email || 'No especificado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-slate-400 mt-0.5 flex-shrink-0">🌐</span>
                    <div>
                      <h4 className="font-medium text-slate-900">Sitio Web</h4>
                      <p className="text-slate-600">
                        {companyData?.website ? (
                          <a 
                            href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline"
                          >
                            {companyData.website}
                          </a>
                        ) : 'No especificado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-slate-400 mt-0.5 flex-shrink-0">🕒</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-slate-900">Horario Comercial</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-emerald-600 hover:bg-emerald-50 h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEditMode(true, 2);
                          }}
                        >
                          Editar Horas
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {companyData?.business_hours?.some(bh => bh.is_open) ? (
                          companyData.business_hours
                            .filter(bh => bh.is_open)
                            .map((day, index) => {
                              // Convert API day name to Spanish for display
                              const dayInSpanish = Object.entries(dayNameMap).find(
                                ([spanish, english]) => english === day.day_of_week?.toLowerCase()
                              )?.[0] || day.day_of_week;
                              
                              // Format time to remove seconds if present
                              const formatTime = (time: string) => time ? time.split(':').slice(0, 2).join(':') : '';
                              
                              return (
                                <p key={index} className="text-slate-600 text-sm">
                                  {dayInSpanish}: {formatTime(day.open_time || '')} - {formatTime(day.close_time || '')}
                                </p>
                              );
                            })
                        ) : (
                          <p className="text-slate-600 text-sm">No hay horarios configurados</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          {!isEditing && (
            <CardFooter className="border-t border-slate-100">
              <Button 
                variant="outline" 
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => toggleEditMode(true)}
              >
                Editar Información
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Sucursales */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 text-lg">👥</div>
                <div>
                  <CardTitle className="text-xl text-slate-900">Sucursales</CardTitle>
                  <CardDescription className="text-slate-600">Administra las sucursales de tu empresa</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((branch) => (
                <div key={branch} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">Sucursal {branch}</h4>
                      <p className="text-sm text-slate-600">Dirección de la sucursal {branch}</p>
                      <div className="mt-2 flex items-center space-x-2 text-sm text-slate-500">
                        <span>5 empleados</span>
                        <span>•</span>
                        <span>Activa</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:bg-slate-100">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
