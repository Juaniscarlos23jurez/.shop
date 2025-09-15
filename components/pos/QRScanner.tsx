"use client";

import { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Repeat, X } from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (customerId: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qrReader = useRef<BrowserQRCodeReader>(new BrowserQRCodeReader());

  useEffect(() => {
    const startScanning = async () => {
      if (!webcamRef.current?.video) return;

      try {
        setIsScanning(true);
        setError(null);

        // Iniciar el escaneo periódico
        scanIntervalRef.current = setInterval(async () => {
          try {
            const video = webcamRef.current?.video;
            if (!video) return;

            // Crear un canvas del tamaño del video
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Dibujar el frame actual del video
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(video, 0, 0);

            // Intentar decodificar el QR
            const result = await qrReader.current.decodeFromCanvas(canvas);

            if (result && result.getText()) {
              if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
              }
              setIsScanning(false);
              onScan(result.getText());
              onClose();
            }
          } catch (error: unknown) {
            // Ignorar errores de "QR no encontrado"
            if (error instanceof Error) {
              const errorMessage = error.message || '';
              if (typeof errorMessage === 'string' && !errorMessage.includes('not found')) {
                console.error('Error escaneando QR:', error);
              }
            } else {
              console.error('Error desconocido escaneando QR:', error);
            }
          }
        }, 500);

      } catch (error: unknown) {
        console.error('Error al iniciar el escáner:', error);
        setError('Error al acceder a la cámara. Por favor, verifique los permisos.');
      }
    };

    if (isOpen) {
      const initTimeout = setTimeout(startScanning, 1000);
      return () => {
        clearTimeout(initTimeout);
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
        }
        setIsScanning(false);
      };
    }

  }, [isOpen, onScan, onClose]);


  const handleError = (err: any) => {
    setError('Error al acceder a la cámara. Verifique los permisos.');
    console.error(err);
  };

  const toggleCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setFacingMode((prev: 'user' | 'environment') => prev === 'user' ? 'environment' : 'user');
    setIsScanning(false);
    
    // Reiniciar el escaneo después de cambiar la cámara
    setTimeout(() => {
      if (isOpen) {
        setIsScanning(true);
      }
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full sm:max-w-[500px] sm:max-h-[600px] p-0">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Escanear QR del Cliente
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 relative bg-black rounded-lg mx-4 mb-4 overflow-hidden">
          {/* Camera preview container */}
          <div className="relative w-full h-[300px] sm:h-[400px] bg-black rounded-lg overflow-hidden">
            {isOpen && (
              <>
              <Webcam
                ref={webcamRef}
                audio={false}
                videoConstraints={{
                  facingMode,
                  width: 1280,
                  height: 720
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                }}
                className="bg-black w-full h-full"
                onUserMediaError={(error) => {
                  setError('Error al acceder a la cámara. Verifique los permisos.');
                  console.error('Camera error:', error);
                }}
              />
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-white bg-black/50 px-4 py-2 rounded-full text-sm">
                    Escaneando...
                  </div>
                </div>
              )}
              </>
            )}
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner guides */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white opacity-80"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white opacity-80"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white opacity-80"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white opacity-80"></div>
              
              {/* Center scanning area */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white border-dashed opacity-60 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-4 mt-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleCamera}
              className="flex items-center gap-2"
            >
              <Repeat className="h-4 w-4" />
              {facingMode === 'environment' ? 'Cámara trasera' : 'Cámara frontal'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground px-4 pb-2">
            Coloca el código QR dentro del área marcada
          </div>

          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm text-center">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  setIsScanning(true);
                }}
                className="w-full mt-2"
              >
                Intentar de nuevo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
