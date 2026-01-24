"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export type ThermalTicketItem = {
  name: string;
  quantity: number;
  price: number;
};

export type ThermalTicketPayload = {
  companyName?: string;
  items: ThermalTicketItem[];
  total: number;
  saleId?: number | string;
  footerMessage?: string;
  printerName?: string;
  [key: string]: unknown;
};

type UseThermalPrinterResult = {
  isConnected: boolean;
  isPrinting: boolean;
  availablePrinters: string[];
  connect: () => Promise<void>;
  disconnect: () => void;
  listPrinters: () => Promise<string[]>;
  printTicket: (payload: ThermalTicketPayload) => Promise<void>;
};

/**
 * Web-safe stub for thermal printer integration.
 *
 * In Vercel/production builds there is no direct access to USB/Bluetooth printers
 * without a dedicated client-side integration. This hook keeps the app compiling
 * and provides a predictable API for the POS and reports pages.
 */
export function useThermalPrinter(): UseThermalPrinterResult {
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([]);
  const qzRef = useRef<any>(null);

  const canUseQz = useMemo(() => typeof window !== "undefined", []);

  const ensureQz = useCallback(async () => {
    if (!canUseQz) {
      throw new Error("QZ Tray only works in the browser");
    }
    if (qzRef.current) return qzRef.current;

    const mod: any = await import("qz-tray");
    const qz: any = mod?.default ?? mod;
    // For local/dev usage, enable unsigned mode in QZ Tray (Settings -> Security).
    // These promises prevent qz from throwing if the site is not signed.
    try {
      qz.security.setCertificatePromise(() => Promise.resolve(null));
      qz.security.setSignaturePromise(() => Promise.resolve(null));
    } catch {
      // Ignore if security API differs; qz-tray versions vary.
    }
    qzRef.current = qz;
    return qz;
  }, [canUseQz]);

  const ensureConnected = useCallback(async () => {
    const qz = await ensureQz();
    if (qz.websocket.isActive()) return qz;

    const hosts = ["localhost", "127.0.0.1", "localhost.qz.io"];
    const securePorts = [8182, 8184];
    const insecurePorts = [8181, 8183];

    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const attempts: { host: string; port: number; usingSecure: boolean }[] = [];

    if (isHttps) {
      hosts.forEach(host => {
        securePorts.forEach(port => attempts.push({ host, port, usingSecure: true }));
        insecurePorts.forEach(port => attempts.push({ host, port, usingSecure: false }));
      });
    } else {
      hosts.forEach(host => {
        insecurePorts.forEach(port => attempts.push({ host, port, usingSecure: false }));
        securePorts.forEach(port => attempts.push({ host, port, usingSecure: true }));
      });
    }

    let lastError: any = null;
    for (const opts of attempts) {
      try {
        console.log(`[ThermalPrinter] Probando: ${opts.usingSecure ? 'wss' : 'ws'}://${opts.host}:${opts.port}`);

        await qz.websocket.connect({ ...opts, timeout: 5000 });

        if (qz.websocket.isActive()) {
          console.log(`[ThermalPrinter] Conectado en puerto ${opts.port}`);
          return qz;
        }
      } catch (e: any) {
        lastError = e;
      }
    }

    const errorMsg = isHttps
      ? "BLOQUEO DE NAVEGADOR. Por favor abre https://localhost:8182 y https://localhost:8184 en pestañas nuevas. Selecciona 'Opciones Avanzadas' -> 'Continuar' en AMBAS si el navegador te lo pide. Después regresa aquí e intenta de nuevo."
      : "No se pudo conectar con QZ Tray. Asegúrate de que el programa esté abierto y con 'Allow Unsigned' activado en Settings -> Security.";

    throw new Error(errorMsg);
  }, [ensureQz]);

  const connect = useCallback(async () => {
    try {
      const qz = await ensureConnected();
      setIsConnected(Boolean(qz.websocket.isActive()));
    } catch (error: any) {
      setIsConnected(false);
      // Lanzamos el error original para que la UI muestre el mensaje de diagnóstico
      throw error;
    }
  }, [ensureConnected]);

  const disconnect = useCallback(() => {
    const qz = qzRef.current;
    if (qz?.websocket?.isActive?.()) {
      qz.websocket.disconnect();
    }
    setIsConnected(false);
    setAvailablePrinters([]);
  }, []);

  const listPrinters = useCallback(async () => {
    try {
      const qz = await ensureConnected();
      const printers: string[] = await qz.printers.findAll();
      setAvailablePrinters(printers);
      return printers;
    } catch (error) {
      console.error("[ThermalPrinter] Error listing printers:", error);
      return [];
    }
  }, [ensureConnected]);

  const printTicket = useCallback(async (payload: ThermalTicketPayload) => {
    const qz = await ensureConnected();
    setIsConnected(Boolean(qz.websocket.isActive()));

    setIsPrinting(true);
    try {
      const storedPrinterName =
        typeof window !== "undefined" ? window.localStorage.getItem("qz_printer_name") : null;
      const printerName = (payload.printerName || storedPrinterName || "").trim();

      const printer = printerName
        ? await qz.printers.find(printerName)
        : await qz.printers.getDefault();

      const config = qz.configs.create(printer, {
        copies: 1,
        colorType: "blackwhite",
      });

      const money = (n: number) => {
        try {
          return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
          }).format(n);
        } catch {
          return `$${n.toFixed(2)}`;
        }
      };

      // Generamos un HTML simple que QZ Tray renderizará como imagen.
      // Esto evita que salga el código "% !PS-Adobe-3.0" en Mac.
      const htmlContent = `
        <div style="width: 100%; font-family: 'monospace'; font-size: 10pt; color: black; background: white; padding: 0; margin: 0;">
          <div style="text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 4px;">
            ${payload.companyName?.toUpperCase() || 'TICKET DE VENTA'}
          </div>
          <div style="border-bottom: 1px dashed black; margin-bottom: 4px; padding-bottom: 4px; font-size: 9pt;">
            ${payload.saleId ? `<div>Folio: #${payload.saleId}</div>` : ''}
            <div>Fecha: ${payload.date || new Date().toLocaleString()}</div>
            ${payload.paymentMethod ? `<div>Pago: ${payload.paymentMethod}</div>` : ''}
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9pt;">
            ${(payload.items || []).map(item => `
              <tr>
                <td style="padding: 1px 0;">${item.quantity}x ${item.name.substring(0, 18)}</td>
                <td style="text-align: right; padding: 1px 0;">${money(item.quantity * item.price)}</td>
              </tr>
            `).join('')}
          </table>

          <div style="border-top: 1px dashed black; padding-top: 4px; font-weight: bold; font-size: 12pt; display: flex; justify-content: space-between;">
            <span style="float: left;">TOTAL:</span>
            <span style="float: right;">${money(Number(payload.total || 0))}</span>
            <div style="clear: both;"></div>
          </div>

          <div style="text-align: center; margin-top: 12px; font-size: 8pt;">
            ${payload.footerMessage || '¡Gracias por su compra!'}
          </div>
          <div style="height: 40px;"></div>
        </div>
      `;

      const data = [{
        type: 'pixel',
        format: 'html',
        flavor: 'plain',
        data: htmlContent,
        options: {
          pageWidth: 2.1,
          pageHeight: null,
          units: 'in',
          density: 203,
          interpolation: 'nearest-neighbor'
        }
      }];

      await qz.print(config, data);
    } finally {
      setIsPrinting(false);
    }
  }, [ensureConnected]);

  return {
    isConnected,
    isPrinting,
    availablePrinters,
    connect,
    disconnect,
    listPrinters,
    printTicket,
  };
}
