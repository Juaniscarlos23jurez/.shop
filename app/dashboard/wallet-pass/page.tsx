"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Activity, Palette, Type, Image, QrCode, Info, Sparkles, Download, Upload } from "lucide-react";

export default function WalletPassBuilderPage() {
  const [form, setForm] = useState({
    programName: "Club de Fidelización",
    programNameColor: "#FFFFFF",
    passTitle: "Tarjeta de Cliente Frecuente",
    passTitleColor: "#FFFFFF",
    subtitle: "Acumula puntos en cada compra",
    subtitleColor: "#E5E7EB",
    description: "Muestra esta tarjeta en caja para acumular y canjear tus beneficios.",
    descriptionColor: "#D1D5DB",
    primaryColor: "#10B981",
    secondaryColor: "#059669",
    logoText: "Tu Marca",
    terms: "Aplican términos y condiciones. Consulta detalles en la tienda.",
    termsColor: "#D1D5DB",
    companyLogoUrl: "",
    backgroundImageUrl: "",
    extraLine1: "ID Cliente: 000123",
    extraLine1Color: "#D1D5DB",
    extraLine2: "Sucursal principal",
    extraLine2Color: "#D1D5DB",
    pointsLabel: "Puntos",
    pointsLabelColor: "#9CA3AF",
    pointsValue: "2450",
    pointsValueColor: "#FFFFFF",
    tierLabel: "Nivel",
    tierLabelColor: "#9CA3AF",
    tierValue: "Oro",
    tierValueColor: "#FFFFFF",
    showCustomerQr: true,
    qrLabel: "Escanea este código en caja",
    qrLabelColor: "#D1D5DB",
    qrNote: "El código representa el ID único del cliente.",
    qrNoteColor: "#9CA3AF",
    showProgramName: true,
    showLogoText: true,
    showPassTitle: true,
    showSubtitle: true,
    showDescription: true,
    showExtraLine1: true,
    showExtraLine2: true,
    showQrSection: true,
    showTerms: true,
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Constructor de Wallet Pass
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Diseña tarjetas digitales profesionales para Apple Wallet y Google Pay
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 shadow-sm">
              <Upload className="h-4 w-4" />
              Importar
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
              <Download className="h-4 w-4" />
              Exportar Pass
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start">
          <div className="space-y-6">
            {/* Información General */}
            <Card className="shadow-lg border-slate-200/60 bg-white/80 backdrop-blur">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Type className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Información General</CardTitle>
                    <CardDescription>Configura los textos principales de tu tarjeta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="programName" className="text-sm font-medium flex items-center gap-2">
                      Nombre del programa
                    </Label>
                    <Input
                      id="programName"
                      value={form.programName}
                      onChange={(e) => handleChange("programName", e.target.value)}
                      placeholder="Ej. Club Rewin Rewards"
                      className="border-slate-200"
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="programNameColor" className="text-xs text-slate-500">Color</Label>
                      <Input
                        id="programNameColor"
                        type="color"
                        value={form.programNameColor}
                        onChange={(e) => handleChange("programNameColor", e.target.value)}
                        className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoText" className="text-sm font-medium">Texto del logo</Label>
                    <Input
                      id="logoText"
                      value={form.logoText}
                      onChange={(e) => handleChange("logoText", e.target.value)}
                      placeholder="Nombre corto de la marca"
                      className="border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="passTitle" className="text-sm font-medium">Título principal</Label>
                    <Input
                      id="passTitle"
                      value={form.passTitle}
                      onChange={(e) => handleChange("passTitle", e.target.value)}
                      placeholder="Ej. Tarjeta de cliente frecuente"
                      className="border-slate-200"
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="passTitleColor" className="text-xs text-slate-500">Color</Label>
                      <Input
                        id="passTitleColor"
                        type="color"
                        value={form.passTitleColor}
                        onChange={(e) => handleChange("passTitleColor", e.target.value)}
                        className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle" className="text-sm font-medium">Subtítulo</Label>
                    <Input
                      id="subtitle"
                      value={form.subtitle}
                      onChange={(e) => handleChange("subtitle", e.target.value)}
                      placeholder="Ej. Gana puntos en cada compra"
                      className="border-slate-200"
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="subtitleColor" className="text-xs text-slate-500">Color</Label>
                      <Input
                        id="subtitleColor"
                        type="color"
                        value={form.subtitleColor}
                        onChange={(e) => handleChange("subtitleColor", e.target.value)}
                        className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="description" className="text-sm font-medium">Descripción corta</Label>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Mostrar</span>
                      <Switch
                        checked={form.showDescription}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({ ...prev, showDescription: Boolean(checked) }))
                        }
                      />
                    </div>
                  </div>
                  {form.showDescription && (
                    <>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        rows={3}
                        className="border-slate-200 resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="descriptionColor" className="text-xs text-slate-500">Color</Label>
                        <Input
                          id="descriptionColor"
                          type="color"
                          value={form.descriptionColor}
                          onChange={(e) => handleChange("descriptionColor", e.target.value)}
                          className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="extraLine1" className="text-sm font-medium">Línea extra 1</Label>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Mostrar</span>
                        <Switch
                          checked={form.showExtraLine1}
                          onCheckedChange={(checked) =>
                            setForm((prev) => ({ ...prev, showExtraLine1: Boolean(checked) }))
                          }
                        />
                      </div>
                    </div>
                    {form.showExtraLine1 && (
                      <>
                        <Input
                          id="extraLine1"
                          value={form.extraLine1}
                          onChange={(e) => handleChange("extraLine1", e.target.value)}
                          placeholder="Ej. ID Cliente"
                          className="border-slate-200"
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="extraLine1Color" className="text-xs text-slate-500">Color</Label>
                          <Input
                            id="extraLine1Color"
                            type="color"
                            value={form.extraLine1Color}
                            onChange={(e) => handleChange("extraLine1Color", e.target.value)}
                            className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="extraLine2" className="text-sm font-medium">Línea extra 2</Label>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Mostrar</span>
                        <Switch
                          checked={form.showExtraLine2}
                          onCheckedChange={(checked) =>
                            setForm((prev) => ({ ...prev, showExtraLine2: Boolean(checked) }))
                          }
                        />
                      </div>
                    </div>
                    {form.showExtraLine2 && (
                      <>
                        <Input
                          id="extraLine2"
                          value={form.extraLine2}
                          onChange={(e) => handleChange("extraLine2", e.target.value)}
                          placeholder="Ej. Segmento o sucursal"
                          className="border-slate-200"
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="extraLine2Color" className="text-xs text-slate-500">Color</Label>
                          <Input
                            id="extraLine2Color"
                            type="color"
                            value={form.extraLine2Color}
                            onChange={(e) => handleChange("extraLine2Color", e.target.value)}
                            className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Puntos y Niveles */}
            <Card className="shadow-lg border-slate-200/60 bg-white/80 backdrop-blur">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Puntos y Niveles</CardTitle>
                    <CardDescription>Configura los valores dinámicos de la tarjeta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pointsLabel" className="text-sm font-medium">Etiqueta de puntos</Label>
                    <Input
                      id="pointsLabel"
                      value={form.pointsLabel}
                      onChange={(e) => handleChange("pointsLabel", e.target.value)}
                      className="border-slate-200"
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="pointsLabelColor" className="text-xs text-slate-500">Color</Label>
                      <Input
                        id="pointsLabelColor"
                        type="color"
                        value={form.pointsLabelColor}
                        onChange={(e) => handleChange("pointsLabelColor", e.target.value)}
                        className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pointsValue" className="text-sm font-medium">Valor de puntos</Label>
                    <Input
                      id="pointsValue"
                      value={form.pointsValue}
                      onChange={(e) => handleChange("pointsValue", e.target.value)}
                      className="border-slate-200"
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="pointsValueColor" className="text-xs text-slate-500">Color</Label>
                      <Input
                        id="pointsValueColor"
                        type="color"
                        value={form.pointsValueColor}
                        onChange={(e) => handleChange("pointsValueColor", e.target.value)}
                        className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tierLabel" className="text-sm font-medium">Etiqueta de nivel</Label>
                    <Input
                      id="tierLabel"
                      value={form.tierLabel}
                      onChange={(e) => handleChange("tierLabel", e.target.value)}
                      className="border-slate-200"
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="tierLabelColor" className="text-xs text-slate-500">Color</Label>
                      <Input
                        id="tierLabelColor"
                        type="color"
                        value={form.tierLabelColor}
                        onChange={(e) => handleChange("tierLabelColor", e.target.value)}
                        className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tierValue" className="text-sm font-medium">Valor de nivel</Label>
                    <Input
                      id="tierValue"
                      value={form.tierValue}
                      onChange={(e) => handleChange("tierValue", e.target.value)}
                      className="border-slate-200"
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="tierValueColor" className="text-xs text-slate-500">Color</Label>
                      <Input
                        id="tierValueColor"
                        type="color"
                        value={form.tierValueColor}
                        onChange={(e) => handleChange("tierValueColor", e.target.value)}
                        className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diseño y Colores */}
            <Card className="shadow-lg border-slate-200/60 bg-white/80 backdrop-blur">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Diseño y Colores</CardTitle>
                    <CardDescription>Personaliza la apariencia visual de tu tarjeta</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-sm font-medium">Color principal</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={form.primaryColor}
                        onChange={(e) => handleChange("primaryColor", e.target.value)}
                        className="h-12 w-20 p-1 cursor-pointer border-slate-200"
                      />
                      <Input
                        type="text"
                        value={form.primaryColor}
                        onChange={(e) => handleChange("primaryColor", e.target.value)}
                        className="flex-1 border-slate-200 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-sm font-medium">Color secundario</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={form.secondaryColor}
                        onChange={(e) => handleChange("secondaryColor", e.target.value)}
                        className="h-12 w-20 p-1 cursor-pointer border-slate-200"
                      />
                      <Input
                        type="text"
                        value={form.secondaryColor}
                        onChange={(e) => handleChange("secondaryColor", e.target.value)}
                        className="flex-1 border-slate-200 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyLogoUrl" className="text-sm font-medium flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Logo de la compañía (URL)
                    </Label>
                    <Input
                      id="companyLogoUrl"
                      value={form.companyLogoUrl}
                      onChange={(e) => handleChange("companyLogoUrl", e.target.value)}
                      placeholder="https://.../logo.png"
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backgroundImageUrl" className="text-sm font-medium flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Imagen de fondo (URL)
                    </Label>
                    <Input
                      id="backgroundImageUrl"
                      value={form.backgroundImageUrl}
                      onChange={(e) => handleChange("backgroundImageUrl", e.target.value)}
                      placeholder="https://.../background.jpg"
                      className="border-slate-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR y Términos */}
            <Card className="shadow-lg border-slate-200/60 bg-white/80 backdrop-blur">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-transparent">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Código QR y Términos</CardTitle>
                      <CardDescription>Configura el código QR y condiciones</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Mostrar sección</span>
                    <Switch
                      checked={form.showQrSection}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, showQrSection: Boolean(checked) }))
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              {form.showQrSection && (
                <CardContent className="pt-6 space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 bg-slate-50">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Mostrar código QR del cliente</Label>
                      <p className="text-xs text-slate-500">
                        Permite escanear la tarjeta en puntos de venta
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={form.showCustomerQr ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          showCustomerQr: !prev.showCustomerQr,
                        }))
                      }
                      className={form.showCustomerQr ? "bg-gradient-to-r from-blue-600 to-indigo-600" : ""}
                    >
                      {form.showCustomerQr ? "Activado" : "Desactivado"}
                    </Button>
                  </div>

                  {form.showCustomerQr && (
                    <div className="grid gap-4 md:grid-cols-2 p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50/50 to-transparent">
                      <div className="space-y-2">
                        <Label htmlFor="qrLabel" className="text-sm font-medium">Texto junto al QR</Label>
                        <Input
                          id="qrLabel"
                          value={form.qrLabel}
                          onChange={(e) => handleChange("qrLabel", e.target.value)}
                          className="border-slate-200"
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="qrLabelColor" className="text-xs text-slate-500">Color</Label>
                          <Input
                            id="qrLabelColor"
                            type="color"
                            value={form.qrLabelColor}
                            onChange={(e) => handleChange("qrLabelColor", e.target.value)}
                            className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qrNote" className="text-sm font-medium">Nota del QR</Label>
                        <Input
                          id="qrNote"
                          value={form.qrNote}
                          onChange={(e) => handleChange("qrNote", e.target.value)}
                          className="border-slate-200"
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="qrNoteColor" className="text-xs text-slate-500">Color</Label>
                          <Input
                            id="qrNoteColor"
                            type="color"
                            value={form.qrNoteColor}
                            onChange={(e) => handleChange("qrNoteColor", e.target.value)}
                            className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="terms" className="text-sm font-medium flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Términos y condiciones
                      </Label>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Mostrar</span>
                        <Switch
                          checked={form.showTerms}
                          onCheckedChange={(checked) =>
                            setForm((prev) => ({ ...prev, showTerms: Boolean(checked) }))
                          }
                        />
                      </div>
                    </div>
                    {form.showTerms && (
                      <>
                        <Textarea
                          id="terms"
                          value={form.terms}
                          onChange={(e) => handleChange("terms", e.target.value)}
                          rows={3}
                          className="border-slate-200 resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="termsColor" className="text-xs text-slate-500">Color</Label>
                          <Input
                            id="termsColor"
                            type="color"
                            value={form.termsColor}
                            onChange={(e) => handleChange("termsColor", e.target.value)}
                            className="h-8 w-16 p-1 cursor-pointer border-slate-200"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Vista Previa */}
          <Card className="sticky top-4 shadow-xl border-slate-200/60 bg-white/80 backdrop-blur">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-transparent">
              <CardTitle className="text-lg">Vista Previa en Tiempo Real</CardTitle>
              <CardDescription>
                Visualiza cómo se verá tu tarjeta en dispositivos móviles
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="ios" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1.5 shadow-inner">
                  <TabsTrigger 
                    value="ios" 
                    className="flex items-center justify-center gap-2 rounded-xl text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <Activity className="h-4 w-4" /> 
                    Apple Wallet
                  </TabsTrigger>
                  <TabsTrigger 
                    value="android" 
                    className="flex items-center justify-center gap-2 rounded-xl text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <Activity className="h-4 w-4" /> 
                    Google Pay
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ios" className="mt-6">
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-sm">
                      <div className="absolute inset-x-8 -top-3 h-3 rounded-full bg-slate-900/60 blur-sm" />
                      <div
                        className="relative rounded-[28px] overflow-hidden shadow-2xl border-2 border-slate-900/20"
                        style={{
                          // Usamos solo propiedades longhand para evitar conflictos entre `background` y `backgroundImage`
                          backgroundColor: form.primaryColor,
                          backgroundImage: form.backgroundImageUrl
                            ? `linear-gradient(135deg, ${form.primaryColor}F0, ${form.secondaryColor}F0), url(${form.backgroundImageUrl})`
                            : `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`,
                          backgroundSize: form.backgroundImageUrl ? "cover" : "100% 100%",
                          backgroundPosition: "center",
                        }}
                      >
                        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                          <div 
                            className="text-xs font-semibold uppercase tracking-[0.18em]"
                            style={{ color: form.programNameColor }}
                          >
                            {form.programName}
                          </div>
                          <div className="flex items-center gap-2.5">
                            {form.companyLogoUrl && (
                              <div className="h-8 w-8 rounded-lg overflow-hidden bg-black/15 border border-white/20 shadow-sm">
                                <img
                                  src={form.companyLogoUrl}
                                  alt="Logo"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm text-xs font-bold text-white/95 max-w-[100px] truncate text-right shadow-sm">
                              {form.logoText}
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-6 pb-5">
                          <div 
                            className="text-lg font-bold"
                            style={{ color: form.passTitleColor }}
                          >
                            {form.passTitle}
                          </div>
                          <div 
                            className="text-xs mt-2"
                            style={{ color: form.subtitleColor }}
                          >
                            {form.subtitle}
                          </div>
                          
                          <div className="mt-4 text-[11px] flex flex-col gap-1">
                            {form.showExtraLine1 && form.extraLine1 && (
                              <span style={{ color: form.extraLine1Color }}>{form.extraLine1}</span>
                            )}
                            {form.showExtraLine2 && form.extraLine2 && (
                              <span style={{ color: form.extraLine2Color }}>{form.extraLine2}</span>
                            )}
                          </div>
                          
                          <div className="mt-5 flex items-end justify-between gap-6">
                            <div>
                              <div 
                                className="text-[11px] uppercase tracking-[0.18em] font-medium"
                                style={{ color: form.pointsLabelColor }}
                              >
                                {form.pointsLabel}
                              </div>
                              <div 
                                className="text-[28px] leading-none font-bold mt-1.5"
                                style={{ color: form.pointsValueColor }}
                              >
                                {form.pointsValue}
                              </div>
                            </div>
                            <div className="text-right">
                              <div 
                                className="text-[11px] uppercase tracking-[0.18em] font-medium"
                                style={{ color: form.tierLabelColor }}
                              >
                                {form.tierLabel}
                              </div>
                              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-sm px-3 py-1.5 shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-sm" />
                                <span 
                                  className="text-xs font-semibold"
                                  style={{ color: form.tierValueColor }}
                                >
                                  {form.tierValue}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-6 py-4 bg-black/20 backdrop-blur-sm border-t border-white/10 space-y-2.5">
                          {form.showDescription && (
                            <p 
                              className="text-[11px] leading-relaxed line-clamp-2"
                              style={{ color: form.descriptionColor }}
                            >
                              {form.description}
                            </p>
                          )}
                          
                          {form.showQrSection && form.showCustomerQr && (
                            <div className="mt-2 flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                              <div className="flex-1 min-w-0">
                                <p 
                                  className="text-[11px] truncate font-medium"
                                  style={{ color: form.qrLabelColor }}
                                >
                                  {form.qrLabel}
                                </p>
                                <p 
                                  className="text-[10px] line-clamp-2 mt-0.5"
                                  style={{ color: form.qrNoteColor }}
                                >
                                  {form.qrNote}
                                </p>
                              </div>
                              <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-lg">
                                <div className="h-14 w-14 rounded-lg bg-slate-900 p-1.5 grid grid-cols-5 grid-rows-5 gap-[2px]">
                                  {[...Array(25)].map((_, i) => {
                                    const isMarker =
                                      i === 0 || i === 1 || i === 5 || i === 6 ||
                                      i === 3 || i === 4 || i === 8 || i === 9 ||
                                      i === 15 || i === 16 || i === 20 || i === 21 ||
                                      i === 18 || i === 19 || i === 23 || i === 24;
                                    const isDot = !isMarker && (i % 3 === 0 || (i + 2) % 4 === 0);
                                    return (
                                      <div
                                        key={i}
                                        className={
                                          isMarker
                                            ? "bg-white rounded-[1px]"
                                            : isDot
                                            ? "bg-white/85"
                                            : "bg-slate-900"
                                        }
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {form.showTerms && (
                          <div className="px-6 py-3 bg-black/15 backdrop-blur-sm border-t border-white/10">
                            <p 
                              className="text-[10px] leading-relaxed line-clamp-2"
                              style={{ color: form.termsColor }}
                            >
                              {form.terms}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-900 text-center font-medium">
                      ✨ Vista previa de Apple Wallet - Los cambios se reflejan en tiempo real
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="android" className="mt-6">
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-sm">
                      <div 
                        className="relative rounded-[28px] overflow-hidden shadow-2xl border-2 border-slate-900/20"
                        style={{ 
                          backgroundColor: form.primaryColor,
                          backgroundImage: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`,
                          backgroundSize: "100% 100%",
                          backgroundPosition: "center",
                        }}
                      >
                        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
                          <div 
                            className="text-xs font-semibold uppercase tracking-[0.18em]"
                            style={{ color: form.programNameColor }}
                          >
                            {form.programName}
                          </div>
                          <div className="flex items-center gap-2.5">
                            {form.companyLogoUrl && (
                              <div className="h-8 w-8 rounded-lg overflow-hidden bg-black/15 border border-white/20 shadow-sm">
                                <img
                                  src={form.companyLogoUrl}
                                  alt="Logo"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div className="h-10 w-10 rounded-2xl bg-black/15 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                              {form.logoText.substring(0, 3)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-6 pb-5">
                          <div 
                            className="text-lg font-bold"
                            style={{ color: form.passTitleColor }}
                          >
                            {form.passTitle}
                          </div>
                          <div 
                            className="text-xs mt-2"
                            style={{ color: form.subtitleColor }}
                          >
                            {form.subtitle}
                          </div>
                          
                          <div className="mt-4 text-[11px] flex flex-col gap-1">
                            {form.extraLine1 && (
                              <span style={{ color: form.extraLine1Color }}>{form.extraLine1}</span>
                            )}
                            {form.extraLine2 && (
                              <span style={{ color: form.extraLine2Color }}>{form.extraLine2}</span>
                            )}
                          </div>
                          
                          <div className="mt-5 grid grid-cols-2 gap-4">
                            <div>
                              <div 
                                className="text-[11px] uppercase tracking-[0.18em] font-medium"
                                style={{ color: form.pointsLabelColor }}
                              >
                                {form.pointsLabel}
                              </div>
                              <div 
                                className="text-[26px] leading-none font-bold mt-1.5"
                                style={{ color: form.pointsValueColor }}
                              >
                                {form.pointsValue}
                              </div>
                            </div>
                            <div>
                              <div 
                                className="text-[11px] uppercase tracking-[0.18em] font-medium"
                                style={{ color: form.tierLabelColor }}
                              >
                                Beneficio
                              </div>
                              <div className="mt-1.5 inline-flex items-center rounded-full bg-black/25 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                                10% OFF
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-6 py-4 bg-black/20 backdrop-blur-sm border-t border-white/10 space-y-2.5">
                          {form.showTerms && (
                            <p 
                              className="text-[11px] leading-relaxed line-clamp-2"
                              style={{ color: form.termsColor }}
                            >
                              {form.terms}
                            </p>
                          )}
                          
                          {form.showQrSection && form.showCustomerQr && (
                            <div className="mt-2 flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                              <div className="flex-1 min-w-0">
                                <p 
                                  className="text-[11px] truncate font-medium"
                                  style={{ color: form.qrLabelColor }}
                                >
                                  {form.qrLabel}
                                </p>
                                <p 
                                  className="text-[10px] line-clamp-2 mt-0.5"
                                  style={{ color: form.qrNoteColor }}
                                >
                                  {form.qrNote}
                                </p>
                              </div>
                              <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-lg">
                                <div className="h-14 w-14 rounded-lg bg-slate-900 p-1.5 grid grid-cols-5 grid-rows-5 gap-[2px]">
                                  {[...Array(25)].map((_, i) => {
                                    const isMarker =
                                      i === 0 || i === 1 || i === 5 || i === 6 ||
                                      i === 3 || i === 4 || i === 8 || i === 9 ||
                                      i === 15 || i === 16 || i === 20 || i === 21 ||
                                      i === 18 || i === 19 || i === 23 || i === 24;
                                    const isDot = !isMarker && (i % 3 === 0 || (i + 2) % 4 === 0);
                                    return (
                                      <div
                                        key={i}
                                        className={
                                          isMarker
                                            ? "bg-white rounded-[1px]"
                                            : isDot
                                            ? "bg-white/85"
                                            : "bg-slate-900"
                                        }
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs text-emerald-900 text-center font-medium">
                      ✨ Vista previa de Google Pay - Personalización en tiempo real
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}