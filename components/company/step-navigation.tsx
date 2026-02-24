"use client";

import React from 'react';

interface StepNavigationProps {
  currentStep: number;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({ currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-4">
        {[
          { number: 1, label: 'Información' },
          { number: 2, label: 'Sucursal' },
          { number: 3, label: 'Pago' }
        ].map((step) => (
          <div key={step.number} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep === step.number
              ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500 font-medium'
              : currentStep > step.number
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-slate-100 text-slate-400'
              }`}>
              {step.number}
            </div>
            <span className={`text-sm text-center ${currentStep >= step.number ? 'text-slate-900 font-medium' : 'text-slate-400'
              }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-10"></div>
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 transition-all duration-300 -z-5"
          style={{
            width: `${((currentStep - 1) / 2) * 100}%`,
            transition: 'width 0.3s ease-in-out'
          }}
        ></div>
      </div>
    </div>
  );
}; 