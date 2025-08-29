import { ApiResponse, UserProfile, ProfileApiUser, BusinessHour } from '@/types/api';

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
    /**
     * Get business hours for a company
     */
    async getBusinessHours(
      companyId: string,
      token: string
    ): Promise<ApiResponse<{ hours: BusinessHour[] }>> {
      try {
        const response = await fetch(`${BASE_URL}/api/companies/${companyId}/business-hours`, {
          headers: getAuthHeader(token),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Error in getBusinessHours:', error);
        return { 
          success: false, 
          message: 'Network or server error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    },
    async getAllCompanies(token: string): Promise<ApiResponse<any>> {
      try {
        console.log('Making request to:', `${BASE_URL}/api/companies`);
        const response = await fetch(`${BASE_URL}/api/companies`, {
          headers: getAuthHeader(token),
        });
        
        console.log('Response status:', response.status);
        const data = await response.json().catch(() => ({}));
        console.log('Raw companies response:', JSON.stringify(data, null, 2));
        
        if (!response.ok) {
          const error = data?.message || 'Failed to fetch companies';
          console.error('API Error:', { status: response.status, error });
          return { success: false, message: error, error: error };
        }
        
        // Check if the response has a data property with an array
        if (data && typeof data === 'object' && 'data' in data) {
          return { 
            success: true, 
            data: data.data,
            raw: data
          };
        }
        
        return { 
          success: true, 
          data: data,
          raw: data
        };
      } catch (error) {
        console.error('Error in getAllCompanies:', error);
        return { 
          success: false, 
          message: 'Network or server error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    },

    async getCompany(companyId: string, token: string): Promise<ApiResponse> {
      try {
        const response = await fetch(`${BASE_URL}/api/companies/${companyId}`, {
          headers: getAuthHeader(token),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Error in getCompany:', error);
        return { 
          success: false, 
          message: 'Network or server error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    },

    async createCompany(data: any, token: string): Promise<ApiResponse> {
      try {
        const response = await fetch(`${BASE_URL}/api/companies`, {
          method: 'POST',
          headers: getAuthHeader(token),
          body: JSON.stringify(data),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Error in createCompany:', error);
        return { 
          success: false, 
          message: 'Network or server error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    },

    async updateCompany(companyId: string, data: any, token: string): Promise<ApiResponse> {
      try {
        const response = await fetch(`${BASE_URL}/api/companies/${companyId}`, {
          method: 'PUT',
          headers: getAuthHeader(token),
          body: JSON.stringify(data),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Error in updateCompany:', error);
        return { 
          success: false, 
          message: 'Network or server error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    },

    async updateBusinessHours(companyId: string, hoursData: any, token: string): Promise<ApiResponse> {
      try {
        const response = await fetch(`${BASE_URL}/api/companies/${companyId}/business-hours`, {
          method: 'PUT',
          headers: getAuthHeader(token),
          body: JSON.stringify(hoursData),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Error in updateBusinessHours:', error);
        return { 
          success: false, 
          message: 'Network or server error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    },

    async createLocation(companyId: string, locationData: any, token: string): Promise<ApiResponse> {
      try {
        const response = await fetch(`${BASE_URL}/api/companies/${companyId}/locations`, {
          method: 'POST',
          headers: getAuthHeader(token),
          body: JSON.stringify(locationData),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Error in createLocation:', error);
        return { 
          success: false, 
          message: 'Network or server error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
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