import * as Lucide from 'lucide-react';
import { FlowStep } from '@/types/whatsapp';

const { MessageSquare, HelpCircle, Clock, Zap, Brain } = Lucide as any;

export const getNodeIcon = (type: FlowStep['type']) => {
  switch (type) {
    case 'message':
      return MessageSquare;
    case 'question':
      return HelpCircle;
    case 'delay':
      return Clock;
    case 'action':
      return Zap;
    case 'ai_assistant':
      return Brain;
    default:
      return MessageSquare;
  }
};

export const getNodeColor = (type: FlowStep['type']) => {
  switch (type) {
    case 'message':
      return 'bg-blue-50 border-blue-200 text-blue-900';
    case 'question':
      return 'bg-green-50 border-green-200 text-green-900';
    case 'delay':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    case 'action':
      return 'bg-purple-50 border-purple-200 text-purple-900';
    case 'ai_assistant':
      return 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 text-pink-900';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-900';
  }
};

export const getNodeTypeLabel = (type: FlowStep['type']) => {
  switch (type) {
    case 'message':
      return 'Mensaje';
    case 'question':
      return 'Pregunta';
    case 'delay':
      return 'Espera';
    case 'action':
      return 'Acción';
    case 'ai_assistant':
      return 'IA Assistant';
    default:
      return 'Paso';
  }
};
