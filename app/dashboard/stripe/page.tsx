"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";

export default function PaymentMethodsPage() {
  const { token, user } = useAuth();
  // Stripe
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  // SPEI
  const [spei, setSpei] = useState({
    display_name: "Transferencia SPEI",
    account_holder: "",
    bank_name: "",
    account_number: "",
    clabe: "",
    reference: "",
    instructions: "",
    qr_image_url: "",
  });
  const [speiId, setSpeiId] = useState<number | null>(null);
  // Efectivo
  const [cashActive, setCashActive] = useState(true);
  const [cashId, setCashId] = useState<number | null>(null);
  const [cash, setCash] = useState({
    display_name: 'Pago en efectivo',
    instructions: 'Pagar al recibir en sucursal',
    cash_limit_amount: undefined as number | undefined,
    sort_order: 1 as number | undefined,
  });
  // Loading flags
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const handleSaveStripe = () => {
    // NOTE: Demo only. Do not store secrets in the client.
    // SaaS: keys belong to each company/tenant. Store them server-side (DB or secret store), not in env files.
    alert("Demo: Guarda las llaves por compañía en el servidor (BD/secret store) mediante una API segura. No las guardes en el cliente.");
  };

  const handleSaveSpei = async () => {
    if (!token || !user?.company_id) return;
    const companyId = user.company_id;
    setLoading(true);
    try {
      const payload = {
        type: 'spei' as const,
        display_name: spei.display_name,
        account_holder: spei.account_holder,
        bank_name: spei.bank_name,
        account_number: spei.account_number,
        clabe: spei.clabe,
        reference: spei.reference,
        instructions: spei.instructions,
        qr_image_url: spei.qr_image_url,
        is_active: true,
      };
      if (speiId) {
        await api.companyPaymentMethods.update(companyId, speiId, payload, token);
      } else {
        const res = await api.companyPaymentMethods.create(companyId, payload, token);
        const created = (res.data?.method || (res as any).method || (res as any).data)?.id;
        if (created) setSpeiId(Number(created));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCash = async () => {
    if (!token || !user?.company_id) return;
    const companyId = user.company_id;
    setLoading(true);
    try {
      const payload = {
        type: 'cash' as const,
        is_active: !!cashActive,
        display_name: cash.display_name,
        instructions: cash.instructions,
        cash_limit_amount: typeof cash.cash_limit_amount === 'number' ? cash.cash_limit_amount : undefined,
        sort_order: typeof cash.sort_order === 'number' ? cash.sort_order : undefined,
      };
      if (cashId) {
        await api.companyPaymentMethods.update(companyId, cashId, payload, token);
      } else {
        const res = await api.companyPaymentMethods.create(companyId, payload, token);
        const created = (res.data?.method || (res as any).method || (res as any).data)?.id;
        if (created) setCashId(Number(created));
      }
    } finally {
      setLoading(false);
    }
  };

  // Load existing methods on mount
  useEffect(() => {
    const loadMethods = async () => {
      if (!token || !user?.company_id) {
        setInitializing(false);
        return;
      }
      try {
        const res = await api.companyPaymentMethods.list(user.company_id, token);
        const methods = (res.data as any) || res;
        const list: any[] = Array.isArray(methods?.data) ? methods.data : Array.isArray(methods) ? methods : [];
        for (const m of list) {
          if (m.type === 'cash') {
            setCashId(Number(m.id));
            setCashActive(!!m.is_active);
            setCash({
              display_name: m.display_name || 'Pago en efectivo',
              instructions: m.instructions || 'Pagar al recibir en sucursal',
              cash_limit_amount: typeof m.cash_limit_amount === 'number' ? m.cash_limit_amount : (m.cash_limit_amount ? Number(m.cash_limit_amount) : undefined),
              sort_order: typeof m.sort_order === 'number' ? m.sort_order : (m.sort_order ? Number(m.sort_order) : undefined),
            });
          }
          if (m.type === 'spei') {
            setSpeiId(Number(m.id));
            setSpei({
              display_name: m.display_name || "Transferencia SPEI",
              account_holder: m.account_holder || "",
              bank_name: m.bank_name || "",
              account_number: m.account_number || "",
              clabe: m.clabe || "",
              reference: m.reference || "",
              instructions: m.instructions || "",
              qr_image_url: m.qr_image_url || "",
            });
          }
        }
      } finally {
        setInitializing(false);
      }
    };
    loadMethods();
  }, [token, user?.company_id]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCardIcon className="h-6 w-6 text-emerald-600" /> Métodos de cobro
          </h1>
          <p className="text-slate-500">Configura los métodos de cobro disponibles para tu compañía.</p>
        </div>
      </div>

      <Tabs defaultValue="efectivo" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="efectivo">Efectivo</TabsTrigger>
          <TabsTrigger value="spei">SPEI</TabsTrigger>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
        </TabsList>

        {/* EFECTIVO */}
        <TabsContent value="efectivo">
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Efectivo en punto de venta</CardTitle>
                <CardDescription>Permite aceptar pagos en efectivo en sucursales o al entregar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cash-active" className="flex items-center gap-3 text-sm">
                    <input
                      id="cash-active"
                      type="checkbox"
                      checked={cashActive}
                      onChange={(e) => setCashActive(e.target.checked)}
                    />
                    Activar efectivo
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre para mostrar</Label>
                    <Input
                      placeholder="Pago en efectivo"
                      value={cash.display_name}
                      onChange={(e) => setCash({ ...cash, display_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Límite de efectivo (MXN)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="500.00"
                      value={typeof cash.cash_limit_amount === 'number' ? cash.cash_limit_amount : ''}
                      onChange={(e) => setCash({ ...cash, cash_limit_amount: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Instrucciones</Label>
                    <Input
                      placeholder="Pagar al recibir en sucursal"
                      value={cash.instructions}
                      onChange={(e) => setCash({ ...cash, instructions: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Orden</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={typeof cash.sort_order === 'number' ? cash.sort_order : ''}
                      onChange={(e) => setCash({ ...cash, sort_order: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveCash} className="w-full" disabled={loading || initializing}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SPEI */}
        <TabsContent value="spei">
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transferencia SPEI</CardTitle>
                <CardDescription>Configura los datos bancarios para que tus clientes realicen transferencias.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    Estos datos se mostrarán a los clientes. Guarda esta configuración en tu servidor vía API protegida.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre para mostrar</Label>
                    <Input
                      placeholder="Transferencia SPEI"
                      value={spei.display_name}
                      onChange={(e) => setSpei({ ...spei, display_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titular de la cuenta</Label>
                    <Input
                      placeholder="Mi Empresa SA de CV"
                      value={spei.account_holder}
                      onChange={(e) => setSpei({ ...spei, account_holder: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input
                      placeholder="BBVA, Banorte, Santander..."
                      value={spei.bank_name}
                      onChange={(e) => setSpei({ ...spei, bank_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número de cuenta</Label>
                    <Input
                      placeholder="0123456789"
                      value={spei.account_number}
                      onChange={(e) => setSpei({ ...spei, account_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CLABE</Label>
                    <Input
                      placeholder="18 dígitos"
                      value={spei.clabe}
                      onChange={(e) => setSpei({ ...spei, clabe: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Referencia</Label>
                    <Input
                      placeholder="Ej. PEDIDO-12345"
                      value={spei.reference}
                      onChange={(e) => setSpei({ ...spei, reference: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Instrucciones</Label>
                    <Input
                      placeholder="Enviar comprobante por WhatsApp"
                      value={spei.instructions}
                      onChange={(e) => setSpei({ ...spei, instructions: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>URL del QR (opcional)</Label>
                    <Input
                      placeholder="https://.../spei-qr.png"
                      value={spei.qr_image_url}
                      onChange={(e) => setSpei({ ...spei, qr_image_url: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSpei} className="w-full" disabled={loading || initializing}>
                  {loading ? 'Guardando...' : 'Guardar SPEI'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* STRIPE */}
        <TabsContent value="stripe">
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Stripe</CardTitle>
                    <CardDescription>Pagos con tarjeta. Administra las llaves por compañía (SaaS).</CardDescription>
                  </div>
                  <Link
                    className="text-sm text-emerald-700 hover:text-emerald-800 underline"
                    href="https://dashboard.stripe.com/"
                    target="_blank"
                  >
                    Ir al Stripe Dashboard
                  </Link>
                </div>
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

                <Button onClick={handleSaveStripe} className="w-full">Guardar llaves (demo)</Button>

                <Separator className="my-2" />

                
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
