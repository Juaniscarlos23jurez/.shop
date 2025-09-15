import { ApiResponse } from '@/types/api';

const BASE_URL = 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';

export const ordersApi = {
  async create(
    companyId: string,
    data: {
      items: Array<{
        product_id: number;
        quantity: number;
        price: string;
        name: string;
      }>;
      total: number;
      payment_method: string;
      payment_status: string;
      status: string;
      description?: string;
    },
    token: string
  ): Promise<ApiResponse<{ order: any }>> {
    const response = await fetch(`${BASE_URL}/api/companies/${companyId}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return response.json();
  },

  async getOrders(companyId: string, token: string): Promise<ApiResponse<{ orders: any[] }>> {
    const response = await fetch(`${BASE_URL}/api/companies/${companyId}/orders`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  }
};
