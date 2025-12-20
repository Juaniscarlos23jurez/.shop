"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/api';
import { CompanyInfoForm } from '@/components/company/company-info-form';
import { BranchInfoForm } from '@/components/company/branch-info-form';
import { StepNavigation } from '@/components/company/step-navigation';

interface CompanyOnboardingWizardProps {
  onComplete?: () => void;
}

export function CompanyOnboardingWizard({ onComplete }: CompanyOnboardingWizardProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Logo and banner states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'México',
    postal_code: '',
    business_type_id: undefined,
    timezone: 'America/Mexico_City',
    currency: 'MXN',
    language: 'es',
    latitude: undefined,
    longitude: undefined,
    location: {
      name: '',
      address: '',
      phone: '',
      email: '',
      contact_person: '',
      timezone: 'America/Mexico_City',
      city: '',
      state: '',
      country: 'México',
      zip_code: '',
      notes: '',
      country_id: undefined,
      state_id: undefined,
      city_id: undefined,
      latitude: undefined,
      longitude: undefined,
    },
  });

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const res = await api.userCompanies.get(token);
        const existing = (res as any)?.data?.data;
        if (res.success && existing?.id) {
          setCompanyId(String(existing.id));
          toast({
            title: 'Ya tienes compañía registrada',
            description: 'Continuemos con la configuración de tu sucursal.',
          });
          setStep(2);
        }
      } catch {
        // ignore
      }
    })();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData((prev: any) => ({
        ...prev,
        location: {
          ...(prev.location || {}),
          [locationField]: value,
        },
      }));
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Logo handlers
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenLogoDialog = () => logoInputRef.current?.click();

  const handleLogoDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Banner handlers
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenBannerDialog = () => bannerInputRef.current?.click();

  const handleBannerDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const canContinueCompany = useMemo(() => {
    return Boolean(formData.name?.trim() && formData.email?.trim());
  }, [formData.name, formData.email]);

  const canCreateLocation = useMemo(() => {
    return Boolean(
      formData.location?.name?.trim() && 
      formData.location?.address?.trim() &&
      formData.location?.state_id &&
      formData.location?.city_id &&
      formData.location?.zip_code?.trim()
    );
  }, [formData.location?.name, formData.location?.address, formData.location?.state_id, formData.location?.city_id, formData.location?.zip_code]);

  const createCompany = async () => {
    if (!token) throw new Error('No se encontró el token de autenticación');

    const payload: any = {
      name: formData.name?.trim(),
      description: formData.description?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      email: formData.email?.trim() || undefined,
      address: formData.address?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      state: formData.state?.trim() || undefined,
      country: formData.country?.trim() || undefined,
      zip_code: formData.postal_code?.trim() || undefined,
      business_type_id: formData.business_type_id ? Number(formData.business_type_id) : undefined,
      website: formData.website?.trim() || undefined,
      timezone: formData.timezone || undefined,
      currency: formData.currency || undefined,
      language: formData.language || undefined,
      latitude: formData.latitude !== undefined ? Number(formData.latitude) : undefined,
      longitude: formData.longitude !== undefined ? Number(formData.longitude) : undefined,
    };

    // Add logo and banner if selected
    if (logoFile) payload.logo = logoFile;
    if (bannerFile) payload.banner = bannerFile;

    const res = await api.userCompanies.create(payload, token);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Error al crear la compañía');
    }

    const created = (res.data as any)?.company || (res.data as any)?.data || (res.data as any);
    const createdId = created?.id ? String(created.id) : null;
    if (!createdId) {
      throw new Error('No se pudo obtener el ID de la compañía');
    }

    setCompanyId(createdId);
    return createdId;
  };

  const createLocation = async () => {
    if (!token) throw new Error('No se encontró el token de autenticación');

    const payload: any = {
      name: formData.location.name.trim(),
      description: formData.location.description?.trim() || undefined,
      address: formData.location.address.trim(),
      phone: formData.location.phone ? String(formData.location.phone).replace(/\D/g, '') : undefined,
      email: formData.location.email?.trim() || undefined,
      contact_person: formData.location.contact_person?.trim() || undefined,
      timezone: formData.location.timezone || formData.timezone || 'America/Mexico_City',
      city: formData.location.city?.trim() || formData.city?.trim() || undefined,
      state: formData.location.state?.trim() || formData.state?.trim() || undefined,
      country: formData.location.country?.trim() || formData.country?.trim() || 'México',
      postal_code: formData.location.zip_code?.trim() || formData.postal_code?.trim() || undefined,
      is_primary: true,
      is_active: true,
    };

    if (formData.location.country_id) payload.country_id = Number(formData.location.country_id);
    if (formData.location.state_id) payload.state_id = Number(formData.location.state_id);
    if (formData.location.city_id) payload.city_id = Number(formData.location.city_id);
    if (formData.location.latitude !== undefined) payload.latitude = Number(formData.location.latitude);
    if (formData.location.longitude !== undefined) payload.longitude = Number(formData.location.longitude);

    const res = await api.userCompanies.createLocation(payload, token);
    if (!res.success) {
      throw new Error(res.message || 'Error al crear la sucursal');
    }

    toast({
      title: '¡Listo!',
      description: 'Tu compañía y sucursal quedaron configuradas.',
    });

    onComplete?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      if (step === 1) {
        if (!canContinueCompany) {
          throw new Error('El nombre y correo electrónico son obligatorios');
        }
        // Solo avanzar al siguiente paso sin guardar aún
        setStep(2);
        setIsLoading(false);
        return;
      }

      if (step === 2) {
        if (!canCreateLocation) {
          throw new Error('El nombre, dirección, estado, ciudad y código postal de la sucursal son obligatorios');
        }
        
        // Primero crear la compañía si no existe
        if (!companyId) {
          const newCompanyId = await createCompany();
          if (!newCompanyId) {
            throw new Error('No se pudo crear la compañía');
          }
        }
        
        // Luego crear la location
        await createLocation();
        return;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <StepNavigation currentStep={step} />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 1 && 'Información de la Empresa'}
            {step === 2 && 'Agregar Sucursal'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Completa la información básica de tu empresa'}
            {step === 2 && 'Configura la información de tu primera sucursal'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Logo de la empresa</label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      onDragOver={handleLogoDragOver}
                      onDrop={handleLogoDrop}
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
                    >
                      <div className="flex flex-col items-center justify-center p-4">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Banner de la empresa</label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      onDragOver={handleBannerDragOver}
                      onDrop={handleBannerDrop}
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
                    >
                      <div className="flex flex-col items-center justify-center p-4 w-full">
                        {bannerPreview ? (
                          <img
                            src={bannerPreview}
                            alt="Banner de la empresa"
                            className="w-full h-56 object-cover object-center mb-2 rounded-md"
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
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerChange}
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
                    business_type_id: formData.business_type_id,
                  }}
                  handleInputChange={handleInputChange}
                  onLocationChange={({ latitude, longitude }) => {
                    setFormData((prev: any) => ({ ...prev, latitude, longitude }));
                  }}
                />
              </>
            )}

            {step === 2 && (
              <BranchInfoForm
                formData={formData.location || { name: '', address: '', timezone: '' }}
                handleInputChange={handleInputChange}
                isFirstBranch
              />
            )}

            <div className="flex justify-end space-x-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Atrás
                </Button>
              )}

              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={
                  isLoading ||
                  (step === 1 && !canContinueCompany) ||
                  (step === 2 && !canCreateLocation)
                }
              >
                {step === 1 ? (isLoading ? 'Guardando...' : 'Guardar y continuar') : (isLoading ? 'Guardando...' : 'Finalizar')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
