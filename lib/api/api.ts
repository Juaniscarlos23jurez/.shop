import { ApiResponse, UserProfile, ProfileApiUser, BusinessHour, Membership } from '@/types/api';

const BASE_URL = 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';
//http://127.0.0.1:8000
export const api = {
  // Authentication methods
  auth: {
    async login(email: string, password: string): Promise<ApiResponse<{ 
      access_token: string;
      token_type: string;
      user: ProfileApiUser;
    }>> {
      return fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password 
        })
      }).then(handleResponse);
    },

    async register(
      name: string, 
      email: string, 
      password: string, 
      password_confirmation: string, 
      phone?: string
    ): Promise<ApiResponse<{
      access_token: string;
      token_type: string;
      user: ProfileApiUser;
    }>> {
      return fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation,
          phone: phone || null
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

  // Profile API

  // User's Companies API
  userCompanies: {
    /**
     * Get the authenticated user's company
     */
    async get(token: string): Promise<ApiResponse<any>> {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/profile/company`, {
          headers: getAuthHeader(token),
        });
        const result = await handleResponse(response);
        console.log('Company API raw response:', result);
        
        // Ensure we have a valid response structure
        if (result.success && result.data) {
          return {
            success: true,
            data: result.data,
            status: result.status,
            statusText: result.statusText
          };
        }
        
        return result;
      } catch (error) {
        console.error('Error in userCompanies.get:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Error al obtener los datos de la compañía',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    },

    /**
     * Create a new company for the authenticated user
     */
    async create(
      data: {
        name: string;
        description?: string;
        phone?: string;
        email?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zip_code?: string;
      },
      token: string
    ): Promise<ApiResponse<{ company: any }>> {
      return fetch(`${BASE_URL}/api/companies`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Update the authenticated user's company
     */
    async update(
      data: {
        name?: string;
        description?: string;
        phone?: string;
        email?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zip_code?: string;
      },
      token: string
    ): Promise<ApiResponse<{ company: any }>> {
      return fetch(`${BASE_URL}/api/companies`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Get company locations
     */
    async getLocations(token: string): Promise<ApiResponse<{ locations: any[] }>> {
      return fetch(`${BASE_URL}/api/locations`, {
        headers: getAuthHeader(token)
      }).then(handleResponse);
    },

    /**
     * Create a new location
     */
    async createLocation(
      data: {
        name: string;
        description?: string;
        phone?: string;
        email?: string;
        address: string;
        city?: string;
        state?: string;
        country?: string;
        zip_code?: string;
        latitude?: number;
        longitude?: number;
      },
      token: string
    ): Promise<ApiResponse<{ location: any }>> {
      return fetch(`${BASE_URL}/api/locations`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Update a location
     */
    async updateLocation(
      locationId: string,
      data: {
        name?: string;
        description?: string;
        phone?: string;
        email?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zip_code?: string;
        latitude?: number;
        longitude?: number;
      },
      token: string
    ): Promise<ApiResponse<{ location: any }>> {
      return fetch(`${BASE_URL}/api/locations/${locationId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Update business hours
     */
    async updateBusinessHours(
      data: { hours: Array<{
        day_of_week: string;
        is_open: boolean;
        open_time?: string | null;
        close_time?: string | null;
      }> },
      token: string
    ): Promise<ApiResponse<{ hours: any[] }>> {
      return fetch(`${BASE_URL}/api/companies/business-hours`, {
        method: 'PUT',
        headers: getAuthHeader(token),
        body: JSON.stringify(data)
      }).then(handleResponse);
    },
  },

  // Companies API (admin/management)
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
          headers: getAuthHeader(token)
        });
        
        return handleResponse(response);
      } catch (error) {
        console.error('Error in getCompanyLocations:', error);
        return { 
          success: false, 
          message: 'Network or server error',
          error: error instanceof Error ? error.message : String(error)
        };
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

  // Memberships API
  memberships: {
    /**
     * Create a new membership for a company
     */
    async createMembership(
      companyId: string,
      data: any,
      token: string
    ): Promise<ApiResponse<{ membership: any }>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/memberships`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Get all memberships for a company
     */
    async getMemberships(
      companyId: string,
      token: string
    ): Promise<ApiResponse<{ 
      data: {
        data: Membership[];
        current_page: number;
        last_page: number;
        total: number;
      }
    }>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/memberships`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }).then(handleResponse);
    },

    /**
     * Update a membership
     */
    async updateMembership(
      companyId: string,
      membershipId: string,
      data: any,
      token: string
    ): Promise<ApiResponse<{ membership: any }>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/memberships/${membershipId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Delete a membership
     */
    async deleteMembership(
      companyId: string,
      membershipId: string,
      token: string
    ): Promise<ApiResponse> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/memberships/${membershipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }).then(handleResponse);
    },
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