"use client";

import { useEffect, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (customerId: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (result) {
      const customerId = result?.text;
      if (customerId) {
        onScan(customerId);
        onClose();
      }
    }
  };

  const handleError = (err: any) => {
    setError('Error al escanear el código QR. Por favor, intente de nuevo.');
    console.error(err);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Escanear Código QR del Cliente</DialogTitle>
        </DialogHeader>
        <div className="w-full">
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={handleScan}
            containerStyle={{ width: '100%' }}
            videoStyle={{ width: '100%' }}
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
