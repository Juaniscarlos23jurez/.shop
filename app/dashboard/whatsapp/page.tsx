"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  BarChart3, 
  Send, 
  Users, 
  Activity, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Bot,
  Clock,
  Eye
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/api";
import SetupGuard from "@/components/whatsapp/SetupGuard";

export default function WhatsAppDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(true);
  const [setupStatus, setSetupStatus] = useState({
    step1: false,
    token: false,
    phone: false,
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [stats, setStats] = useState({
    messagesSentToday: 0,
    messagesReceivedToday: 0,
    activeConversations: 0,
    deliveryRate: 0,
    responseTime: 0,
    connectedDevices: 0,
    connectionStatus: 'disconnected' as 'connected' | 'disconnected' | 'error',
    recentActivity: []
  });

  useEffect(() => {
    fetchSetupStatus();
    fetchDashboardData();
  }, []);

  const fetchSetupStatus = async () => {
    if (!user?.company_id || !token) return;

    try {
      setSetupLoading(true);
      const response = await fetch(`/api/proxy/api/companies/${user.company_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success && result.data) {
        const company = result.data;
        setSetupStatus({
          step1: Boolean(company.whatsapp_webhook_configured),
          token: Boolean(company.has_whatsapp_access_token),
          phone: Boolean(company.whatsapp_phone_number_id),
        });
      }
    } catch (error) {
      console.error('Error fetching setup status:', error);
    } finally {
      setSetupLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!user?.company_id || !token) return;

    try {
      setLoading(true);
      
      // Fetch stats from API
      const statsResponse = await api.whatsapp.getStats(
        String(user.company_id),
        token,
        '24h'
      );

      if (statsResponse.success && statsResponse.data) {
        setStats({
          messagesSentToday: statsResponse.data.messagesSent24h || 0,
          messagesReceivedToday: statsResponse.data.messagesReceived24h || 0,
          activeConversations: statsResponse.data.activeConversations || 0,
          deliveryRate: 95.5, // Mock data - should come from API
          responseTime: statsResponse.data.responseTime || 0,
          connectedDevices: statsResponse.data.connectionStatus === 'connected' ? 1 : 0,
          connectionStatus: statsResponse.data.connectionStatus || 'disconnected',
          recentActivity: [] // Mock data - should come from API
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!user?.company_id || !token) return;

    setTestingConnection(true);
    try {
      // This would test the WhatsApp connection
      const response = await api.whatsapp.testConnection(
        String(user.company_id),
        token
      );

      if (response.success) {
        setStats(prev => ({ ...prev, connectionStatus: 'connected' }));
        toast({
          title: "Conexión exitosa",
          description: "La conexión con WhatsApp Business está activa",
        });
      } else {
        setStats(prev => ({ ...prev, connectionStatus: 'error' }));
        throw new Error('Connection failed');
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo establecer conexión con WhatsApp Business",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const MetricCard = ({ title, value, icon: Icon, change, changeType, subtitle }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs text-muted-foreground flex items-center mt-1 ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'positive' ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {change} vs ayer
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  const setupComplete = setupStatus.step1 && setupStatus.token && setupStatus.phone;

  if (loading || setupLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!setupComplete) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <SetupGuard
          step1Completed={setupStatus.step1}
          step2TokenStored={setupStatus.token}
          step2PhoneLinked={setupStatus.phone}
          onGoToSettings={() => router.push('/dashboard/whatsapp/configuracion')}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de WhatsApp</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={testingConnection}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${testingConnection ? 'animate-spin' : ''}`} />
            Probar Conexión
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Estado de la Conexión
            <Badge 
              variant={stats.connectionStatus === 'connected' ? 'default' : 'destructive'}
              className="flex items-center gap-2"
            >
              {stats.connectionStatus === 'connected' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Conectado
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Desconectado
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Estado actual de la conexión con WhatsApp Business API
              </p>
              <p className="text-xs text-muted-foreground">
                Dispositivos conectados: {stats.connectedDevices}
              </p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/whatsapp/configuracion')}
              variant="outline"
              size="sm"
            >
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Mensajes Enviados Hoy"
          value={stats.messagesSentToday}
          icon={Send}
          change="+12.5%"
          changeType="positive"
        />
        <MetricCard
          title="Mensajes Recibidos Hoy"
          value={stats.messagesReceivedToday}
          icon={MessageSquare}
          change="+8.2%"
          changeType="positive"
        />
        <MetricCard
          title="Conversaciones Activas"
          value={stats.activeConversations}
          icon={Users}
          change="-2.1%"
          changeType="negative"
        />
        <MetricCard
          title="Tasa de Entrega"
          value={`${stats.deliveryRate}%`}
          icon={CheckCircle}
          change="+0.5%"
          changeType="positive"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tiempo de Respuesta"
          value={`${stats.responseTime} min`}
          icon={Clock}
          subtitle="Promedio de respuesta"
        />
        <MetricCard
          title="Flujos Activos"
          value="5"
          icon={Bot}
          change="+1"
          changeType="positive"
        />
        <MetricCard
          title="Tasa de Apertura"
          value="87.3%"
          icon={Eye}
          change="+3.2%"
          changeType="positive"
        />
        <MetricCard
          title="Interacciones Hoy"
          value="142"
          icon={Activity}
          change="+15.7%"
          changeType="positive"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/whatsapp/inbox')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ir al Inbox</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Revisa y responde mensajes de tus clientes
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/whatsapp/automatizacion')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestionar Flujos</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Configura respuestas automáticas y bots
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/whatsapp/campanas')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crear Campaña</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Envía mensajes masivos a tus clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="messages" className="w-full">
            <TabsList>
              <TabsTrigger value="messages">Mensajes</TabsTrigger>
              <TabsTrigger value="campaigns">Campañas</TabsTrigger>
              <TabsTrigger value="flows">Flujos</TabsTrigger>
            </TabsList>
            <TabsContent value="messages" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">No hay actividad reciente</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="campaigns" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">No hay campañas recientes</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="flows" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">No hay actividad de flujos reciente</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
