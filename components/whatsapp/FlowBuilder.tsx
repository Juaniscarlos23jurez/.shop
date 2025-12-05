"use client";

import { useState } from 'react';
import { FlowTemplate, FlowStep } from '@/types/whatsapp';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import * as Lucide from 'lucide-react';
const { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  ArrowDown, 
  MessageSquare, 
  HelpCircle, 
  Clock, 
  Zap,
  Play,
  Pause
} = Lucide as any;

interface FlowBuilderProps {
  flow?: FlowTemplate;
  onSave: (flow: Omit<FlowTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function FlowBuilder({ flow, onSave, onCancel }: FlowBuilderProps) {
  const [flowData, setFlowData] = useState<Omit<FlowTemplate, 'id' | 'createdAt' | 'updatedAt'>>({
    name: flow?.name || '',
    description: flow?.description || '',
    trigger: flow?.trigger || 'manual',
    triggerKeywords: flow?.triggerKeywords || [],
    steps: flow?.steps || [],
    isActive: flow?.isActive || false,
  });

  const [editingStep, setEditingStep] = useState<FlowStep | null>(null);
  const [showStepDialog, setShowStepDialog] = useState(false);

  const addStep = () => {
    const newStep: FlowStep = {
      id: `step_${Date.now()}`,
      type: 'message',
      content: '',
    };
    setEditingStep(newStep);
    setShowStepDialog(true);
  };

  const editStep = (step: FlowStep) => {
    setEditingStep(step);
    setShowStepDialog(true);
  };

  const saveStep = (step: FlowStep) => {
    if (editingStep && flowData.steps.find(s => s.id === editingStep.id)) {
      // Editar paso existente
      setFlowData(prev => ({
        ...prev,
        steps: prev.steps.map(s => s.id === step.id ? step : s)
      }));
    } else {
      // Agregar nuevo paso
      setFlowData(prev => ({
        ...prev,
        steps: [...prev.steps, step]
      }));
    }
    setShowStepDialog(false);
    setEditingStep(null);
  };

  const deleteStep = (stepId: string) => {
    setFlowData(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== stepId)
    }));
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'question':
        return <HelpCircle className="w-4 h-4" />;
      case 'delay':
        return <Clock className="w-4 h-4" />;
      case 'action':
        return <Zap className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStepTypeLabel = (type: string) => {
    switch (type) {
      case 'message':
        return 'Mensaje';
      case 'question':
        return 'Pregunta';
      case 'delay':
        return 'Espera';
      case 'action':
        return 'Acción';
      default:
        return 'Mensaje';
    }
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'manual':
        return 'Manual';
      case 'first_message':
        return 'Primer mensaje';
      case 'keyword':
        return 'Palabra clave';
      case 'post_purchase':
        return 'Post-compra';
      case 'abandoned_cart':
        return 'Carrito abandonado';
      default:
        return 'Manual';
    }
  };

  return (
    <div className="space-y-4">
      {/* Información básica del flujo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Información del Flujo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-sm">Nombre del flujo</Label>
              <Input
                id="name"
                value={flowData.name}
                onChange={(e) => setFlowData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Bienvenida nuevos clientes"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="trigger" className="text-sm">Disparador</Label>
              <Select
                value={flowData.trigger}
                onValueChange={(value: any) => setFlowData(prev => ({ ...prev, trigger: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="first_message">Primer mensaje</SelectItem>
                  <SelectItem value="keyword">Palabra clave</SelectItem>
                  <SelectItem value="post_purchase">Post-compra</SelectItem>
                  <SelectItem value="abandoned_cart">Carrito abandonado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm">Descripción</Label>
            <Textarea
              id="description"
              value={flowData.description}
              onChange={(e) => setFlowData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe qué hace este flujo automático"
              className="mt-1 min-h-[60px]"
              rows={3}
            />
          </div>

          {flowData.trigger === 'keyword' && (
            <div>
              <Label htmlFor="keywords">Palabras clave (separadas por comas)</Label>
              <Input
                id="keywords"
                value={flowData.triggerKeywords?.join(', ') || ''}
                onChange={(e) => setFlowData(prev => ({ 
                  ...prev, 
                  triggerKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                }))}
                placeholder="hola, ayuda, info"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={flowData.isActive}
              onChange={(e) => setFlowData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="isActive">Flujo activo</Label>
          </div>
        </CardContent>
      </Card>

      {/* Pasos del flujo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pasos del Flujo</CardTitle>
            <Button onClick={addStep} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Paso
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {flowData.steps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay pasos configurados</p>
              <p className="text-sm">Agrega el primer paso para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flowData.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    {index < flowData.steps.length - 1 && (
                      <ArrowDown className="w-4 h-4 text-gray-400 mt-2" />
                    )}
                  </div>
                  
                  <Card className="flex-1">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStepIcon(step.type)}
                            <Badge variant="outline">
                              {getStepTypeLabel(step.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{step.content}</p>
                          {step.options && step.options.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {step.options.map((option, optIndex) => (
                                <Badge key={optIndex} variant="secondary" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editStep(step)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStep(step.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              // Previsualizar flujo
              console.log('Previsualizando flujo:', flowData);
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            Previsualizar
          </Button>
          <Button onClick={() => onSave(flowData)}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Flujo
          </Button>
        </div>
      </div>

      {/* Dialog para editar pasos */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStep && flowData.steps.find(s => s.id === editingStep.id) 
                ? 'Editar Paso' 
                : 'Nuevo Paso'
              }
            </DialogTitle>
          </DialogHeader>
          
          {editingStep && (
            <StepEditor
              step={editingStep}
              onSave={saveStep}
              onCancel={() => {
                setShowStepDialog(false);
                setEditingStep(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para editar un paso individual
function StepEditor({ 
  step, 
  onSave, 
  onCancel 
}: { 
  step: FlowStep; 
  onSave: (step: FlowStep) => void; 
  onCancel: () => void; 
}) {
  const [stepData, setStepData] = useState<FlowStep>(step);

  const addOption = () => {
    setStepData(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setStepData(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt) || []
    }));
  };

  const removeOption = (index: number) => {
    setStepData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="stepType">Tipo de paso</Label>
        <Select
          value={stepData.type}
          onValueChange={(value: any) => setStepData(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="message">Mensaje</SelectItem>
            <SelectItem value="question">Pregunta con opciones</SelectItem>
            <SelectItem value="delay">Espera</SelectItem>
            <SelectItem value="action">Acción</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="stepContent">
          {stepData.type === 'message' ? 'Mensaje' : 
           stepData.type === 'question' ? 'Pregunta' :
           stepData.type === 'delay' ? 'Tiempo de espera (segundos)' :
           'Descripción de la acción'}
        </Label>
        {stepData.type === 'delay' ? (
          <Input
            id="stepContent"
            type="number"
            value={stepData.delay || 0}
            onChange={(e) => setStepData(prev => ({ ...prev, delay: parseInt(e.target.value) }))}
            placeholder="60"
          />
        ) : (
          <Textarea
            id="stepContent"
            value={stepData.content}
            onChange={(e) => setStepData(prev => ({ ...prev, content: e.target.value }))}
            placeholder={
              stepData.type === 'message' ? 'Escribe el mensaje que se enviará...' :
              stepData.type === 'question' ? '¿Cuál es tu pregunta?' :
              'Describe la acción a realizar...'
            }
          />
        )}
      </div>

      {stepData.type === 'question' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Opciones de respuesta</Label>
            <Button variant="outline" size="sm" onClick={addOption}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar opción
            </Button>
          </div>
          <div className="space-y-2">
            {stepData.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Opción ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )) || []}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(stepData)}>
          Guardar Paso
        </Button>
      </div>
    </div>
  );
}
