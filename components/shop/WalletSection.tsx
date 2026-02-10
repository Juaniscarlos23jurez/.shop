"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as Lucide from "lucide-react";
import { clientAuthApi } from "@/lib/api/client-auth";
const { Wallet, CreditCard, Smartphone } = Lucide as any;

interface WalletSectionProps {
  companyName?: string;
  buttonColor?: string;
}

export function WalletSection({ companyName, buttonColor }: WalletSectionProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPkpass = async () => {
    try {
      setError(null);
      setDownloading(true);

      const token = typeof window !== "undefined" ? window.localStorage.getItem("customer_token") : null;
      if (!token) {
        setError("Inicia sesión para descargar tu pase de membresía.");
        return;
      }

      // Primero obtenemos el perfil para recuperar el UUID del cliente
      const profileResp = await clientAuthApi.getProfile(token);

      if (!profileResp.success || !profileResp.data || !(profileResp.data as any).data) {
        setError("No se pudo obtener tu perfil para generar el pase.");
        return;
      }

      const profileData = (profileResp.data as any).data;
      const membershipId = profileData.uuid as string | undefined;

      if (!membershipId) {
        setError("Tu cuenta no tiene un identificador de membresía válido.");
        return;
      }

      // Por ahora usamos un companyId fijo (1). Ajusta este valor según la compañía real.
      const companyId = 1;

      const res = await clientAuthApi.getMembershipPkpass(token, membershipId, companyId);
      if (!res.ok) {
        setError("No se pudo descargar el pase. Intenta de nuevo más tarde.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Abrimos el pkpass en la misma pestaña para que iOS lo reconozca y ofrezca añadirlo a Wallet
      window.location.href = url;
    } catch (e) {
      setError("Ocurrió un error al descargar el pase.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="pb-16">
      <Card className="max-w-xl mx-auto">
        <CardHeader className="flex flex-row items-start gap-3">
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center ${!buttonColor ? 'bg-emerald-100 text-emerald-700' : 'text-white'}`}
            style={buttonColor ? { backgroundColor: buttonColor } : {}}
          >
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl">Wallet</CardTitle>
            <CardDescription className="text-base mt-1">
              Aquí podrás guardar tu pase digital (PKPass) para {companyName || "tu comercio favorito"}.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm sm:text-base text-gray-700">
            <p>
              Descarga tu pase digital para agregarlo a Apple Wallet o Google Wallet y úsalo cada vez que visites el local.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                className={`w-full sm:w-auto inline-flex items-center gap-2 text-white ${!buttonColor ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:opacity-90'}`}
                style={buttonColor ? { backgroundColor: buttonColor } : {}}
                onClick={handleDownloadPkpass}
                disabled={downloading}
              >
                <Smartphone className="h-5 w-5" />
                {downloading ? "Abriendo..." : "Abrir pase"}
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto inline-flex items-center gap-2"
                disabled
              >
                <CreditCard className="h-5 w-5" />
                Ver pase
              </Button>
            </div>
            {error && (
              <p className="text-xs text-red-500 mt-2">
                {error}
              </p>
            )}
            {!error && (
              <p className="text-xs text-gray-500 mt-2">
                Necesitas tener una cuenta e iniciar sesión para que podamos generar tu pase de membresía.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
