"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Megaphone, 
  Plus, 
  Send, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pause,
  Play,
  BarChart3,
  Calendar,
  Eye,
  MessageSquare,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/api";
import SetupGuard from "@/components/whatsapp/SetupGuard";

interface Campaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  templateName: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'failed';
  recipients: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  scheduledAt?: string;
  sentAt?: string;
  completedAt?: string;
  createdAt: string;
}

export default function WhatsAppCampanas() {
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    templateId: '',
    recipientType: 'all' as 'all' | 'customers' | 'vip' | 'new',
    scheduledAt: ''
  });

  useEffect(() => {
    fetchSetupStatus();
    fetchCampaigns();
    fetchTemplates();
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

  const fetchCampaigns = async () => {
    if (!user?.company_id || !token) return;

    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Promoción de Verano',
          description: 'Descuentos especiales en productos de verano',
          templateId: 'promo-summer',
          templateName: 'Promoción Verano 2024',
          status: 'completed',
          recipients: {
            total: 500,
            sent: 500,
            delivered: 485,
            read: 320,
            failed: 15
          },
          sentAt: '2024-01-15T10:00:00Z',
          completedAt: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-14T15:00:00Z'
        },
        {
          id: '2',
          name: 'Nuevo Producto',
          description: 'Lanzamiento de nuestro nuevo producto estrella',
          templateId: 'new-product',
          templateName: 'Lanzamiento Producto',
          status: 'sending',
          recipients: {
            total: 1000,
            sent: 650,
            delivered: 620,
            read: 180,
            failed: 30
          },
          sentAt: '2024-01-20T14:00:00Z',
          createdAt: '2024-01-19T09:00:00Z'
        },
        {
          id: '3',
          name: 'Recordatorio de Compra',
          description: 'Recordar a clientes abandonar carrito',
          templateId: 'cart-reminder',
          templateName: 'Recordatorio Carrito',
          status: 'scheduled',
          recipients: {
            total: 200,
            sent: 0,
            delivered: 0,
            read: 0,
            failed: 0
          },
          scheduledAt: '2024-01-25T12:00:00Z',
          createdAt: '2024-01-21T11:00:00Z'
        }
      ];
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las campañas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!user?.company_id || !token) return;

    try {
      const response = await api.whatsapp.getTemplates(
        String(user.company_id),
        token
      );

      if (response.success && response.data) {
        // Filter only approved templates
        setTemplates(response.data.filter(t => t.status === 'approved'));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleCreateCampaign = async () => {
    if (!user?.company_id || !token) return;

    try {
      // Mock API call - replace with actual implementation
      const newCampaign: Campaign = {
        id: String(Date.now()),
        name: campaignData.name,
        description: campaignData.description,
        templateId: campaignData.templateId,
        templateName: templates.find(t => t.id === campaignData.templateId)?.name || '',
        status: campaignData.scheduledAt ? 'scheduled' : 'draft',
        recipients: {
          total: campaignData.recipientType === 'all' ? 1000 : 500,
          sent: 0,
          delivered: 0,
          read: 0,
          failed: 0
        },
        scheduledAt: campaignData.scheduledAt || undefined,
        createdAt: new Date().toISOString()
      };

      setCampaigns([newCampaign, ...campaigns]);
      toast({
        title: "Campaña creada",
        description: "La campaña se ha creado correctamente",
      });
      setIsCreateDialogOpen(false);
      setCampaignData({
        name: '',
        description: '',
        templateId: '',
        recipientType: 'all',
        scheduledAt: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la campaña",
        variant: "destructive",
      });
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (!user?.company_id || !token) return;

    try {
      // Mock API call - replace with actual implementation
      setCampaigns(campaigns.map(c => 
        c.id === campaignId 
          ? { ...c, status: 'sending', sentAt: new Date().toISOString() }
          : c
      ));
      toast({
        title: "Campaña enviada",
        description: "La campaña se está enviando",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la campaña",
        variant: "destructive",
      });
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    if (!user?.company_id || !token) return;

    try {
      setCampaigns(campaigns.map(c => 
        c.id === campaignId 
          ? { ...c, status: 'paused' }
          : c
      ));
      toast({
        title: "Campaña pausada",
        description: "La campaña se ha pausado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo pausar la campaña",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'sending': return <Send className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{campaign.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{campaign.description}</p>
          </div>
          <Badge className={getStatusColor(campaign.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(campaign.status)}
              <span className="capitalize">
                {campaign.status === 'completed' && 'Completada'}
                {campaign.status === 'sending' && 'Enviando'}
                {campaign.status === 'scheduled' && 'Programada'}
                {campaign.status === 'paused' && 'Pausada'}
                {campaign.status === 'failed' && 'Fallida'}
                {campaign.status === 'draft' && 'Borrador'}
              </span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Plantilla: {campaign.templateName}</span>
              <span>Destinatarios: {campaign.recipients.total}</span>
            </div>
            <Progress 
              value={(campaign.recipients.sent / campaign.recipients.total) * 100} 
              className="h-2"
            />
            <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
              <div className="text-center">
                <div className="font-medium text-green-600">{campaign.recipients.delivered}</div>
                <div>Entregados</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{campaign.recipients.read}</div>
                <div>Leídos</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-600">{campaign.recipients.sent}</div>
                <div>Enviados</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">{campaign.recipients.failed}</div>
                <div>Fallidos</div>
              </div>
            </div>
          </div>

          {campaign.scheduledAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Programada para: {new Date(campaign.scheduledAt).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            {campaign.status === 'draft' && (
              <Button
                size="sm"
                onClick={() => handleSendCampaign(campaign.id)}
              >
                <Send className="w-4 h-4 mr-1" />
                Enviar Ahora
              </Button>
            )}
            {campaign.status === 'scheduled' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePauseCampaign(campaign.id)}
              >
                <Pause className="w-4 h-4 mr-1" />
                Pausar
              </Button>
            )}
            {campaign.status === 'sending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePauseCampaign(campaign.id)}
              >
                <Pause className="w-4 h-4 mr-1" />
                Pausar Envío
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Ver Estadísticas
            </Button>
          </div>
        </div>
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
        <h2 className="text-3xl font-bold tracking-tight">Campañas Masivas</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Campaña
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear Nueva Campaña</DialogTitle>
              <DialogDescription>
                Envía mensajes masivos a tus clientes usando plantillas aprobadas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Campaña</Label>
                <Input
                  id="name"
                  placeholder="Ej: Promoción de Verano"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el propósito de esta campaña"
                  value={campaignData.description}
                  onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Plantilla de Mensaje</Label>
                <Select
                  value={campaignData.templateId}
                  onValueChange={(value) => setCampaignData({ ...campaignData, templateId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destinatarios</Label>
                <Select
                  value={campaignData.recipientType}
                  onValueChange={(value: 'all' | 'customers' | 'vip' | 'new') => 
                    setCampaignData({ ...campaignData, recipientType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los contactos</SelectItem>
                    <SelectItem value="customers">Clientes con compras</SelectItem>
                    <SelectItem value="vip">Clientes VIP</SelectItem>
                    <SelectItem value="new">Clientes nuevos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Programar Envío (Opcional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={campaignData.scheduledAt}
                  onChange={(e) => setCampaignData({ ...campaignData, scheduledAt: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCampaign} disabled={!campaignData.name || !campaignData.templateId}>
                Crear Campaña
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campañas</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {
                campaigns.filter((c) => ['draft', 'scheduled', 'sending'].includes(c.status))
                  .length
              }{" "}
              activas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes Enviados</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((acc, c) => acc + c.recipients.sent, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Entrega</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% vs mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Lectura</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.2%</div>
            <p className="text-xs text-muted-foreground">
              +5.3% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay campañas</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera campaña para enviar mensajes masivos
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Campaña
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)
        )}
      </div>
    </div>
  );
}
