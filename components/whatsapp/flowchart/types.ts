import { FlowStep } from '@/types/whatsapp';

export interface FlowNode extends FlowStep {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Connection {
  from: string;
  to: string;
}

export interface PanOffset {
  x: number;
  y: number;
}
