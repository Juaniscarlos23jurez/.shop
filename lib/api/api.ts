import { ApiResponse, UserProfile, ProfileApiUser } from '@/types/api';

const BASE_URL = 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';

export const api = {
  // Authentication methods
  auth: {
    async login(email: string, password: string): Promise<ApiResponse<{ 
      user: any; 
      id_token: string;
      token_type: string;
    }>> {
      return fetch(`${BASE_URL}/api/auth/firebase/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password })
      }).then(handleResponse);
    },

    async register(name: string, email: string, password: string, phone?: string): Promise<ApiResponse> {
      return fetch(`${BASE_URL}/api/auth/firebase/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          ...(phone && { phone })
        })
      }).then(handleResponse);
    },

    async getProfile(token: string): Promise<ApiResponse<{ user: ProfileApiUser; company_id?: string }>> {
      return fetch(`${BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }).then(handleResponse);
    },

    async logout(token: string): Promise<ApiResponse> {
      return fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }).then(handleResponse);
    },
  },

    // Companies API
  companies: {
    async createCompany(data: any, token: string) {
      return fetch(`${BASE_URL}/api/companies`, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    async updateCompany(companyId: string, data: any, token: string) {
      return fetch(`${BASE_URL}/api/companies/${companyId}`, {
        method: 'PUT',
        headers: getAuthHeader(token),
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    async getCompany(companyId: string) {
      return fetch(`${BASE_URL}/api/companies/${companyId}`).then(handleResponse);
    },

    async updateBusinessHours(companyId: string, hoursData: any, token: string) {
      return fetch(`${BASE_URL}/api/companies/${companyId}/business-hours`, {
        method: 'PUT',
        headers: getAuthHeader(token),
        body: JSON.stringify(hoursData),
      }).then(handleResponse);
    },

    async createLocation(companyId: string, locationData: any, token: string) {
      return fetch(`${BASE_URL}/api/companies/${companyId}/locations`, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(locationData),
      }).then(handleResponse);
    },
  },
};

// Helper function to handle API responses
async function handleResponse(response: Response): Promise<ApiResponse> {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const error = data?.message || 'Something went wrong';
    return { success: false, message: error, error: error };
  }
  
  return { success: true, data: data };
}

// Helper function to get auth header
export function getAuthHeader(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}