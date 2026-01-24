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

    const host = "localhost";

    // If your site is HTTPS (e.g. Vercel), browsers block ws:// as mixed content.
    // QZ Tray uses 8182 for WSS and 8181 for WS.
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";

    // We try secure port 8182 first if on HTTPS. 
    // Fallback to 8181 if secure fails or if on HTTP.
    const attempts = isHttps
      ? [
        { host, port: 8182, usingSecure: true },
        { host, port: 8181, usingSecure: false }
      ]
      : [
        { host, port: 8181, usingSecure: false },
        { host, port: 8182, usingSecure: true }
      ];

    let lastError: unknown = null;
    for (const opts of attempts) {
      try {
        console.log(`[ThermalPrinter] Trying to connect to QZ Tray at ${opts.usingSecure ? 'wss' : 'ws'}://${opts.host}:${opts.port}`);
        await qz.websocket.connect(opts);
        if (qz.websocket.isActive()) {
          console.log(`[ThermalPrinter] Connected successfully to QZ Tray`);
          return qz;
        }
      } catch (e) {
        console.warn(`[ThermalPrinter] Failed attempt to connect to ${opts.host}:${opts.port}`, e);
        lastError = e;
      }
    }

    throw lastError || new Error("Unable to establish connection with QZ Tray. Make sure it's running.");
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

      const lines: string[] = [];
      lines.push("\x1B\x40");
      if (payload.companyName) lines.push(`${payload.companyName}\n`);
      lines.push("------------------------------\n");
      if (payload.saleId !== undefined) lines.push(`Venta: ${String(payload.saleId)}\n`);
      if (payload.date) lines.push(`${String(payload.date)}\n`);
      if (payload.paymentMethod) lines.push(`Pago: ${String(payload.paymentMethod)}\n`);
      lines.push("------------------------------\n");

      for (const item of payload.items || []) {
        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const lineTotal = qty * price;
        lines.push(`${qty} x ${item.name}  ${money(lineTotal)}\n`);
      }

      lines.push("------------------------------\n");
      lines.push(`TOTAL: ${money(Number(payload.total || 0))}\n`);
      if (payload.footerMessage) lines.push(`\n${payload.footerMessage}\n`);
      lines.push("\n\n\n");
      lines.push("\x1D\x56\x00");

      await qz.print(config, lines);
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
