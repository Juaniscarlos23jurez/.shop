"use client";

import { useState } from "react";
import * as Lucide from "lucide-react";
const { ArrowLeft, Save, X } = Lucide as any;

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FlowchartEditor } from "@/components/whatsapp/FlowchartEditor";
import { FlowTemplate } from "@/types/whatsapp";
import { mockFlowTemplates } from "@/app/dashboard/whatsapp/flows/mock-data";
import { toast } from "@/hooks/use-toast";

const defaultFlow: FlowTemplate = {
  id: "",
  name: "",
  description: "",
  trigger: "manual",
  triggerKeywords: [],
  steps: [],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function CreateWhatsAppFlowPage() {
  const router = useRouter();
  const [selectedFlow, setSelectedFlow] = useState<FlowTemplate>(defaultFlow);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveFlow = async (data: Omit<FlowTemplate, "id" | "createdAt" | "updatedAt">) => {
    try {
      setIsSaving(true);
      // TODO: Replace with API POST /api/whatsapp/companies/:companyId/flows
      console.log("Saving flow", data);
      setTimeout(() => {
        toast({
          title: "Flujo guardado",
          description: "El flujo se creó correctamente y ya está disponible en la tabla.",
        });
        router.push("/dashboard/whatsapp/flows");
      }, 800);
    } catch (error) {
      console.error("Error saving flow", error);
      toast({
        title: "Error al guardar",
        description: "No pudimos guardar el flujo. Intenta nuevamente.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/whatsapp/flows")}
            aria-label="Regresar a flujos">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Crear flujo de WhatsApp</h1>
            <p className="text-sm text-gray-500">Define los mensajes y automatizaciones de tu asistente.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/whatsapp/flows")}
            disabled={isSaving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button size="sm" onClick={() => handleSaveFlow(selectedFlow)} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r bg-white overflow-y-auto">
          <Card className="m-4">
            <CardHeader>
              <CardTitle className="text-sm">Plantillas rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockFlowTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`p-3 cursor-pointer border ${selectedFlow.name === template.name ? "border-green-500" : "border-gray-200"}`}
                  onClick={() => setSelectedFlow({ ...template, id: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {template.name}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <Badge variant={template.isActive ? "default" : "secondary"} className="text-[10px]">
                      {template.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
          <Separator className="my-4" />
          <div className="px-4 pb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center justify-between">
                  <span>Pasos</span>
                  <span className="font-semibold">{selectedFlow.steps.length}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Trigger</span>
                  <span className="font-semibold capitalize">{selectedFlow.trigger.replace("_", " ")}</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex-1 bg-slate-50">
          <FlowchartEditor
            flow={selectedFlow}
            onSave={handleSaveFlow}
            onCancel={() => router.push("/dashboard/whatsapp/flows")}
          />
        </div>
      </div>
    </div>
  );
}
