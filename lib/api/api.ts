import { ApiResponse, UserProfile, ProfileApiUser, BusinessHour, Membership, Coupon, CouponCreateInput, CouponUpdateInput } from '@/types/api';
import { Product, ProductListResponse, ProductResponse, ProductCreateInput, ProductUpdateInput } from '@/types/product';
import { Category, CategoryCreateInput, CategoryUpdateInput, CategoryResponse, CategoryListResponse } from '@/types/category';
import { ordersApi } from './orders';

const BASE_URL = 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';
//http://127.0.0.1:8000
export const api = {
  // Public Geo endpoints (no auth required)
  publicGeo: {
    async getCountries(active?: boolean): Promise<ApiResponse<any>> {
      const params = new URLSearchParams();
      if (typeof active === 'boolean') params.set('active', String(active));
      const url = `${BASE_URL}/api/public/countries${params.toString() ? `?${params.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }).then(handleResponse);
    },

    async getStates(country_id: number | string, active?: boolean): Promise<ApiResponse<any>> {
      const params = new URLSearchParams({ country_id: String(country_id) });
      if (typeof active === 'boolean') params.set('active', String(active));
      return fetch(`${BASE_URL}/api/public/states?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }).then(handleResponse);
    },

    async getCities(state_id: number | string, active?: boolean): Promise<ApiResponse<any>> {
      const params = new URLSearchParams({ state_id: String(state_id) });
      if (typeof active === 'boolean') params.set('active', String(active));
      return fetch(`${BASE_URL}/api/public/cities?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }).then(handleResponse);
    },

    // Listado público de tipos de negocio
    async getBusinessTypes(): Promise<ApiResponse<{ id: number; name: string; slug: string }[]>> {
      const url = `${BASE_URL}/api/public/business-types`;
      return fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }).then(handleResponse);
    },
  },
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

    async employeeLogin(email: string, password: string): Promise<ApiResponse<{ 
      access_token: string;
      token_type: string;
      user: ProfileApiUser;
    }>> {
      return fetch(`${BASE_URL}/api/auth/employee/login`, {
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
    async createEmployee(
      companyId: string,
      data: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone: string;
        position: string;
        department: string;
        hire_date: string;
        salary: number;
        emergency_contact_name: string;
        emergency_contact_phone: string;
        address: string;
        location_assignment?: {
          location_id: string | number;
          role: string;
          is_primary: boolean;
          start_date: string;
          schedule?: {
            [key: string]: {
              start: string | null;
              end: string | null;
              is_working: boolean;
            };
          };
        };
      },
      token: string
    ): Promise<ApiResponse<{ employee: any }>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/employees`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },
    /**
     * Get the authenticated user's company
     */
    async get(token: string): Promise<ApiResponse<any>> {
      return fetch(`${BASE_URL}/api/auth/profile/company`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Get company followers
     */
    async getFollowers(token: string): Promise<ApiResponse<{
      company: { 
        id: number; 
        name: string;
        owner_id?: number;
      };
      summary: {
        total_followers: number;
        followers_with_membership: number;
        followers_without_membership: number;
      };
      followers: Array<{
        company_id: number;
        customer_id: number;
        customer_name: string;
        customer_email: string;
        customer_phone?: string;
        customer_since: string;
        following_since: string;
        membership_id: number | null;
        membership_name: string | null;
        membership_description: string | null;
        membership_price: string | null;
        has_active_membership: number; // 0 or 1
      }>;
    }>> {
      console.log('Fetching followers from:', `${BASE_URL}/api/my-company/followers`);
      try {
        const response = await fetch(`${BASE_URL}/api/my-company/followers`, {
          headers: getAuthHeader(token),
        });
        console.log('Raw followers response status:', response.status);
        const result = await handleResponse(response);
        console.log('Processed followers response:', result);
        return result;
      } catch (error) {
        console.error('Error in getFollowers:', error);
        throw error;
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
        business_type_id?: number;
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
        business_type_id?: number;
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
     * Get employees for a location
     */
    async getLocationEmployees(
      companyId: string,
      locationId: string,
      token: string
    ): Promise<ApiResponse<{ data: any[] }>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/locations/${locationId}/employees`,
        {
          headers: getAuthHeader(token)
        }
      ).then(async (response) => {
        const result = await handleResponse(response);
        // Transform the response to match the expected format
        if (result.success && result.data) {
          return {
            ...result,
            data: {
              data: Array.isArray(result.data) ? result.data : result.data.data || []
            }
          };
        }
        return result;
      });
    },

    /**
     * Assign employee to location
     */
    async assignEmployeeToLocation(
      companyId: string,
      locationId: string,
      employeeId: string,
      token: string
    ): Promise<ApiResponse<{ success: boolean }>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/locations/${locationId}/employees/${employeeId}`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeader(token),
            'Content-Type': 'application/json'
          }
        }
      ).then(handleResponse);
    },

    /**
     * Update employee assignment
     */
    async updateEmployeeAssignment(
      companyId: string,
      locationId: string,
      employeeId: string,
      data: Record<string, any>,
      token: string
    ): Promise<ApiResponse<{ success: boolean }>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/locations/${locationId}/employees/${employeeId}`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeader(token),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      ).then(handleResponse);
    },

    /**
     * Remove employee from location
     */
    async removeEmployeeFromLocation(
      companyId: string,
      locationId: string,
      employeeId: string,
      token: string
    ): Promise<ApiResponse<{ success: boolean }>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/locations/${locationId}/employees/${employeeId}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(token)
        }
      ).then(handleResponse);
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
        // optional geo ids
        country_id?: number | string;
        state_id?: number | string;
        city_id?: number | string;
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
        // optional geo ids
        country_id?: number | string;
        state_id?: number | string;
        city_id?: number | string;
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

    /**
     * Notifications: list company notifications
     */
    async listNotifications(
      companyId: string,
      token: string,
      params: { per_page?: number | string; status?: string } = {}
    ): Promise<ApiResponse<{ data: any }>> {
      const search = new URLSearchParams();
      if (params.per_page !== undefined) search.set('per_page', String(params.per_page));
      if (params.status) search.set('status', params.status);
      const url = `${BASE_URL}/api/companies/${companyId}/notifications${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Notifications: create a company notification
     */
    async createNotification(
      companyId: string,
      data: {
        channel: 'push' | 'email';
        title: string;
        body: string;
        data?: Record<string, any> | null;
        segment_type: 'all' | 'active' | 'inactive' | 'with_orders' | 'no_orders' | 'custom';
        segment_filters?: Record<string, any> | null;
        recipient_ids?: number[] | null;
        scheduled_at?: string | null; // ISO 8601 or null
      },
      token: string
    ): Promise<ApiResponse<{ data: { notification: any; total_recipients?: number } }>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/notifications`, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Notifications: get a single notification
     */
    async getNotification(
      companyId: string,
      notificationId: string | number,
      token: string
    ): Promise<ApiResponse<{ data: any }>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/notifications/${notificationId}`, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    async createLocation(companyId: string, locationData: any, token: string): Promise<ApiResponse> {
      try {
        const url = `${BASE_URL}/api/test/companies/${companyId}/locations`;
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(locationData),
        });
        
        const result = await handleResponse(response);
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

  // Coupons API
  coupons: {
    /**
     * Get all coupons for a company
     */
    async getCoupons(
      companyId: string,
      token: string
    ): Promise<ApiResponse<{
      data: {
        data: Coupon[];
        current_page: number;
        last_page: number;
        total: number;
      }
    }>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/coupons`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Create a new coupon
     */
    async createCoupon(
      companyId: string,
      data: CouponCreateInput,
      token: string
    ): Promise<ApiResponse<{ coupon: Coupon }>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/coupons`, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Get a specific coupon
     */
    async getCoupon(
      companyId: string,
      couponId: string,
      token: string
    ): Promise<ApiResponse<{ coupon: Coupon }>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/coupons/${couponId}`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Update a coupon
     */
    async updateCoupon(
      companyId: string,
      couponId: string,
      data: CouponUpdateInput,
      token: string
    ): Promise<ApiResponse<{ coupon: Coupon }>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/coupons/${couponId}`, {
        method: 'PUT',
        headers: getAuthHeader(token),
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Delete a coupon
     */
    async deleteCoupon(
      companyId: string,
      couponId: string,
      token: string
    ): Promise<ApiResponse> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/coupons/${couponId}`, {
        method: 'DELETE',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },
  },

  // Orders API
  orders: ordersApi,

  // Sales API
  sales: {
    /**
     * Get sales list with optional filters
     */
    async listSales(
      params: {
        location_id?: number | string;
        date_from?: string; // YYYY-MM-DD
        date_to?: string;   // YYYY-MM-DD
        per_page?: number | string;
        page?: number | string;
      } = {},
      token: string
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.location_id !== undefined) search.set('location_id', String(params.location_id));
      if (params.date_from) search.set('date_from', params.date_from);
      if (params.date_to) search.set('date_to', params.date_to);
      if (params.per_page !== undefined) search.set('per_page', String(params.per_page));
      if (params.page !== undefined) search.set('page', String(params.page));

      const url = `${BASE_URL}/api/sales${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Create a new sale
     */
    async createSale(
      data: {
        location_id: number | string;
        user_id?: number | string | null;
        points_earned?: number; // optional: allow FE to send computed points
        payment_method: 'cash' | 'card' | 'transfer' | 'points';
        items: Array<{
          product_id: number | string;
          quantity: number;
          notes?: string;
        }>;
      },
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`${BASE_URL}/api/sales`, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Get sale details
     */
    async getSale(id: number | string, token: string): Promise<ApiResponse<any>> {
      return fetch(`${BASE_URL}/api/sales/${id}`, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Update sale status
     */
    async updateSale(
      id: number | string,
      data: {
        payment_status?: 'completed' | 'pending' | 'failed';
        sale_status?: 'completed' | 'cancelled';
      },
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`${BASE_URL}/api/sales/${id}`, {
        method: 'PATCH',
        headers: getAuthHeader(token),
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Sales statistics
     */
    async getStatistics(
      params: {
        location_id?: number | string;
        date_from?: string;
        date_to?: string;
      } = {},
      token: string
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.location_id !== undefined) search.set('location_id', String(params.location_id));
      if (params.date_from) search.set('date_from', params.date_from);
      if (params.date_to) search.set('date_to', params.date_to);
      const url = `${BASE_URL}/api/sales/statistics${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },
  },

  // Products API
  products: {
    /**
     * Get all products for a company
     */
    async getProducts(
      companyId: string,
      token: string,
      page: number = 1,
      perPage: number = 15,
      type?: 'physical' | 'made_to_order' | 'service'
    ): Promise<ApiResponse<ProductListResponse>> {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(type && { type })
      });

      return fetch(
        `${BASE_URL}/api/companies/${companyId}/products?${params.toString()}`,
        {
          method: 'GET',
          headers: getAuthHeader(token),
        }
      ).then(handleResponse);
    },

    /**
     * Create a new product
     */
    async createProduct(
      companyId: string,
      data: ProductCreateInput,
      token: string
    ): Promise<ApiResponse<ProductResponse>> {
      const headers = {
        ...getAuthHeader(token),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      return fetch(`${BASE_URL}/api/companies/${companyId}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Get a specific product
     */
    async getProduct(
      companyId: string,
      productId: string,
      token: string
    ): Promise<ApiResponse<ProductResponse>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/products/${productId}`,
        {
          method: 'GET',
          headers: getAuthHeader(token),
        }
      ).then(handleResponse);
    },

    /**
     * Update a product
     */
    async updateProduct(
      companyId: string,
      productId: string,
      data: ProductUpdateInput,
      token: string
    ): Promise<ApiResponse<ProductResponse>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/products/${productId}`,
        {
          method: 'PUT',
          headers: getAuthHeader(token),
          body: JSON.stringify(data),
        }
      ).then(handleResponse);
    },

    /**
     * Delete a product
     */
    async deleteProduct(
      companyId: string,
      productId: string,
      token: string
    ): Promise<ApiResponse> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/products/${productId}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(token),
        }
      ).then(handleResponse);
    },

    /**
     * Update product stock (for physical products)
     */
    async updateProductStock(
      companyId: string,
      productId: string,
      locationId: number,
      stock: number,
      token: string
    ): Promise<ApiResponse<ProductResponse>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/products/${productId}/stock`,
        {
          method: 'PUT',
          headers: getAuthHeader(token),
          body: JSON.stringify({ location_id: locationId, stock }),
        }
      ).then(handleResponse);
    },

    /**
     * Toggle product availability
     */
    async toggleProductAvailability(
      companyId: string,
      productId: string,
      locationId: number,
      isAvailable: boolean,
      token: string
    ): Promise<ApiResponse<ProductResponse>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/products/${productId}/availability`,
        {
          method: 'PUT',
          headers: getAuthHeader(token),
          body: JSON.stringify({ location_id: locationId, is_available: isAvailable }),
        }
      ).then(handleResponse);
    },
  },

  // Categories API
  categories: {
    /**
     * Get all categories
     */
    async getCategories(token: string): Promise<CategoryListResponse> {
      const response = await fetch(`${BASE_URL}/api/categories`, {
        method: 'GET',
        headers: getAuthHeader(token),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Categories fetch error:', data);
        throw new Error(data.message || data.error || 'Failed to fetch categories');
      }

      return data;
    },

    /**
     * Create a new category
     */
    async createCategory(
      data: CategoryCreateInput,
      token: string
    ): Promise<CategoryResponse> {
      const response = await fetch(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Category creation error:', responseData);
        throw new Error(responseData.message || responseData.error || 'Failed to create category');
      }

      return responseData;
    },

    /**
     * Get a specific category
     */
    async getCategory(
      categoryId: string | number,
      token: string
    ): Promise<CategoryResponse> {
      const response = await fetch(`${BASE_URL}/api/categories/${categoryId}`, {
        method: 'GET',
        headers: getAuthHeader(token),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch category');
      }

      return data;
    },

    /**
     * Update a category
     */
    async updateCategory(
      categoryId: string | number,
      data: CategoryUpdateInput,
      token: string
    ): Promise<CategoryResponse> {
      const response = await fetch(`${BASE_URL}/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update category');
      }

      return responseData;
    },

    /**
     * Delete a category
     */
    async deleteCategory(
      categoryId: string | number,
      token: string
    ): Promise<{ status: string; message: string }> {
      const response = await fetch(`${BASE_URL}/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: getAuthHeader(token),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }

      return data;
    },
  },
};

// Helper function to handle API responses
async function handleResponse(response: Response): Promise<ApiResponse> {
  const responseText = await response.text();
  let data: any;

  try {
    data = responseText ? JSON.parse(responseText) : {};
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

  if (response.ok) {
    return {
      success: true,
      data: data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // Handle errors
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

// Helper function to get auth header
export function getAuthHeader(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}

// Point Rules API
export const pointRulesApi = {
  /**
   * Get all point rules for a company
   * @param companyId - ID of the company
   * @param token - Authentication token
   */
  async getPointRules(companyId: string | number, token: string) {
    const response = await fetch(
      `${BASE_URL}/api/companies/${companyId}/point-rules`,
      {
        headers: getAuthHeader(token),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch point rules');
    }

    return data;
  },

  /**
   * Get a specific point rule
   * @param companyId - ID of the company
   * @param ruleId - ID of the point rule
   * @param token - Authentication token
   */
  async getPointRule(companyId: string | number, ruleId: string | number, token: string) {
    const response = await fetch(
      `${BASE_URL}/api/companies/${companyId}/point-rules/${ruleId}`,
      {
        headers: getAuthHeader(token),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch point rule');
    }

    return data;
  },

  /**
   * Create a new point rule
   * @param companyId - ID of the company
   * @param ruleData - Point rule data
   * @param token - Authentication token
   */
  async createPointRule(
    companyId: string | number,
    ruleData: {
      spend_amount: number;
      points: number;
      is_active?: boolean;
      starts_at?: string | null;
      ends_at?: string | null;
      metadata?: Record<string, any>;
    },
    token: string
  ) {
    const response = await fetch(
      `${BASE_URL}/api/companies/${companyId}/point-rules`,
      {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(ruleData),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create point rule');
    }

    return data;
  },

  /**
   * Update a point rule
   * @param companyId - ID of the company
   * @param ruleId - ID of the point rule
   * @param ruleData - Updated point rule data
   * @param token - Authentication token
   */
  async updatePointRule(
    companyId: string | number,
    ruleId: string | number,
    ruleData: {
      spend_amount?: number;
      points?: number;
      is_active?: boolean;
      starts_at?: string | null;
      ends_at?: string | null;
      metadata?: Record<string, any>;
    },
    token: string
  ) {
    const response = await fetch(
      `${BASE_URL}/api/companies/${companyId}/point-rules/${ruleId}`,
      {
        method: 'PUT',
        headers: getAuthHeader(token),
        body: JSON.stringify(ruleData),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update point rule');
    }

    return data;
  },

  /**
   * Delete a point rule
   * @param companyId - ID of the company
   * @param ruleId - ID of the point rule to delete
   * @param token - Authentication token
   */
  async deletePointRule(companyId: string | number, ruleId: string | number, token: string) {
    const response = await fetch(
      `${BASE_URL}/api/companies/${companyId}/point-rules/${ruleId}`,
      {
        method: 'DELETE',
        headers: getAuthHeader(token),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete point rule');
    }

    return { success: true };
  },
};

// Company API with point rules
export const companyApi = {
  /**
   * Get company details including point rules
   * @param companyId - ID of the company
   * @param token - Authentication token
   */
  async getCompanyWithPointRules(companyId: string | number, token: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${companyId}?with=pointRules`,
      {
        headers: getAuthHeader(token),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch company details');
    }

    return data;
  },
};