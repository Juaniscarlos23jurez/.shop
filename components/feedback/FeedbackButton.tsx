"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, MessageSquarePlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api/api"
import { useAuth } from "@/contexts/AuthContext"

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  bug: "Error",
  feature: "Sugerencia",
  general: "Comentario general",
  question: "Pregunta",
  praise: "Elogio",
}

export function FeedbackButton({
  variant = "floating",
  initialType = "",
  initialSubject = "",
  hideTypeSelect = false,
  customTitle,
  customDescription,
  children
}: {
  variant?: "floating" | "navbar" | "custom",
  initialType?: string,
  initialSubject?: string,
  hideTypeSelect?: boolean,
  customTitle?: string,
  customDescription?: string,
  children?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: initialType,
    subject: initialSubject,
    message: "",
    email: "",
    whatsapp: ""
  })
  const { toast } = useToast()
  const { token } = useAuth()
  const typeSubmitValue = useMemo(() => {
    if (!formData.type) return ""
    return FEEDBACK_TYPE_LABELS[formData.type] || formData.type
  }, [formData.type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type || !formData.message) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive"
      })
      return
    }

    if (!token) {
      toast({
        title: "Sesión requerida",
        description: "Inicia sesión para poder enviar feedback.",
        variant: "destructive"
      })
      return
    }

    if (!typeSubmitValue) {
      toast({
        title: "Error",
        description: "Selecciona un tipo de feedback válido",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = new FormData()
      payload.append("type", typeSubmitValue)
      payload.append("message", formData.message.trim())

      if (formData.subject.trim()) payload.append("subject", formData.subject.trim())
      if (formData.email.trim()) payload.append("email", formData.email.trim())
      if (formData.whatsapp.trim()) payload.append("whatsapp", formData.whatsapp.trim())
      if (screenshot) payload.append("screenshot", screenshot)

      const response = await api.feedback.submitCompanyFeedback(payload, token)

      if (!response.success) {
        throw new Error(response.message || "No pudimos enviar tu feedback")
      }

      toast({
        title: "¡Gracias por tu feedback!",
        description: "Hemos recibido tu mensaje y lo revisaremos pronto.",
      })

      setFormData({
        type: "",
        subject: "",
        message: "",
        email: "",
        whatsapp: ""
      })
      setScreenshot(null)
      setScreenshotPreview(null)
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No pudimos enviar tu feedback. Intenta de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (image only)
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido",
          variant: "destructive"
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe ser mayor a 5MB",
          variant: "destructive"
        })
        return
      }

      setScreenshot(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeScreenshot = () => {
    setScreenshot(null)
    setScreenshotPreview(null)
  }

  return (
    <div className={variant === "floating" ? "fixed top-4 left-1/2 transform -translate-x-1/2 z-50" : "relative"}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {variant === "custom" ? (
            children
          ) : variant === "floating" ? (
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6 py-3 flex items-center gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Feedback</span>
            </Button>
          ) : (
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-200"
              size="sm"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Feedback.</span>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              {customTitle || "Envíanos tu Feedback"}
            </DialogTitle>
            <DialogDescription>
              {customDescription || "Ayúdanos a mejorar Fynlink+ compartiendo tus ideas, reportando problemas o sugiriendo mejoras."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {!hideTypeSelect && (
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Feedback *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
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
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Asunto (Opcional)</Label>
              <Input
                id="subject"
                placeholder="Breve descripción del tema"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje *</Label>
              <Textarea
                id="message"
                placeholder="Describe detalladamente tu feedback, error o sugerencia..."
                className="min-h-[120px]"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com (si quieres respuesta)"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+52 123 456 7890 (si quieres respuesta por WhatsApp)"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshot">Captura de Pantalla (Opcional)</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="flex-1"
                  />
                  {screenshot && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeScreenshot}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Quitar
                    </Button>
                  )}
                </div>

                {screenshotPreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                    <div className="relative inline-block">
                      <img
                        src={screenshotPreview}
                        alt="Vista previa de la captura"
                        className="max-w-full h-auto rounded-lg border border-gray-200 max-h-48 object-contain"
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Formatos aceptados: JPG, PNG, GIF. Máximo 5MB.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isSubmitting ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
