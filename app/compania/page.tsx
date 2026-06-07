'use client';

import { MapPin, Phone, Mail, Globe, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CompaniaPage() {
  const companyData = {
    name: 'Nombre de la Empresa',
    description: 'Breve descripción de la compañía y su misión principal.',
    address: 'Av. Principal #123, Colonia Centro',
    city: 'Ciudad de México',
    phone: '+52 55 1234 5678',
    email: 'contacto@empresa.com',
    website: 'www.empresa.com',
    schedule: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
  };

  const contactInfo = [
    { label: 'Dirección', value: `${companyData.address}, ${companyData.city}`, icon: MapPin },
    { label: 'Teléfono', value: companyData.phone, icon: Phone },
    { label: 'Correo', value: companyData.email, icon: Mail },
    { label: 'Sitio Web', value: companyData.website, icon: Globe },
    { label: 'Horario', value: companyData.schedule, icon: Clock },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Compañía</h1>
        <p className="text-lg text-slate-500">Administra la información de tu empresa</p>
      </div>

      {/* Información Principal */}
      <div className="mb-16">
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">
            Información General
          </h2>
          <h3 className="text-2xl font-semibold text-slate-900 mb-3">{companyData.name}</h3>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
            {companyData.description}
          </p>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg">
            Editar Información
          </Button>
        </div>
      </div>

      {/* Contacto */}
      <div className="mb-16">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-8">
          Datos de Contacto
        </h2>
        
        <div className="space-y-6">
          {contactInfo.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-4">
                <Icon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 mb-1">{item.label}</p>
                  <p className="text-base text-slate-900">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sucursales */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Sucursales
          </h2>
          <Button variant="outline" size="sm" className="text-slate-600 border-slate-300">
            + Agregar
          </Button>
        </div>

        <div className="space-y-4">
          {[1, 2].map((branch) => (
            <div 
              key={branch} 
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 mb-1">Sucursal {branch}</h4>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>5 empleados</span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                    Activa
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-600 hover:text-slate-900 gap-2"
              >
                Ver
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
