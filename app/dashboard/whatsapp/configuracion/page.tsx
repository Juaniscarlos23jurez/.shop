"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Smartphone,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  AlertTriangle,
  Key,
  Phone,
  Globe,
  Shield,
  Upload,
  Download,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/api";
import { WhatsAppTemplate } from "@/types/whatsapp";
import { Toaster } from "@/components/ui/toaster";

interface WhatsAppSettings {
  appId: string;
  appSecret: string;
  whatsappBusinessAccountId: string;
  accessToken: string;
  phoneId: string;
  webhookUrl: string;
  verifyToken: string;
  embeddedLoginEnabled: boolean;
  hasFacebookAppSecret: boolean;
  hasWhatsAppAccessToken: boolean;
  businessProfile: {
    about: string;
    address: string;
    email: string;
    phone: string;
    website: string;
  };
  isConnected: boolean;
  lastSyncAt?: string;
}

export default function WhatsAppConfiguracion() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingTemplates, setSyncingTemplates] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [settings, setSettings] = useState<WhatsAppSettings>({
    appId: '',
    appSecret: '',
    whatsappBusinessAccountId: '',
    accessToken: '',
    phoneId: '',
    webhookUrl: '',
    verifyToken: '',
    embeddedLoginEnabled: false,
    hasFacebookAppSecret: false,
    hasWhatsAppAccessToken: false,
    businessProfile: {
      about: '',
      address: '',
      email: '',
      phone: '',
      website: ''
    },
    isConnected: false
  });

  const step1Completed = settings.isConnected;
  const step2TokenStored = settings.hasWhatsAppAccessToken;
  const step2PhoneLinked = Boolean(settings.phoneId);
  const step2Completed = step2TokenStored && step2PhoneLinked;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    if (!user?.company_id || !token) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/proxy/api/companies/${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success && result.data) {
        const companyData = result.data;
        const webhookUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/api/whatsapp/webhook`
          : '';

        setSettings({
          appId: companyData.facebook_app_id || '',
          appSecret: '',
          whatsappBusinessAccountId: companyData.whatsapp_business_account_id || '',
          accessToken: '',
          phoneId: companyData.whatsapp_phone_number_id || '',
          webhookUrl: webhookUrl,
          verifyToken: companyData.whatsapp_verify_token || '',
          embeddedLoginEnabled: false,
          businessProfile: {
            about: companyData.description || '',
            address: companyData.address || '',
            email: companyData.email || '',
            phone: companyData.phone || '',
            website: companyData.website || ''
          },
          isConnected: companyData.whatsapp_webhook_configured || false,
          lastSyncAt: companyData.updated_at,
          hasFacebookAppSecret: companyData.has_facebook_app_secret || false,
          hasWhatsAppAccessToken: companyData.has_whatsapp_access_token || false
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!user?.company_id || !token) return;

    try {
      const response = await (api as any).whatsapp.getTemplates(
        String(user.company_id),
        token
      );

      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.company_id || !token) return;

    try {
      setSaving(true);
      const response = await (api as any).whatsapp.updateSettings(
        String(user.company_id),
        settings,
        token
      );

      if (response.success) {
        toast({
          title: "Configuración guardada",
          description: "Los cambios se han guardado correctamente",
        });

        router.push('/dashboard/whatsapp/monitor');
      } else {
        throw new Error(response.message || 'Error al guardar');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!user?.company_id || !token) return;

    try {
      setTestingConnection(true);
      const response = await (api as any).whatsapp.testConnection(
        String(user.company_id),
        token
      );

      setSettings(prev => ({ ...prev, isConnected: true }));
      toast({
        title: "Conexión exitosa",
        description: "La conexión con WhatsApp Business está activa",
      });
    } catch (error) {
      setSettings(prev => ({ ...prev, isConnected: false }));
      toast({
        title: "Error de conexión",
        description: "No se pudo establecer conexión con WhatsApp Business",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleConnectWebhook = async () => {
    if (!user?.company_id || !token) return;

    try {
      const response = await fetch(`/api/proxy/api/whatsapp/companies/${user.company_id}/settings/connect-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          app_id: settings.appId,
          app_secret: settings.appSecret
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Webhook conectado",
          description: "El webhook se ha configurado correctamente",
        });
      } else {
        throw new Error(result.message || 'Error al conectar webhook');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo conectar el webhook",
        variant: "destructive",
      });
    }
  };

  const handleConfigure = async () => {
    if (!user?.company_id || !token) return;

    try {
      const payload: Record<string, string> = {
        business_account_id: settings.whatsappBusinessAccountId,
      };

      if (settings.accessToken) {
        payload.access_token = settings.accessToken;
      }

      if (settings.phoneId) {
        payload.phone_number_id = settings.phoneId;
      }

      const response = await fetch(`/api/proxy/api/whatsapp/companies/${user.company_id}/settings/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setSettings(prev => ({
          ...prev,
          isConnected: true,
          hasWhatsAppAccessToken: (!!settings.accessToken) || prev.hasWhatsAppAccessToken,
          accessToken: ''
        }));
        toast({
          title: "WhatsApp configurado",
          description: "Token verificado y cuenta conectada correctamente",
        });
      } else {
        throw new Error(result.message || 'Error en la configuración');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    }
  };

  const handleSyncTemplates = async () => {
    if (!user?.company_id || !token) return;

    try {
      setSyncingTemplates(true);
      const response = await api.whatsapp.getTemplates(
        String(user.company_id),
        token
      );

      setSettings(prev => ({ ...prev, lastSyncAt: new Date().toISOString() }));
      fetchTemplates();
      toast({
        title: "Sincronización completada",
        description: "Las plantillas se han sincronizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo sincronizar las plantillas",
        variant: "destructive",
      });
    } finally {
      setSyncingTemplates(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "El texto se ha copiado al portapapeles",
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configuración de Meta</h2>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/whatsapp/monitor')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Verificar
          </Button>
{/* 
          <div className="flex items-center space-x-2">
            <Switch
              id="embedded-login-header"
              checked={settings.embeddedLoginEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, embeddedLoginEnabled: checked })
              }
            />
            <Label htmlFor="embedded-login-header" className="text-sm">
              Inicio de sesión incrustado
            </Label>
          </div>
          */}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Step 1: Facebook Developer Account and Facebook App */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Paso 1: Cuenta de Desarrollador de Facebook y App de Facebook
              </CardTitle>
              <div className="flex items-center gap-2 text-sm">
                {step1Completed ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Webhook conectado correctamente con Meta.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-600">Falta conectar el webhook para completar este paso.</span>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appId">ID de la App de Facebook</Label>
              <Input
                id="appId"
                value={settings.appId}
                onChange={(e) => setSettings({ ...settings, appId: e.target.value })}
                placeholder="Ingresa tu ID de la app de Facebook"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appSecret" className="flex items-center gap-2">
                Secreto de la App de Facebook
                {settings.hasFacebookAppSecret && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </Label>
              <Input
                id="appSecret"
                type="password"
                value={settings.appSecret}
                onChange={(e) => setSettings({ ...settings, appSecret: e.target.value })}
                placeholder="Ingresa tu secreto de la app de Facebook"
              />
              <p className="text-xs text-muted-foreground">
                Este valor no se almacena por seguridad. Deberás ingresarlo cada vez que configures el webhook.
                {settings.hasFacebookAppSecret && (
                  <span className="ml-2 text-green-600">Configurado</span>
                )}
              </p>
            </div>

            <div className="flex justify-end">
              <Button className="bg-green-500 hover:bg-green-600" onClick={handleConnectWebhook}>
                Conectar Webhook
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: WhatsApp Integration Configuration */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Paso 2: Configuración de integración de WhatsApp
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  {step2TokenStored ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={step2TokenStored ? "text-green-700" : "text-amber-600"}>
                    Token {step2TokenStored ? "guardado" : "pendiente"}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  {step2PhoneLinked ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={step2PhoneLinked ? "text-green-700" : "text-amber-600"}>
                    Número {step2PhoneLinked ? "sincronizado" : "no sincronizado"}
                  </span>
                </div>
                {step2Completed && (
                  <span className="text-green-700 font-medium">Integración validada con Meta.</span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsappBusinessAccountId">ID de cuenta de WhatsApp Business</Label>
              <Input
                id="whatsappBusinessAccountId"
                value={settings.whatsappBusinessAccountId}
                onChange={(e) => setSettings({ ...settings, whatsappBusinessAccountId: e.target.value })}
                placeholder="Ingresa tu ID de cuenta de WhatsApp Business"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken" className="flex items-center gap-2">
                Token de acceso de WhatsApp
                {settings.hasWhatsAppAccessToken && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </Label>
              <div className="relative">
                <Input
                  id="accessToken"
                  type={showAccessToken ? "text" : "password"}
                  value={settings.accessToken}
                  onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
                  placeholder={settings.hasWhatsAppAccessToken
                    ? "Token ya configurado. Ingrésalo solo si deseas reemplazarlo."
                    : "Ingresa tu token de acceso de WhatsApp"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowAccessToken(!showAccessToken)}
                >
                  {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-10 top-0 h-full px-3"
                  onClick={() => copyToClipboard(settings.accessToken)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="bg-green-500 hover:bg-green-600" onClick={handleConfigure}>
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  );
}