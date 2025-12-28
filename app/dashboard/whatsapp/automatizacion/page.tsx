"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Settings, 
  MessageSquare,
  Clock,
  Users,
  TrendingUp,
  Zap,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api/api";
import { FlowTemplate, FlowStep } from "@/types/whatsapp";
import SetupGuard from "@/components/whatsapp/SetupGuard";

export default function WhatsAppAutomatizacion() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(true);
  const [setupStatus, setSetupStatus] = useState({
    step1: false,
    token: false,
    phone: false
  });
  const [flows, setFlows] = useState<FlowTemplate[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<FlowTemplate | null>(null);
  const [newFlow, setNewFlow] = useState({
    name: '',
    description: '',
    trigger: 'manual' as FlowTemplate['trigger'],
    triggerKeywords: [] as string[]
  });
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    fetchSetupStatus();
    fetchFlows();
  }, []);

  const fetchSetupStatus = async () => {
    if (!user?.company_id || !token) return;

    try {
      setSetupLoading(true);
      const response = await fetch(`/api/proxy/api/companies/${user.company_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success && result.data) {
        const company = result.data;
        setSetupStatus({
          step1: Boolean(company.whatsapp_webhook_configured),
          token: Boolean(company.has_whatsapp_access_token),
          phone: Boolean(company.whatsapp_phone_number_id)
        });
      }
    } catch (error) {
      console.error('Error fetching setup status:', error);
    } finally {
      setSetupLoading(false);
    }
  };

  const fetchFlows = async () => {
    if (!user?.company_id || !token) return;

    try {
      setLoading(true);
      const response = await api.whatsapp.getFlows(
        String(user.company_id),
        token
      );

      if (response.success && response.data) {
        setFlows(response.data);
      }
    } catch (error) {
      console.error('Error fetching flows:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los flujos automáticos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlow = async () => {
    if (!user?.company_id || !token) return;

    try {
      const flowData = {
        ...newFlow,
        steps,
        isActive: false
      };

      const response = await api.whatsapp.createFlow(
        String(user.company_id),
        flowData,
        token
      );

      if (response.success) {
        toast({
          title: "Flujo creado",
          description: "El flujo automático se ha creado correctamente",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchFlows();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el flujo automático",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFlow = async () => {
    if (!user?.company_id || !token || !editingFlow) return;

    try {
      const response = await api.whatsapp.updateFlow(
        String(user.company_id),
        editingFlow.id,
        editingFlow,
        token
      );

      if (response.success) {
        toast({
          title: "Flujo actualizado",
          description: "El flujo automático se ha actualizado correctamente",
        });
        setEditingFlow(null);
        fetchFlows();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el flujo automático",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (!user?.company_id || !token) return;

    try {
      const response = await api.whatsapp.deleteFlow(
        String(user.company_id),
        flowId,
        token
      );

      if (response.success) {
        toast({
          title: "Flujo eliminado",
          description: "El flujo automático se ha eliminado correctamente",
        });
        fetchFlows();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el flujo automático",
        variant: "destructive",
      });
    }
  };

  const handleToggleFlow = async (flow: FlowTemplate) => {
    if (!user?.company_id || !token) return;

    try {
      const response = await api.whatsapp.updateFlow(
        String(user.company_id),
        flow.id,
        { ...flow, isActive: !flow.isActive },
        token
      );

      if (response.success) {
        toast({
          title: flow.isActive ? "Flujo pausado" : "Flujo activado",
          description: `El flujo se ha ${flow.isActive ? 'pausado' : 'activado'} correctamente`,
        });
        fetchFlows();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del flujo",
        variant: "destructive",
      });
    }
  };

  const addStep = (type: FlowStep['type']) => {
    const newStep: FlowStep = {
      id: `step-${Date.now()}`,
      type,
      content: '',
      options: type === 'question' ? [''] : undefined,
      nextStep: undefined
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (index: number, updates: Partial<FlowStep>) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], ...updates };
    setSteps(updatedSteps);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setNewFlow({
      name: '',
      description: '',
      trigger: 'manual',
      triggerKeywords: []
    });
    setSteps([]);
  };

  const FlowCard = ({ flow }: { flow: FlowTemplate }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{flow.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{flow.description}</p>
          </div>
          <Badge variant={flow.isActive ? 'default' : 'secondary'}>
            {flow.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>{flow.steps.length} pasos</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{flow.stats?.totalTriggers || 0} usos</span>
            </div>
            {flow.stats?.completionRate && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{flow.stats.completionRate}% completado</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {flow.trigger === 'manual' && 'Manual'}
              {flow.trigger === 'first_message' && 'Primer mensaje'}
              {flow.trigger === 'keyword' && 'Por palabra clave'}
              {flow.trigger === 'post_purchase' && 'Post compra'}
              {flow.trigger === 'abandoned_cart' && 'Carrito abandonado'}
            </Badge>
            {flow.triggerKeywords && flow.triggerKeywords.length > 0 && (
              <Badge variant="outline">
                {flow.triggerKeywords.join(', ')}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant={flow.isActive ? "secondary" : "default"}
              onClick={() => handleToggleFlow(flow)}
            >
              {flow.isActive ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Activar
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingFlow(flow)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteFlow(flow.id)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
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
        <h2 className="text-3xl font-bold tracking-tight">Automatización y Flujos</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Flujo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Flujo Automático</DialogTitle>
              <DialogDescription>
                Configura un flujo de respuestas automáticas para tus clientes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Flujo</Label>
                <Input
                  id="name"
                  placeholder="Ej: Bienvenida, Horarios, etc."
                  value={newFlow.name}
                  onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe qué hace este flujo automático"
                  value={newFlow.description}
                  onChange={(e) => setNewFlow({ ...newFlow, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Disparador</Label>
                <Select
                  value={newFlow.trigger}
                  onValueChange={(value: FlowTemplate['trigger']) => 
                    setNewFlow({ ...newFlow, trigger: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="first_message">Primer mensaje</SelectItem>
                    <SelectItem value="keyword">Palabra clave</SelectItem>
                    <SelectItem value="post_purchase">Post compra</SelectItem>
                    <SelectItem value="abandoned_cart">Carrito abandonado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Pasos del Flujo</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addStep('message')}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Mensaje
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addStep('question')}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Pregunta
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addStep('condition')}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Condición
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addStep('ai_assistant')}
                    >
                      <Bot className="w-4 h-4 mr-1" />
                      IA Asistente
                    </Button>
                  </div>
                </div>

                {steps.map((step, index) => (
                  <Card key={step.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-sm font-medium">
                          {step.type === 'message' && 'Mensaje'}
                          {step.type === 'question' && 'Pregunta'}
                          {step.type === 'condition' && 'Condición'}
                          {step.type === 'ai_assistant' && 'IA Asistente'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStep(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Contenido del paso"
                      value={step.content}
                      onChange={(e) => updateStep(index, { content: e.target.value })}
                      className="mb-2"
                    />
                    {step.type === 'question' && (
                      <div className="space-y-2">
                        <Label>Opciones de respuesta</Label>
                        {step.options?.map((option, optIndex) => (
                          <Input
                            key={optIndex}
                            placeholder={`Opción ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(step.options || [])];
                              newOptions[optIndex] = e.target.value;
                              updateStep(index, { options: newOptions });
                            }}
                          />
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newOptions = [...(step.options || []), ''];
                            updateStep(index, { options: newOptions });
                          }}
                        >
                          Agregar opción
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateFlow} disabled={!newFlow.name || steps.length === 0}>
                Crear Flujo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {flows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay flujos automáticos</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer flujo para automatizar respuestas a tus clientes
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Flujo
              </Button>
            </CardContent>
          </Card>
        ) : (
          flows.map((flow) => <FlowCard key={flow.id} flow={flow} />)
        )}
      </div>
    </div>
  );
}
