"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as Lucide from "lucide-react";
import { clientAuthApi } from "@/lib/api/client-auth";
const { Wallet, CreditCard, Smartphone, ShieldCheck, Zap } = Lucide as any;

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
        setError("Inicia sesión para descargar tu pase de atleta.");
        return;
      }

      const profileResp = await clientAuthApi.getProfile(token);

      if (!profileResp.success || !profileResp.data || !(profileResp.data as any).data) {
        setError("No se pudo obtener tu perfil atleta.");
        return;
      }

      const profileData = (profileResp.data as any).data;
      const membershipId = profileData.uuid as string | undefined;

      if (!membershipId) {
        setError("Tu cuenta no tiene un identificador de atleta válido.");
        return;
      }

      const companyId = 1;

      const res = await clientAuthApi.getMembershipPkpass(token, membershipId, companyId);
      if (!res.ok) {
        setError("Error de conexión con el centro de pase.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.location.href = url;
    } catch (e) {
      setError("Fallo en la generación del pase digital.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="pb-32 px-1">
      <Card className="max-w-xl mx-auto bg-zinc-900 border-zinc-800 rounded-[2.5rem] border-2 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600/10 to-transparent p-1">
          <CardHeader className="flex flex-row items-start gap-5 p-8">
            <div
              className={`h-16 w-16 rounded-[1.25rem] flex items-center justify-center shadow-2xl ${!buttonColor ? 'bg-blue-600 text-white' : 'text-white'}`}
              style={buttonColor ? { backgroundColor: buttonColor } : {}}
            >
              <Wallet className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter">Digital Pass</CardTitle>
              <CardDescription className="text-base mt-2 text-zinc-400 font-medium">
                Acceso rápido y seguro a {companyName || "tu centro"}.
              </CardDescription>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-8 pt-0">
          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-zinc-950 p-6 rounded-[1.5rem] border border-zinc-800">
              <ShieldCheck className="h-6 w-6 text-blue-500 mt-1" />
              <p className="text-zinc-300 font-medium leading-relaxed">
                Tu pase digital es tu identidad en el {companyName || 'Gym'}. Úsalo para registrar tus sesiones y acumular puntos.
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-8">
              <Button
                size="lg"
                className={`w-full h-16 rounded-2xl font-black uppercase tracking-widest text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.4)] transition-all flex items-center gap-3 ${!buttonColor ? 'bg-blue-600 hover:bg-blue-700' : 'hover:opacity-95'}`}
                style={buttonColor ? { backgroundColor: buttonColor } : {}}
                onClick={handleDownloadPkpass}
                disabled={downloading}
              >
                <Zap className={`h-6 w-6 ${downloading ? 'animate-pulse' : ''}`} />
                {downloading ? "GENERANDO..." : "VINCULAR A WALLET"}
              </Button>
              <div className="flex items-center justify-center gap-4 py-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Apple_Wallet_Icon.svg" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Apple Wallet" />
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Wallet_logo.svg" className="h-6 opacity-30 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Google Wallet" />
              </div>
            </div>

            {error ? (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-900/30 rounded-xl text-center">
                <p className="text-sm text-red-400 font-black uppercase tracking-tight">{error}</p>
              </div>
            ) : (
              <p className="text-[10px] text-zinc-600 mt-6 text-center font-black uppercase tracking-[0.2em] max-w-[80%] mx-auto leading-relaxed">
                Debes haber completado tu perfil de atleta para generar el pase con éxito.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
