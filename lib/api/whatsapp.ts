import { 
  WhatsAppContact, 
  WhatsAppMessage, 
  WhatsAppConversation, 
  FlowTemplate, 
  WhatsAppTemplate,
  WhatsAppStats,
  WhatsAppApiResponse 
} from '@/types/whatsapp';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class WhatsAppApi {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    token?: string
  ): Promise<WhatsAppApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('[WhatsApp API] Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Contactos
  async getContacts(
    companyId: string, 
    token: string,
    options?: {
      search?: string;
      status?: 'all' | 'unread' | 'active_flow';
      page?: number;
      per_page?: number;
    }
  ): Promise<WhatsAppApiResponse<WhatsAppContact[]>> {
    const params = new URLSearchParams();
    if (options?.search) params.append('search', options.search);
    if (options?.status) params.append('status', options.status);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());

    return this.request<WhatsAppContact[]>(
      `/whatsapp/companies/${companyId}/contacts?${params.toString()}`,
      { method: 'GET' },
      token
    );
  }

  async getContact(
    companyId: string, 
    contactId: string, 
    token: string
  ): Promise<WhatsAppApiResponse<WhatsAppContact>> {
    return this.request<WhatsAppContact>(
      `/whatsapp/companies/${companyId}/contacts/${contactId}`,
      { method: 'GET' },
      token
    );
  }

  async updateContact(
    companyId: string, 
    contactId: string, 
    data: Partial<WhatsAppContact>, 
    token: string
  ): Promise<WhatsAppApiResponse<WhatsAppContact>> {
    return this.request<WhatsAppContact>(
      `/whatsapp/companies/${companyId}/contacts/${contactId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      token
    );
  }

  // Mensajes
  async getMessages(
    companyId: string, 
    contactId: string, 
    token: string,
    options?: {
      page?: number;
      per_page?: number;
    }
  ): Promise<WhatsAppApiResponse<WhatsAppMessage[]>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());

    return this.request<WhatsAppMessage[]>(
      `/whatsapp/companies/${companyId}/contacts/${contactId}/messages?${params.toString()}`,
      { method: 'GET' },
      token
    );
  }

  async sendMessage(
    companyId: string, 
    contactId: string, 
    data: {
      content: string;
      type?: 'text' | 'template';
      templateId?: string;
      templateVariables?: Record<string, string>;
    }, 
    token: string
  ): Promise<WhatsAppApiResponse<WhatsAppMessage>> {
    return this.request<WhatsAppMessage>(
      `/whatsapp/companies/${companyId}/contacts/${contactId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async markMessageAsRead(
    companyId: string, 
    contactId: string, 
    messageId: string, 
    token: string
  ): Promise<WhatsAppApiResponse<void>> {
    return this.request<void>(
      `/whatsapp/companies/${companyId}/contacts/${contactId}/messages/${messageId}/read`,
      { method: 'POST' },
      token
    );
  }

  // Conversaciones
  async getConversations(
    companyId: string, 
    token: string,
    options?: {
      status?: 'active' | 'closed' | 'waiting';
      assignedAgent?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<WhatsAppApiResponse<WhatsAppConversation[]>> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.assignedAgent) params.append('assigned_agent', options.assignedAgent);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());

    return this.request<WhatsAppConversation[]>(
      `/whatsapp/companies/${companyId}/conversations?${params.toString()}`,
      { method: 'GET' },
      token
    );
  }

  async updateConversationStatus(
    companyId: string, 
    conversationId: string, 
    status: 'active' | 'closed' | 'waiting', 
    token: string
  ): Promise<WhatsAppApiResponse<WhatsAppConversation>> {
    return this.request<WhatsAppConversation>(
      `/whatsapp/companies/${companyId}/conversations/${conversationId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      token
    );
  }

  // Flujos automáticos
  async getFlowTemplates(
    companyId: string, 
    token: string
  ): Promise<WhatsAppApiResponse<FlowTemplate[]>> {
    return this.request<FlowTemplate[]>(
      `/whatsapp/companies/${companyId}/flows`,
      { method: 'GET' },
      token
    );
  }

  async createFlowTemplate(
    companyId: string, 
    data: Omit<FlowTemplate, 'id' | 'createdAt' | 'updatedAt'>, 
    token: string
  ): Promise<WhatsAppApiResponse<FlowTemplate>> {
    return this.request<FlowTemplate>(
      `/whatsapp/companies/${companyId}/flows`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async updateFlowTemplate(
    companyId: string, 
    flowId: string, 
    data: Partial<FlowTemplate>, 
    token: string
  ): Promise<WhatsAppApiResponse<FlowTemplate>> {
    return this.request<FlowTemplate>(
      `/whatsapp/companies/${companyId}/flows/${flowId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async deleteFlowTemplate(
    companyId: string, 
    flowId: string, 
    token: string
  ): Promise<WhatsAppApiResponse<void>> {
    return this.request<void>(
      `/whatsapp/companies/${companyId}/flows/${flowId}`,
      { method: 'DELETE' },
      token
    );
  }

  async triggerFlow(
    companyId: string, 
    contactId: string, 
    flowId: string, 
    token: string
  ): Promise<WhatsAppApiResponse<void>> {
    return this.request<void>(
      `/whatsapp/companies/${companyId}/contacts/${contactId}/flows/${flowId}/trigger`,
      { method: 'POST' },
      token
    );
  }

  // Templates de WhatsApp
  async getTemplates(
    companyId: string, 
    token: string
  ): Promise<WhatsAppApiResponse<WhatsAppTemplate[]>> {
    return this.request<WhatsAppTemplate[]>(
      `/whatsapp/companies/${companyId}/templates`,
      { method: 'GET' },
      token
    );
  }

  async createTemplate(
    companyId: string, 
    data: Omit<WhatsAppTemplate, 'id' | 'createdAt' | 'status'>, 
    token: string
  ): Promise<WhatsAppApiResponse<WhatsAppTemplate>> {
    return this.request<WhatsAppTemplate>(
      `/whatsapp/companies/${companyId}/templates`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  // Estadísticas
  async getStats(
    companyId: string, 
    token: string,
    period?: '24h' | '7d' | '30d'
  ): Promise<WhatsAppApiResponse<WhatsAppStats>> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);

    return this.request<WhatsAppStats>(
      `/whatsapp/companies/${companyId}/stats?${params.toString()}`,
      { method: 'GET' },
      token
    );
  }

  // Webhook para recibir mensajes
  async setupWebhook(
    companyId: string, 
    webhookUrl: string, 
    token: string
  ): Promise<WhatsAppApiResponse<void>> {
    return this.request<void>(
      `/whatsapp/companies/${companyId}/webhook`,
      {
        method: 'POST',
        body: JSON.stringify({ webhook_url: webhookUrl }),
      },
      token
    );
  }

  // Configuración de WhatsApp Business
  async getBusinessProfile(
    companyId: string, 
    token: string
  ): Promise<WhatsAppApiResponse<any>> {
    return this.request<any>(
      `/whatsapp/companies/${companyId}/business-profile`,
      { method: 'GET' },
      token
    );
  }

  async updateBusinessProfile(
    companyId: string, 
    data: any, 
    token: string
  ): Promise<WhatsAppApiResponse<any>> {
    return this.request<any>(
      `/whatsapp/companies/${companyId}/business-profile`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      token
    );
  }
}

export const whatsappApi = new WhatsAppApi();
