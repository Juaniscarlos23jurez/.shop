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
import { BranchesList } from '@/components/company/branches-list';

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
  locations?: Array<{
    id?: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    timezone?: string;
    is_primary?: boolean;
    is_active?: boolean;
  }>;
}

export default function CompaniaPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch company data on mount
  useEffect(() => {
    console.log('Component mounted, fetching company data...');
    fetchCompanyData();
  }, [token]); // Re-fetch if token changes
  
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
      setIsLoading(true);
      console.log('Fetching companies with token...');
      const response = await api.companies.getAllCompanies(token);
      console.log('Companies API response:', response);
      
      if (response.success && response.data) {
        const companies = Array.isArray(response.data) ? response.data : 
                         response.data.data ? response.data.data : [];
        
        if (companies.length > 0) {
          const company = companies[0];
          console.log('Found company:', company);
          setCompanyData(company);
          
          // Also try to fetch locations for this company
          try {
            const locationsResponse = await api.companies.getCompanyLocations(company.id, token);
            console.log('Locations response:', locationsResponse);
            
            if (locationsResponse.success && locationsResponse.data) {
              setCompanyData(prev => ({
                ...prev!,
                locations: locationsResponse.data?.locations || []
              }));
            }
          } catch (locationsError) {
            console.error('Error fetching locations:', locationsError);
          }
        }
      } else {
        console.error('Failed to fetch companies:', response.message);
      }
    } catch (error) {
      console.error('Error in fetchCompanyData:', error);
    } finally {
      setIsLoading(false);
    }
    
    // Log token info (safely)
    console.log('Fetching companies with token:', {
      exists: !!token,
      length: token?.length,
      startsWith: token?.substring(0, 10) + '...',
      endsWith: '...' + token?.substring(token.length - 10)
    });
    
    try {
      console.log('Fetching companies...');
      const companyResponse = await api.companies.getAllCompanies(token);
      console.log('Raw company response:', JSON.stringify(companyResponse, null, 2));
      
      if (!companyResponse.success) {
        console.error('Failed to fetch companies:', companyResponse.message);
        throw new Error(companyResponse.message || 'Failed to fetch companies');
      }
      
      // Log the full response structure for debugging
      console.log('Response data structure:', {
        hasData: !!companyResponse.data,
        dataKeys: companyResponse.data ? Object.keys(companyResponse.data) : [],
        rawData: companyResponse.data
      });
      
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
    
    if (!token) {
      toast({
        title: 'Error',
        description: 'No se encontró el token de autenticación',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    // Log token information (without exposing the full token)
    console.log('Token info:', {
      exists: !!token,
      length: token?.length,
      startsWith: token?.substring(0, 10) + '...',
      endsWith: '...' + token?.substring(token.length - 10)
    });
    
    // Verify token format
    if (!token || !token.startsWith('eyJ')) {
      console.error('Invalid token format');
      toast({
        title: 'Error de autenticación',
        description: 'El token de autenticación no es válido. Por favor, inicia sesión nuevamente.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // If we're in step 3 (creating a location)
      if (currentStep === 3) {
        if (!companyData?.id) {
          throw new Error('No se encontró el ID de la compañía');
        }

        if (!formData.location?.name || !formData.location?.address) {
          throw new Error('El nombre y la dirección de la sucursal son obligatorios');
        }
        
        // Validate company ID format
        const companyId = companyData?.id;
        if (!companyId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)) {
          console.error('Invalid company ID format:', companyId);
          throw new Error('ID de compañía inválido. Por favor, recarga la página e intenta de nuevo.');
        }

        const locationPayload = {
          name: formData.location.name.trim(),
          address: formData.location.address.trim(),
          phone: formData.location.phone ? String(formData.location.phone).replace(/\D/g, '') : undefined,
          email: formData.location.email?.trim(),
          timezone: formData.location.timezone || formData.timezone,
          city: formData.location.city?.trim() || companyData?.city || '',
          state: formData.location.state?.trim() || companyData?.state || '',
          country: formData.location.country?.trim() || companyData?.country || 'México',
          postal_code: formData.location.postal_code?.trim() || companyData?.postal_code || '',
          is_primary: true,
          is_active: true,
        };
        
        // Create the new location
        const locationResponse = await api.companies.createLocation(companyData.id, locationPayload, token);
        
        if (!locationResponse.success) {
          throw new Error(locationResponse.message || 'Error al crear la sucursal');
        }
        
        // Show success message
        toast({
          title: '¡Éxito!',
          description: 'Sucursal creada correctamente',
        });
        
        // Redirect to the previous page after a short delay
        setTimeout(() => {
          router.back();
        }, 1500);
        
        return; // Exit early since we're redirecting
      }

      // Prepare the payload for company update
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

      // Update company
      const response = await api.companies.updateCompany(companyData.id, companyPayload, token);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al actualizar la compañía');
      }

      const companyResponseData = response.data.company || response.data;
      setCompanyData(companyResponseData);

      // If this was step 2, update business hours
      if (currentStep === 2 && formData.business_hours?.length) {
        const hoursResponse = await api.companies.updateBusinessHours(
          companyData.id, 
          { hours: formData.business_hours }, 
          token
        );
        
        if (!hoursResponse.success) {
          throw new Error(hoursResponse.message || 'Error al actualizar los horarios comerciales');
        }
      }

      // Move to the next step
      setCurrentStep(currentStep + 1);
      toggleEditMode(false);
      
      toast({
        title: '¡Éxito!',
        description: currentStep === 1 
          ? 'Información de la compañía guardada correctamente. Continúa con los siguientes pasos.'
          : 'Horarios comerciales guardados correctamente. Continúa con el siguiente paso.',
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
                         disabled={isLoading || !formData.location?.name || !formData.location?.address}
                       >
                         {isLoading ? 'Guardando...' : 'Crear Sucursal'}
                       </Button>
                     ) : (
                       <Button 
                         type="submit"
                         className="bg-emerald-600 hover:bg-emerald-700"
                         onClick={currentStep === 2 ? saveBusinessHours : () => setCurrentStep(currentStep + 1)}
                         disabled={isLoading}
                       >
                         {currentStep === 2 ? 'Guardar Horas y Siguiente' : 'Siguiente'}
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
                 <CardTitle className="text-xl text-slate-900">{companyData?.name || 'Compañía'}</CardTitle>
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
                       required
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
                           {companyData?.business_hours?.some(bh => bh.is_open) ? 'Editar Horas' : 'No completado'}
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

         <BranchesList 
           companyId={companyData?.id || ''} 
           onAddBranchClick={() => toggleEditMode(true, 3)} 
         />
       </div>
     </div>
   );
 }
