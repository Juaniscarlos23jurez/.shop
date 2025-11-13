"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, QrCode } from "lucide-react"; // Import icons

export default function WebShopStorePage() {
  const [shopUrl, setShopUrl] = useState("https://your-web-shop-url.com"); // Replace with actual shop URL
  const [qrCodeData, setQrCodeData] = useState("https://your-web-shop-url.com"); // Data for QR code, can be same as URL

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Web Shop Store',
          url: shopUrl,
        });
        console.log('Web shop URL shared successfully');
      } catch (error) {
        console.error('Error sharing web shop URL:', error);
      }
    } else {
      alert(`Share this URL: ${shopUrl}`);
    }
  };

  // Function to generate QR code (placeholder, actual implementation would use a library)
  const generateQrCode = () => {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md">
        <QrCode className="w-24 h-24 text-gray-700" /> {/* Placeholder for QR code */}
      </div>
    );
  };

  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-6">Web Shop Store</h1>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics">Análisis de Rendimiento</TabsTrigger>
          <TabsTrigger value="general-info">Información General</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Rendimiento</CardTitle>
              <CardDescription>Métricas clave de tu tienda en línea.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total de Ventas</p>
                <p className="text-2xl font-bold">$12,345.67</p>
                <p className="text-xs text-green-500">+5% vs. último mes</p>
              </div>
              <div className="border p-4 rounded-lg">
                <p className="text-sm text-gray-500">Pedidos Realizados</p>
                <p className="text-2xl font-bold">450</p>
                <p className="text-xs text-green-500">+10% vs. último mes</p>
              </div>
              <div className="border p-4 rounded-lg">
                <p className="text-sm text-gray-500">Tasa de Conversión</p>
                <p className="text-2xl font-bold">2.5%</p>
                <p className="text-xs text-red-500">-0.2% vs. último mes</p>
              </div>
              <div className="border p-4 rounded-lg">
                <p className="text-sm text-gray-500">Visitantes Únicos</p>
                <p className="text-2xl font-bold">18,000</p>
                <p className="text-xs text-green-500">+8% vs. último mes</p>
              </div>
              <div className="border p-4 rounded-lg">
                <p className="text-sm text-gray-500">Tiempo Promedio en el Sitio</p>
                <p className="text-2xl font-bold">3:45 min</p>
                <p className="text-xs text-green-500">+15s vs. último mes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ventas por Período</CardTitle>
              <CardDescription>Visualiza el historial de ventas de tu tienda.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-100 flex items-center justify-center rounded-md text-gray-500">
                [Gráfico de Líneas de Ventas Aquí]
              </div>
              <p className="text-sm text-gray-500 mt-2">Seleccionar rango de fechas y métrica para visualizar.</p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
              <CardDescription>Identifica qué productos tienen mejor rendimiento.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                <li>Producto A (Ventas: $5,000)</li>
                <li>Producto B (Ventas: $3,500)</li>
                <li>Producto C (Ventas: $2,100)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Fuentes de Tráfico</CardTitle>
              <CardDescription>Entiende de dónde provienen tus visitantes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-100 flex items-center justify-center rounded-md text-gray-500">
                [Gráfico de Pastel/Donut de Fuentes de Tráfico Aquí]
              </div>
              <p className="text-sm text-gray-500 mt-2">Orgánico: 40%, Directo: 30%, Social: 20%, Referencia: 10%</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="general-info" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Información General de la Tienda</CardTitle>
              <CardDescription>Detalles y herramientas para tu tienda en línea.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">URL de la Tienda</h3>
                <div className="flex items-center space-x-2">
                  <Input type="text" value={shopUrl} readOnly className="flex-1" />
                  <Button onClick={() => navigator.clipboard.writeText(shopUrl)}>
                    Copiar URL
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Código QR de la Tienda</h3>
                <div className="flex items-center justify-center p-4 bg-gray-100 rounded-md w-48 h-48 mx-auto border border-gray-300">
                  <QrCode className="w-32 h-32 text-gray-700" /> {/* Placeholder for QR code */}
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">Escanea este código con tu dispositivo móvil para acceder directamente a tu tienda.</p>
                <Button variant="outline" className="mt-4 w-full">Descargar QR</Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Compartir Tienda</h3>
                <Button onClick={handleShare} className="flex items-center space-x-2 w-full">
                  <Share2 className="h-4 w-4" />
                  <span>Compartir Tienda (vía Web Share API)</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
