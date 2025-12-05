export interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastSeen?: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  isPinned: boolean;
  tags: string[];
  flowStatus?: 'active' | 'completed' | 'paused';
  customerInfo?: {
    email?: string;
    address?: string;
    notes?: string;
    totalOrders?: number;
    totalSpent?: number;
  };
}

export interface WhatsAppMessage {
  id: string;
  contactId: string;
  content: string;
  timestamp: string;
  isFromContact: boolean;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'flow_response' | 'template';
  mediaUrl?: string;
  mediaMimeType?: string;
  linkPreview?: {
    url: string;
    title?: string;
    description?: string;
    imageUrl?: string;
  };
  flowData?: {
    question: string;
    options: string[];
    selectedOption?: string;
    flowId?: string;
    stepId?: string;
  };
  templateData?: {
    templateId: string;
    templateName: string;
    variables?: Record<string, string>;
  };
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  trigger: 'manual' | 'first_message' | 'keyword' | 'post_purchase' | 'abandoned_cart';
  triggerKeywords?: string[];
  steps: FlowStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalTriggers: number;
    completionRate: number;
    averageTime: number;
  };
}

export interface FlowStep {
  id: string;
  type: 'message' | 'question' | 'condition' | 'action' | 'delay' | 'ai_assistant';
  content: string;
  options?: string[];
  nextStep?: string;
  optionConnections?: { [optionIndex: number]: string }; // Para preguntas con múltiples salidas
  conditions?: FlowCondition[];
  actions?: FlowAction[];
  delay?: number; // en segundos
  aiConfig?: {
    assistantType: 'customer_service' | 'sales' | 'support' | 'order_confirmation';
    prompt?: string;
    maxTokens?: number;
    temperature?: number;
    fallbackMessage?: string;
  };
}

export interface FlowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
  nextStep: string;
}

export interface FlowAction {
  type: 'tag_contact' | 'send_notification' | 'create_order' | 'assign_agent';
  parameters: Record<string, any>;
}

export interface WhatsAppConversation {
  id: string;
  contactId: string;
  messages: WhatsAppMessage[];
  status: 'active' | 'closed' | 'waiting' | 'assigned';
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  activeFlow?: {
    flowId: string;
    currentStep: string;
    startedAt: string;
    variables: Record<string, string>;
  };
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'marketing' | 'utility' | 'authentication';
  language: string;
  status: 'approved' | 'pending' | 'rejected';
  content: string;
  variables: string[];
  createdAt: string;
}

export interface WhatsAppStats {
  totalContacts: number;
  activeConversations: number;
  messagesReceived24h: number;
  messagesSent24h: number;
  responseTime: number; // en minutos
  flowsActive: number;
  flowCompletionRate: number;
}

export interface WhatsAppApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}
