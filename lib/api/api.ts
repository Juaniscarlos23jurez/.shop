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

    async getCompanyLocations(companyId: string, token: string): Promise<ApiResponse<{ locations: any[] }>> {
      try {
        const response = await fetch(`${BASE_URL}/api/companies/${companyId}/locations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || 'Failed to fetch company locations');
        }

        return response.json();
      } catch (error) {
        console.error('Error in getCompanyLocations:', error);
        throw error;
      }
    },

    async createLocation(companyId: string, locationData: any, token: string): Promise<ApiResponse> {
      try {
        console.log('Creating location with data:', {
          companyId,
          locationData,
          token: token ? 'Token exists' : 'No token provided'
        });
        
        const url = `${BASE_URL}/api/test/companies/${companyId}/locations`;
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        console.log('Sending request to:', url);
        console.log('Headers:', JSON.stringify(headers, null, 2));
        console.log('Payload:', JSON.stringify(locationData, null, 2));
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(locationData),
        });
        
        const result = await handleResponse(response);
        console.log('Location creation response:', result);
        return result;
        
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
  // Clone the response so we can read it multiple times
  const responseClone = response.clone();
  
  // First, try to get the response as text to help with debugging
  const responseText = await responseClone.text();
  
  let data: any;
  try {
    // Try to parse the response as JSON
    data = responseText ? JSON.parse(responseText) : {};
    
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      data: data
    });
  } catch (error) {
    console.error('Failed to parse JSON response. Response text:', responseText);
    return { 
      success: false, 
      message: 'Invalid server response',
      error: `Failed to parse response as JSON. Status: ${response.status} ${response.statusText}`,
      status: response.status,
      statusText: response.statusText,
      responseText: responseText
    };
  }
  
  if (!response.ok) {
    // Log detailed error information
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries()),
      data: data,
      responseText: responseText
    });
    
    // Try to extract error message from different response formats
    const errorMessage = data?.message || 
                        data?.error?.message || 
                        data?.error || 
                        (typeof data === 'string' ? data : null) ||
                        response.statusText || 
                        'An unknown error occurred';
    
    return { 
      success: false, 
      message: errorMessage,
      error: errorMessage,
      status: response.status,
      statusText: response.statusText,
      data: data,
      responseText: responseText
    };
  }
  
  return { 
    success: true, 
    data: data,
    status: response.status,
    statusText: response.statusText
  };
}

// Helper function to get auth header
export function getAuthHeader(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}