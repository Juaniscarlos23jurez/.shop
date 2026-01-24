"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type PrinterItem = {
    name: string;
    quantity: number;
    price: number;
};

export type PrinterPayload = {
    companyName?: string;
    items: PrinterItem[];
    total: number;
    saleId?: number | string;
    date?: string;
    paymentMethod?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    logoUrl?: string;
    footerMessage?: string;
};

interface PrinterContextType {
    isBluetoothConnected: boolean;
    bluetoothDevice: any;
    btPrinterName: string | null;
    connectBluetooth: () => Promise<void>;
    disconnectBluetooth: () => void;
    printViaBluetooth: (payload: PrinterPayload) => Promise<void>;

    // Settings
    settings: {
        paperWidth: string;
        autoPrint: boolean;
        copies: number;
    };
    setSettings: React.Dispatch<React.SetStateAction<{
        paperWidth: string;
        autoPrint: boolean;
        copies: number;
    }>>;

    // QZ State (Optional legacy support)
    isQzConnected: boolean;
    connectQz: () => Promise<void>;
    printViaQz: (payload: PrinterPayload) => Promise<void>;
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export function PrinterProvider({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();

    // Bluetooth State
    const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
    const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
    const [btPrinterName, setBtPrinterName] = useState<string | null>(null);

    // Persistent refs for connection
    const serverRef = useRef<any>(null);
    const deviceRef = useRef<any>(null);
    const isManualDisconnect = useRef(false);
    const [showReconnectModal, setShowReconnectModal] = useState(false);

    // Global Printer Settings 
    const [settings, setSettings] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("printer_settings");
            return saved ? JSON.parse(saved) : {
                paperWidth: "58mm",
                autoPrint: true,
                copies: 1,
            };
        }
        return {
            paperWidth: "58mm",
            autoPrint: true,
            copies: 1,
        };
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("printer_settings", JSON.stringify(settings));
        }
    }, [settings]);

    // QZ State stub
    const [isQzConnected, setIsQzConnected] = useState(false);

    // Initial mount log and recovery attempt
    useEffect(() => {
        console.log("[PrinterProvider] Heartbeat & Recovery Monitor activo.");

        // Keep-alive heartbeat: Sends a null byte every 40s to prevent printer sleep
        const heartbeat = setInterval(async () => {
            if (serverRef.current?.connected) {
                try {
                    // We try to find the characteristic to send a tiny "noop" command
                    const services = await serverRef.current.getPrimaryServices();
                    for (const service of services) {
                        const chars = await service.getCharacteristics();
                        const writeChar = chars.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);
                        if (writeChar) {
                            // Send a "Null" byte (0x00) which usually doesn't print anything but keeps link active
                            await writeChar.writeValue(new Uint8Array([0x00]));
                            console.log("[PrinterProvider] Heartbeat sent.");
                            break;
                        }
                    }
                } catch (e) {
                    console.warn("[PrinterProvider] Heartbeat failed", e);
                }
            }
        }, 40000);

        // Heartbeat to check connection status and show modal if lost
        const monitor = setInterval(() => {
            if (deviceRef.current && !deviceRef.current.gatt?.connected && !isManualDisconnect.current && isBluetoothConnected) {
                console.warn("[PrinterProvider] Conexión perdida inesperadamente.");
                setIsBluetoothConnected(false);
                setShowReconnectModal(true);
            }
        }, 3000);

        return () => {
            clearInterval(heartbeat);
            clearInterval(monitor);
        };
    }, [isBluetoothConnected]);

    const connectBluetooth = useCallback(async () => {
        if (typeof window === "undefined") return;
        const nav = navigator as any;
        if (!nav.bluetooth) throw new Error("Bluetooth no disponible.");

        try {
            console.log("[PrinterContext] Solicitando dispositivo...");
            const device = await nav.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [
                    "000018f0-0000-1000-8000-00805f9b34fb",
                    "000018f1-0000-1000-8000-00805f9b34fb",
                    "e7810a71-73ae-499d-8c15-faa9aef0c3f2"
                ]
            });

            console.log("[PrinterContext] Conectando a GATT...");
            const server = await device.gatt?.connect();

            device.addEventListener('gattserverdisconnected', () => {
                if (!isManualDisconnect.current) {
                    console.warn("[PrinterContext] Desconexión inesperada detectada");
                    setIsBluetoothConnected(false);
                    setShowReconnectModal(true);
                }
            });

            deviceRef.current = device;
            serverRef.current = server;
            isManualDisconnect.current = false;
            setShowReconnectModal(false);

            setBluetoothDevice(device);
            setBtPrinterName(device.name || "Impresora BT");
            setIsBluetoothConnected(true);
            console.log("[PrinterContext] Éxito:", device.name);

        } catch (error: any) {
            console.error("[PrinterContext] Error:", error);
            throw error;
        }
    }, []);

    const disconnectBluetooth = useCallback(() => {
        isManualDisconnect.current = true;
        if (deviceRef.current?.gatt?.connected) {
            deviceRef.current.gatt.disconnect();
        }
        deviceRef.current = null;
        serverRef.current = null;
        setBluetoothDevice(null);
        setBtPrinterName(null);
        setIsBluetoothConnected(false);
        setShowReconnectModal(false);
    }, []);

    const sanitizeText = (text: string) => {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[ñÑ]/g, "n")         // Replace ñ
            .replace(/[¡!¿?]/g, "?")       // Replace spec chars
            .replace(/[^\x00-\x7F]/g, ""); // Remove non-ascii
    };

    const wrapText = (text: string, limit: number) => {
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length <= limit) {
                currentLine += (currentLine === "" ? "" : " ") + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        });
        lines.push(currentLine);
        return lines;
    };

    const printViaBluetooth = useCallback(async (payload: PrinterPayload) => {
        const server = serverRef.current;
        if (!server || !server.connected) {
            throw new Error("Impresora no conectada.");
        }

        const processImage = async (url: string): Promise<Uint8Array[]> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject("No se pudo crear contexto 2D");

                    // Resize to fit printer (max 384px for 58mm, but let's go with 120-160 for a logo)
                    const maxWidth = 160;
                    const scale = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scale;

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const pixels = imageData.data;

                    // ESC/POS GS v 0 command: GS v 0 m xL xH yL yH d1...dk
                    const widthBytes = Math.ceil(canvas.width / 8);
                    const height = canvas.height;

                    const data = new Uint8Array(widthBytes * height);
                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const idx = (y * canvas.width + x) * 4;
                            const r = pixels[idx];
                            const g = pixels[idx + 1];
                            const b = pixels[idx + 2];
                            const a = pixels[idx + 3];

                            // If pixel is transparent, treat as white
                            if (a < 128) continue;

                            const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
                            if (luminance < 140) { // Slightly more sensitive to black
                                data[y * widthBytes + Math.floor(x / 8)] |= (0x80 >> (x % 8));
                            }
                        }
                    }

                    // Split into chunks to avoid BT MTU limits
                    const chunks: Uint8Array[] = [];
                    // GS v 0 command
                    const header = new Uint8Array([0x1d, 0x76, 0x30, 0, widthBytes % 256, Math.floor(widthBytes / 256), height % 256, Math.floor(height / 256)]);
                    chunks.push(header);

                    const chunkSize = 256; // Smaller chunks for better stability
                    for (let i = 0; i < data.length; i += chunkSize) {
                        chunks.push(data.slice(i, i + chunkSize));
                    }
                    resolve(chunks);
                };
                img.onerror = (e) => {
                    console.error("[PrinterContext] Error al cargar imagen:", e);
                    reject("No se pudo cargar el logo");
                };
                img.src = url;
            });
        };

        try {
            const services = await server.getPrimaryServices();
            let printChar: any = null;

            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        printChar = char;
                        break;
                    }
                }
                if (printChar) break;
            }

            if (!printChar) throw new Error("No se encontró canal de escritura.");

            const encoder = new TextEncoder();
            const esc = {
                init: new Uint8Array([0x1b, 0x40]),
                center: new Uint8Array([0x1b, 0x61, 0x01]),
                left: new Uint8Array([0x1b, 0x61, 0x00]),
                boldOn: new Uint8Array([0x1b, 0x45, 0x01]),
                boldOff: new Uint8Array([0x1b, 0x45, 0x00]),
                feed: new Uint8Array([0x0a]),
                cut: new Uint8Array([0x1d, 0x56, 0x41, 0x10]),
            };

            const write = async (data: Uint8Array | string) => {
                const finalStr = typeof data === 'string' ? sanitizeText(data) : "";
                const bytes = typeof data === 'string' ? encoder.encode(finalStr) : data;
                await printChar!.writeValue(bytes);
            };

            for (let i = 0; i < (settings.copies || 1); i++) {
                await write(esc.init);
                await write(esc.center);

                // Print Logo if available
                if (payload.logoUrl) {
                    try {
                        const imageChunks = await processImage(payload.logoUrl);
                        for (const chunk of imageChunks) {
                            await write(chunk);
                            // Micro-delay between chunks to avoid BT buffer overflow
                            await new Promise(r => setTimeout(r, 10));
                        }
                        await write(esc.feed);
                        await new Promise(r => setTimeout(r, 200)); // Wait for image to print
                    } catch (e) {
                        console.warn("[PrinterContext] Error imprimiendo logo:", e);
                    }
                }

                await write(esc.boldOn);
                await write(`${payload.companyName?.toUpperCase() || 'TICKET DE VENTA'}\n`);
                await write(esc.boldOff);

                if (payload.address || payload.city) {
                    await write(`${payload.address || ''}\n`);
                    await write(`${payload.city || ''} ${payload.state || ''}\n`);
                }
                if (payload.phone) await write(`Tel: ${payload.phone}\n`);
                await write("\n");

                await write(esc.left);
                if (payload.saleId) await write(`Folio: #${payload.saleId}\n`);
                await write(`Fecha: ${payload.date || new Date().toLocaleString()}\n`);
                if (payload.paymentMethod) await write(`Pago: ${payload.paymentMethod}\n`);
                await write("--------------------------------\n");

                for (const item of payload.items) {
                    const nameLines = wrapText(item.name, 18);
                    const firstLine = nameLines.shift() || "";
                    const priceStr = `$${(item.quantity * item.price).toFixed(2).padStart(8)}`;

                    await write(`${item.quantity}x ${firstLine.padEnd(18)} ${priceStr}\n`);

                    for (const extraLine of nameLines) {
                        await write(`   ${extraLine}\n`);
                    }
                }

                await write("--------------------------------\n");
                await write(esc.boldOn);
                await write(`TOTAL: $${payload.total.toFixed(2).padStart(23)}\n`);
                await write(esc.boldOff);

                await write(esc.feed);
                await write(esc.center);
                await write(`${payload.footerMessage || 'Gracias por su compra'}\n`);
                await write(`powered by fynlink.shop\n\n\n\n`);
                await write(esc.cut);
                if (i < (settings.copies - 1)) await new Promise(r => setTimeout(r, 500));
            }

        } catch (error: any) {
            console.error("[PrinterContext] Error en impresión:", error);
            throw error;
        }
    }, [settings.copies]);

    const connectQz = useCallback(async () => setIsQzConnected(true), []);
    const printViaQz = useCallback(async (payload: PrinterPayload) => console.log("QZ Print", payload), []);

    const contextValue = React.useMemo(() => ({
        isBluetoothConnected,
        bluetoothDevice,
        btPrinterName,
        connectBluetooth,
        disconnectBluetooth,
        printViaBluetooth,
        isQzConnected,
        connectQz,
        printViaQz,
        settings,
        setSettings
    }), [
        isBluetoothConnected,
        bluetoothDevice,
        btPrinterName,
        connectBluetooth,
        disconnectBluetooth,
        printViaBluetooth,
        isQzConnected,
        connectQz,
        printViaQz,
        settings,
        setSettings
    ]);

    return (
        <PrinterContext.Provider value={contextValue}>
            {children}

            {/* Reconnect Modal */}
            {showReconnectModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-6">
                        <div className="bg-rose-100 p-4 rounded-full">
                            <Bluetooth className="h-10 w-10 text-rose-600 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900">Conexión perdida</h3>
                            <p className="text-slate-500">
                                La impresora se ha desconectado. Asegúrate de que esté cerca y encendida.
                            </p>
                        </div>
                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={handleReconnectAttempt}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Search className="h-5 w-5" />
                                Reconectar ahora
                            </button>
                            <button
                                onClick={() => setShowReconnectModal(false)}
                                className="w-full text-slate-400 hover:text-slate-600 text-sm font-medium py-2"
                            >
                                Cerrar aviso
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PrinterContext.Provider>
    );
}

// Sub-components as symbols
import { Bluetooth, Search } from "lucide-react";

function handleReconnectAttempt() {
    // This is just a UI trigger, the user must click "Reconnect" on the Terminal page usually
    // or we can redirect them to terminal
    window.location.href = "/dashboard/terminal";
}

export function usePrinter() {
    const context = useContext(PrinterContext);
    if (context === undefined) {
        throw new Error('usePrinter must be used within a PrinterProvider');
    }
    return context;
}
