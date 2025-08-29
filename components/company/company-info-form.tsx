"use client";

import React from 'react';

interface CompanyInfoFormProps {
  formData: {
    name?: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    website?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({ formData, handleInputChange }) => {
  return (
    <>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
          Nombre de la Empresa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Correo Electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
          Dirección
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
            Ciudad
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
            Estado/Provincia
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-slate-700 mb-1">
            Código Postal
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formData.postal_code || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
          Sitio Web
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website || ''}
          onChange={handleInputChange}
          placeholder="https://ejemplo.com"
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>
    </>
  );
}; 