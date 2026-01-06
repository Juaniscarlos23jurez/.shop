import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

interface PrinterDeviceWrapper {
    device: any; // BluetoothDevice
    characteristic: any; // BluetoothRemoteGATTCharacteristic
}

export const useThermalPrinter = () => {
    const { toast } = useToast();
    const [isConnected, setIsConnected] = useState(false);
    const [device, setDevice] = useState<any>(null); // BluetoothDevice
    const [characteristic, setCharacteristic] = useState<any>(null); // BluetoothRemoteGATTCharacteristic
    const [isPrinting, setIsPrinting] = useState(false);

    const connectDetails = useCallback(async () => {
        try {
            if (!(navigator as any).bluetooth) {
                toast({
                    title: "Error de compatibilidad",
                    description: "Tu navegador no soporta Bluetooth Web. Usa Chrome o Edge.",
                    variant: "destructive"
                });
                return;
            }

            console.log('Requesting Bluetooth Device...');
            const device = await (navigator as any).bluetooth.requestDevice({
                filters: [
                    { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }
                ],
                optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
            });

            console.log('Connecting to GATT Server...');
            const server = await device.gatt.connect();

            console.log('Getting Service...');
            const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');

            console.log('Getting Characteristic...');
            const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

            device.addEventListener('gattserverdisconnected', onDisconnected);

            setDevice(device);
            setCharacteristic(characteristic);
            setIsConnected(true);

            toast({
                title: "Impresora Conectada",
                description: `Conectado a ${device.name}`,
            });

        } catch (error) {
            console.error('Argh! ' + error);
            toast({
                title: "Error de conexión",
                description: "No se pudo conectar a la impresora. Asegúrate de que esté encendida.",
                variant: "destructive"
            });
        }
    }, [toast]);

    const onDisconnected = useCallback(() => {
        console.log('Device Disconnected');
        setIsConnected(false);
        setDevice(null);
        setCharacteristic(null);
        toast({
            title: "Desconectado",
            description: "La impresora se ha desconectado",
            variant: "destructive"
        });
    }, [toast]);

    const disconnect = useCallback(() => {
        if (device && device.gatt.connected) {
            device.gatt.disconnect();
        }
    }, [device]);

    // ESC/POS Commands
    const ESC = '\x1B';
    const GS = '\x1D';
    const LF = '\x0A';

    const commands = {
        INIT: ESC + '@',
        CENTER: ESC + 'a' + '\x01',
        LEFT: ESC + 'a' + '\x00',
        RIGHT: ESC + 'a' + '\x02',
        BOLD_ON: ESC + 'E' + '\x01',
        BOLD_OFF: ESC + 'E' + '\x00',
        CUT: GS + 'V' + '\x41' + '\x00', // Cut receipt
    };

    const printTicket = async (ticketData: {
        companyName: string;
        items: { name: string; quantity: number; price: number }[];
        total: number;
        date: string;
        saleId?: string | number;
        paymentMethod?: string;
    }) => {
        if (!characteristic) {
            toast({
                title: "No conectado",
                description: "Conecta una impresora primero",
                variant: "destructive"
            });
            return;
        }

        setIsPrinting(true);

        try {
            let receiptText = "";

            // Initialize
            receiptText += commands.INIT;

            // Header
            receiptText += commands.CENTER;
            receiptText += commands.BOLD_ON;
            receiptText += ticketData.companyName + LF;
            receiptText += commands.BOLD_OFF;
            receiptText += LF;
            receiptText += "Ticket de Venta" + LF;
            if (ticketData.saleId) receiptText += `Folio: #${ticketData.saleId}` + LF;
            receiptText += ticketData.date + LF;
            receiptText += LF;

            // Items
            receiptText += commands.LEFT;
            receiptText += "--------------------------------" + LF;
            receiptText += "CANT  PRODUCTO           IMPORTE" + LF;
            receiptText += "--------------------------------" + LF;

            ticketData.items.forEach(item => {
                const qty = item.quantity.toString().padEnd(4, ' ');
                // Truncate name to fit (approx 18 chars)
                let name = item.name.substring(0, 18).padEnd(20, ' ');
                const price = (item.price * item.quantity).toFixed(2).padStart(8, ' ');
                receiptText += `${qty}${name}${price}` + LF;
            });

            receiptText += "--------------------------------" + LF;

            // Totals
            receiptText += commands.RIGHT;
            receiptText += commands.BOLD_ON;
            receiptText += `TOTAL: $${ticketData.total.toFixed(2)}` + LF;
            receiptText += commands.BOLD_OFF;

            if (ticketData.paymentMethod) {
                receiptText += `Metodo: ${ticketData.paymentMethod}` + LF;
            }

            receiptText += LF + LF + LF;
            receiptText += commands.CENTER + "Gracias por su compra!" + LF;
            receiptText += LF + LF + LF; // Feed lines

            // Convert string to Uint8Array
            const encoder = new TextEncoder(); // This encodes to UTF-8. Some printers might need different encoding (like Windows-1252) for special chars.
            // For basic ASCII it's fine. For accented characters we might need to be careful or use a library, 
            // but for this MVP we'll stick to standard text. 
            // Manual stripping of accents could be good if printer doesn't support UTF-8.

            const data = encoder.encode(receiptText);

            // Write in chunks if needed (GATT max size is usually 512 bytes, but often 20 bytes for older BLE)
            // Most thermal printers handle bigger chunks but safe bet is usually chunks of 100-512
            const CHUNK_SIZE = 512;
            for (let i = 0; i < data.length; i += CHUNK_SIZE) {
                const chunk = data.slice(i, i + CHUNK_SIZE);
                await characteristic.writeValue(chunk);
            }

            toast({
                title: "Impresión enviada",
                description: "Ticket enviado a la impresora",
            });

        } catch (error) {
            console.error('Error printing:', error);
            toast({
                title: "Error de impresión",
                description: "Ocurrió un error al enviar datos a la impresora",
                variant: "destructive"
            });
        } finally {
            setIsPrinting(false);
        }
    };

    return {
        isConnected,
        isPrinting,
        connect: connectDetails,
        disconnect,
        printTicket
    };
};
