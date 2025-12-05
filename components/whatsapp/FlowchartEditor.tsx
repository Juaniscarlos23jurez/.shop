"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import * as Lucide from 'lucide-react';
const { 
  Plus, 
  MessageSquare, 
  HelpCircle, 
  Clock, 
  Zap, 
  Play, 
  Trash2, 
  Settings,
  ArrowRight,
  Bot,
  Move,
  Link,
  Eye,
  Copy,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Brain,
  ShoppingCart,
  Headphones,
  CheckSquare
} = Lucide as any;

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { FlowTemplate, FlowStep } from '@/types/whatsapp';

interface FlowNode extends FlowStep {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Connection {
  from: string;
  to: string;
}

interface FlowchartEditorProps {
  flow?: FlowTemplate;
  onSave: (flowData: Omit<FlowTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function FlowchartEditor({ flow, onSave, onCancel }: FlowchartEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(true);
  
  const [flowData, setFlowData] = useState({
    name: flow?.name || '',
    description: flow?.description || '',
    trigger: flow?.trigger || 'manual' as const,
    triggerKeywords: flow?.triggerKeywords || [],
    isActive: flow?.isActive || false,
  });

  // Convertir steps a nodos con posiciones
  const [nodes, setNodes] = useState<FlowNode[]>(() => {
    if (flow?.steps && flow.steps.length > 0) {
      return flow.steps.map((step, index) => ({
        ...step,
        x: 100 + (index % 3) * 300,
        y: 100 + Math.floor(index / 3) * 200,
        width: 250,
        height: 120,
      }));
    }
    
    // Nodo inicial por defecto
    return [{
      id: 'start',
      type: 'message',
      content: 'Mensaje de bienvenida',
      x: 100,
      y: 100,
      width: 250,
      height: 120,
    }];
  });

  const [connections, setConnections] = useState<Connection[]>(() => {
    const conns: Connection[] = [];
    nodes.forEach(node => {
      if (node.nextStep) {
        conns.push({ from: node.id, to: node.nextStep });
      }
    });
    return conns;
  });

  const getNodeIcon = (type: FlowStep['type']) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'question': return HelpCircle;
      case 'delay': return Clock;
      case 'action': return Zap;
      case 'ai_assistant': return Brain;
      default: return MessageSquare;
    }
  };

  const getNodeColor = (type: FlowStep['type']) => {
    switch (type) {
      case 'message': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'question': return 'bg-green-50 border-green-200 text-green-900';
      case 'delay': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'action': return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'ai_assistant': return 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 text-pink-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getNodeTypeLabel = (type: FlowStep['type']) => {
    switch (type) {
      case 'message': return 'Mensaje';
      case 'question': return 'Pregunta';
      case 'delay': return 'Espera';
      case 'action': return 'Acción';
      case 'ai_assistant': return 'IA Assistant';
      default: return 'Paso';
    }
  };

  const addNewNode = (type: FlowStep['type']) => {
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type,
      content: type === 'message' ? 'Nuevo mensaje' : 
               type === 'question' ? '¿Nueva pregunta?' : 
               type === 'delay' ? 'Esperar...' : 
               type === 'ai_assistant' ? 'Asistente IA activado' : 'Nueva acción',
      x: 100 + nodes.length * 50,
      y: 100 + nodes.length * 50,
      width: 250,
      height: 120,
      ...(type === 'question' ? { options: ['Opción 1', 'Opción 2'] } : {}),
      ...(type === 'delay' ? { delay: 60 } : {}),
      ...(type === 'ai_assistant' ? { 
        aiConfig: {
          assistantType: 'customer_service',
          prompt: 'Eres un asistente de atención al cliente. Ayuda al usuario con sus consultas de manera amable y profesional.',
          maxTokens: 150,
          temperature: 0.7,
          fallbackMessage: 'Lo siento, no pude procesar tu consulta. Un agente te contactará pronto.'
        }
      } : {}),
    };
    
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
  };

  const updateNode = (nodeId: string, updates: Partial<FlowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const connectNodes = (fromId: string, toId: string) => {
    // Remover conexión existente del nodo origen
    setConnections(prev => prev.filter(conn => conn.from !== fromId));
    // Agregar nueva conexión
    setConnections(prev => [...prev, { from: fromId, to: toId }]);
    // Actualizar nextStep en el nodo
    updateNode(fromId, { nextStep: toId });
  };

  // Funciones de drag & drop
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return; // Solo botón izquierdo
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggedNode(nodeId);
    setIsDragging(true);
    setSelectedNode(nodeId);
    
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y
    });

    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, e.clientX - rect.left - dragOffset.x);
    const newY = Math.max(0, e.clientY - rect.top - dragOffset.y);

    updateNode(draggedNode, { x: newX, y: newY });
  }, [isDragging, draggedNode, dragOffset, updateNode]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Funciones de pan (arrastrar mapa)
  const handlePanStart = (e: React.MouseEvent) => {
    // Solo pan si está en modo pan o es click derecho
    if (panMode || e.button === 2) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  };

  const handlePanMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  }, [isPanning, panStart]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Event listeners para drag & drop y pan
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handlePanMove);
      document.addEventListener('mouseup', handlePanEnd);
      
      return () => {
        document.removeEventListener('mousemove', handlePanMove);
        document.removeEventListener('mouseup', handlePanEnd);
      };
    }
  }, [isPanning, handlePanMove, handlePanEnd]);

  // Funciones de utilidad
  const duplicateNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const newNode: FlowNode = {
      ...node,
      id: `node_${Date.now()}`,
      x: node.x + 50,
      y: node.y + 50,
      nextStep: undefined
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  const resetCanvas = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const autoLayout = () => {
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      x: 100 + (index % 4) * 300,
      y: 100 + Math.floor(index / 4) * 200,
    }));
    setNodes(updatedNodes);
  };

  // Función para dibujar líneas ortogonales entre nodos
  const renderConnections = () => {
    const allConnections: React.ReactElement[] = [];

    // Conexiones normales (nextStep)
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (!fromNode || !toNode) return;

      // Aplicar zoom y pan a las coordenadas
      const fromX = (fromNode.x + fromNode.width) * zoom + panOffset.x;
      const fromY = (fromNode.y + fromNode.height / 2) * zoom + panOffset.y;
      const toX = toNode.x * zoom + panOffset.x;
      const toY = (toNode.y + toNode.height / 2) * zoom + panOffset.y;

      // Líneas ortogonales (rectas con esquinas)
      const midX = fromX + (toX - fromX) / 2;
      const path = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;

      allConnections.push(
        <g key={`${conn.from}-${conn.to}`}>
          <path
            d={path}
            stroke="#6b7280"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
            className="flowchart-connection"
          />
          {/* Línea de hover más gruesa para mejor interacción */}
          <path
            d={path}
            stroke="transparent"
            strokeWidth="12"
            fill="none"
            className="cursor-pointer hover:stroke-red-200"
            onClick={(e) => {
              e.stopPropagation();
              setConnections(prev => prev.filter(c => c.from !== conn.from || c.to !== conn.to));
              updateNode(conn.from, { nextStep: undefined });
            }}
            onMouseEnter={(e) => {
              const visiblePath = e.currentTarget.previousElementSibling as SVGPathElement;
              if (visiblePath) {
                visiblePath.setAttribute('stroke', '#ef4444');
                visiblePath.setAttribute('stroke-width', '3');
              }
            }}
            onMouseLeave={(e) => {
              const visiblePath = e.currentTarget.previousElementSibling as SVGPathElement;
              if (visiblePath) {
                visiblePath.setAttribute('stroke', '#6b7280');
                visiblePath.setAttribute('stroke-width', '2');
              }
            }}
          />
        </g>
      );
    });

    // Conexiones de opciones (optionConnections)
    nodes.forEach(fromNode => {
      if (fromNode.type === 'question' && fromNode.optionConnections) {
        Object.entries(fromNode.optionConnections).forEach(([optionIndex, toNodeId]) => {
          const toNode = nodes.find(n => n.id === toNodeId);
          if (!toNode) return;

          const optionIdx = parseInt(optionIndex);
          const totalOptions = fromNode.options?.length || 1;
          
          // Calcular posición Y del punto de conexión de la opción
          const optionSpacing = fromNode.height / (totalOptions + 1);
          const optionY = fromNode.y + optionSpacing * (optionIdx + 1);

          // Aplicar zoom y pan
          const fromX = (fromNode.x + fromNode.width + 12) * zoom + panOffset.x; // +12 para el offset del punto
          const fromY = optionY * zoom + panOffset.y;
          const toX = toNode.x * zoom + panOffset.x;
          const toY = (toNode.y + toNode.height / 2) * zoom + panOffset.y;

          const midX = fromX + (toX - fromX) / 2;
          const path = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;

          // Color diferente para conexiones de opciones
          const optionColor = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][optionIdx % 5];

          allConnections.push(
            <g key={`${fromNode.id}_${optionIndex}-${toNodeId}`}>
              <path
                d={path}
                stroke={optionColor}
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
                className="flowchart-connection"
                strokeDasharray="5,5"
              />
              {/* Línea de hover */}
              <path
                d={path}
                stroke="transparent"
                strokeWidth="12"
                fill="none"
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  updateNode(fromNode.id, {
                    optionConnections: {
                      ...fromNode.optionConnections,
                      [optionIndex]: undefined
                    }
                  });
                }}
              />
              {/* Label de la opción */}
              <text
                x={(fromX + midX) / 2}
                y={fromY - 5}
                fontSize="10"
                fill={optionColor}
                className="pointer-events-none font-medium"
              >
                {fromNode.options?.[optionIdx]?.substring(0, 15) || `Opción ${optionIdx + 1}`}
              </text>
            </g>
          );
        });
      }
    });

    return allConnections;
  };

  const handleSave = () => {
    const steps = nodes.map(node => ({
      id: node.id,
      type: node.type,
      content: node.content,
      ...(node.options ? { options: node.options } : {}),
      ...(node.nextStep ? { nextStep: node.nextStep } : {}),
      ...(node.optionConnections ? { optionConnections: node.optionConnections } : {}),
      ...(node.delay ? { delay: node.delay } : {}),
      ...(node.aiConfig ? { aiConfig: node.aiConfig } : {}),
    }));

    onSave({
      ...flowData,
      steps,
    });
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  return (
    <div className="h-full flex">
      {/* Canvas principal */}
      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        {/* Toolbar superior */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white rounded-lg shadow-lg p-2 border">
          {/* Nodos */}
          <div className="flex gap-1 border-r pr-2">
            <Button
              size="sm"
              onClick={() => addNewNode('message')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Mensaje
            </Button>
            <Button
              size="sm"
              onClick={() => addNewNode('question')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Pregunta
            </Button>
            <Button
              size="sm"
              onClick={() => addNewNode('delay')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Clock className="w-4 h-4 mr-1" />
              Espera
            </Button>
            <Button
              size="sm"
              onClick={() => addNewNode('action')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Zap className="w-4 h-4 mr-1" />
              Acción
            </Button>
            <Button
              size="sm"
              onClick={() => addNewNode('ai_assistant')}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
            >
              <Brain className="w-4 h-4 mr-1" />
              IA Assistant
            </Button>
          </div>

          {/* Herramientas */}
          <div className="flex gap-1 border-r pr-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPanMode(!panMode)}
              title="Modo arrastrar mapa"
              className={panMode ? 'bg-blue-100 border-blue-300' : ''}
            >
              <Move className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={autoLayout}
              title="Auto organizar"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetCanvas}
              title="Centrar vista"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle grid"
              className={showGrid ? 'bg-blue-50' : ''}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </div>

        </div>

        {/* Info panel flotante */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 rounded-lg shadow-lg border text-sm max-w-xs overflow-hidden">
          <div className="px-3 py-2 flex items-center justify-between gap-2 border-b">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span className="font-medium text-gray-900">Cómo usar el editor</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-500 hover:text-gray-800"
              onClick={() => setShowHelpPanel(!showHelpPanel)}
            >
              {showHelpPanel ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>

          {showHelpPanel && (
            <div className="p-3 space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Move className="w-3 h-3" />
                <span>Arrastra los nodos para moverlos</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-3 h-3" />
                <span>Click para seleccionar y editar</span>
              </div>
              <div className="space-y-1 bg-blue-50 p-2 rounded border border-blue-200">
                <div className="font-medium text-blue-700 flex items-center gap-1">
                  <Link className="w-3 h-3" />
                  Conectar nodos:
                </div>
                <div className="text-blue-600 ml-5">
                  • Punto <span className="inline-block w-2 h-2 bg-gray-400 rounded-full align-middle"></span> gris: Click para iniciar
                </div>
                <div className="text-blue-600 ml-5">
                  • Punto <span className="inline-block w-2 h-2 bg-green-500 rounded-full align-middle"></span> verde: Click para conectar
                </div>
              </div>
              <div className="space-y-1 bg-orange-50 p-2 rounded border border-orange-200">
                <div className="font-medium text-orange-700 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  Opciones (Preguntas):
                </div>
                <div className="text-orange-600 ml-5">
                  • Puntos <span className="inline-block w-2 h-2 bg-orange-300 rounded-full align-middle"></span> naranjas a la derecha
                </div>
                <div className="text-orange-600 ml-5">
                  • Hover para ver qué opción es
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-3 h-3" />
                <span>Hover sobre línea → click para eliminar conexión</span>
              </div>
              <div className="flex items-center gap-2">
                <Move className="w-3 h-3" />
                <span>Activa modo pan (🔄) o click derecho para arrastrar mapa</span>
              </div>
              {panMode && (
                <div className="bg-green-50 p-2 rounded border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <Move className="w-3 h-3" />
                    <span className="font-medium">Modo pan activo</span>
                  </div>
                  <div className="text-green-600 text-[10px] mt-1">
                    Click y arrastra para mover el mapa
                  </div>
                </div>
              )}
              {connectingFrom && (
                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Conectando...</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-blue-600 hover:text-blue-800"
                      onClick={() => setConnectingFrom(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-blue-600 mt-1 text-[10px]">
                    Click en un punto verde para completar
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canvas con nodos */}
        <div 
          ref={canvasRef}
          className={`relative w-full h-full min-h-[600px] ${showGrid ? 'flowchart-grid' : 'bg-gray-50'} ${
            isPanning ? 'cursor-grabbing' : panMode ? 'cursor-grab' : 'cursor-default'
          }`}
          style={{ 
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`
          }}
          onMouseDown={handlePanStart}
          onClick={(e) => {
            // Si se hace click en el canvas (no en un nodo), cancelar conexión
            if (e.target === e.currentTarget && connectingFrom) {
              setConnectingFrom(null);
            }
          }}
        >
          {/* SVG para las conexiones */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#6b7280"
                />
              </marker>
            </defs>
            {renderConnections()}
          </svg>

          {/* Nodos */}
          {nodes.map(node => {
            const Icon = getNodeIcon(node.type);
            const isSelected = selectedNode === node.id;
            const isDraggedNode = draggedNode === node.id;
            
            return (
              <Card
                key={node.id}
                className={`absolute transition-all duration-200 select-none ${getNodeColor(node.type)} ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-xl scale-105' : 'hover:shadow-lg hover:scale-102'
                } ${isDraggedNode ? 'cursor-grabbing z-50' : 'cursor-grab'} ${
                  connectingFrom && connectingFrom !== node.id ? 'ring-2 ring-green-300 shadow-lg' : ''
                } flowchart-node ${
                  node.type === 'message' ? 'node-message' :
                  node.type === 'question' ? 'node-question' :
                  node.type === 'delay' ? 'node-delay' :
                  node.type === 'ai_assistant' ? 'node-ai_assistant' : 'node-action'
                }`}
                style={{
                  left: node.x * zoom + panOffset.x,
                  top: node.y * zoom + panOffset.y,
                  width: node.width,
                  height: node.height,
                  transform: `scale(${zoom}) ${isDraggedNode ? 'rotate(2deg)' : 'rotate(0deg)'}`,
                  transformOrigin: 'top left',
                }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node.id);
                }}
              >
                <div className="p-3 h-full flex flex-col relative">
                  {/* Header del nodo */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${
                        node.type === 'message' ? 'bg-blue-100' :
                        node.type === 'question' ? 'bg-green-100' :
                        node.type === 'delay' ? 'bg-yellow-100' : 'bg-purple-100'
                      }`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {getNodeTypeLabel(node.type)}
                      </Badge>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-gray-500 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateNode(node.id);
                        }}
                        title="Duplicar"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-gray-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNode(node.id);
                        }}
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Contenido del nodo */}
                  <div className="flex-1 text-sm">
                    <p className="font-medium line-clamp-2 mb-1 text-gray-800">
                      {node.content || 'Sin contenido'}
                    </p>
                    
                    {/* Detalles específicos por tipo */}
                    {node.type === 'question' && node.options && (
                      <div className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 mt-1">
                        <div className="flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          <span>{node.options.length} opciones</span>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {node.options.slice(0, 2).map((option, idx) => (
                            <div key={idx} className="text-[10px] truncate flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                node.optionConnections?.[idx] ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                              {option}
                            </div>
                          ))}
                          {node.options.length > 2 && (
                            <div className="text-[10px] text-gray-500">+{node.options.length - 2} más</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {node.type === 'delay' && node.delay && (
                      <div className="text-xs text-gray-600 bg-yellow-50 rounded px-2 py-1 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Esperar {node.delay}s</span>
                        </div>
                      </div>
                    )}

                    {node.type === 'action' && (
                      <div className="text-xs text-gray-600 bg-purple-50 rounded px-2 py-1 mt-1">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>Acción automática</span>
                        </div>
                      </div>
                    )}

                    {node.type === 'ai_assistant' && node.aiConfig && (
                      <div className="text-xs text-gray-600 bg-gradient-to-r from-pink-50 to-purple-50 rounded px-2 py-1 mt-1 border border-pink-200">
                        <div className="flex items-center gap-1 mb-1">
                          <Brain className="w-3 h-3" />
                          <span className="font-medium">
                            {node.aiConfig.assistantType === 'customer_service' && '🎧 Atención al Cliente'}
                            {node.aiConfig.assistantType === 'sales' && '🛒 Ventas'}
                            {node.aiConfig.assistantType === 'support' && '🔧 Soporte Técnico'}
                            {node.aiConfig.assistantType === 'order_confirmation' && '✅ Confirmación'}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">
                          Tokens: {node.aiConfig.maxTokens || 150}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Indicador de conexión */}
                  {node.nextStep && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}

                  {/* Puntos de conexión de salida */}
                  {node.type === 'question' && node.options ? (
                    // Múltiples puntos para preguntas
                    <div className="absolute -right-12 top-0 bottom-0 flex flex-col justify-center gap-2 z-10">
                      {node.options.map((option, optionIndex) => {
                        const isConnecting = connectingFrom === `${node.id}_${optionIndex}`;
                        const isConnected = node.optionConnections?.[optionIndex];
                        
                        return (
                          <div 
                            key={optionIndex}
                            className="group relative flex items-center gap-2"
                          >
                            {/* Etiqueta de la opción */}
                            <div className="hidden group-hover:flex absolute -right-32 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20">
                              {option.substring(0, 20)}
                              <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900"></div>
                            </div>
                            
                            {/* Punto de conexión */}
                            <div 
                              className={`w-4 h-4 rounded-full cursor-pointer transition-all border-2 shadow-md hover:shadow-lg flowchart-connection-point ${
                                isConnecting
                                  ? 'border-blue-600 bg-blue-400 animate-pulse scale-125' 
                                  : isConnected
                                  ? 'border-green-600 bg-green-400 hover:scale-110'
                                  : 'border-orange-400 bg-orange-300 hover:border-blue-600 hover:bg-blue-300 hover:scale-110'
                              }`}
                              title={`Opción: ${option}`}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                
                                const connectionId = `${node.id}_${optionIndex}`;
                                
                                if (connectingFrom && connectingFrom !== connectionId) {
                                  // Si estamos conectando desde otro nodo/opción
                                  if (connectingFrom.includes('_')) {
                                    // Conectar desde una opción específica
                                    const parts = connectingFrom.split('_');
                                    const fromOptionIndex = parts[parts.length - 1];
                                    const fromNodeId = parts.slice(0, -1).join('_');
                                    console.log('[Flowchart] Connect from option', { fromNodeId, fromOptionIndex, toNodeId: node.id });
                                    updateNode(fromNodeId, {
                                      optionConnections: {
                                        ...nodes.find(n => n.id === fromNodeId)?.optionConnections,
                                        [parseInt(fromOptionIndex)]: node.id
                                      }
                                    });
                                  } else {
                                    // Conectar desde un nodo normal
                                    console.log('[Flowchart] Connect from node to option target', { fromNodeId: connectingFrom, toNodeId: node.id });
                                    connectNodes(connectingFrom, node.id);
                                  }
                                  setConnectingFrom(null);
                                } else if (!connectingFrom) {
                                  // Iniciar conexión desde esta opción
                                  console.log('[Flowchart] Start connection from option', { connectionId, optionIndex, nodeId: node.id });
                                  setConnectingFrom(connectionId);
                                } else {
                                  // Cancelar conexión
                                  console.log('[Flowchart] Cancel option connection', { connectingFrom });
                                  setConnectingFrom(null);
                                }
                              }}
                            >
                              {isConnecting && (
                                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                              )}
                            </div>
                            
                            {/* Indicador de estado */}
                            {isConnected && (
                              <div className="text-xs text-green-600 font-medium">✓</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Punto único para otros tipos de nodos
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                      <div 
                        className={`w-4 h-4 rounded-full cursor-pointer transition-all border-2 shadow-md hover:shadow-lg flowchart-connection-point ${
                          connectingFrom === node.id 
                            ? 'border-blue-600 bg-blue-400 animate-pulse scale-125' 
                            : 'border-gray-400 bg-gray-300 hover:border-blue-600 hover:bg-blue-300 hover:scale-110'
                        }`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          
                          if (connectingFrom && connectingFrom !== node.id) {
                            // Conectar desde otro nodo u opción hacia este nodo
                            if (connectingFrom.includes('_')) {
                              // Desde una opción específica
                              const parts = connectingFrom.split('_');
                              const fromOptionIndex = parts[parts.length - 1];
                              const fromNodeId = parts.slice(0, -1).join('_');
                              console.log('[Flowchart] Connect option to node output', { fromNodeId, fromOptionIndex, toNodeId: node.id });
                              updateNode(fromNodeId, {
                                optionConnections: {
                                  ...nodes.find(n => n.id === fromNodeId)?.optionConnections,
                                  [parseInt(fromOptionIndex)]: node.id
                                }
                              });
                            } else {
                              console.log('[Flowchart] Connect node to node output', { fromNodeId: connectingFrom, toNodeId: node.id });
                              connectNodes(connectingFrom, node.id);
                            }
                            setConnectingFrom(null);
                          } else if (!connectingFrom) {
                            // Iniciar conexión desde este nodo
                            console.log('[Flowchart] Start connection from node', { nodeId: node.id });
                            setConnectingFrom(node.id);
                          } else {
                            // Cancelar si se vuelve a hacer click
                            console.log('[Flowchart] Cancel node connection', { connectingFrom });
                            setConnectingFrom(null);
                          }
                        }}
                      >
                        {connectingFrom === node.id && (
                          <div className="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Punto de conexión de entrada */}
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10">
                    <div 
                      className={`w-4 h-4 rounded-full transition-all border-2 shadow-md ${
                        connectingFrom && connectingFrom !== node.id
                          ? 'border-green-600 bg-green-400 cursor-pointer hover:scale-110 hover:shadow-lg'
                          : 'border-gray-400 bg-gray-200'
                      }`}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        
                        if (connectingFrom && connectingFrom !== node.id) {
                          // Conectar el nodo anterior a este
                          if (connectingFrom.includes('_')) {
                            // Conectar desde una opción específica
                            const parts = connectingFrom.split('_');
                            const fromOptionIndex = parts[parts.length - 1];
                            const fromNodeId = parts.slice(0, -1).join('_');
                            console.log('[Flowchart] Connect option to entry', { fromNodeId, fromOptionIndex, toNodeId: node.id });
                            updateNode(fromNodeId, {
                              optionConnections: {
                                ...nodes.find(n => n.id === fromNodeId)?.optionConnections,
                                [parseInt(fromOptionIndex)]: node.id
                              }
                            });
                          } else {
                            console.log('[Flowchart] Connect node to entry', { fromNodeId: connectingFrom, toNodeId: node.id });
                            connectNodes(connectingFrom, node.id);
                          }
                          setConnectingFrom(null);
                        }
                      }}
                    >
                      {connectingFrom && connectingFrom !== node.id && (
                        <div className="absolute inset-0 bg-green-500 rounded-full opacity-30"></div>
                      )}
                    </div>
                  </div>

                  {/* Indicador de selección */}
                  {isSelected && (
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </Card>
            );
          })}

          {/* Controles de zoom en esquina inferior derecha */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1 bg-white rounded-lg shadow-lg border p-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="text-xs text-center px-2 py-1 bg-gray-50 rounded text-gray-600 min-w-[50px]">
              {Math.round(zoom * 100)}%
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="border-t pt-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom(1)}
                title="Reset zoom (100%)"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel lateral de propiedades */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900 mb-4">Configuración del Flujo</h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="flow-name" className="text-sm">Nombre del flujo</Label>
              <Input
                id="flow-name"
                value={flowData.name}
                onChange={(e) => setFlowData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Bienvenida nuevos clientes"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="flow-trigger" className="text-sm">Disparador</Label>
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
        </div>

        {/* Propiedades del nodo seleccionado */}
        {selectedNodeData && (
          <div className="p-4 border-b">
            <h4 className="font-medium text-gray-900 mb-3">
              Editar {getNodeTypeLabel(selectedNodeData.type)}
            </h4>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Contenido</Label>
                <Textarea
                  value={selectedNodeData.content}
                  onChange={(e) => updateNode(selectedNodeData.id, { content: e.target.value })}
                  placeholder="Escribe el mensaje..."
                  className="mt-1 min-h-[60px]"
                  rows={3}
                />
              </div>

              {selectedNodeData.type === 'question' && (
                <div>
                  <Label className="text-sm">Opciones de respuesta</Label>
                  <div className="mt-1 space-y-2">
                    {(selectedNodeData.options || []).map((option, index) => (
                      <Input
                        key={index}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(selectedNodeData.options || [])];
                          newOptions[index] = e.target.value;
                          updateNode(selectedNodeData.id, { options: newOptions });
                        }}
                        placeholder={`Opción ${index + 1}`}
                      />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = [...(selectedNodeData.options || []), 'Nueva opción'];
                        updateNode(selectedNodeData.id, { options: newOptions });
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Agregar opción
                    </Button>
                  </div>
                </div>
              )}

              {selectedNodeData.type === 'delay' && (
                <div>
                  <Label className="text-sm">Tiempo de espera (segundos)</Label>
                  <Input
                    type="number"
                    value={selectedNodeData.delay || 60}
                    onChange={(e) => updateNode(selectedNodeData.id, { delay: parseInt(e.target.value) || 60 })}
                    className="mt-1"
                  />
                </div>
              )}

              {selectedNodeData.type === 'ai_assistant' && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Tipo de Asistente</Label>
                    <Select
                      value={selectedNodeData.aiConfig?.assistantType || 'customer_service'}
                      onValueChange={(value: any) => updateNode(selectedNodeData.id, { 
                        aiConfig: { 
                          ...selectedNodeData.aiConfig, 
                          assistantType: value 
                        } 
                      })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer_service">
                          <div className="flex items-center gap-2">
                            <Headphones className="w-4 h-4" />
                            Atención al Cliente
                          </div>
                        </SelectItem>
                        <SelectItem value="sales">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            Ventas
                          </div>
                        </SelectItem>
                        <SelectItem value="support">
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Soporte Técnico
                          </div>
                        </SelectItem>
                        <SelectItem value="order_confirmation">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4" />
                            Confirmación de Compra
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Prompt del Sistema</Label>
                    <Textarea
                      value={selectedNodeData.aiConfig?.prompt || ''}
                      onChange={(e) => updateNode(selectedNodeData.id, { 
                        aiConfig: { 
                          assistantType: selectedNodeData.aiConfig?.assistantType || 'customer_service',
                          ...selectedNodeData.aiConfig, 
                          prompt: e.target.value 
                        } 
                      })}
                      placeholder="Instrucciones para la IA..."
                      className="mt-1 min-h-[80px]"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Max Tokens</Label>
                      <Input
                        type="number"
                        value={selectedNodeData.aiConfig?.maxTokens || 150}
                        onChange={(e) => updateNode(selectedNodeData.id, { 
                          aiConfig: { 
                            assistantType: selectedNodeData.aiConfig?.assistantType || 'customer_service',
                            ...selectedNodeData.aiConfig, 
                            maxTokens: parseInt(e.target.value) || 150 
                          } 
                        })}
                        className="mt-1"
                        min="50"
                        max="500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Creatividad</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={selectedNodeData.aiConfig?.temperature || 0.7}
                        onChange={(e) => updateNode(selectedNodeData.id, { 
                          aiConfig: { 
                            assistantType: selectedNodeData.aiConfig?.assistantType || 'customer_service',
                            ...selectedNodeData.aiConfig, 
                            temperature: parseFloat(e.target.value) || 0.7 
                          } 
                        })}
                        className="mt-1"
                        min="0"
                        max="1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Mensaje de Respaldo</Label>
                    <Textarea
                      value={selectedNodeData.aiConfig?.fallbackMessage || ''}
                      onChange={(e) => updateNode(selectedNodeData.id, { 
                        aiConfig: { 
                          assistantType: selectedNodeData.aiConfig?.assistantType || 'customer_service',
                          ...selectedNodeData.aiConfig, 
                          fallbackMessage: e.target.value 
                        } 
                      })}
                      placeholder="Mensaje cuando la IA no puede responder..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <Brain className="w-4 h-4" />
                      <span className="font-medium text-sm">Vista Previa</span>
                    </div>
                    <div className="text-xs text-blue-600">
                      <div><strong>Tipo:</strong> {
                        selectedNodeData.aiConfig?.assistantType === 'customer_service' ? 'Atención al Cliente' :
                        selectedNodeData.aiConfig?.assistantType === 'sales' ? 'Ventas' :
                        selectedNodeData.aiConfig?.assistantType === 'support' ? 'Soporte Técnico' :
                        'Confirmación de Compra'
                      }</div>
                      <div><strong>Tokens:</strong> {selectedNodeData.aiConfig?.maxTokens || 150}</div>
                      <div><strong>Creatividad:</strong> {selectedNodeData.aiConfig?.temperature || 0.7}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estadísticas del flujo */}
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Estadísticas</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center p-2 bg-white rounded border">
              <div className="font-bold text-lg text-blue-600">{nodes.length}</div>
              <div className="text-gray-600">Nodos</div>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="font-bold text-lg text-green-600">{connections.length}</div>
              <div className="text-gray-600">Conexiones</div>
            </div>
          </div>
          
          {/* Validación */}
          <div className="mt-3 space-y-1">
            {nodes.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                <AlertTriangle className="w-3 h-3" />
                <span>Agrega al menos un nodo</span>
              </div>
            )}
            {nodes.some(n => !n.content?.trim()) && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="w-3 h-3" />
                <span>Algunos nodos no tienen contenido</span>
              </div>
            )}
            {nodes.length > 0 && !nodes.some(n => !n.content?.trim()) && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                <CheckCircle2 className="w-3 h-3" />
                <span>Flujo válido</span>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-auto p-4 border-t space-y-3">
          <Button 
            onClick={handleSave} 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Flujo
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancelar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                // Vista previa del flujo
                console.log('Preview flow:', { ...flowData, steps: nodes });
              }}
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-1" />
              Vista previa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
