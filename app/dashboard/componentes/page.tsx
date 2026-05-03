"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api/api";
import { useAuth } from "@/contexts/AuthContext";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as Lucide from "lucide-react";
const { Megaphone, Sparkles, LayoutTemplate, MousePointerClick, Palette, ShoppingCart, Download, MousePointer, Monitor, Menu, Laptop, Star, Type, Square, Crown } = Lucide as any;

export default function ComponentesPlaygroundPage() {
  const { token, user } = useAuth();
  const [openDemoModal, setOpenDemoModal] = useState(false);

  // Banner state
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerText, setBannerText] = useState(
    "Lanza aquí un mensaje corto de promoción o anuncio importante."
  );
  const [bannerButtonLabel, setBannerButtonLabel] = useState("Ver más");
  const [bannerButtonUrl, setBannerButtonUrl] = useState("");
  const [bannerColor, setBannerColor] = useState("#059669"); // emerald-600 por defecto

  // Popup state
  const [popupEnabled, setPopupEnabled] = useState(true);
  const [popupImageUrl, setPopupImageUrl] = useState("");
  const [popupImageFile, setPopupImageFile] = useState<File | null>(null);
  const [popupTitle, setPopupTitle] = useState("Ejemplo de modal");
  const [popupDescription, setPopupDescription] = useState(
    "Aquí puedes previsualizar cómo se vería un mensaje importante, un formulario o una promoción en un modal."
  );
  const [popupButtonLabel, setPopupButtonLabel] = useState("Ir a la promo");
  const [popupButtonUrl, setPopupButtonUrl] = useState("https://tutienda.com/promo");
  const [popupButtonColor, setPopupButtonColor] = useState("#059669");


  // Custom design colors state
  const [cartButtonColor, setCartButtonColor] = useState("#059669"); // emerald-600 por defecto
  const [cartIconColor, setCartIconColor] = useState("#ffffff"); // blanco por defecto
  const [navigationBarColor, setNavigationBarColor] = useState("#1f2937"); // gray-800 por defecto
  const [downloadAppColor, setDownloadAppColor] = useState("#3b82f6"); // blue-500 por defecto
  const [backgroundColor, setBackgroundColor] = useState("#f9fafb"); // gray-50 por defecto

  // Loyality design colors
  const [primaryColor, setPrimaryColor] = useState("#059669"); // verde Starbucks
  const [rewardAccentColor, setRewardAccentColor] = useState("#eab308"); // dorado estrellas
  const [surfaceColor, setSurfaceColor] = useState("#ffffff"); // blanco para tarjetas
  const [buttonTextColor, setButtonTextColor] = useState("#ffffff"); // texto sobre primario

  // Loading / saving state
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const CONTEXT_KEY = "public_store_home";

  // Load existing settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      if (!token || !user?.company_id) return;
      try {
        setLoadingSettings(true);
        setSaveMessage(null);
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
            if (typeof settings.banner_enabled === "boolean") setBannerEnabled(settings.banner_enabled);
            if (typeof settings.banner_text === "string") setBannerText(settings.banner_text);
            if (typeof settings.banner_button_label === "string") setBannerButtonLabel(settings.banner_button_label);
            if (typeof settings.banner_button_url === "string") setBannerButtonUrl(settings.banner_button_url);
            if (typeof settings.banner_color === "string") setBannerColor(settings.banner_color);

            if (typeof settings.popup_enabled === "boolean") setPopupEnabled(settings.popup_enabled);
            if (typeof settings.popup_image_url === "string") setPopupImageUrl(settings.popup_image_url);
            if (typeof settings.popup_title === "string") setPopupTitle(settings.popup_title);
            if (typeof settings.popup_description === "string") setPopupDescription(settings.popup_description);
            if (typeof settings.popup_button_label === "string") setPopupButtonLabel(settings.popup_button_label);
            if (typeof settings.popup_button_url === "string") setPopupButtonUrl(settings.popup_button_url);
            if (typeof settings.popup_button_color === "string") setPopupButtonColor(settings.popup_button_color);

            // Cargar colores de diseño personalizado
            if (typeof settings.cart_button_color === "string") setCartButtonColor(settings.cart_button_color);
            if (typeof settings.cart_icon_color === "string") setCartIconColor(settings.cart_icon_color);
            if (typeof settings.navigation_bar_color === "string") setNavigationBarColor(settings.navigation_bar_color);
            if (typeof settings.download_app_color === "string") setDownloadAppColor(settings.download_app_color);
            if (typeof settings.background_color === "string") setBackgroundColor(settings.background_color);

            // Cargar colores loyality
            if (typeof settings.primary_color === "string") setPrimaryColor(settings.primary_color);
            if (typeof settings.reward_accent_color === "string") setRewardAccentColor(settings.reward_accent_color);
            if (typeof settings.surface_color === "string") setSurfaceColor(settings.surface_color);
            if (typeof settings.button_text_color === "string") setButtonTextColor(settings.button_text_color);
          }
        }
      } catch (e) {
        console.error("Error loading UI settings", e);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, [token, user?.company_id]);


  const handleSave = async () => {
    if (!token || !user?.company_id) return;
    console.log("[UI Settings] handleSave iniciado", {
      hasToken: !!token,
      companyId: user.company_id,
      popupEnabled,
      currentPopupImageUrl: popupImageUrl,
      hasNewPopupImageFile: !!popupImageFile,
    });

    try {
      setSavingSettings(true);
      setSaveMessage(null);

      let finalPopupImageUrl = popupImageUrl;

      if (popupImageFile) {
        try {
          console.log("[UI Settings] Subiendo nueva imagen de pop-up a Firebase Storage", {
            name: popupImageFile.name,
            size: popupImageFile.size,
            type: popupImageFile.type,
          });

          const filePath = `popup-images/${user.company_id}/${Date.now()}_${popupImageFile.name}`;
          const storageRef = ref(storage, filePath);

          console.log("[UI Settings] Ruta de Storage generada", { filePath });

          const uploadResult = await uploadBytes(storageRef, popupImageFile);
          console.log("[UI Settings] Upload completado", {
            fullPath: uploadResult.metadata.fullPath,
            size: uploadResult.metadata.size,
          });

          finalPopupImageUrl = await getDownloadURL(storageRef);
          console.log("[UI Settings] URL pública obtenida de Firebase Storage", {
            finalPopupImageUrl,
          });
        } catch (uploadError) {
          console.error("[UI Settings] Error subiendo imagen de pop-up a Firebase Storage", uploadError);
          throw uploadError;
        }
      } else {
        console.log("[UI Settings] No hay nueva imagen de pop-up, se usa la URL existente", {
          finalPopupImageUrl,
        });
      }

      const payload = {
        company_id: user.company_id,
        context: CONTEXT_KEY,
        banner_enabled: bannerEnabled,
        banner_text: bannerText,
        banner_button_label: bannerButtonLabel,
        banner_button_url: bannerButtonUrl,
        banner_color: bannerColor,
        popup_enabled: popupEnabled,
        popup_image_url: finalPopupImageUrl,
        popup_title: popupTitle,
        popup_description: popupDescription,
        popup_button_label: popupButtonLabel,
        popup_button_url: popupButtonUrl,
        popup_button_color: popupButtonColor,
        // Colores de diseño personalizado
        cart_button_color: cartButtonColor,
        cart_icon_color: cartIconColor,
        navigation_bar_color: navigationBarColor,
        download_app_color: downloadAppColor,
        background_color: backgroundColor,
        primary_color: primaryColor,
        reward_accent_color: rewardAccentColor,
        surface_color: surfaceColor,
        button_text_color: buttonTextColor,
      };

      console.log("[UI Settings] Enviando payload a api.uiSettings.upsert", payload);

      const res = await api.uiSettings.upsert(payload, token);
      console.log("[UI Settings] Respuesta de api.uiSettings.upsert", res);

      if (res.success) {
        setSaveMessage("Configuración guardada correctamente.");
        console.log("[UI Settings] Configuración guardada correctamente");
        // Una vez guardado con éxito, limpiamos el archivo local para no volver a subirlo
        setPopupImageFile(null);
        setPopupImageUrl(finalPopupImageUrl || "");
      } else {
        const message = res.message || "No se pudo guardar la configuración.";
        setSaveMessage(message);
        console.warn("[UI Settings] No se pudo guardar la configuración", { message });
      }
    } catch (e) {
      console.error("[UI Settings] Error saving UI settings", e);
      setSaveMessage("Error al guardar la configuración.");
    } finally {
      setSavingSettings(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Componentes</h1>
          <p className="text-muted-foreground mt-1">
            Zona de pruebas para banners, modales y otros componentes que luego podrás reutilizar en tu tienda y dashboard.
          </p>
          {loadingSettings && (
            <p className="mt-1 text-xs text-muted-foreground">Cargando configuración guardada...</p>
          )}
          {saveMessage && !loadingSettings && (
            <p className="mt-1 text-xs text-muted-foreground">{saveMessage}</p>
          )}
        </div>
        <div className="flex items-center gap-3">

          <Button size="sm" onClick={handleSave} disabled={savingSettings || !token}>
            {savingSettings ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="custom-design" className="mt-4">
        <TabsList>
          <TabsTrigger value="custom-design">Custom Diseño</TabsTrigger>
          <TabsTrigger value="componentes">Componentes</TabsTrigger>

        </TabsList>

        <TabsContent value="custom-design" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-1">
            {/* Custom Design Configuration */}
            <Card className="border-none shadow-xl bg-gradient-to-b from-card to-muted/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                      <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600">
                        <Palette className="h-6 w-6" />
                      </div>
                      Identidad Visual
                    </CardTitle>
                    <CardDescription className="text-base">
                      Personaliza la paleta cromática de tu tienda digital para alinearla con tu marca.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Premium Design
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Botón Agregar al Carrito */}
                  <div className="group relative flex flex-col space-y-3 p-5 rounded-2xl border bg-card hover:border-purple-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <label className="font-semibold text-sm">Botón</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          value={cartButtonColor}
                          onChange={(e) => setCartButtonColor(e.target.value)}
                          className="pl-10 h-10 text-xs font-mono bg-muted/30 border-none"
                        />
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm ring-2 ring-background"
                          style={{ backgroundColor: cartButtonColor }}
                        />
                      </div>
                      <input
                        type="color"
                        value={cartButtonColor}
                        onChange={(e) => setCartButtonColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-xl border-none bg-transparent p-0 transition-transform hover:scale-110"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      Acción principal (CTA)
                    </p>
                  </div>

                  {/* Icono del Carrito */}
                  <div className="group relative flex flex-col space-y-3 p-5 rounded-2xl border bg-card hover:border-blue-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                        <MousePointer className="h-4 w-4" />
                      </div>
                      <label className="font-semibold text-sm">Contraste de Iconos</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          value={cartIconColor}
                          onChange={(e) => setCartIconColor(e.target.value)}
                          className="pl-10 h-10 text-xs font-mono bg-muted/30 border-none"
                        />
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm ring-2 ring-background border"
                          style={{ backgroundColor: cartIconColor }}
                        />
                      </div>
                      <input
                        type="color"
                        value={cartIconColor}
                        onChange={(e) => setCartIconColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-xl border-none bg-transparent p-0 transition-transform hover:scale-110"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      Simbolismos y Glifos
                    </p>
                  </div>

                  {/* Barra de Navegación */}
                  <div className="group relative flex flex-col space-y-3 p-5 rounded-2xl border bg-card hover:border-slate-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:scale-110 transition-transform">
                        <Menu className="h-4 w-4" />
                      </div>
                      <label className="font-semibold text-sm">Navegación Superior</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          value={navigationBarColor}
                          onChange={(e) => setNavigationBarColor(e.target.value)}
                          className="pl-10 h-10 text-xs font-mono bg-muted/30 border-none"
                        />
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm ring-2 ring-background"
                          style={{ backgroundColor: navigationBarColor }}
                        />
                      </div>
                      <input
                        type="color"
                        value={navigationBarColor}
                        onChange={(e) => setNavigationBarColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-xl border-none bg-transparent p-0 transition-transform hover:scale-110"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      Fondo del Header
                    </p>
                  </div>

                  {/* Botón Descargar App */}
                  <div className="group relative flex flex-col space-y-3 p-5 rounded-2xl border bg-card hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                        <Download className="h-4 w-4" />
                      </div>
                      <label className="font-semibold text-sm">Botón de App</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          value={downloadAppColor}
                          onChange={(e) => setDownloadAppColor(e.target.value)}
                          className="pl-10 h-10 text-xs font-mono bg-muted/30 border-none"
                        />
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm ring-2 ring-background"
                          style={{ backgroundColor: downloadAppColor }}
                        />
                      </div>
                      <input
                        type="color"
                        value={downloadAppColor}
                        onChange={(e) => setDownloadAppColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-xl border-none bg-transparent p-0 transition-transform hover:scale-110"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      Promoción Instalable
                    </p>
                  </div>

                  {/* Color de Fondo */}
                  <div className="group relative flex flex-col space-y-3 p-5 rounded-2xl border bg-card hover:border-orange-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                        <Monitor className="h-4 w-4" />
                      </div>
                      <label className="font-semibold text-sm">Fondo Global</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="pl-10 h-10 text-xs font-mono bg-muted/30 border-none"
                        />
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm ring-2 ring-background border"
                          style={{ backgroundColor: backgroundColor }}
                        />
                      </div>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-xl border-none bg-transparent p-0 transition-transform hover:scale-110"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      Canvas del Sitio
                    </p>
                  </div>
                  {/* Primary Brand Color */}
                  <div className="group relative flex flex-col space-y-3 p-5 rounded-2xl border bg-card hover:border-emerald-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                        <Crown className="h-4 w-4" />
                      </div>
                      <label className="font-semibold text-sm">Primario (Marca)</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="pl-10 h-10 text-xs font-mono bg-muted/30 border-none"
                        />
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm ring-2 ring-background border"
                          style={{ backgroundColor: primaryColor }}
                        />
                      </div>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-xl border-none bg-transparent p-0 transition-transform hover:scale-110"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      Identidad fuerte
                    </p>
                  </div>

                  {/* Text on Primary */}
                  <div className="group relative flex flex-col space-y-3 p-5 rounded-2xl border bg-card hover:border-slate-300 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:scale-110 transition-transform">
                        <Type className="h-4 w-4" />
                      </div>
                      <label className="font-semibold text-sm">Texto en Primario</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          value={buttonTextColor}
                          onChange={(e) => setButtonTextColor(e.target.value)}
                          className="pl-10 h-10 text-xs font-mono bg-muted/30 border-none"
                        />
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm ring-2 ring-background border"
                          style={{ backgroundColor: buttonTextColor }}
                        />
                      </div>
                      <input
                        type="color"
                        value={buttonTextColor}
                        onChange={(e) => setButtonTextColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-xl border-none bg-transparent p-0 transition-transform hover:scale-110"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      Contraste sobre marca
                    </p>
                  </div>

                  {/* Reward Accent Color */}
                  <div className="group relative flex flex-col space-y-3 p-5 rounded-2xl border bg-card hover:border-yellow-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600 group-hover:scale-110 transition-transform">
                        <Star className="h-4 w-4" />
                      </div>
                      <label className="font-semibold text-sm">Acento (Recompensas)</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          value={rewardAccentColor}
                          onChange={(e) => setRewardAccentColor(e.target.value)}
                          className="pl-10 h-10 text-xs font-mono bg-muted/30 border-none"
                        />
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm ring-2 ring-background border"
                          style={{ backgroundColor: rewardAccentColor }}
                        />
                      </div>
                      <input
                        type="color"
                        value={rewardAccentColor}
                        onChange={(e) => setRewardAccentColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-xl border-none bg-transparent p-0 transition-transform hover:scale-110"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      Puntos, estrellas, progreso
                    </p>
                  </div>

                  {/* Surface Color */}
                  <div className="group relative flex flex-col space-y-3 p-5 rounded-2xl border bg-card hover:border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-600 group-hover:scale-110 transition-transform">
                        <Square className="h-4 w-4" />
                      </div>
                      <label className="font-semibold text-sm">Superficie (Tarjetas)</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          value={surfaceColor}
                          onChange={(e) => setSurfaceColor(e.target.value)}
                          className="pl-10 h-10 text-xs font-mono bg-muted/30 border-none"
                        />
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm ring-2 ring-background border"
                          style={{ backgroundColor: surfaceColor }}
                        />
                      </div>
                      <input
                        type="color"
                        value={surfaceColor}
                        onChange={(e) => setSurfaceColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-xl border-none bg-transparent p-0 transition-transform hover:scale-110"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      Fondo de las tarjetas
                    </p>
                  </div>
                </div>

                {/* Live Preview Mockup */}

              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="componentes" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Banner demo + config */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-card to-emerald-50/10">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    Banner Promocional
                  </CardTitle>
                  <CardDescription>
                    Diseña banners de alto impacto para destacar ofertas o anuncios importantes.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-xl border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estado</span>
                  <Switch checked={bannerEnabled} onCheckedChange={setBannerEnabled} />
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Vista Previa</h4>
                    <span className="text-[10px] text-emerald-600 font-medium">Actualización en vivo</span>
                  </div>
                  {bannerEnabled ? (
                    <div
                      className="rounded-3xl border px-8 py-6 text-white shadow-2xl transition-all duration-500 hover:scale-[1.01]"
                      style={{
                        backgroundColor: bannerColor || "#059669",
                        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)'
                      }}
                    >
                      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <Badge className="bg-white/20 text-white border-none backdrop-blur-md mb-2">Destacado</Badge>
                          <p className="text-sm sm:text-lg font-bold leading-tight max-w-md">
                            {bannerText}
                          </p>
                        </div>
                        <Button
                          size="lg"
                          className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-2xl shadow-lg transition-all hover:shadow-xl active:scale-95"
                          asChild={!!bannerButtonUrl}
                        >
                          {bannerButtonUrl ? (
                            <a href={bannerButtonUrl} target="_blank" rel="noreferrer">
                              {bannerButtonLabel}
                            </a>
                          ) : (
                            <span>{bannerButtonLabel}</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="group rounded-3xl border-2 border-dashed border-muted-foreground/10 p-12 text-center transition-colors hover:border-emerald-500/20 bg-muted/5 tracking-tight">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground/30 group-hover:text-emerald-500/50 transition-colors">
                        <Megaphone className="h-6 w-6" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">El banner está inactivo</p>
                      <p className="text-xs text-muted-foreground/60">Activa el switch superior para gestionar el contenido.</p>
                    </div>
                  )}
                </div>

                {/* Config form */}
                <div className="grid gap-6 text-sm">
                  <div className="space-y-2">
                    <label className="font-bold flex items-center gap-2">
                      <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
                      Mensaje principal
                    </label>
                    <Textarea
                      value={bannerText}
                      onChange={(e) => setBannerText(e.target.value)}
                      placeholder="Escribe aquí tu mensaje promocional..."
                      className="rounded-2xl bg-muted/30 border-none min-h-[100px] focus-visible:ring-emerald-500/30"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-bold flex items-center gap-2">
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                        Texto del Botón
                      </label>
                      <Input
                        value={bannerButtonLabel}
                        onChange={(e) => setBannerButtonLabel(e.target.value)}
                        className="rounded-xl bg-muted/30 border-none h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                        Enlace de Destino
                      </label>
                      <Input
                        placeholder="https://tutienda.com/promo"
                        value={bannerButtonUrl}
                        onChange={(e) => setBannerButtonUrl(e.target.value)}
                        className="rounded-xl bg-muted/30 border-none h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-muted/20">
                    <label className="font-bold flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      Cromatismo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input
                          type="color"
                          value={bannerColor}
                          onChange={(e) => setBannerColor(e.target.value)}
                          className="h-12 w-12 cursor-pointer rounded-xl border-none bg-transparent p-0 transition-transform hover:scale-110"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={bannerColor}
                          onChange={(e) => setBannerColor(e.target.value)}
                          className="text-xs font-mono bg-background/50 border-none h-11"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modal demo + config */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-card to-sky-50/10">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <div className="p-2 rounded-xl bg-sky-600/10 text-sky-600">
                      <MousePointerClick className="h-5 w-5" />
                    </div>
                    Modal Inteligente
                  </CardTitle>
                  <CardDescription>
                    Interacciones emergentes para captar la atención de tus clientes de forma elegante.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-xl border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estado</span>
                  <Switch checked={popupEnabled} onCheckedChange={setPopupEnabled} />
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-muted/20 border-2 border-dashed border-sky-200/50 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-sky-500/10 flex items-center justify-center text-sky-600 shadow-inner">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">¿Listo para probar?</p>
                    <p className="text-xs text-muted-foreground mb-4">Lanza la previsualización del pop-up configurado.</p>
                  </div>
                  <Button
                    size="lg"
                    disabled={!popupEnabled}
                    onClick={() => popupEnabled && setOpenDemoModal(true)}
                    className="rounded-2xl bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-200 transition-all active:scale-95"
                  >
                    Lanzar Vista Previa
                  </Button>
                </div>

                {/* Config form */}
                <div className="grid gap-6 text-sm">
                  <div className="space-y-2">
                    <label className="font-bold flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      Imagen / Multimedia
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const objectUrl = URL.createObjectURL(file);
                          setPopupImageUrl(objectUrl);
                          setPopupImageFile(file);
                        }}
                      />
                      <div className="p-4 border-2 border-dashed rounded-2xl bg-muted/30 text-center transition-all group-hover:bg-muted/50 group-hover:border-sky-300">
                        <p className="text-xs font-bold text-muted-foreground">Haz clic para subir o arrastra una imagen</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">Soporta PNG, JPG, WebP</p>
                      </div>
                    </div>
                    {popupImageUrl && (
                      <div className="mt-4 relative group rounded-2xl overflow-hidden shadow-xl ring-4 ring-muted/30">
                        <img
                          src={popupImageUrl}
                          alt="Preview del pop-up"
                          className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                          <span className="text-white text-[10px] font-bold uppercase tracking-widest">Previsualización del Asset</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-bold flex items-center gap-2">Título del Modal</label>
                      <Input
                        value={popupTitle}
                        onChange={(e) => setPopupTitle(e.target.value)}
                        className="rounded-xl bg-muted/30 border-none h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold flex items-center gap-2">Cuerpo del Mensaje</label>
                      <Textarea
                        value={popupDescription}
                        onChange={(e) => setPopupDescription(e.target.value)}
                        rows={2}
                        className="rounded-xl bg-muted/30 border-none focus-visible:ring-sky-500/30"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-bold flex items-center gap-2">Etiqueta del Botón</label>
                      <Input
                        value={popupButtonLabel}
                        onChange={(e) => setPopupButtonLabel(e.target.value)}
                        placeholder="Ej: Ir al grupo de WhatsApp"
                        className="rounded-xl bg-muted/30 border-none h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold flex items-center gap-2">Color de Acción</label>
                      <div className="flex items-center gap-3 p-1 bg-muted/30 rounded-xl">
                        <input
                          type="color"
                          value={popupButtonColor}
                          onChange={(e) => setPopupButtonColor(e.target.value)}
                          className="h-9 w-9 cursor-pointer rounded-lg border-none bg-transparent p-0 overflow-hidden"
                        />
                        <Input
                          value={popupButtonColor}
                          onChange={(e) => setPopupButtonColor(e.target.value)}
                          className="text-xs font-mono bg-transparent border-none h-9 grow"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dialog preview actual representation */}
                <Dialog open={openDemoModal && popupEnabled} onOpenChange={setOpenDemoModal}>
                  <DialogContent className="sm:max-w-[440px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-300">
                    {popupImageUrl && (
                      <div className="w-full h-72 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
                        <img
                          src={popupImageUrl}
                          alt={popupTitle}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="px-8 py-8 space-y-6 bg-card">
                      <div className="space-y-2 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">{popupTitle}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{popupDescription}</p>
                      </div>

                      {popupButtonLabel && popupButtonUrl && (
                        <div className="flex justify-center">
                          <Button
                            className="w-full h-14 text-sm font-bold rounded-2xl shadow-xl transition-all active:scale-95"
                            style={{
                              backgroundColor: popupButtonColor || '#059669',
                              color: '#ffffff',
                            }}
                            onClick={() => {
                              window.open(popupButtonUrl, '_blank');
                            }}
                          >
                            {popupButtonLabel}
                          </Button>
                        </div>
                      )}

                      <p className="text-[10px] text-center text-muted-foreground/40 font-medium">
                        Haz clic fuera para cerrar este modal
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
}
