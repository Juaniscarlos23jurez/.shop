"use client";

import * as Lucide from "lucide-react";
const { MessageSquare, HelpCircle, Clock, Zap, Brain, Move, Grid3x3, RotateCcw } = Lucide as any;

import { Button } from "@/components/ui/button";
import { FlowStep } from "@/types/whatsapp";

interface FlowchartToolbarProps {
  onAddNode: (type: FlowStep["type"]) => void;
  onTogglePanMode: () => void;
  panMode: boolean;
  onAutoLayout: () => void;
  onResetCanvas: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export function FlowchartToolbar({
  onAddNode,
  onTogglePanMode,
  panMode,
  onAutoLayout,
  onResetCanvas,
  showGrid,
  onToggleGrid,
}: FlowchartToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white rounded-lg shadow-lg p-2 border">
      <div className="flex gap-1 border-r pr-2">
        <Button size="sm" onClick={() => onAddNode("message")} className="bg-blue-600 hover:bg-blue-700 text-white">
          <MessageSquare className="w-4 h-4 mr-1" />
          Mensaje
        </Button>
        <Button size="sm" onClick={() => onAddNode("question")} className="bg-green-600 hover:bg-green-700 text-white">
          <HelpCircle className="w-4 h-4 mr-1" />
          Pregunta
        </Button>
        <Button size="sm" onClick={() => onAddNode("delay")} className="bg-yellow-600 hover:bg-yellow-700 text-white">
          <Clock className="w-4 h-4 mr-1" />
          Espera
        </Button>
        <Button size="sm" onClick={() => onAddNode("action")} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Zap className="w-4 h-4 mr-1" />
          Acción
        </Button>
        <Button
          size="sm"
          onClick={() => onAddNode("ai_assistant")}
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
        >
          <Brain className="w-4 h-4 mr-1" />
          IA Assistant
        </Button>
      </div>

      <div className="flex gap-1 border-r pr-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePanMode}
          title="Modo arrastrar mapa"
          className={panMode ? "bg-blue-100 border-blue-300" : ""}
        >
          <Move className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onAutoLayout} title="Auto organizar">
          <Grid3x3 className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onResetCanvas} title="Centrar vista">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleGrid}
          title="Toggle grid"
          className={showGrid ? "bg-blue-50" : ""}
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
