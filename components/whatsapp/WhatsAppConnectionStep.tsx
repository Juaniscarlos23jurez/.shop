"use client";

import * as Lucide from 'lucide-react';
const { Bot, ArrowLeft } = Lucide as any;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WhatsAppConnectionStepProps {
  qrCodeUrl: string | null;
  sessionStatus: 'disconnected' | 'connecting' | 'waiting_qr' | 'connected' | 'error';
  sessionError: string | null;
  onStartSession: () => void;
}

export function WhatsAppConnectionStep({
  qrCodeUrl,
  sessionStatus,
  sessionError,
  onStartSession,
}: WhatsAppConnectionStepProps) {
  const isLoading = sessionStatus === 'connecting';

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-green-600" />
            Conecta tu WhatsApp Business
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Escanea el código QR con la app de WhatsApp en tu teléfono para vincular esta cuenta.
          </p>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-56 h-56 border border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-white relative overflow-hidden">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Código QR de WhatsApp"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.error('[WhatsApp] Error al cargar imagen de QR:', {
                        src: (e.target as HTMLImageElement)?.src,
                      });
                    }}
                  />
                ) : (
                  <div className="text-center px-4 text-gray-500 text-sm">
                    {isLoading
                      ? 'Generando código QR...'
                      : 'Haz clic en "Generar QR" para crear el código de conexión.'}
                  </div>
                )}
              </div>

              <Button
                onClick={onStartSession}
                disabled={isLoading}
                className="w-full md:w-auto bg-green-500 hover:bg-green-600"
              >
                {isLoading ? 'Conectando...' : 'Generar QR'}
              </Button>

              {sessionStatus === 'waiting_qr' && (
                <p className="text-xs text-gray-500 text-center max-w-xs">
                  Esperando a que escanees el código desde tu teléfono. Esta pantalla se actualizará automáticamente cuando la sesión esté conectada.
                </p>
              )}

              {sessionStatus === 'error' && sessionError && (
                <p className="text-xs text-red-600 text-center max-w-xs">
                  {sessionError}
                </p>
              )}
            </div>

            <div className="flex-1 space-y-3 text-sm text-gray-700">
              <h3 className="font-medium flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Cómo escanear el QR en WhatsApp
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Abre WhatsApp en tu teléfono.</li>
                <li>Ve a <span className="font-medium">Configuración {'>'} Dispositivos vinculados</span>.</li>
                <li>Toca <span className="font-medium">Vincular un dispositivo</span>.</li>
                <li>Escanea el código QR que ves en esta pantalla.</li>
              </ol>
              <p className="text-xs text-gray-500 mt-2">
                Tu sesión se mantendrá activa en nuestros servidores mientras esta ventana esté vinculada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
