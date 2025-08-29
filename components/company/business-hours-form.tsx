"use client";

import React from 'react';

interface BusinessHoursFormProps {
  businessHours: Array<{
    day_of_week: string;
    is_open: boolean;
    open_time?: string;
    close_time?: string;
  }> | undefined;
  setBusinessHours: React.Dispatch<React.SetStateAction<Partial<any>>>; // Simplified for now
}

export const BusinessHoursForm: React.FC<BusinessHoursFormProps> = ({ businessHours, setBusinessHours }) => {
  const handleBusinessHoursChange = (index: number, field: string, value: string | boolean) => {
    if (businessHours) {
      const updatedHours = [...businessHours];
      updatedHours[index] = { ...updatedHours[index], [field]: value };
      setBusinessHours(prev => ({ ...prev, business_hours: updatedHours }));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-900">Horario Comercia1l</h3>
      <p className="text-sm text-slate-500 mb-4">Configura los horarios de atención de tu negocio</p>
      
      {businessHours?.map((day, index) => (
        <div key={day.day_of_week} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={`day-${index}`}
              checked={day.is_open}
              onChange={() => handleBusinessHoursChange(index, 'is_open', !day.is_open)}
              className="h-4 w-4 text-emerald-600 rounded border-slate-300"
            />
            <label htmlFor={`day-${index}`} className="text-sm font-medium text-slate-700 w-24">
              {day.day_of_week}
            </label>
          </div>
          
          {day.is_open ? (
            <div className="flex items-center space-x-2">
              <input
                type="time"
                value={day.open_time || ''}
                onChange={(e) => handleBusinessHoursChange(index, 'open_time', e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <span className="text-slate-400">a</span>
              <input
                type="time"
                value={day.close_time || ''}
                onChange={(e) => handleBusinessHoursChange(index, 'close_time', e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
            </div>
          ) : (
            <span className="text-sm text-slate-400">Cerrado</span>
          )}
        </div>
      ))}
    </div>
  );
}; 