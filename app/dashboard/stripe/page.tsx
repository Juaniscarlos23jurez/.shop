"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard as CreditCardIcon } from "lucide-react";

export default function StripeSettingsPage() {
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const handleSave = () => {
    // NOTE: Demo only. Do not store secrets in the client.
    // SaaS: keys belong to each company/tenant. Store them server-side (DB or secret store), not in env files.
    alert("Demo: Guarda las llaves por compañía en el servidor (BD/secret store) mediante una API segura. No las guardes en el cliente.");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCardIcon className="h-6 w-6 text-emerald-600" /> Stripe
          </h1>
          <p className="text-slate-500">Pagos y configuración de Stripe</p>
        </div>
        <Link
          className="text-sm text-emerald-700 hover:text-emerald-800 underline"
          href="https://dashboard.stripe.com/"
          target="_blank"
        >
          Ir al Stripe Dashboard
        </Link>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="keys">Llaves</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pagos recientes</CardTitle>
                <CardDescription>Vista previa (placeholder). Integra la API de Stripe para listar pagos reales.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-50 text-xs text-slate-500">
                    <span>ID</span>
                    <span>Monto</span>
                    <span>Estado</span>
                    <span>Fecha</span>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 text-sm border-t">
                      <span className="font-mono text-slate-700">pay_demo_{i}</span>
                      <span className="text-slate-700">$0.00</span>
                      <span className="text-amber-600">demo</span>
                      <span className="text-slate-500">--/--/----</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">Conecta la API de Stripe en el servidor para obtener pagos reales.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keys">
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Llaves por compañía (SaaS)</CardTitle>
                <CardDescription>Administra las llaves a nivel de compañía/tenant. Guarda y lee desde el servidor/BD, no en .env.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    En un SaaS, cada compañía tiene sus propias llaves. Nunca guardes la <span className="font-semibold">Secret Key</span> en el cliente. Usa una API segura y almacénala cifrada en el servidor (BD/secret store).
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="pk">Publishable Key</Label>
                  <Input
                    id="pk"
                    placeholder="pk_live_..."
                    value={publishableKey}
                    onChange={(e) => setPublishableKey(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sk">Secret Key</Label>
                  <Input
                    id="sk"
                    type="password"
                    placeholder="sk_live_..."
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                  />
                </div>

                <Button onClick={handleSave} className="w-full">Guardar (demo)</Button>

                <Separator className="my-2" />

                <div className="text-xs text-slate-500 space-y-2">
                  <p>
                    Implementación recomendada:
                  </p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Crear endpoints: <code>POST /api/stripe/keys</code> (guardar/actualizar), <code>GET /api/stripe/keys</code> (leer).</li>
                    <li>Identificar la compañía actual (ej. por <code>user.companyId</code> o subdominio).</li>
                    <li>Guardar cifrado en BD/secret manager. Nunca devolver la Secret Key completa al cliente.</li>
                    <li>Usar la Secret Key únicamente en el servidor para llamadas a Stripe y webhooks.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
