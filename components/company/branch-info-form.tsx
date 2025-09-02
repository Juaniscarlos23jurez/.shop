"use client";

import React from 'react';

interface BranchInfoFormProps {
  formData: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    contact_person?: string;
    timezone?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    notes?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const BranchInfoForm: React.FC<BranchInfoFormProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-900">Agregar Sucursal</h3>
      <p className="text-sm text-slate-500 mb-4">Agrega tu primera sucursal</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="locationName" className="block text-sm font-medium text-slate-700 mb-1">
            Nombre de la Sucursal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="locationName"
            name="location.name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label htmlFor="locationAddress" className="block text-sm font-medium text-slate-700 mb-1">
            Dirección <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="locationAddress"
            name="location.address"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label htmlFor="locationPhone" className="block text-sm font-medium text-slate-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            id="locationPhone"
            name="location.phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="locationEmail" className="block text-sm font-medium text-slate-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="locationEmail"
            name="location.email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="locationContact" className="block text-sm font-medium text-slate-700 mb-1">
            Persona de Contacto
          </label>
          <input
            type="text"
            id="locationContact"
            name="location.contact_person"
            value={formData.contact_person || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="locationPostalCode" className="block text-sm font-medium text-slate-700 mb-1">
            Código Postal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="locationZipCode"
            name="location.zip_code"
            value={formData.zip_code || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label htmlFor="locationTimezone" className="block text-sm font-medium text-slate-700 mb-1">
            Zona Horaria
          </label>
          <select
            id="locationTimezone"
            name="location.timezone"
            value={formData.timezone || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
            <option value="America/Monterrey">Monterrey (UTC-6)</option>
            <option value="America/Tijuana">Tijuana (UTC-8)</option>
            <option value="America/New_York">Nueva York (UTC-5)</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 