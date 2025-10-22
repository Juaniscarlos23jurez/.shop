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
  },

  /**
   * Get pending orders for a company
   */
  async getPendingOrders(
    companyId: string,
    token: string,
    params?: {
      location_id?: number;
      payment_status?: string;
      per_page?: number;
    }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.location_id) queryParams.append('location_id', String(params.location_id));
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.per_page) queryParams.append('per_page', String(params.per_page));

    const url = `${BASE_URL}/api/companies/${companyId}/orders/pending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending orders');
    }

    return response.json();
  },

  /**
   * Update order status
   */
  async updateOrderStatus(
    companyId: string,
    orderId: string | number,
    status: string,
    token: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(`${BASE_URL}/api/companies/${companyId}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update order status');
    }

    return response.json();
  },

  /**
   * Get all orders with filters
   */
  async getAllOrders(
    companyId: string,
    token: string,
    params?: {
      status?: string;
      payment_status?: string;
      location_id?: number;
      delivery_method?: string;
      payment_method?: string;
      from_date?: string;
      to_date?: string;
      per_page?: number;
    }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.location_id) queryParams.append('location_id', String(params.location_id));
    if (params?.delivery_method) queryParams.append('delivery_method', params.delivery_method);
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params?.from_date) queryParams.append('from_date', params.from_date);
    if (params?.to_date) queryParams.append('to_date', params.to_date);
    if (params?.per_page) queryParams.append('per_page', String(params.per_page));

    const url = `${BASE_URL}/api/companies/${companyId}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
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
