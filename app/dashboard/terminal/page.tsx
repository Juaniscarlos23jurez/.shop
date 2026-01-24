"use client";

import { useState, useEffect } from "react";
import { Bluetooth, Printer, RefreshCw, CheckCircle2, XCircle, Search, Info, Settings2, Smartphone, Terminal as TerminalIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { usePrinter } from "@/contexts/PrinterContext";

export default function TerminalPage() {
    const { toast } = useToast();
    const {
        isBluetoothConnected,
        btPrinterName,
        bluetoothDevice,
        connectBluetooth,
        disconnectBluetooth,
        printViaBluetooth,
        settings,
        setSettings
    } = usePrinter();

    const [isConnecting, setIsConnecting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        console.log("[TerminalPage] Estado del Contexto BT:", { isBluetoothConnected, btPrinterName, bluetoothDevice });
    }, [isBluetoothConnected, btPrinterName, bluetoothDevice]);

    const checkBluetoothAvailability = async () => {
        if (typeof window !== "undefined" && !navigator.bluetooth) {
            toast({
                title: "Bluetooth no disponible",
                description: "Tu navegador no soporta Web Bluetooth o no está habilitado.",
                variant: "destructive",
            });
            return false;
        }
        return true;
    };

    const handleConnect = async () => {
        const available = await checkBluetoothAvailability();
        if (!available) return;

        try {
            setIsScanning(true);
            await connectBluetooth();
            toast({
                title: "¡Conectado!",
                description: "Se ha vinculado con éxito a la impresora.",
            });
        } catch (error: any) {
            console.error("Bluetooth Connection Error:", error);
            toast({
                title: "Error de conexión",
                description: error.message || "No se pudo establecer conexión.",
                variant: "destructive",
            });
        } finally {
            setIsScanning(false);
        }
    };

    const disconnectPrinter = () => {
        disconnectBluetooth();
        toast({
            title: "Desconectado",
            description: "La impresora ha sido desconectada.",
        });
    };

    const handlePrintTest = async () => {
        try {
            await printViaBluetooth({
                logoUrl: "https://firebasestorage.googleapis.com/v0/b/finansas-mvapq7.firebasestorage.app/o/companies%2F1%2Flogo%2F1759896439034_logo_1754281609717.jpeg?alt=media&token=9523f0d7-78bd-4f37-83f9-24ea1c9b2714",
                companyName: "Miel de sol",
                items: [{ name: "Producto de Prueba", quantity: 1, price: 100 }],
                total: 100,
            });
            toast({
                title: "Impresión enviada",
                description: "Se ha enviado el ticket de prueba.",
            });
        } catch (error: any) {
            toast({
                title: "Error de impresión",
                description: error.message || "No se pudo imprimir.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                        <Smartphone className="h-10 w-10 text-emerald-500" />
                        Terminal Bluetooth
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Configura y conecta tu terminal de impresión térmica sin complicaciones.
                    </p>
                </div>
                <div className="flex gap-2">
                    {isBluetoothConnected ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-1.5 text-sm font-semibold flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Online: {btPrinterName}
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-semibold flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-slate-400" />
                            Desconectado
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Connection Control */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl bg-gradient-to-br from-white to-slate-50 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Bluetooth className="h-32 w-32" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Search className="h-6 w-6 text-emerald-500" />
                                Buscar Terminal
                            </CardTitle>
                            <CardDescription>
                                Utiliza el Bluetooth de tu navegador para conectar directamente con la impresora.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {!isBluetoothConnected ? (
                                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 space-y-4">
                                    <div className="bg-emerald-100 p-4 rounded-full">
                                        <Bluetooth className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-slate-900">No hay dispositivos vinculados</p>
                                        <p className="text-sm text-slate-500 px-8">
                                            Asegúrate de que tu impresora esté encendida y en modo vinculación.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleConnect}
                                        disabled={isScanning || isConnecting}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 h-auto text-lg rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                                    >
                                        {isScanning ? (
                                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <Search className="mr-2 h-5 w-5" />
                                        )}
                                        {isScanning ? "Escaneando..." : "Buscar Impresora"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-emerald-500 p-3 rounded-xl text-white">
                                                <Printer className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg leading-tight">{btPrinterName}</h4>
                                                <p className="text-sm text-slate-500 font-mono">{bluetoothDevice?.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">Conectado</Badge>
                                            <Button variant="ghost" size="sm" onClick={disconnectPrinter} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-auto py-1">
                                                Desconectar
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            onClick={handlePrintTest}
                                            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-600 border px-6 py-8 h-auto flex flex-col gap-2 rounded-2xl transition-all group"
                                        >
                                            <TerminalIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                                            <span className="font-semibold">Imprimir Test</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 border px-6 py-8 h-auto flex flex-col gap-2 rounded-2xl transition-all"
                                        >
                                            <Settings2 className="h-6 w-6" />
                                            <span className="font-semibold">Ajustes</span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Alert className="bg-blue-50 border-blue-100 text-blue-800 rounded-2xl border">
                        <Info className="h-5 w-5 !text-blue-600" />
                        <AlertTitle className="font-bold">¿Cómo conectar sin contraseña?</AlertTitle>
                        <AlertDescription className="text-blue-700">
                            Muchos modelos de impresoras térmicas Bluetooth utilizan el modo "Just Works" o códigos genéricos (0000 o 1234). Al pulsar en buscar, selecciona tu dispositivo y el sistema intentará la conexión automática.
                        </AlertDescription>
                    </Alert>
                </div>

                {/* Sidebar / Settings */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-slate-400" />
                                Configuración
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">Ancho de papel</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={settings.paperWidth === "58mm" ? "default" : "outline"}
                                        className={settings.paperWidth === "58mm" ? "bg-slate-900" : ""}
                                        onClick={() => setSettings(prev => ({ ...prev, paperWidth: "58mm" }))}
                                    >
                                        58mm
                                    </Button>
                                    <Button
                                        variant={settings.paperWidth === "80mm" ? "default" : "outline"}
                                        className={settings.paperWidth === "80mm" ? "bg-slate-900" : ""}
                                        onClick={() => setSettings(prev => ({ ...prev, paperWidth: "80mm" }))}
                                    >
                                        80mm
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-slate-900">Impresión Automática</p>
                                        <p className="text-xs text-slate-500">Imprimir al finalizar venta</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings(prev => ({ ...prev, autoPrint: !prev.autoPrint }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoPrint ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoPrint ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-slate-900">Número de Copias</p>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg"
                                            onClick={() => setSettings(prev => ({ ...prev, copies: Math.max(1, prev.copies - 1) }))}
                                        >
                                            <span className="text-lg">-</span>
                                        </Button>
                                        <span className="font-bold text-lg w-8 text-center">{settings.copies}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg"
                                            onClick={() => setSettings(prev => ({ ...prev, copies: prev.copies + 1 }))}
                                        >
                                            <span className="text-lg">+</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="ghost" className="w-full text-slate-400 hover:text-slate-600 text-xs">
                                Restaurar valores predeterminados
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Compatibility Card */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
                        <div className="absolute -bottom-4 -right-4 opacity-10">
                            <CheckCircle2 className="h-24 w-24" />
                        </div>
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            Alta Compatibilidad
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Compatible con la mayoría de impresoras térmicas del mercado (ESC/POS). No requiere controladores externos ni QZ Tray para esta conexión directa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
