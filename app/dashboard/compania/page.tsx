"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Icons removed due to import issues
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyInfo } from "@/components/company/company-info";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { toast } from '@/components/ui/use-toast';
import { StepNavigation } from '@/components/company/step-navigation';
import { CompanyInfoForm } from '@/components/company/company-info-form';
import { BranchInfoForm } from '@/components/company/branch-info-form';
import { BranchesList } from '@/components/company/branches-list';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface CompanyData {
  id?: number;
  name: string;
  description?: string;
  status?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  business_type?: string;
  business_type_id?: number | string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  currency?: string;
  language?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  location?: {
    name: string;
    description?: string;
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
    zip_code?: string;
    notes?: string;
    // Geo IDs and coordinates
    country_id?: number | string;
    state_id?: number | string;
    city_id?: number | string;
    latitude?: number;
    longitude?: number;
  };
  locations?: Array<{
    id?: number;
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch company data on mount
  useEffect(() => {
    if (token) {
      console.log('Component mounted, fetching company data...');
      fetchCompanyData();
    }
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

  const [formData, setFormData] = useState<Partial<CompanyData>>({
    timezone: 'America/Mexico_City',
    currency: 'MXN',
    language: 'es',
    location: {
      name: '',
      address: '',
      timezone: 'America/Mexico_City',
    }
  });

  const handleOpenLogoDialog = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setSelectedLogoFile(file);
  };

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setLogoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setSelectedLogoFile(file);
    }
  };

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const uploadLogoIfNeeded = async (companyId: string): Promise<string | null> => {
    if (!selectedLogoFile) return null;
    try {
      const path = `companies/${companyId}/logo/${Date.now()}_${selectedLogoFile.name}`;
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, selectedLogoFile);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (err) {
      console.error('Error uploading logo to Firebase:', err);
      toast({
        title: 'Error al subir logo',
        description: 'Se continuará sin actualizar el logo.',
        variant: 'destructive',
      });
      return null;
    }
  };

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
      console.log('Fetching company data with token...');
      const response = await api.userCompanies.get(token);
      console.log('Company API response:', response);
      
      if (response.success && response.data && response.data.data) {
        // The API returns company data in response.data.data
        const company = response.data.data;
        console.log('Raw company data:', company);
        
        // Ensure we're getting the correct data structure
        const companyData = {
          id: company.id,
          name: company.name,
          description: company.description,
          status: company.status,
          email: company.email,
          phone: company.phone,
          website: company.website || undefined,
          logo_url: company.logo_url || undefined,
          business_type: company.business_type || undefined,
          business_type_id: company.business_type_id || undefined,
          address: company.address,
          city: company.city,
          state: company.state,
          country: company.country || undefined,
          postal_code: company.postal_code || undefined,
          timezone: company.timezone,
          currency: company.currency,
          language: company.language,
          is_active: company.is_active
        };
        
        console.log('Processed company data:', companyData);
        setCompanyData(companyData);
        
        // Initialize form data with company data
        setFormData(prev => ({
          ...prev,
          ...company,
          location: company.location || prev.location
        }));
        
        // Force a re-render by updating the component
        console.log('Company data set successfully:', company);
        
        // Also try to fetch locations for this company
        try {
          const locationsResponse = await api.userCompanies.getLocations(token);
          console.log('Locations response:', locationsResponse);
          
          if (locationsResponse.success && locationsResponse.data?.locations) {
            const locations = locationsResponse.data.locations;
            setCompanyData(prev => prev ? {
              ...prev,
              locations
            } : null);
          }
        } catch (locationsError) {
          console.error('Error fetching locations:', locationsError);
        }
        
        // Ensure null values are converted to undefined
        const sanitizedCompany = {
          ...company,
          country: company.country || undefined,
          postal_code: company.postal_code || undefined,
          website: company.website || undefined,
        };
        
        setFormData(prev => ({
          ...prev,
          ...sanitizedCompany,
          location: company.location || prev.location
        }));
      } else {
        console.log('No company found in response, setting default data');
        console.log('Response was:', response);
        setCompanyData({
          id: 0,
          name: 'Nueva Empresa'
        });
      }
    } catch (error) {
      console.error('Error in fetchCompanyData:', error);
      toast({ 
        title: 'Error', 
        description: 'Error al cargar los datos de la empresa', 
        variant: 'destructive' 
      });
      setCompanyData(null);
    } finally {
      console.log('Finished loading company data');
      setIsLoading(false);
    }
  }, [token]);

  // Remove duplicate useEffect that might be causing issues

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
    
    if (!token) {
      console.error('No token available');
      toast({
        title: 'Error de autenticación',
        description: 'No hay token de autenticación. Por favor, inicia sesión nuevamente.',
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
        
        if (!companyData?.id) {
          throw new Error('No se encontró el ID de la compañía');
        }

        const locationPayload: any = {
          name: formData.location.name.trim(),
          description: formData.location.description?.trim(),
          address: formData.location.address.trim(),
          phone: formData.location.phone ? String(formData.location.phone).replace(/\D/g, '') : undefined,
          email: formData.location.email?.trim(),
          timezone: formData.location.timezone || formData.timezone || 'America/Mexico_City',
          city: formData.location.city?.trim() || companyData?.city || '',
          state: formData.location.state?.trim() || companyData?.state || '',
          country: formData.location.country?.trim() || companyData?.country || 'México',
          zip_code: formData.location.zip_code?.trim() || formData.location.postal_code?.trim() || companyData?.postal_code || '',
          is_primary: true,
          is_active: true,
        };
        
        // Include geo IDs if present
        if (formData.location.country_id) {
          locationPayload.country_id = Number(formData.location.country_id);
        }
        if (formData.location.state_id) {
          locationPayload.state_id = Number(formData.location.state_id);
        }
        if (formData.location.city_id) {
          locationPayload.city_id = Number(formData.location.city_id);
        }
        
        // Include coordinates if present
        if (formData.location.latitude !== undefined) {
          locationPayload.latitude = Number(formData.location.latitude);
        }
        if (formData.location.longitude !== undefined) {
          locationPayload.longitude = Number(formData.location.longitude);
        }

        console.log('Sending location payload:', JSON.stringify(locationPayload, null, 2));
        
        // Create the new location
        const locationResponse = await api.userCompanies.createLocation(locationPayload, token);
        
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
      const data: Partial<CompanyData> = {
        name: formData.name || undefined,
        description: formData.description || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        postal_code: formData.postal_code || undefined,
        business_type_id: formData.business_type_id ? Number(formData.business_type_id) : undefined,
        timezone: formData.timezone || undefined,
        currency: formData.currency || undefined,
        language: formData.language || undefined,
        logo_url: formData.logo_url || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
              };

      // Validate required fields for new company
      if (companyData?.id === 0 && (!formData.name || !formData.email)) {
        throw new Error('El nombre y correo electrónico son obligatorios');
      }

      // If a new logo file is selected, upload to Firebase and set logo_url
      const resolvedCompanyId = companyData?.id?.toString() || '0';
      if (selectedLogoFile) {
        const uploadedLogoUrl = await uploadLogoIfNeeded(resolvedCompanyId);
        if (uploadedLogoUrl) {
          data.logo_url = uploadedLogoUrl;
        }
      }

      // Create or update company
      const response = companyData?.id === 0 ?
        await api.userCompanies.create({
          name: formData.name!,
          email: formData.email!,
          description: formData.description,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country || undefined,
          zip_code: formData.postal_code || undefined,
          business_type_id: formData.business_type_id ? Number(formData.business_type_id) : undefined
        }, token) :
        await api.companies.updateCompany(resolvedCompanyId, data, token);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al actualizar la compañía');
      }

      const companyResponseData = response.data.company || response.data;
      setCompanyData(companyResponseData);


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
  // If we don't have company data yet, show loading
  if (!companyData) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-lg animate-pulse">Cargando datos de la empresa...</span>
      </div>
    );
  }

  // Show the form if we're in edit mode
  if (isEditing) {
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
             </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {currentStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Logo de la empresa</label>
                      <div className="flex items-center justify-center w-full">
                        <label
                          onClick={handleOpenLogoDialog}
                          onDragOver={handleLogoDragOver}
                          onDrop={handleLogoDrop}
                          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
                        >
                          <div className="flex flex-col items-center justify-center p-4">
                            {logoPreview || companyData?.logo_url ? (
                              <img
                                src={logoPreview || (companyData?.logo_url as string)}
                                alt="Logo de la empresa"
                                className="max-h-24 max-w-full mb-2 rounded-md"
                              />
                            ) : (
                              <>
                                <svg
                                  className="w-8 h-8 mb-2 text-slate-500"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 20 16"
                                >
                                  <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                  />
                                </svg>
                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">Haz clic para subir</span> o arrastra y suelta
                                </p>
                                <p className="text-xs text-slate-500">PNG, JPG o SVG (MAX. 5MB)</p>
                              </>
                            )}
                          </div>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoChange}
                          />
                        </label>
                      </div>
                    </div>

                    <CompanyInfoForm 
                      formData={{
                        name: formData.name,
                        description: formData.description,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.postal_code || undefined,
                        website: formData.website,
                        business_type_id: formData.business_type_id
                      }} 
                      handleInputChange={handleInputChange}
                      onLocationChange={({ latitude, longitude }) => {
                        setFormData(prev => ({ ...prev, latitude, longitude }));
                      }} 
                    />
                  </>
                )}


                {/* Branch Information Step */}
                {currentStep === 3 && (
                  <BranchInfoForm 
                    formData={formData.location || { name: '', address: '', timezone: '' }} 
                    handleInputChange={handleInputChange} 
                  />
                )}
              </div>

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
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={isLoading}
                      >
                        Siguiente
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

  // Show the main view when not editing
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Compañía</h1>
          <p className="text-slate-600 mt-1">Administra la información de tu empresa</p>
        </div>
        <div className="text-xs text-gray-500">
          Data: {companyData?.name || 'No name'} | ID: {companyData?.id || 'No ID'}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CompanyInfo
          companyData={companyData || {
            name: '',
            description: '',
            email: '',
            phone: '',
            address: '',
            website: '',
            city: '',
            state: '',
            country: '',
            postal_code: ''
          }}
          isEditing={isEditing}
          isLoading={isLoading}
          formData={formData}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          toggleEditMode={toggleEditMode}
        />
        {!isEditing && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={() => toggleEditMode(true)}
            >
              Editar Información
            </Button>
          </div>
        )}
        <BranchesList 
          companyId={companyData?.id?.toString() || ''} 
          onAddBranchClick={() => toggleEditMode(true, 3)} 
        />
      </div>
    </div>
  );
}
