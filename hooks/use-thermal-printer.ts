"use client";

import { useCallback, useState } from "react";

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
};

type UseThermalPrinterResult = {
  isConnected: boolean;
  isPrinting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
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

  const connect = useCallback(async () => {
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const printTicket = useCallback(async (payload: ThermalTicketPayload) => {
    if (!isConnected) {
      throw new Error("Printer not connected");
    }

    setIsPrinting(true);
    try {
      // Placeholder behavior: log the ticket payload. Replace with real printer integration.
      // eslint-disable-next-line no-console
      console.log("[ThermalPrinter] printTicket", payload);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setIsPrinting(false);
    }
  }, [isConnected]);

  return {
    isConnected,
    isPrinting,
    connect,
    disconnect,
    printTicket,
  };
}
