'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface AuthFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  title: string;
  buttonText: string;
  isLoading?: boolean;
  isEmployeeLogin?: boolean;
}

export function AuthForm({ 
  onSubmit, 
  buttonText, 
  isLoading: propIsLoading = false, 
  isEmployeeLogin = false 
}: AuthFormProps) {
  const primaryColor = isEmployeeLogin ? 'blue' : 'green';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </Label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-${primaryColor}-500 focus:border-${primaryColor}-500 sm:text-sm`}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </Label>
            <div className="text-sm">
              <Link href="/auth/forgot-password" className={`font-medium text-${primaryColor}-600 hover:text-${primaryColor}-500`}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-${primaryColor}-500 focus:border-${primaryColor}-500 sm:text-sm`}
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className={`h-4 w-4 text-${primaryColor}-600 focus:ring-${primaryColor}-500 border-gray-300 rounded`}
          />
          <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Recordarme
          </Label>
        </div>

        <div>
          <Button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${primaryColor}-600 hover:bg-${primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${primaryColor}-500 transition-colors duration-200`}
            disabled={isSubmitting || propIsLoading}
          >
            {isSubmitting || propIsLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
