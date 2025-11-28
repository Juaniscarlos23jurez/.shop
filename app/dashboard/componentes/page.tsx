"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api/api";
import { useAuth } from "@/contexts/AuthContext";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as Lucide from "lucide-react";
const { Megaphone, Sparkles, LayoutTemplate, MousePointerClick } = Lucide as any;

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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Banner demo + config */}
        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Megaphone className="h-5 w-5 text-emerald-600" />
                Banner promocional
              </CardTitle>
              <CardDescription>
                Aquí podrás diseñar banners hero que luego se mostrarán en tu web o app.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Habilitado</span>
              <Switch checked={bannerEnabled} onCheckedChange={setBannerEnabled} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preview */}
            {bannerEnabled ? (
              <div
                className="rounded-2xl border px-6 py-4 text-white shadow-lg"
                style={{ backgroundColor: bannerColor || "#059669" }}
              >
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm sm:text-base font-medium leading-snug">
                    {bannerText}
                  </p>
                  <Button
                    size="sm"
                    className="bg-white text-emerald-700 hover:bg-emerald-50 whitespace-nowrap"
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
              <div className="rounded-xl border border-dashed border-muted-foreground/20 p-4 text-xs text-muted-foreground">
                El banner está deshabilitado. Activa el switch para verlo en la vista previa.
              </div>
            )}

            {/* Config form */}
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-medium">Texto del banner</label>
                <Textarea
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
                  Texto del botón
                </label>
                <Input
                  value={bannerButtonLabel}
                  onChange={(e) => setBannerButtonLabel(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
                  Link del botón
                </label>
                <Input
                  placeholder="https://tutienda.com/promo"
                  value={bannerButtonUrl}
                  onChange={(e) => setBannerButtonUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
                  Color de fondo
                </label>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <input
                    type="color"
                    value={bannerColor}
                    onChange={(e) => setBannerColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded-md border border-input bg-background p-1"
                  />
                  <Input
                    value={bannerColor}
                    onChange={(e) => setBannerColor(e.target.value)}
                    className="max-w-[140px] text-xs"
                  />
                  <span className="hidden sm:inline">
                    Ejemplo: #059669
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal demo + config */}
        <Card className="border-dashed">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MousePointerClick className="h-5 w-5 text-sky-600" />
                Modal / Pop-up
              </CardTitle>
              <CardDescription>
                Ejemplo de modal que luego podrás adaptar para anuncios, formularios o confirmaciones.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Habilitado</span>
              <Switch checked={popupEnabled} onCheckedChange={setPopupEnabled} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Configura el contenido del pop-up y luego pruébalo con el botón de vista previa.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                disabled={!popupEnabled}
                onClick={() => popupEnabled && setOpenDemoModal(true)}
              >
                Abrir pop-up de ejemplo
              </Button>
            </div>

            {/* Config form */}
            <div className="grid gap-4 text-sm">
              <div className="space-y-1">
                <label className="font-medium">Imagen del pop-up</label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-accent hover:file:text-accent-foreground"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    console.log("[UI Settings] onChange imagen pop-up", { hasFile: !!file, file });
                    if (!file) return;
                    const objectUrl = URL.createObjectURL(file);
                    console.log("[UI Settings] objectUrl generado para previsualización", { objectUrl });
                    setPopupImageUrl(objectUrl);
                    setPopupImageFile(file);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Selecciona una imagen desde tu dispositivo para previsualizar el pop-up.
                </p>
                {popupImageUrl && (
                  <div className="mt-2 overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={popupImageUrl}
                      alt="Preview del pop-up"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="font-medium">Título</label>
                <Input value={popupTitle} onChange={(e) => setPopupTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="font-medium">Descripción</label>
                <Textarea
                  value={popupDescription}
                  onChange={(e) => setPopupDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Dialog preview */}
            <Dialog open={openDemoModal && popupEnabled} onOpenChange={setOpenDemoModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{popupTitle}</DialogTitle>
                  <DialogDescription>{popupDescription}</DialogDescription>
                </DialogHeader>
                {popupImageUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border bg-muted">
                    <img
                      src={popupImageUrl}
                      alt={popupTitle}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-3 text-sm text-muted-foreground mt-3">
                  <p>
                    Personaliza este contenido, agrega más textos o acciones según el tipo de pop-up que quieras mostrar.
                  </p>
                  <p>
                    Más adelante podrás conectar esta configuración con tu backend o reglas de negocio.
                  </p>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenDemoModal(false)}
                  >
                    Cerrar
                  </Button>
                  <Button size="sm" onClick={() => setOpenDemoModal(false)}>
                    Entendido
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
