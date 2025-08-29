const BASE_URL = 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const api = {
  // Authentication methods
  auth: {
    async login(email: string, password: string): Promise<ApiResponse<{ 
      user: any; 
      access_token: string;
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

    async getProfile(token: string): Promise<ApiResponse> {
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

  // Add other API endpoints here
  // Example:
  // user: {
  //   async getProfile(userId: string, token: string) {
  //     return fetch(`${BASE_URL}/api/users/${userId}`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Accept': 'application/json',
  //       },
  //     }).then(handleResponse);
  //   },
  // }
};

// Helper function to handle API responses
async function handleResponse(response: Response): Promise<any> {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const error = data?.message || 'Something went wrong';
    return Promise.reject(error);
  }
  
  return data;
}

// Helper function to get auth header
export function getAuthHeader(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}
