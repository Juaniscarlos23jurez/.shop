"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api/api";
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Smartphone,
  Palette,
  Link as LinkIcon,
  Save,
  Loader2,
  Copy,
  Check
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  bgColor?: string;
  textColor?: string;
}



export default function SocialBioPage() {
  const { company } = useCompany();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialSettings, setInitialSettings] = useState<any>(null);

  // Stats / Info from Business
  const businessName = company?.name || "Tu Negocio";
  const businessLogo = company?.logo_url || company?.image_url || "";

  // Compute public URL from company slug or name
  const slugifyName = (name: string) =>
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const companySlug = company?.slug || (company?.name ? slugifyName(company.name) : "");
  const publicBioUrl = companySlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/bio/${companySlug}`
    : "";

  const handleCopyUrl = async () => {
    if (!publicBioUrl) return;
    try {
      await navigator.clipboard.writeText(publicBioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Error al copiar", variant: "destructive" });
    }
  };

  // State for Social Bio
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#1c08af"); // base blue
  const [buttonTextColor, setButtonTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#960303"); // base red
  const [globalTextColor, setGlobalTextColor] = useState("#ffffff");
  const [bioDescription, setBioDescription] = useState("¡Bienvenidos a nuestra página oficial! Encuentra todos nuestros enlaces aquí.");

  const CONTEXT_KEY = "social_bio_settings";

  useEffect(() => {
    const loadSettings = async () => {
      if (!token || !user?.company_id) return;
      try {
        setLoading(true);

        // Fetch global UI settings for default colors
        const globalRes = await api.uiSettings.get(
          {
            company_id: user.company_id,
            context: "public_store_home",
          },
          token
        );

        let defaultPrimary = "#10b981";
        let defaultBg = "#f8fafc";

        if (globalRes.success && globalRes.data) {
          const globalData: any = (globalRes.data as any).data || globalRes.data;
          if (globalData.cart_button_color) defaultPrimary = globalData.cart_button_color;
          if (globalData.background_color) defaultBg = globalData.background_color;
        }

        // Fetch specific Bio Link settings
        const res = await api.uiSettings.get(
          {
            company_id: user.company_id,
            context: CONTEXT_KEY,
          },
          token
        );

        if (res.success && res.data) {
          const settings: any = (res.data as any).data || res.data;
          if (settings) {
            setLinks(settings.links || []);
            setInitialSettings(settings);
          } else {
            const defaults = {
              links: [],
              primaryColor: defaultPrimary,
              buttonTextColor: "#ffffff",
              backgroundColor: defaultBg,
              globalTextColor: "#ffffff",
              bioDescription: bioDescription,
            };
            setPrimaryColor(defaultPrimary);
            setBackgroundColor(defaultBg);
            setInitialSettings(defaults);
          }
        } else {
          setPrimaryColor(defaultPrimary);
          setBackgroundColor(defaultBg);
        }
      } catch (e) {
        console.error("Error loading social bio settings", e);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [token, user?.company_id, bioDescription]);

  // Check for changes
  const hasChanges = JSON.stringify({
    links,
    primaryColor,
    buttonTextColor,
    backgroundColor,
    globalTextColor,
    bioDescription
  }) !== JSON.stringify(initialSettings);

  const handleSave = async () => {
    if (!token || !user?.company_id) return;
    try {
      setSaving(true);
      const payload = {
        company_id: user.company_id,
        context: CONTEXT_KEY,
        links,
        primaryColor,
        buttonTextColor,
        backgroundColor,
        globalTextColor,
        bioDescription,
      };

      const res = await api.uiSettings.upsert(payload, token);
      if (res.success) {
        setInitialSettings({
          links,
          primaryColor,
          buttonTextColor,
          backgroundColor,
          globalTextColor,
          bioDescription
        });
        toast({
          title: "¡Éxito!",
          description: "Tu Bio Link ha sido guardado correctamente.",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar la configuración.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Error saving social bio", e);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    const newLink: SocialLink = {
      id: Math.random().toString(36).substr(2, 9),
      label: "Nuevo Enlace",
      url: "https://",
      bgColor: primaryColor,
      textColor: buttonTextColor,
    };
    setLinks([...links, newLink]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const updateLink = (id: string, field: keyof SocialLink, value: string) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  if (loading && !company) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">

        {/* Settings Column */}
        <div className="w-full lg:w-3/5 space-y-6">
          {/* Public URL Banner */}
          {companySlug && (
            <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
              <CardContent className="py-4 px-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">Tu URL pública de Bio Link</p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Pega este link en la bio de tu TikTok, Instagram y redes sociales.
                      </p>
                      <p className="text-xs font-mono text-emerald-800 mt-1 break-all">{publicBioUrl}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                      onClick={handleCopyUrl}
                    >
                      {copied ? <Check className="h-4 w-4 mr-1 text-emerald-600" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? "Copiado!" : "Copiar"}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => window.open(publicBioUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver página
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bio Link Personalizado</h1>
              <p className="text-slate-500 mt-1">
                Crea una página de aterrizaje perfecta para tu TikTok, Instagram y más.
              </p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving || !hasChanges}
              className={`transition-all duration-300 ${
                hasChanges 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200" 
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed contrast-75"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : hasChanges ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4 text-emerald-500" />
                  Todo al día
                </>
              )}
            </Button>
          </div>

          <div className="space-y-6">
            {/* Profile Info */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-500" />
                  Información del Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Descripción de la Bio</Label>
                  <Input
                    value={bioDescription}
                    onChange={(e) => setBioDescription(e.target.value)}
                    placeholder="Escribe algo sobre tu negocio..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Personalización Visual moved from Diseño Tab */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5 text-emerald-500" />
                  Diseño Global
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Fondo de la Página</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border border-slate-200"
                      />
                      <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="h-8 text-xs font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Color de Texto (Nombre/Bio)</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={globalTextColor}
                        onChange={(e) => setGlobalTextColor(e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border border-slate-200"
                      />
                      <Input value={globalTextColor} onChange={(e) => setGlobalTextColor(e.target.value)} className="h-8 text-xs font-mono" />
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Custom Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-900">
                  <LinkIcon className="h-5 w-5 text-emerald-500" />
                  Enlaces Personalizados
                </h3>
                <Button variant="outline" size="sm" onClick={addLink} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir Enlace
                </Button>
              </div>

              <div className="space-y-4">
                {links.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400">No hay enlaces añadidos aún.</p>
                    <Button variant="link" onClick={addLink} className="text-emerald-600 mt-2">Haz clic para añadir tu primer enlace</Button>
                  </div>
                ) : (
                  links.map((link) => (
                    <Card key={link.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex-1 space-y-3">
                          <Input
                            placeholder="Título del enlace (ej: Nuestro Menú)"
                            value={link.label}
                            onChange={(e) => updateLink(link.id, "label", e.target.value)}
                            className="font-medium"
                          />
                          <Input
                            placeholder="URL de destino"
                            value={link.url}
                            onChange={(e) => updateLink(link.id, "url", e.target.value)}
                            className="text-slate-500 h-8 text-xs"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-[10px] uppercase text-slate-400">Fondo</Label>
                            <input
                              type="color"
                              value={link.bgColor || primaryColor}
                              onChange={(e) => updateLink(link.id, "bgColor", e.target.value)}
                              className="h-6 w-6 cursor-pointer rounded border border-slate-200"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-[10px] uppercase text-slate-400">Texto</Label>
                            <input
                              type="color"
                              value={link.textColor || buttonTextColor}
                              onChange={(e) => updateLink(link.id, "textColor", e.target.value)}
                              className="h-6 w-6 cursor-pointer rounded border border-slate-200"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => removeLink(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Column (Mobile Mockup) */}
        <div className="w-full lg:w-2/5 flex flex-col items-center">
          <div className="sticky top-10">
            <h3 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-widest text-slate-500 mb-6">
              <Smartphone className="h-4 w-4" />
              Vista Previa en Vivo
            </h3>

            <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden ring-4 ring-slate-800 ring-offset-2">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>

              {/* Content Area */}
              <div className="absolute inset-0 overflow-y-auto overflow-x-hidden hide-scrollbar" style={{ backgroundColor }}>
                <div className="flex flex-col items-center pt-12 pb-8 px-6">
                  {/* Business Brand */}
                  <div className="w-20 h-20 rounded-full border-2 border-white shadow-md overflow-hidden bg-white mb-4">
                    {businessLogo ? (
                      <img src={businessLogo} alt={businessName} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold text-2xl">
                        {businessName[0]}
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-center mb-1" style={{ color: globalTextColor }}>{businessName}</h4>
                  <p className="text-center text-xs px-4 mb-6 leading-relaxed opacity-80" style={{ color: globalTextColor }}>{bioDescription}</p>

                  {/* Other Links */}
                  <div className="w-full space-y-3">
                    {links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex flex-col items-center justify-center py-4 px-4 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                        style={{
                          backgroundColor: link.bgColor || primaryColor,
                          color: link.textColor || buttonTextColor,
                        }}
                      >
                        <span className="font-semibold text-sm text-center">
                          {link.label || "Sin título"}
                        </span>
                      </a>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-12 flex items-center gap-2 opacity-30 grayscale hover:opacity-100 transition-opacity">
                    <Globe className="h-3 w-3" />
                    <span className="text-[10px] font-bold tracking-tighter uppercase">Power by {businessName}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-6 text-center max-w-[280px]">
              Tus cambios se reflejan automáticamente en esta vista previa móvil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
