"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, X, MessageSquarePlus, Upload, Send, HelpCircle, Bug, Lightbulb, MessageSquare, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  bug: "Error",
  feature: "Sugerencia",
  general: "Comentario general",
  question: "Pregunta",
  praise: "Elogio",
};

export default function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    subject: "",
    message: "",
    email: "",
    whatsapp: ""
  });
  
  const { toast } = useToast();
  const { token } = useAuth();

  const typeSubmitValue = useMemo(() => {
    if (!formData.type) return "";
    return FEEDBACK_TYPE_LABELS[formData.type] || formData.type;
  }, [formData.type]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Error", description: "Por favor selecciona un archivo de imagen válido", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "La imagen no debe ser mayor a 5MB", variant: "destructive" });
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.message) {
      toast({ title: "Campos requeridos", description: "Por favor completa los campos obligatorios.", variant: "destructive" });
      return;
    }
    if (!token) return;

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("type", typeSubmitValue);
      payload.append("message", formData.message.trim());
      if (formData.subject.trim()) payload.append("subject", formData.subject.trim());
      if (formData.email.trim()) payload.append("email", formData.email.trim());
      if (formData.whatsapp.trim()) payload.append("whatsapp", formData.whatsapp.trim());
      if (screenshot) payload.append("screenshot", screenshot);

      const response = await api.feedback.submitCompanyFeedback(payload, token);
      if (!response.success) throw new Error(response.message || "Error al enviar");

      toast({ title: "¡Gracias!", description: "Tu feedback ha sido enviado correctamente." });
      setFormData({ type: "", subject: "", message: "", email: "", whatsapp: "" });
      setScreenshot(null);
      setScreenshotPreview(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo enviar.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
          Feedback
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Tu opinión es fundamental para nosotros. Ayúdanos a mejorar reportando fallos o sugiriendo nuevas ideas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="shadow-xl border-none ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl border-b">
              <CardTitle className="text-2xl">Enviar Nuevo Reporte</CardTitle>
              <CardDescription>Completa los detalles de tu mensaje a continuación.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-8">
              <form id="feedback-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="type" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Tipo de Feedback <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.type} onValueChange={(v) => handleInputChange('type', v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">🐛 Reportar un Error</SelectItem>
                        <SelectItem value="feature">💡 Sugerir una Mejora</SelectItem>
                        <SelectItem value="general">💬 Comentario General</SelectItem>
                        <SelectItem value="question">❓ Pregunta</SelectItem>
                        <SelectItem value="praise">👍 Elogio o Satisfacción</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subject" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Asunto
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Ej: Problema con el login"
                      className="h-11"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="message" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Mensaje <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Describe detalladamente tu situación..."
                    className="min-h-[160px] resize-none text-lg p-4"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Para recibir respuesta"
                      className="h-11"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="whatsapp" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="+52 ..."
                      className="h-11"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">
                    Captura de Pantalla
                  </Label>
                  <div className="flex flex-col gap-4">
                    <div className={cn(
                      "relative border-2 border-dashed rounded-xl p-8 transition-colors text-center hover:bg-slate-50 dark:hover:bg-slate-900 group",
                      screenshot ? "border-purple-200 bg-purple-50/30" : "border-slate-200 dark:border-slate-800"
                    )}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          {screenshot ? (
                            <Plus className="h-10 w-10 text-purple-500" />
                          ) : (
                            <Upload className="h-10 w-10 text-slate-400 group-hover:text-purple-500 transition-colors" />
                          )}
                        </div>
                        <div className="text-sm">
                          <span className="font-bold text-purple-600">Haz clic para subir</span> o arrastra y suelta
                        </div>
                        <p className="text-xs text-muted-foreground">JPG, PNG o GIF (Máx. 5MB)</p>
                      </div>
                    </div>

                    {screenshotPreview && (
                      <div className="relative group rounded-xl overflow-hidden border shadow-sm max-w-sm mx-auto w-full">
                        <img
                          src={screenshotPreview}
                          alt="Preview"
                          className="w-full h-auto max-h-64 object-contain bg-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t rounded-b-xl flex justify-end gap-3">
              <Button
                type="submit"
                form="feedback-form"
                disabled={isSubmitting}
                className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg shadow-lg shadow-purple-500/20"
              >
                <Send className="mr-2 h-5 w-5" />
                {isSubmitting ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-purple-600 text-white border-none shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <MessageSquarePlus className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">¿Para qué sirve?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-purple-50 font-medium">
              <div className="flex items-start gap-3">
                <Bug className="h-6 w-6 mt-1 flex-shrink-0" />
                <p>Reporta fallos críticos en la plataforma para que podamos solucionarlos de inmediato.</p>
              </div>
              <div className="flex items-start gap-3">
                <Lightbulb className="h-6 w-6 mt-1 flex-shrink-0" />
                <p>Sugiere nuevas funcionalidades o mejoras que harían tu trabajo más fácil.</p>
              </div>
              <div className="flex items-start gap-3">
                <ThumbsUp className="h-6 w-6 mt-1 flex-shrink-0" />
                <p>Dinos qué es lo que más te gusta para seguir potenciando esas herramientas.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-slate-50 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                Preguntas Frecuentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm">¿Recibiré respuesta?</h4>
                <p className="text-xs text-muted-foreground">Si nos proporcionas tu email o WhatsApp, nuestro equipo se pondrá en contacto contigo lo antes posible.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">¿Cuánto tiempo tardan?</h4>
                <p className="text-xs text-muted-foreground">Solemos revisar todos los reportes en un plazo de 24 a 48 horas hábiles.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
