"use client";

import { useState } from 'react';
import * as Lucide from 'lucide-react';
const { Bot, ArrowLeft, Plus, TrendingUp, MoreVertical, Edit, Pause, Play, Trash2 } = Lucide as any;

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

import { FlowchartEditor } from "@/components/whatsapp/FlowchartEditor";
import { FlowTemplate } from "@/types/whatsapp";

export default function WhatsAppFlowsPage() {
  const router = useRouter();

  const [flowTemplates, setFlowTemplates] = useState<FlowTemplate[]>([
    {
      id: '1',
      name: 'Bienvenida Nuevos Clientes',
      description: 'Flujo automático para dar la bienvenida a nuevos clientes que escriben por primera vez.',
      trigger: 'first_message',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      steps: [],
    },
    {
      id: '2',
      name: 'Seguimiento Post-Venta',
      description: 'Pide feedback y ofrece un cupón después de una compra.',
      trigger: 'post_purchase',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      steps: [],
    },
  ]);

  const [editingFlow, setEditingFlow] = useState<FlowTemplate | null>(flowTemplates[0] || null);

  const handleNewFlow = () => {
    const emptyFlow: FlowTemplate = {
      id: '',
      name: '',
      description: '',
      trigger: 'manual',
      steps: [],
      isActive: false,
      createdAt: '',
      updatedAt: '',
    };
    setEditingFlow(emptyFlow);
  };

  const handleSaveFlow = (data: Omit<FlowTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingFlow && editingFlow.id) {
      // Actualizar en memoria
      setFlowTemplates((prev) =>
        prev.map((flow) =>
          flow.id === editingFlow.id
            ? {
                ...flow,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : flow,
        ),
      );
    } else {
      const newFlow: FlowTemplate = {
        ...data,
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFlowTemplates((prev) => [...prev, newFlow]);
      setEditingFlow(newFlow);
    }
  };

  const getTriggerLabel = (trigger: FlowTemplate['trigger']) => {
    switch (trigger) {
      case 'first_message':
        return 'Primer mensaje';
      case 'post_purchase':
        return 'Post-compra';
      case 'keyword':
        return 'Palabra clave';
      case 'abandoned_cart':
        return 'Carrito abandonado';
      default:
        return 'Manual';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/whatsapp')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Bot className="w-5 h-5 text-green-600" />
              Flujos Automáticos de WhatsApp
            </h1>
            <p className="text-sm text-gray-600">
              Diseña flujos tipo n8n para automatizar respuestas y opciones que verá el cliente.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNewFlow}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo flujo
          </Button>
          <Button variant="ghost" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Ver estadísticas
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel izquierdo: lista de flujos */}
        <div className="w-80 border-r bg-white flex flex-col">
          <div className="px-4 py-3 border-b">
            <h2 className="font-medium text-sm text-gray-800">Tus flujos</h2>
            <p className="text-xs text-gray-500">Selecciona un flujo para editarlo.</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {flowTemplates.map((flow) => (
                <Card
                  key={flow.id}
                  className={`p-3 cursor-pointer hover:shadow-sm transition-shadow border ${
                    editingFlow?.id === flow.id ? 'border-green-500' : ''
                  }`}
                  onClick={() => setEditingFlow(flow)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium truncate">{flow.name || 'Sin título'}</h3>
                      <p className="text-xs text-gray-500 truncate">
                        {getTriggerLabel(flow.trigger)}
                      </p>
                    </div>
                    <Badge
                      variant={flow.isActive ? 'default' : 'secondary'}
                      className="text-[10px] px-2 py-0.5 whitespace-nowrap"
                    >
                      {flow.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                    {flow.description || 'Sin descripción'}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                    <span>{flow.steps.length} pasos</span>
                    <span>{flow.createdAt ? new Date(flow.createdAt).toLocaleDateString() : ''}</span>
                  </div>

                  <div className="mt-2 flex justify-end gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingFlow(flow)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {flow.isActive ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
              {flowTemplates.length === 0 && (
                <p className="text-xs text-gray-500 px-1">No tienes flujos todavía. Crea uno nuevo.</p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Panel derecho: canvas tipo n8n con FlowBuilder */}
        <div className="flex-1 flex flex-col bg-slate-50">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="font-medium text-sm text-gray-800">
                {editingFlow?.name || 'Nuevo flujo'}
              </h2>
              <p className="text-xs text-gray-500">
                Define los mensajes y opciones que verá el cliente paso a paso.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {editingFlow && editingFlow.id && (
                <Badge
                  variant={editingFlow.isActive ? 'default' : 'secondary'}
                  className="text-[10px] px-2 py-0.5"
                >
                  {editingFlow.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <FlowchartEditor
              flow={editingFlow || undefined}
              onSave={(data: Omit<FlowTemplate, 'id' | 'createdAt' | 'updatedAt'>) => handleSaveFlow(data)}
              onCancel={() => {
                if (flowTemplates.length > 0) {
                  setEditingFlow(flowTemplates[0]);
                } else {
                  setEditingFlow(null);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
