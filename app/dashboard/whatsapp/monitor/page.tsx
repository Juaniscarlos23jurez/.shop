"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  QrCode,
  Link,
  Copy,
  Lock,
  HelpCircle,
  Wifi,
  WifiOff,
  Phone,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/api";

interface PhoneNumber {
  id: string;
  number: string;
  qualityRating: 'GREEN' | 'YELLOW' | 'RED';
  isDefault: boolean;
  name: string;
}

interface HealthStatus {
  status: 'connected' | 'restricted' | 'blocked';
  message: string;
}

export default function WhatsAppMonitor() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [pingingWebhook, setPingingWebhook] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({ status: 'connected', message: 'Todo funciona correctamente' });
  const [accessToken, setAccessToken] = useState('EAAJZC...JZBlA');

  useEffect(() => {
    fetchMonitorData();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchMonitorData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitorData = async () => {
    if (!user?.company_id || !token) return;

    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockPhoneNumbers: PhoneNumber[] = [
        {
          id: '1',
          number: '+52 55 1234 5678',
          qualityRating: 'GREEN',
          isDefault: true,
          name: 'WhatsApp Principal'
        },
        {
          id: '2',
          number: '+1 555 123 4567',
          qualityRating: 'YELLOW',
          isDefault: false,
          name: 'WhatsApp USA'
        }
      ];

      setPhoneNumbers(mockPhoneNumbers);
    } catch (error) {
      console.error('Error fetching monitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user?.company_id || !token) return;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Cuenta desconectada",
        description: "La conexión con WhatsApp ha sido terminada",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo desconectar la cuenta",
        variant: "destructive",
      });
    }
  };

  const handleGenerateQR = async () => {
    try {
      // Mock QR generation
      const qrUrl = `https://wa.me/15551234567?text=${encodeURIComponent('Hola, me gustaría obtener más información')}`;
      setQrCodeUrl(qrUrl);
      setShowQRModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el código QR",
        variant: "destructive",
      });
    }
  };

  const handleTestMessage = async () => {
    if (!testPhoneNumber || !user?.company_id || !token) return;

    try {
      setSendingTest(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Mensaje enviado",
        description: `Mensaje de prueba enviado a ${testPhoneNumber}`,
      });
      setTestPhoneNumber('');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje de prueba",
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handlePingWebhook = async () => {
    if (!user?.company_id || !token) return;

    try {
      setPingingWebhook(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Webhook verificado",
        description: "El webhook está respondiendo correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "El webhook no responde",
        variant: "destructive",
      });
    } finally {
      setPingingWebhook(false);
    }
  };

  const handleSetDefault = async (phoneId: string) => {
    try {
      // Mock API call
      setPhoneNumbers(prev => 
        prev.map(phone => ({
          ...phone,
          isDefault: phone.id === phoneId
        }))
      );
      toast({
        title: "Número actualizado",
        description: "El número predeterminado ha sido cambiado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el número",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "El texto se ha copiado al portapapeles",
    });
  };

  const getQualityColor = (rating: string) => {
    switch (rating) {
      case 'GREEN': return 'text-green-600 bg-green-100';
      case 'YELLOW': return 'text-yellow-600 bg-yellow-100';
      case 'RED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'restricted': return 'text-yellow-600';
      case 'blocked': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Monitor de WhatsApp</h1>
        <div className="flex gap-3">
          <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleGenerateQR}>
                <QrCode className="w-4 h-4 mr-2" />
                Click to get QR Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitación a Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center p-6 bg-gray-100 rounded-lg">
                  <QrCode className="w-48 h-48 text-gray-800" />
                </div>
                <div className="space-y-2">
                  <Label>URL de WhatsApp:</Label>
                  <div className="flex gap-2">
                    <Input value={qrCodeUrl} readOnly />
                    <Button size="sm" onClick={() => copyToClipboard(qrCodeUrl)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>URL para compartir:</Label>
                  <div className="flex gap-2">
                    <Input value={`https://api.whatsapp.com/send?phone=15551234567&text=Hola`} readOnly />
                    <Button size="sm" onClick={() => copyToClipboard('https://api.whatsapp.com/send?phone=15551234567&text=Hola')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleDisconnect}>
            <XCircle className="w-4 h-4 mr-2" />
            Disconnect Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Configuration and Tests */}
        <div className="space-y-6">
          {/* Token Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Panel de Token
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Lock className="w-4 h-4 text-gray-500" />
                <Input 
                  value={accessToken} 
                  readOnly 
                  className="bg-transparent border-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Este token representa el permiso del sistema con Meta
              </p>
            </CardContent>
          </Card>

          {/* Test Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Mensaje de Prueba
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-phone">Número de teléfono</Label>
                <div className="relative">
                  <Input
                    id="test-phone"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="+52 55 1234 5678"
                  />
                  <HelpCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Usa el formato internacional con código de país
                </p>
              </div>
              <Button 
                onClick={handleTestMessage} 
                disabled={!testPhoneNumber || sendingTest}
                className="w-full"
              >
                {sendingTest ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Smartphone className="w-4 h-4 mr-2" />
                )}
                Enviar Mensaje de Prueba
              </Button>
            </CardContent>
          </Card>

          {/* Webhook Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Verificación de Webhook
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handlePingWebhook} 
                disabled={pingingWebhook}
                className="w-full"
              >
                {pingingWebhook ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wifi className="w-4 h-4 mr-2" />
                )}
                Ping Webhook
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Verifica que Facebook puede comunicarse con tu servidor
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Health Status */}
        <div className="space-y-6">
          {/* Phone Numbers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Números de Teléfono
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {phoneNumbers.map((phone) => (
                <div key={phone.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{phone.name}</p>
                      <p className="text-sm text-gray-500">{phone.number}</p>
                    </div>
                    <Badge className={getQualityColor(phone.qualityRating)}>
                      {phone.qualityRating}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Calidad: {phone.qualityRating}</span>
                    {!phone.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(phone.id)}
                      >
                        Marcar como predeterminado
                      </Button>
                    )}
                    {phone.isDefault && (
                      <Badge variant="secondary">Predeterminado</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Overall Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Salud Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {healthStatus.status === 'connected' && <CheckCircle className="w-8 h-8 text-green-600" />}
                {healthStatus.status === 'restricted' && <AlertTriangle className="w-8 h-8 text-yellow-600" />}
                {healthStatus.status === 'blocked' && <XCircle className="w-8 h-8 text-red-600" />}
                <div>
                  <p className={`font-medium ${getHealthColor(healthStatus.status)}`}>
                    {healthStatus.status === 'connected' && 'Conectado'}
                    {healthStatus.status === 'restricted' && 'Restringido'}
                    {healthStatus.status === 'blocked' && 'Bloqueado'}
                  </p>
                  <p className="text-sm text-gray-500">{healthStatus.message}</p>
                </div>
              </div>
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Si la cuenta está bloqueada, Meta ha restringido el envío de mensajes por spam o falta de pago.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
