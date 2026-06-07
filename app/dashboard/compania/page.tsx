"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  Briefcase, 
  Edit, 
  ExternalLink, 
  Calendar, 
  Clock, 
  Coins, 
  Languages, 
  Image as ImageIcon, 
  UploadCloud, 
  ChevronRight,
  Plus
} from 'lucide-react';
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
  banner_url?: string;
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
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleOpenBannerDialog = () => {
    bannerInputRef.current?.click();
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

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBannerPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setSelectedBannerFile(file);
  };

  const handleBannerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setBannerPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setSelectedBannerFile(file);
    }
  };

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [logoPreview, bannerPreview]);

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

  const uploadBannerIfNeeded = async (companyId: string): Promise<string | null> => {
    if (!selectedBannerFile) return null;
    try {
      const path = `companies/${companyId}/banner/${Date.now()}_${selectedBannerFile.name}`;
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, selectedBannerFile);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (err) {
      console.error('Error uploading banner to Firebase:', err);
      toast({
        title: 'Error al subir banner',
        description: 'Se continuará sin actualizar el banner.',
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
      router.push('/dashboard/compania', { scroll: false });
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
          banner_url: company.banner_url || undefined,
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
          is_active: company.is_active,
          created_at: company.created_at,
          updated_at: company.updated_at
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
      // If we're in step 2 (creating a location)
      if (currentStep === 2) {
        if (!companyData?.id) {
          throw new Error('No se encontró el ID de la compañía');
        }

        if (!formData.location?.name || !formData.location?.address) {
          throw new Error('El nombre y la dirección de la sucursal son obligatorios');
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
          postal_code: formData.location.zip_code?.trim() || formData.location.postal_code?.trim() || companyData?.postal_code || '',
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
        banner_url: formData.banner_url || undefined,
      };

      // Include coordinates if they exist in formData
      if (formData.latitude !== undefined && formData.latitude !== null) {
        data.latitude = Number(formData.latitude);
      }
      if (formData.longitude !== undefined && formData.longitude !== null) {
        data.longitude = Number(formData.longitude);
      }

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

      // If a new banner file is selected, upload to Firebase and set banner_url
      if (selectedBannerFile) {
        const uploadedBannerUrl = await uploadBannerIfNeeded(resolvedCompanyId);
        if (uploadedBannerUrl) {
          data.banner_url = uploadedBannerUrl;
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
          business_type_id: formData.business_type_id ? Number(formData.business_type_id) : undefined,
          logo_url: data.logo_url || formData.logo_url || undefined,
          banner_url: data.banner_url || formData.banner_url || undefined
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
        description: 'Información de la compañía guardada correctamente. Continúa con el siguiente paso.',
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 font-medium animate-pulse text-lg">Cargando...</span>
        </div>
      </div>
    );
  }

  // Debug log to check the current state
  // If we don't have company data yet, show loading
  if (!companyData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-lg animate-pulse text-slate-500">Cargando datos de la empresa...</span>
      </div>
    );
  }

  // Show the form if we're in edit mode
  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configuración de Empresa</h1>
              <p className="text-slate-500 mt-1">Actualiza la identidad y detalles de tu negocio</p>
            </div>
            <Button 
               variant="outline" 
               onClick={() => toggleEditMode(false)}
               className="border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              Cancelar Edición
            </Button>
        </div>

        <StepNavigation currentStep={currentStep} />

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-slate-800">
               {currentStep === 1 ? (
                 <><Building2 className="w-6 h-6 text-emerald-600" /> Información de la Empresa</>
               ) : (
                 <><MapPin className="w-6 h-6 text-emerald-600" /> Agregar Sucursal</>
               )}
            </CardTitle>
            <CardDescription className="text-slate-500 text-base">
              {currentStep === 1 && 'Personaliza el logo, banner y datos de contacto de tu empresa.'}
              {currentStep === 2 && 'Configura los detalles de tu nueva ubicación.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit}>
              <div className="p-6 md:p-8 space-y-10">
                {currentStep === 1 && (
                  <>
                    {/* Visual Asset Management */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Logo Section */}
                      <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                           Logo
                           <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">PREVIEW</span>
                        </label>
                        <div 
                          onDragOver={handleLogoDragOver}
                          onDrop={handleLogoDrop}
                          onClick={handleOpenLogoDialog}
                          className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group cursor-pointer hover:border-emerald-400 transition-all hover:bg-emerald-50/30"
                        >
                           {logoPreview || companyData?.logo_url ? (
                             <img
                               src={logoPreview || (companyData?.logo_url as string)}
                               alt="Logo de la empresa"
                               className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
                             />
                           ) : (
                             <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                 <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                               </div>
                               <p className="text-sm font-medium text-slate-700">Subir Logo</p>
                               <p className="text-xs text-slate-400 mt-1">Arrastra o haz clic</p>
                             </div>
                           )}
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <UploadCloud className="text-white w-8 h-8" />
                           </div>
                        </div>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                        <p className="text-[11px] text-slate-400 leading-tight">Recomendado: 500x500px, PNG o SVG con fondo transparente.</p>
                      </div>

                      {/* Banner Section */}
                      <div className="lg:col-span-2 space-y-4">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                           Banner / Portada
                           <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">PREVIEW</span>
                        </label>
                        <div 
                           onDragOver={handleBannerDragOver}
                           onDrop={handleBannerDrop}
                           onClick={handleOpenBannerDialog}
                           className="relative h-40 md:h-full min-h-[160px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group cursor-pointer hover:border-emerald-400 transition-all hover:bg-emerald-50/30"
                        >
                          {bannerPreview || companyData?.banner_url ? (
                            <img
                              src={bannerPreview || (companyData?.banner_url as string)}
                              alt="Banner de la empresa"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                 <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                               </div>
                               <p className="text-sm font-medium text-slate-700">Subir Imagen de Portada</p>
                               <p className="text-xs text-slate-400 mt-1">Aspecto recomendado 16:9</p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <UploadCloud className="text-white w-8 h-8" />
                          </div>
                        </div>
                        <input
                          ref={bannerInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerChange}
                        />
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 my-4" />

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
                {currentStep === 2 && (
                  <BranchInfoForm
                    formData={formData.location || { name: '', address: '', timezone: '' }}
                    handleInputChange={handleInputChange}
                    isFirstBranch={!companyData?.locations || companyData.locations.length === 0}
                  />
                )}
              </div>
              <div className="bg-slate-50/80 p-6 md:p-8 flex justify-end gap-4 border-t">
                {currentStep === 1 ? (
                  <Button
                    type="submit"
                    className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isLoading || !formData.name || !formData.email}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar Información'}
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="h-12 px-6 rounded-xl border-slate-200"
                    >
                      Regresar
                    </Button>
                    {currentStep === 2 ? (
                      <Button
                        type="submit"
                        className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200"
                        disabled={
                          isLoading ||
                          !formData.location?.name ||
                          !formData.location?.address ||
                          !formData.location?.state_id ||
                          !formData.location?.city_id ||
                          !formData.location?.zip_code
                        }
                      >
                        {isLoading ? 'Guardando...' : 'Confirmar y Crear'}
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={isLoading}
                      >
                        Siguiente Paso
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
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header with Images */}
      <div className="mb-12 space-y-6">
        {/* Banner */}
        {companyData?.banner_url && (
          <div className="w-full h-48 rounded-lg overflow-hidden border border-slate-200">
            <img 
              src={companyData.banner_url} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Logo and Title */}
        <div className="flex items-end gap-6">
          {companyData?.logo_url && (
            <div className="w-24 h-24 rounded-lg border border-slate-200 overflow-hidden bg-white flex-shrink-0">
              <img 
                src={companyData.logo_url} 
                alt="Logo" 
                className="w-full h-full object-contain p-2"
              />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-1">Compañía</h1>
            <p className="text-lg text-slate-500">Administra la información de tu empresa</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-12">
        {/* Company Information Section */}
        <div className="border-b border-slate-200 pb-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">
                Información General
              </h2>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">{companyData?.name || 'Nombre no definido'}</h3>
              <p className="text-slate-600 max-w-2xl leading-relaxed">
                {companyData?.description || 'Nuestra empresa aún no cuenta con una descripción.'}
              </p>
            </div>
            <Button
              className="ml-4 shrink-0 bg-slate-900 text-white hover:bg-slate-800 rounded-lg"
              onClick={() => toggleEditMode(true, 1)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Datos de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1">Correo</p>
                <p className="text-slate-900 font-medium">{companyData?.email || 'No disponible'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1">Teléfono</p>
                <p className="text-slate-900 font-medium">{companyData?.phone || 'No disponible'}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1">Dirección</p>
                <p className="text-slate-900 font-medium">
                  {companyData?.address || 'No especificada'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {companyData?.city}, {companyData?.state} {companyData?.postal_code && `• CP ${companyData.postal_code}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Globe className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1">Sitio Web</p>
                <a 
                  href={companyData?.website?.startsWith('http') ? companyData.website : `https://${companyData?.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-900 font-medium hover:text-emerald-600 transition-colors"
                >
                  {companyData?.website || 'No disponible'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-6">
            Configuración Regional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Zona Horaria</p>
                <p className="text-slate-900 font-medium">{companyData?.timezone || 'America/Mexico_City'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Coins className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Moneda</p>
                <p className="text-slate-900 font-medium">{companyData?.currency || 'MXN'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Languages className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Idioma</p>
                <p className="text-slate-900 font-medium uppercase">{companyData?.language || 'es'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Branches Section */}
        <div className="border-t border-slate-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Sucursales ({companyData?.locations?.length || 0})
            </h2>
            <Button 
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg"
              onClick={() => toggleEditMode(true, 2)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
          <BranchesList
            companyId={companyData?.id?.toString() || ''}
            onAddBranchClick={() => toggleEditMode(true, 2)}
          />
        </div>
      </div>
    </div>
  );
}

