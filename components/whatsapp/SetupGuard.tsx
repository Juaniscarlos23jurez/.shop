"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface SetupGuardProps {
  step1Completed: boolean;
  step2TokenStored: boolean;
  step2PhoneLinked: boolean;
  onGoToSettings?: () => void;
}

const requirements = [
  {
    key: "step1",
    title: "Paso 1: Conectar Webhook",
    description:
      "Ingresa tu App ID y App Secret para suscribir tu servidor con Meta.",
  },
  {
    key: "step2_token",
    title: "Paso 2: Guardar Token de Acceso",
    description: "Proporciona el token de WhatsApp para que podamos enviar mensajes.",
  },
  {
    key: "step2_phone",
    title: "Paso 2: Sincronizar Número de WhatsApp",
    description:
      "Asocia tu número de WhatsApp Business para validar la conexión con Meta.",
  },
];

export function SetupGuard({
  step1Completed,
  step2TokenStored,
  step2PhoneLinked,
  onGoToSettings,
}: SetupGuardProps) {
  const statusMap: Record<string, boolean> = {
    step1: step1Completed,
    step2_token: step2TokenStored,
    step2_phone: step2PhoneLinked,
  };

  return (
    <Card className="max-w-3xl mx-auto text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Completa los pasos requeridos para continuar
        </CardTitle>
        <p className="text-muted-foreground">
          Necesitas finalizar la configuración de Meta (webhook y token) para acceder a esta sección.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {requirements.map((req) => {
            const completed = statusMap[req.key];
            const Icon = completed ? CheckCircle : AlertTriangle;
            const color = completed ? "text-green-600" : "text-amber-500";
            const textColor = completed ? "text-green-700" : "text-amber-600";

            return (
              <div
                key={req.key}
                className="flex flex-col items-center gap-2 rounded-lg border px-4 py-3"
              >
                <div className={`flex items-center gap-2 ${textColor}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="font-medium">{req.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{req.description}</p>
              </div>
            );
          })}
        </div>

        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={onGoToSettings}
        >
          Ir a Configuración
        </Button>
      </CardContent>
    </Card>
  );
}

export default SetupGuard;
