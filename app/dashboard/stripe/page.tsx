"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard as CreditCardIcon, Landmark, WalletCards, Store, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";
import { useCompany } from "@/contexts/CompanyContext";
import { useLockedPlan } from "@/hooks/use-locked-plan";
import { useRouter } from "next/navigation";

export default function PaymentMethodsPage() {
  const { token, user } = useAuth();
  const { getPlanName } = useCompany();
  const { showLockedToast } = useLockedPlan();
  const router = useRouter();

  const planName = getPlanName();
  const isBasicPlan = planName === 'Básico';

  // Stripe
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(user?.company_id ? String(user.company_id) : null);
  const [stripeEditMode, setStripeEditMode] = useState(false);
  const [stripeSaving, setStripeSaving] = useState(false);
  const [secretKeyDirty, setSecretKeyDirty] = useState(false);
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
  const [speiActive, setSpeiActive] = useState(true);
  // Efectivo
  const [cashActive, setCashActive] = useState(true);
  const [cashId, setCashId] = useState<number | null>(null);
  const [cash, setCash] = useState({
    display_name: 'Pago en efectivo',
    instructions: 'Pagar al recibir en sucursal',
    cash_limit_amount: undefined as number | undefined,
    sort_order: 1 as number | undefined,
  });
  // Mercado Pago
  const [mercadoPago, setMercadoPago] = useState({
    display_name: "Mercado Pago",
    public_key: "",
    access_token: "",
    integrator_id: "",
    webhook_url: "",
    instructions: "",
  });
  const [mercadoPagoId, setMercadoPagoId] = useState<number | null>(null);
  const [mercadoPagoActive, setMercadoPagoActive] = useState(false);
  const [mercadoPagoAccessTokenDirty, setMercadoPagoAccessTokenDirty] = useState(false);
  // Loading flags
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [speiModalOpen, setSpeiModalOpen] = useState(false);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [mercadoPagoModalOpen, setMercadoPagoModalOpen] = useState(false);

  const handleSaveStripe = async (options?: { publishableKey?: string; secretKey?: string; enabled?: boolean }) => {
    if (!token) {
      alert('Necesitas iniciar sesión para guardar las llaves.');
      return;
    }
    const resolvedCompanyId = companyId ?? (user?.company_id ? String(user.company_id) : null);
    if (!resolvedCompanyId) {
      alert('No se encontró la compañía para guardar las llaves.');
      return;
    }

    try {
      setStripeSaving(true);
      const nextPublishable = options?.publishableKey ?? publishableKey;
      const nextSecret = options?.secretKey ?? secretKey;
      const nextEnabled = typeof options?.enabled === 'boolean' ? options.enabled : stripeEnabled;

      const payload: any = {
        stripe_publishable_key: nextPublishable || null,
        stripe_enabled: nextEnabled,
      };

      if (options?.secretKey !== undefined || secretKeyDirty) {
        payload.stripe_secret_key = nextSecret || null;
      }
      await api.companies.updateCompany(resolvedCompanyId, payload as any, token);
      setCompanyId(resolvedCompanyId);

      if (options?.publishableKey !== undefined) setPublishableKey(nextPublishable);
      if (options?.secretKey !== undefined) setSecretKey(nextSecret);
      setStripeEnabled(nextEnabled);

      setStripeEditMode(false);
    } catch (error) {
      console.error('Error guardando configuración de Stripe', error);
      alert('No se pudo guardar la configuración. Intenta de nuevo.');
    } finally {
      setStripeSaving(false);
    }
  };

  const handleSaveSpei = async (options?: { data?: typeof spei; isActive?: boolean }) => {
    if (!token || !user?.company_id) return;
    const companyId = user.company_id;
    setLoading(true);
    try {
      const nextData = options?.data ?? spei;
      const nextActive = typeof options?.isActive === 'boolean' ? options.isActive : speiActive;
      const payload = {
        type: 'spei' as const,
        display_name: nextData.display_name,
        account_holder: nextData.account_holder,
        bank_name: nextData.bank_name,
        account_number: nextData.account_number,
        clabe: nextData.clabe,
        reference: nextData.reference,
        instructions: nextData.instructions,
        qr_image_url: nextData.qr_image_url,
        is_active: !!nextActive,
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

  const handleSaveMercadoPago = async (options?: { data?: typeof mercadoPago; isActive?: boolean }) => {
    if (!token || !user?.company_id) return;
    const companyId = user.company_id;
    setLoading(true);
    try {
      const nextData = options?.data ?? mercadoPago;
      const nextActive = typeof options?.isActive === 'boolean' ? options.isActive : mercadoPagoActive;

      // Update Company Profile as well for the new fields if they exist
      const resolvedCompanyId = companyId ?? (user?.company_id ? String(user.company_id) : null);
      if (resolvedCompanyId) {
        const profilePayload: any = {
          mercadopago_enabled: nextActive,
          mercadopago_public_key: nextData.public_key || null,
        };

        if (options?.data?.access_token !== undefined || mercadoPagoAccessTokenDirty) {
          profilePayload.mercadopago_access_token = nextData.access_token || null;
        }

        await api.companies.updateCompany(String(resolvedCompanyId), profilePayload, token);
      }

      const methodPayload: any = {
        type: 'mercado_pago' as const,
        display_name: nextData.display_name,
        public_key: nextData.public_key,
        integrator_id: nextData.integrator_id,
        webhook_url: nextData.webhook_url,
        instructions: nextData.instructions,
        is_active: !!nextActive,
      };

      if (options?.data?.access_token !== undefined || mercadoPagoAccessTokenDirty) {
        methodPayload.access_token = nextData.access_token;
      } else {
        // Ensure we don't accidentally overwrite with empty if we are not dirty, 
        // but methodPayload needs to be complete for create usually. 
        // For update, partial might work depending on backend, but let's assume we send what we have if we are creating.
        if (!mercadoPagoId) {
          methodPayload.access_token = nextData.access_token;
        }
      }

      if (mercadoPagoId) {
        await api.companyPaymentMethods.update(companyId, mercadoPagoId, methodPayload, token);
      } else {
        const res = await api.companyPaymentMethods.create(companyId, methodPayload, token);
        const created = (res.data?.method || (res as any).method || (res as any).data)?.id;
        if (created) setMercadoPagoId(Number(created));
      }

      if (options?.isActive !== undefined) {
        setMercadoPagoActive(!!options.isActive);
      }
      if (options?.data) {
        setMercadoPago(options.data);
      }
    } catch (error) {
      console.error('Error guardando configuración de Mercado Pago', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCash = async (options?: { data?: typeof cash; isActive?: boolean }) => {
    if (!token || !user?.company_id) return;
    const companyId = user.company_id;
    setLoading(true);
    try {
      const nextData = options?.data ?? cash;
      const nextActive = typeof options?.isActive === 'boolean' ? options.isActive : cashActive;
      const payload = {
        type: 'cash' as const,
        is_active: !!nextActive,
        display_name: nextData.display_name,
        instructions: nextData.instructions,
        cash_limit_amount: typeof nextData.cash_limit_amount === 'number' ? nextData.cash_limit_amount : undefined,
        sort_order: typeof nextData.sort_order === 'number' ? nextData.sort_order : undefined,
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
            setSpeiActive(!!m.is_active);
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
          if (m.type === 'mercado_pago') {
            setMercadoPagoId(Number(m.id));
            setMercadoPagoActive(!!m.is_active);
            setMercadoPago({
              display_name: m.display_name || "Mercado Pago",
              public_key: m.public_key || "",
              access_token: m.access_token || "",
              integrator_id: m.integrator_id || "",
              webhook_url: m.webhook_url || "",
              instructions: m.instructions || "",
            });
          }
        }
      } finally {
        setInitializing(false);
      }
    };
    loadMethods();
  }, [token, user?.company_id]);

  // Load Company Profile settings (Stripe and Mercado Pago flags/keys)
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const loadCompanySettings = async () => {
      try {
        const res = await api.userCompanies.get(token);
        const companyData: any = res?.data ?? res;
        const company = companyData?.data ?? companyData;
        if (!company) return;

        if (isMounted) {
          // Stripe
          setPublishableKey(company.stripe_publishable_key ?? '');
          setSecretKey(company.stripe_secret_key ?? '');
          setSecretKeyDirty(false);
          setStripeEnabled(Boolean(company.stripe_enabled));

          // Mercado Pago
          setMercadoPagoActive(Boolean(company.mercadopago_enabled));
          setMercadoPago(prev => ({
            ...prev,
            public_key: company.mercadopago_public_key ?? prev.public_key,
            access_token: company.mercadopago_access_token ?? prev.access_token,
          }));
          setMercadoPagoAccessTokenDirty(false);

          const resolvedId = company.id ?? company.company_id ?? company.data?.id;
          if (resolvedId) {
            setCompanyId(String(resolvedId));
          }
        }
      } catch (error) {
        console.error('[PaymentMethodsPage] Error loading company settings', error);
      }
    };

    loadCompanySettings();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleToggleCash = async (checked: boolean) => {
    setCashActive(checked);
    await handleSaveCash({ isActive: checked });
  };

  const handleToggleSpei = async (checked: boolean) => {
    setSpeiActive(checked);
    await handleSaveSpei({ isActive: checked });
  };

  const handleToggleMercadoPago = async (checked: boolean) => {
    setMercadoPagoActive(checked);
    if (!checked) {
      await handleSaveMercadoPago({ isActive: false });
      return;
    }
    if (!mercadoPago.public_key || !mercadoPago.access_token) {
      setMercadoPagoModalOpen(true);
      return;
    }
    await handleSaveMercadoPago({ isActive: true });
  };

  const handleToggleStripe = async (checked: boolean) => {
    if (!checked) {
      setStripeEnabled(false);
      await handleSaveStripe({ enabled: false });
      return;
    }

    if (!publishableKey || !secretKey) {
      setStripeModalOpen(true);
    } else {
      setStripeEnabled(true);
      await handleSaveStripe({ enabled: true });
    }
  };

  const cardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setCashModalOpen(true)}
          onKeyDown={(event) => cardKeyDown(event, () => setCashModalOpen(true))}
          className="transition hover:border-emerald-200 hover:shadow"
        >
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Efectivo</CardTitle>
              <CardDescription>Pagos presenciales o contra entrega.</CardDescription>
            </div>
            <div
              className="flex items-center gap-2"
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Switch
                checked={cashActive}
                disabled={loading || initializing}
                onCheckedChange={handleToggleCash}
              />
              <span className="text-sm text-slate-500">{cashActive ? "Activo" : "Inactivo"}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <WalletCards className="h-4 w-4 text-emerald-600" />
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{cash.display_name}</span>
                <span>{cash.instructions || "Pagar al recibir en sucursal"}</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={(event) => {
                event.stopPropagation();
                setCashModalOpen(true);
              }}
            >
              Configurar efectivo
            </Button>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => setSpeiModalOpen(true)}
          onKeyDown={(event) => cardKeyDown(event, () => setSpeiModalOpen(true))}
          className="transition hover:border-emerald-200 hover:shadow"
        >
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Transferencia SPEI</CardTitle>
              <CardDescription>Comparte tus datos bancarios con clientes.</CardDescription>
            </div>
            <div
              className="flex items-center gap-2"
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Switch
                checked={speiActive}
                disabled={loading || initializing}
                onCheckedChange={handleToggleSpei}
              />
              <span className="text-sm text-slate-500">{speiActive ? "Activo" : "Inactivo"}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Landmark className="h-4 w-4 text-emerald-600" />
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{spei.display_name}</span>
                <span>{spei.bank_name ? `${spei.bank_name} · ${spei.account_holder}` : "Configura tu cuenta bancaria"}</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={(event) => {
                event.stopPropagation();
                setSpeiModalOpen(true);
              }}
            >
              Editar datos SPEI
            </Button>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => isBasicPlan ? showLockedToast() : setStripeModalOpen(true)}
          onKeyDown={(event) => cardKeyDown(event, () => isBasicPlan ? showLockedToast() : setStripeModalOpen(true))}
          className={`transition ${isBasicPlan ? 'opacity-80' : 'hover:border-emerald-200 hover:shadow'}`}
        >
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Stripe
                {isBasicPlan && <Lock className="h-4 w-4 text-slate-400" />}
              </CardTitle>
              <CardDescription>Pagos con tarjeta conectados a tu cuenta.</CardDescription>
            </div>
            <div
              className="flex items-center gap-2"
              onClick={(event) => {
                event.stopPropagation();
                if (isBasicPlan) showLockedToast();
              }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Switch
                checked={stripeEnabled}
                disabled={stripeSaving || initializing}
                onCheckedChange={(checked) => isBasicPlan ? showLockedToast() : handleToggleStripe(checked)}
              />
              <span className="text-sm text-slate-500">{stripeEnabled ? "Activo" : "Inactivo"}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <CreditCardIcon className="h-4 w-4 text-emerald-600" />
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">
                  {publishableKey ? "Llaves configuradas" : "Sin llaves registradas"}
                </span>
                <span>Administra las llaves directamente desde el modal.</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              disabled={isBasicPlan}
              onClick={(event) => {
                event.stopPropagation();
                if (isBasicPlan) {
                  showLockedToast();
                  return;
                }
                setStripeModalOpen(true);
              }}
            >
              {isBasicPlan ? "Restringido (Plan Básico)" : "Administrar Stripe"}
            </Button>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => isBasicPlan ? showLockedToast() : setMercadoPagoModalOpen(true)}
          onKeyDown={(event) => cardKeyDown(event, () => isBasicPlan ? showLockedToast() : setMercadoPagoModalOpen(true))}
          className={`transition ${isBasicPlan ? 'opacity-80' : 'hover:border-emerald-200 hover:shadow'}`}
        >
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Mercado Pago
                {isBasicPlan && <Lock className="h-4 w-4 text-slate-400" />}
              </CardTitle>
              <CardDescription>Integra cobros con QR y links de pago.</CardDescription>
            </div>
            <div
              className="flex items-center gap-2"
              onClick={(event) => {
                event.stopPropagation();
                if (isBasicPlan) showLockedToast();
              }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <Switch
                checked={mercadoPagoActive}
                disabled={loading || initializing}
                onCheckedChange={(checked) => isBasicPlan ? showLockedToast() : handleToggleMercadoPago(checked)}
              />
              <span className="text-sm text-slate-500">{mercadoPagoActive ? "Activo" : "Inactivo"}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Store className="h-4 w-4 text-emerald-600" />
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{mercadoPago.display_name}</span>
                <span>
                  {mercadoPago.public_key
                    ? "Credenciales configuradas"
                    : "Configura tu integración primero"}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              disabled={isBasicPlan}
              onClick={(event) => {
                event.stopPropagation();
                if (isBasicPlan) {
                  showLockedToast();
                  return;
                }
                setMercadoPagoModalOpen(true);
              }}
            >
              {isBasicPlan ? "Restringido (Plan Básico)" : "Administrar Mercado Pago"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Cash modal */}
      <Dialog open={cashModalOpen} onOpenChange={setCashModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurar efectivo</DialogTitle>
            <DialogDescription>
              Personaliza las instrucciones para tus pedidos pagados en sucursal o contra entrega.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleSaveCash();
              setCashModalOpen(false);
            }}
          >
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
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCashModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || initializing}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mercado Pago modal */}
      <Dialog open={mercadoPagoModalOpen} onOpenChange={setMercadoPagoModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configurar Mercado Pago</DialogTitle>
            <DialogDescription>
              Ingresa las credenciales y datos requeridos por Mercado Pago para autorizar tus cobros.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleSaveMercadoPago();
              setMercadoPagoModalOpen(false);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre para mostrar</Label>
                <Input
                  placeholder="Mercado Pago"
                  value={mercadoPago.display_name}
                  onChange={(e) => setMercadoPago({ ...mercadoPago, display_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Public Key</Label>
                <Input
                  placeholder="APP_USR-XXXXXXXXXXXXXXXX"
                  value={mercadoPago.public_key}
                  onChange={(e) => setMercadoPago({ ...mercadoPago, public_key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Access Token</Label>
                <Input
                  type="password"
                  placeholder="APP_USR-XXXXXXXXXXXXXXX"
                  value={mercadoPago.access_token}
                  onChange={(e) => {
                    setMercadoPago({ ...mercadoPago, access_token: e.target.value });
                    setMercadoPagoAccessTokenDirty(true);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Integrator ID (opcional)</Label>
                <Input
                  placeholder="dev_123456789"
                  value={mercadoPago.integrator_id}
                  onChange={(e) => setMercadoPago({ ...mercadoPago, integrator_id: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://midominio.com/api/mercadopago/webhook"
                  value={mercadoPago.webhook_url}
                  onChange={(e) => setMercadoPago({ ...mercadoPago, webhook_url: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Instrucciones internas</Label>
                <Input
                  placeholder="Ej. Revisar pagos en Mercado Pago Dashboard"
                  value={mercadoPago.instructions}
                  onChange={(e) => setMercadoPago({ ...mercadoPago, instructions: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setMercadoPagoModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || initializing}>
                {loading ? 'Guardando...' : 'Guardar configuración'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* SPEI modal */}
      <Dialog open={speiModalOpen} onOpenChange={setSpeiModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configurar transferencia SPEI</DialogTitle>
            <DialogDescription>
              Agrega los datos bancarios que compartirás con tus clientes.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              Estos datos se mostrarán a los clientes. Guarda esta configuración en tu servidor vía API protegida.
            </AlertDescription>
          </Alert>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleSaveSpei();
              setSpeiModalOpen(false);
            }}
          >
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
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setSpeiModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || initializing}>
                {loading ? 'Guardando...' : 'Guardar SPEI'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stripe modal */}
      <Dialog open={stripeModalOpen} onOpenChange={setStripeModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Administrar llaves de Stripe</DialogTitle>
            <DialogDescription>Conecta tu cuenta de Stripe para aceptar pagos con tarjeta.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleSaveStripe();
              setStripeEnabled(Boolean((publishableKey && publishableKey.length) || (secretKey && secretKey.length)));
              setStripeModalOpen(false);
            }}
          >
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
                onChange={(e) => {
                  setSecretKey(e.target.value);
                  setSecretKeyDirty(true);
                }}
              />
            </div>
            <Link
              className="text-sm text-emerald-700 hover:text-emerald-800 underline inline-flex"
              href="https://dashboard.stripe.com/"
              target="_blank"
            >
              Ir al Stripe Dashboard
            </Link>
            <Separator className="my-2" />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStripeModalOpen(false);
                  setStripeEnabled(Boolean((publishableKey && publishableKey.length) || (secretKey && secretKey.length)));
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={stripeSaving}>
                {stripeSaving ? 'Guardando...' : 'Guardar llaves'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
