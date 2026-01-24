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

    const hosts = ["localhost", "127.0.0.1"];
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";

    // Port 8182 is for Secure (WSS), Port 8181 is for Insecure (WS)
    const attempts: { host: string; port: number; usingSecure: boolean }[] = [];

    if (isHttps) {
      hosts.forEach(host => {
        attempts.push({ host, port: 8182, usingSecure: true });
        attempts.push({ host, port: 8181, usingSecure: false });
      });
    } else {
      hosts.forEach(host => {
        attempts.push({ host, port: 8181, usingSecure: false });
        attempts.push({ host, port: 8182, usingSecure: true });
      });
    }

    let lastError: any = null;
    for (const opts of attempts) {
      try {
        console.log(`[ThermalPrinter] Intentando conectar a QZ Tray en ${opts.usingSecure ? 'wss' : 'ws'}://${opts.host}:${opts.port}`);

        // Timeout de 10 segundos para dar tiempo en Macs cargadas
        await qz.websocket.connect({ ...opts, timeout: 10000 });

        if (qz.websocket.isActive()) {
          console.log(`[ThermalPrinter] Conectado exitosamente a QZ Tray`);
          return qz;
        }
      } catch (e: any) {
        console.warn(`[ThermalPrinter] Falló intento en ${opts.host}:${opts.port}`, e);
        lastError = e;
      }
    }

    const errorMsg = isHttps
      ? "ERROR DE SEGURIDAD. Tu navegador bloquea la conexión. Abre https://localhost:8182 en una pestaña nueva, dale a 'Opciones Avanzadas' y luego a 'Continuar'. Regresa aquí y recarga."
      : "No se pudo conectar con QZ Tray. Asegúrate de que esté abierto y con 'Allow Unsigned' activado en Settings -> Security.";

    throw new Error(errorMsg);
  }, [ensureQz]);

  const connect = useCallback(async () => {
    try {
      const qz = await ensureConnected();
      setIsConnected(Boolean(qz.websocket.isActive()));
    } catch {
      setIsConnected(false);
      throw new Error("Unable to establish connection with QZ");
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
        <div style="width: 100%; font-family: 'Courier New', monospace; font-size: 12px; color: black; background: white; padding: 0; margin: 0;">
          <div style="text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 5px;">
            ${payload.companyName?.toUpperCase() || 'TICKET DE VENTA'}
          </div>
          <div style="border-bottom: 1px dashed black; margin-bottom: 5px; padding-bottom: 5px;">
            ${payload.saleId ? `<div>Venta: #${payload.saleId}</div>` : ''}
            <div>Fecha: ${payload.date || new Date().toLocaleString()}</div>
            ${payload.paymentMethod ? `<div>Pago: ${payload.paymentMethod}</div>` : ''}
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
            ${(payload.items || []).map(item => `
              <tr>
                <td style="padding: 2px 0;">${item.quantity} x ${item.name}</td>
                <td style="text-align: right; padding: 2px 0;">${money(item.quantity * item.price)}</td>
              </tr>
            `).join('')}
          </table>

          <div style="border-top: 1px dashed black; padding-top: 5px; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between;">
            <span>TOTAL:</span>
            <span>${money(Number(payload.total || 0))}</span>
          </div>

          <div style="text-align: center; margin-top: 15px; font-size: 11px;">
            ${payload.footerMessage || '¡Gracias por su compra!'}
          </div>
          <div style="height: 30px;"></div>
        </div>
      `;

      const data = [{
        type: 'pixel',
        format: 'html',
        flavor: 'plain',
        data: htmlContent,
        options: {
          pageWidth: 2.1, // Aprox 58mm en pulgadas
          pageHeight: null // Automático
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
