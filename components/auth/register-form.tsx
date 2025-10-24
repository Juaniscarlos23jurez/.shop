"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface RegisterFormValues {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => Promise<void> | void;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const [values, setValues] = useState<RegisterFormValues>({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    if (!values.email.trim()) {
      setError("El correo es requerido.");
      return;
    }
    if (!values.password) {
      setError("La contraseña es requerida.");
      return;
    }
    if (values.password !== values.password_confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre
          </Label>
          <div className="mt-1">
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={values.name}
              onChange={handleChange}
            />
          </div>
        </div>

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
              value={values.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Teléfono (opcional)
          </Label>
          <div className="mt-1">
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </Label>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={values.password}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
            Confirmar contraseña
          </Label>
          <div className="mt-1">
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              value={values.password_confirmation}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div>
          <Button
            type="submit"
            className="w-full"
            disabled={submitting || isLoading}
          >
            {submitting || isLoading ? "Registrando..." : "Crear cuenta"}
          </Button>
        </div>
      </form>
    </div>
  );
}
