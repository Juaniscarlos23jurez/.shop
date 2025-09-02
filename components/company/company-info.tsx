import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";


interface CompanyData {
  id?: number;
  name: string;
  description?: string;
  status?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  business_type?: string;
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
}

interface CompanyInfoProps {
  companyData: CompanyData;
  isEditing: boolean;
  isLoading: boolean;
  formData: CompanyData;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  toggleEditMode: (value: boolean, section?: number) => void;
}

export function CompanyInfo({
  companyData,
  isEditing,
  isLoading,
  formData,
  onSubmit,
  onInputChange,
  toggleEditMode
}: CompanyInfoProps) {
  return (
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
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nombre de la empresa</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={onInputChange}
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
                  onChange={onInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={onInputChange}
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
                  onChange={onInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Descripción</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={onInputChange}
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
                  onChange={onInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Ciudad</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={onInputChange}
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
                    {[
                      companyData.address,
                      companyData.city,
                      companyData.state,
                      companyData.country,
                      companyData.postal_code
                    ].filter(Boolean).join(', ') || 'No especificada'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-slate-400 mt-0.5 flex-shrink-0">📞</span>
                <div>
                  <h4 className="font-medium text-slate-900">Teléfono</h4>
                  <p className="text-slate-600">{companyData.phone || 'No especificado'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-slate-400 mt-0.5 flex-shrink-0">✉️</span>
                <div>
                  <h4 className="font-medium text-slate-900">Correo Electrónico</h4>
                  <p className="text-slate-600">{companyData.email || 'No especificado'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-slate-400 mt-0.5 flex-shrink-0">🌐</span>
                <div>
                  <h4 className="font-medium text-slate-900">Sitio Web</h4>
                  <p className="text-slate-600">
                    {companyData.website ? (
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
              
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
