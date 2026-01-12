import {
  ApiResponse,
  LaravelPaginator,
  InventoryMovement,
  InventoryMovementType,
  InventoryMovementsListResponse,
  ReviewStatus,
  CompanyReview,
  CompanyReviewStats,
  ProfileApiUser,
  BusinessHour,
  CompanyPaymentMethod,
  CompanyPaymentMethodCreateInput,
  CompanyPaymentMethodUpdateInput,
  Membership,
  Coupon,
  CouponCreateInput,
  CouponUpdateInput,
  CouponValidationRequest,
  CouponValidationResponse,
  CouponAssignmentRequest,
  CouponAssignByMembershipRequest
} from '@/types/api';
import { Product, ProductListResponse, ProductResponse, ProductCreateInput, ProductUpdateInput } from '@/types/product';
import { Category, CategoryCreateInput, CategoryUpdateInput, CategoryResponse, CategoryListResponse } from '@/types/category';
import { ordersApi } from './orders';

export const BASE_URL = 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';
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

    /**
     * Product Promotions (Public): list active and valid promotions
     * GET /api/public/companies/{companyId}/product-promotions
     * Optional filters: product_id, location_id, per_page, page
     * No auth required.
     */
    async listPublicProductPromotions(
      companyId: string,
      params: {
        product_id?: number | string;
        location_id?: number | string;
        per_page?: number | string;
        page?: number | string;
      } = {}
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.product_id !== undefined) search.set('product_id', String(params.product_id));
      if (params.location_id !== undefined) search.set('location_id', String(params.location_id));
      if (params.per_page !== undefined) search.set('per_page', String(params.per_page));
      if (params.page !== undefined) search.set('page', String(params.page));
      const url = `${BASE_URL}/api/public/companies/${companyId}/product-promotions${search.toString() ? `?${search.toString()}` : ''}`;
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

  feedback: {
    /**
     * Submit feedback for the authenticated company (supports file upload)
     * POST /api/company/feedback
     */
    async submitCompanyFeedback(formData: FormData, token?: string): Promise<ApiResponse<any>> {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return fetch(`${BASE_URL}/api/company/feedback`, {
        method: 'POST',
        headers,
        body: formData,
      }).then(handleResponse);
    },
  },

  // Reviews/Comments endpoints (authenticated)
  reviews: {
    async list(
      companyId: string | number,
      token: string,
      filters: { status?: ReviewStatus; channel?: string; per_page?: number; page?: number } = {}
    ): Promise<ApiResponse<{ data: CompanyReview[]; stats?: CompanyReviewStats }>> {
      const search = new URLSearchParams();
      if (filters.status) search.set('status', filters.status);
      if (filters.channel) search.set('channel', filters.channel);
      if (filters.per_page !== undefined) search.set('per_page', String(filters.per_page));
      if (filters.page !== undefined) search.set('page', String(filters.page));

      const url = `${BASE_URL}/api/companies/${companyId}/reviews${search.toString() ? `?${search.toString()}` : ''}`;

      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    async respond(
      companyId: string | number,
      reviewId: string | number,
      responseText: string,
      token: string
    ): Promise<ApiResponse<any>> {
      const url = `${BASE_URL}/api/companies/${companyId}/reviews/${reviewId}/respond`;
      return fetch(url, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: responseText }),
      }).then(handleResponse);
    },

    async updateStatus(
      companyId: string | number,
      reviewId: string | number,
      status: ReviewStatus,
      token: string
    ): Promise<ApiResponse<any>> {
      const url = `${BASE_URL}/api/companies/${companyId}/reviews/${reviewId}/status`;
      return fetch(url, {
        method: 'PATCH',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }).then(handleResponse);
    },
  },

  inventory: {
    /**
     * Kardex / Inventory Movements (authenticated)
     * GET /api/companies/{companyId}/inventory/movements
     */
    async listMovements(
      companyId: string | number,
      token: string,
      filters: {
        location_id?: number | string;
        product_id?: number | string;
        sale_id?: number | string;
        type?: InventoryMovementType;
        from_date?: string; // YYYY-MM-DD
        to_date?: string; // YYYY-MM-DD
        per_page?: number;
        page?: number;
      } = {}
    ): Promise<ApiResponse<InventoryMovementsListResponse>> {
      const search = new URLSearchParams();
      if (filters.location_id !== undefined) search.set('location_id', String(filters.location_id));
      if (filters.product_id !== undefined) search.set('product_id', String(filters.product_id));
      if (filters.sale_id !== undefined) search.set('sale_id', String(filters.sale_id));
      if (filters.type) search.set('type', String(filters.type));
      if (filters.from_date) search.set('from_date', filters.from_date);
      if (filters.to_date) search.set('to_date', filters.to_date);
      if (filters.per_page !== undefined) search.set('per_page', String(filters.per_page));
      if (filters.page !== undefined) search.set('page', String(filters.page));

      const url = `${BASE_URL}/api/companies/${companyId}/inventory/movements${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
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
      return fetch(`/api/proxy/api/auth/login`, {
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

    async socialLogin(
      idToken: string,
      provider: 'google.com' | 'apple.com' | string,
      fcmBrowserToken?: string | null
    ): Promise<ApiResponse<{
      access_token: string;
      token_type: string;
      user: ProfileApiUser;
    }>> {
      return fetch(`/api/proxy/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          id_token: idToken,
          provider,
          fcm_browser_token: fcmBrowserToken ?? undefined,
        }),
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

    async socialRegister(
      idToken: string,
      provider: 'google.com' | 'apple.com' | string,
      fcmBrowserToken?: string | null
    ): Promise<ApiResponse<{
      access_token: string;
      token_type: string;
      user: ProfileApiUser;
    }>> {
      return fetch(`/api/proxy/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          id_token: idToken,
          provider,
          fcm_browser_token: fcmBrowserToken ?? undefined,
        }),
      }).then(handleResponse);
    },

    async getProfile(token: string): Promise<ApiResponse<{ user: ProfileApiUser; company_id?: string }>> {
      return fetch(`/api/proxy/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }).then(handleResponse);
    },

    async logout(token: string): Promise<ApiResponse> {
      return fetch(`/api/proxy/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }).then(handleResponse);
    },

    async updateFcmToken(token: string, fcmBrowserToken: string): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/auth/profile/fcm-token`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fcm_browser_token: fcmBrowserToken,
        }),
      }).then(handleResponse);
    },
  },

  // Profile API

  // User's Companies API
  subscriptions: {
    /**
     * List all available plans (Public/Auth)
     * GET /api/company-plans
     */
    async getPlans(token?: string): Promise<ApiResponse<any>> {
      const url = `/api/proxy/api/company-plans`;
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return fetch(url, {
        method: 'GET',
        headers,
      }).then(handleResponse);
    },

    /**
     * Initiate a subscription checkout process
     * POST /api/company-subscriptions/subscribe
     * Body: { company_id, plan_id, interval, trial_days }
     */
    async subscribe(
      data: {
        company_id: number | string;
        plan_id: number | string;
        interval: 'month' | 'year';
        trial_days?: number;
        success_url?: string;
        cancel_url?: string;
      },
      token: string
    ): Promise<ApiResponse<{ checkout_url: string }>> {
      const url = `/api/proxy/api/company-subscriptions/subscribe`;
      return fetch(url, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Get payment history for a company
     * GET /api/companies/{companyId}/subscription-payments
     */
    async getPaymentHistory(
      companyId: number | string,
      token: string
    ): Promise<ApiResponse<any>> {
      const url = `/api/proxy/api/companies/${companyId}/subscription-payments`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Get Stripe Customer Portal URL for managing subscription
     * POST /api/company-subscriptions/portal
     */
    async getPortalUrl(
      companyId: number | string,
      token: string,
      returnUrl?: string
    ): Promise<ApiResponse<{ portal_url: string; url?: string }>> {
      const url = `/api/proxy/api/company-subscriptions/portal`;
      return fetch(url, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          return_url: returnUrl || window.location.href
        }),
      }).then(handleResponse);
    }
  },

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
      return fetch(`/api/proxy/api/auth/profile/company`, {
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
        customer_fcm_token?: string;
        customer_profile_photo_path?: string;
        customer_since: string;
        following_since: string;
        points_balance: number;
        total_points_earned: number;
        total_points_spent: number;
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
     * Get a single follower detail for the authenticated user's company
     * Backend route: GET /api/my-company/followers/{customerId}
     */
    async getFollowerDetail(
      customerId: string | number,
      token: string
    ): Promise<ApiResponse<{
      company: {
        id: number;
        name: string;
        owner_id?: number;
      };
      follower: {
        company_id: number;
        customer_id: number;
        customer_name: string;
        customer_email: string;
        customer_phone?: string;
        customer_email_verified: boolean;
        customer_login_provider?: string;
        customer_fcm_token?: string;
        has_push_notifications_enabled: boolean;
        customer_profile_photo_path?: string;
        customer_since: string;
        following_since: string;
        points_balance: number;
        total_points_earned: number;
        total_points_spent: number;
        membership_id: number | null;
        membership_name: string | null;
        membership_description: string | null;
        membership_price: string | null;
        has_active_membership: boolean;
      };
    }>> {
      const url = `${BASE_URL}/api/my-company/followers/${customerId}`;
      try {
        const response = await fetch(url, {
          headers: getAuthHeader(token),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Error in getFollowerDetail:', error);
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
        logo_url?: string;
        banner_url?: string;
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
        logo_url?: string;
        banner_url?: string;
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
      data: {
        hours: Array<{
          day_of_week: string;
          is_open: boolean;
          open_time?: string | null;
          close_time?: string | null;
        }>
      },
      token: string
    ): Promise<ApiResponse<{ hours: any[] }>> {
      return fetch(`${BASE_URL}/api/companies/business-hours`, {
        method: 'PUT',
        headers: getAuthHeader(token),
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Employee Accounts Management
     */

    // List employee accounts for a company (supports filters)
    async getEmployeeAccounts(
      companyId: string,
      token: string,
      filters?: { employee_id?: string | number; email?: string }
    ): Promise<ApiResponse<{ data: any[] }>> {
      const search = new URLSearchParams();
      if (filters?.employee_id !== undefined && filters?.employee_id !== null) {
        search.set('employee_id', String(filters.employee_id));
      }
      if (filters?.email) {
        search.set('email', filters.email);
      }
      const url = `${BASE_URL}/api/companies/${companyId}/employee-accounts${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    // Create employee account
    async createEmployeeAccount(
      companyId: string,
      employeeId: string,
      data: {
        email: string;
        password: string;
        password_confirmation: string;
        role_type: 'sales' | 'cashier' | 'supervisor' | 'manager';
        location_id?: number;
        name?: string;
      },
      token: string
    ): Promise<ApiResponse<{ data: any }>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/employee-accounts/employees/${employeeId}`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeader(token),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      ).then(handleResponse);
    },

    // Get employee account details
    async getEmployeeAccount(
      companyId: string,
      userId: string,
      token: string
    ): Promise<ApiResponse<{ data: any }>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/employee-accounts/${userId}`,
        {
          headers: getAuthHeader(token),
        }
      ).then(handleResponse);
    },

    // Update employee account
    async updateEmployeeAccount(
      companyId: string,
      userId: string,
      data: {
        email?: string;
        role_type?: 'sales' | 'cashier' | 'supervisor' | 'manager';
        location_id?: number;
        is_active?: boolean;
      },
      token: string
    ): Promise<ApiResponse<{ data: any }>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/employee-accounts/${userId}`,
        {
          method: 'PUT',
          headers: {
            ...getAuthHeader(token),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      ).then(handleResponse);
    },

    // Deactivate employee account
    async deactivateEmployeeAccount(
      companyId: string,
      userId: string,
      token: string
    ): Promise<ApiResponse<{ message: string }>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/employee-accounts/${userId}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(token),
        }
      ).then(handleResponse);
    },

    // Reactivate employee account
    async reactivateEmployeeAccount(
      companyId: string,
      userId: string,
      token: string
    ): Promise<ApiResponse<{ data: any }>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/employee-accounts/${userId}/reactivate`,
        {
          method: 'POST',
          headers: getAuthHeader(token),
        }
      ).then(handleResponse);
    },

    // Change employee account password
    async changeEmployeeAccountPassword(
      companyId: string,
      userId: string,
      data: { password: string; password_confirmation: string },
      token: string
    ): Promise<ApiResponse<{ message?: string }>> {
      return fetch(
        `${BASE_URL}/api/companies/${companyId}/employee-accounts/${userId}/change-password`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeader(token),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      ).then(handleResponse);
    },
  },

  // UI Components Settings (banner + popup per company/location/context)
  uiSettings: {
    /**
     * Get UI settings for a given context (company/location/context).
     * Backend route: GET /api/ui-settings (auth:sanctum)
     * Example: /api/ui-settings?company_id=1&location_id=1&context=public_store_home
     */
    async get(
      params: {
        company_id?: number | string;
        location_id?: number | string;
        context: string;
      },
      token: string
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.company_id !== undefined && params.company_id !== null) {
        search.set('company_id', String(params.company_id));
      }
      if (params.location_id !== undefined && params.location_id !== null) {
        search.set('location_id', String(params.location_id));
      }
      search.set('context', params.context);

      const url = `${BASE_URL}/api/ui-settings${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Upsert UI settings for a given context.
     * Backend route: PUT /api/ui-settings (auth:sanctum)
     * Body matches the Laravel controller expectation.
     */
    async upsert(
      data: {
        company_id?: number | string;
        location_id?: number | string;
        context: string;
        banner_enabled?: boolean;
        banner_text?: string;
        banner_button_label?: string;
        banner_button_url?: string;
        banner_color?: string;
        popup_enabled?: boolean;
        popup_image_url?: string;
        popup_title?: string;
        popup_description?: string;
      },
      token: string
    ): Promise<ApiResponse<any>> {
      const url = `${BASE_URL}/api/ui-settings`;
      return fetch(url, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Get UI settings publicly (no auth required).
     * Backend route: GET /api/public/ui-settings
     * Example: /api/public/ui-settings?company_id=1&location_id=1&context=public_store_home
     */
    async getPublic(params: {
      company_id?: number | string;
      location_id?: number | string;
      context: string;
    }): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.company_id !== undefined && params.company_id !== null) {
        search.set('company_id', String(params.company_id));
      }
      if (params.location_id !== undefined && params.location_id !== null) {
        search.set('location_id', String(params.location_id));
      }
      search.set('context', params.context);

      const url = `${BASE_URL}/api/public/ui-settings${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
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
        console.log('[API] Updating company with data:', data);
        const response = await fetch(`${BASE_URL}/api/companies/${companyId}`, {
          method: 'PUT',
          headers: {
            ...getAuthHeader(token),
            'Content-Type': 'application/json',
          },
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
        const response = await fetch(`/api/proxy/api/companies/${companyId}/locations`, {
          headers: getAuthHeader(token),
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

    async getPaymentStats(companyId: string, params: any, token: string): Promise<ApiResponse<any>> {
      try {
        const queryParams = new URLSearchParams();
        if (params?.location_id) queryParams.append('location_id', params.location_id);
        if (params?.date_from) queryParams.append('date_from', params.date_from);
        if (params?.date_to) queryParams.append('date_to', params.date_to);

        const queryString = queryParams.toString();
        const url = `${BASE_URL}/api/companies/${companyId}/payment-stats${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          headers: getAuthHeader(token),
        });
        return handleResponse(response);
      } catch (error) {
        console.error('Error in getPaymentStats:', error);
        return {
          success: false,
          message: 'Network or server error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    },

    /**
     * Product Promotions: list
     * GET /api/companies/{companyId}/product-promotions
     * Optional filters: product_id, location_id, active_only, per_page, page
     */
    async listProductPromotions(
      companyId: string,
      token: string,
      params: {
        product_id?: number | string;
        location_id?: number | string;
        active_only?: boolean | string;
        per_page?: number | string;
        page?: number | string;
      } = {}
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.product_id !== undefined) search.set('product_id', String(params.product_id));
      if (params.location_id !== undefined) search.set('location_id', String(params.location_id));
      if (params.active_only !== undefined) search.set('active_only', String(params.active_only));
      if (params.per_page !== undefined) search.set('per_page', String(params.per_page));
      if (params.page !== undefined) search.set('page', String(params.page));
      const url = `${BASE_URL}/api/companies/${companyId}/product-promotions${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Product Promotions: create
     * POST /api/companies/{companyId}/product-promotions
     */
    async createProductPromotion(
      companyId: string,
      token: string,
      data: {
        product_id: number | string;
        location_id: number | string;
        promo_price: number;
        start_at?: string | null;
        end_at?: string | null;
        is_active?: boolean;
        quantity_limit?: number | null;
        per_user_limit?: number | null;
      }
    ): Promise<ApiResponse<any>> {
      const url = `${BASE_URL}/api/companies/${companyId}/product-promotions`;
      return fetch(url, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Product Promotions: update
     * PUT /api/companies/{companyId}/product-promotions/{promotionId}
     */
    async updateProductPromotion(
      companyId: string,
      token: string,
      promotionId: string | number,
      data: {
        product_id?: number | string;
        location_id?: number | string;
        promo_price?: number;
        start_at?: string | null;
        end_at?: string | null;
        is_active?: boolean;
        quantity_limit?: number | null;
        per_user_limit?: number | null;
      }
    ): Promise<ApiResponse<any>> {
      const url = `${BASE_URL}/api/companies/${companyId}/product-promotions/${promotionId}`;
      return fetch(url, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Product Promotions: delete
     * DELETE /api/companies/{companyId}/product-promotions/{promotionId}
     */
    async deleteProductPromotion(
      companyId: string,
      token: string,
      promotionId: string | number,
    ): Promise<ApiResponse<any>> {
      const url = `${BASE_URL}/api/companies/${companyId}/product-promotions/${promotionId}`;
      return fetch(url, {
        method: 'DELETE',
        headers: getAuthHeader(token),
      }).then(handleResponse);
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
     * Followers: list company followers with filters
     * Endpoint: GET /api/companies/{companyId}/followers
     * Filters:
     * - mode: 'both' | 'fcm_only' | 'email_only' | 'none'
     * - has_fcm: boolean
     * - has_email: boolean
     * Pagination:
     * - per_page, page
     */
    async listFollowers(
      companyId: string,
      token: string,
      params: {
        mode?: 'both' | 'fcm_only' | 'email_only' | 'none';
        has_fcm?: boolean;
        has_email?: boolean;
        per_page?: number | string;
        page?: number | string;
      } = {}
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.mode) search.set('mode', params.mode);
      if (typeof params.has_fcm === 'boolean') search.set('has_fcm', String(params.has_fcm));
      if (typeof params.has_email === 'boolean') search.set('has_email', String(params.has_email));
      if (params.per_page !== undefined) search.set('per_page', String(params.per_page));
      if (params.page !== undefined) search.set('page', String(params.page));

      const url = `${BASE_URL}/api/companies/${companyId}/followers${search.toString() ? `?${search.toString()}` : ''}`;
      // Debug: safe logging (do not print token)
      try {
        console.log('[API] GET listFollowers URL:', url);
        console.log('[API] GET listFollowers params:', Object.fromEntries(search.entries()));
      } catch { }
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(async (response) => {
        try {
          console.log('[API] listFollowers response status:', response.status);
        } catch { }
        return handleResponse(response);
      });
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

    /**
     * Notifications: send emails for a notification (Paso 2)
     * POST /api/companies/{companyId}/notifications/{notificationId}/send-emails
     */
    async sendNotificationEmails(
      companyId: string,
      notificationId: string | number,
      token: string
    ): Promise<ApiResponse<{
      data: {
        notification_id: number;
        sent_count: number;
        failed_count: number;
        total_processed: number;
        errors: any[]
      }
    }>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/notifications/${notificationId}/send-emails`, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify({}),
      }).then(handleResponse);
    },

    /**
     * Announcements (Banners): Public list of active announcements for a company
     * GET /api/public/companies/{companyId}/announcements
     */
    async listPublicAnnouncements(
      companyId: string,
      params: { per_page?: number | string; page?: number | string } = {}
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.per_page !== undefined) search.set('per_page', String(params.per_page));
      if (params.page !== undefined) search.set('page', String(params.page));
      const url = `${BASE_URL}/api/public/companies/${companyId}/announcements${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }).then(handleResponse);
    },

    /**
     * Announcements (Banners): Protected list for a company (owner only)
     * GET /api/companies/{companyId}/announcements
     */
    async listAnnouncements(
      companyId: string,
      token: string,
      params: { per_page?: number | string; page?: number | string } = {}
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.per_page !== undefined) search.set('per_page', String(params.per_page));
      if (params.page !== undefined) search.set('page', String(params.page));
      const url = `${BASE_URL}/api/companies/${companyId}/announcements${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Announcements: Get single
     * GET /api/companies/{companyId}/announcements/{id}
     */
    async getAnnouncement(
      companyId: string,
      id: string | number,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/announcements/${id}`, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Announcements: Create
     * POST /api/companies/{companyId}/announcements
     */
    async createAnnouncement(
      companyId: string,
      data: {
        title: string;
        subtitle?: string | null;
        text?: string | null;
        link_url?: string | null;
        image_url?: string | null;
        is_active?: boolean;
        starts_at?: string | null;
        ends_at?: string | null;
      },
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/announcements`, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Announcements: Update
     * PUT /api/companies/{companyId}/announcements/{id}
     */
    async updateAnnouncement(
      companyId: string,
      id: string | number,
      data: {
        title?: string;
        subtitle?: string | null;
        text?: string | null;
        link_url?: string | null;
        image_url?: string | null;
        is_active?: boolean;
        starts_at?: string | null;
        ends_at?: string | null;
      },
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/announcements/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(token),
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Announcements: Delete
     * DELETE /api/companies/{companyId}/announcements/{id}
     */
    async deleteAnnouncement(
      companyId: string,
      id: string | number,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/announcements/${id}`, {
        method: 'DELETE',
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

  // Company Payment Methods API
  companyPaymentMethods: {
    /**
     * Public: list active payment methods for a company
     * GET /api/public/companies/{companyId}/payment-methods
     */
    async publicList(companyId: string | number): Promise<ApiResponse<CompanyPaymentMethod[]>> {
      const url = `${BASE_URL}/api/public/companies/${companyId}/payment-methods`;
      return fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      }).then(handleResponse);
    },

    /**
     * Owner: list all payment methods (including inactive)
     * GET /api/companies/{companyId}/payment-methods
     */
    async list(companyId: string | number, token: string): Promise<ApiResponse<CompanyPaymentMethod[]>> {
      const url = `${BASE_URL}/api/companies/${companyId}/payment-methods`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Owner: create a payment method
     * POST /api/companies/{companyId}/payment-methods
     */
    async create(
      companyId: string | number,
      data: CompanyPaymentMethodCreateInput,
      token: string
    ): Promise<ApiResponse<{ method: CompanyPaymentMethod }>> {
      const url = `${BASE_URL}/api/companies/${companyId}/payment-methods`;
      return fetch(url, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Owner: get a payment method
     * GET /api/companies/{companyId}/payment-methods/{id}
     */
    async get(
      companyId: string | number,
      id: string | number,
      token: string
    ): Promise<ApiResponse<{ method: CompanyPaymentMethod }>> {
      const url = `${BASE_URL}/api/companies/${companyId}/payment-methods/${id}`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Owner: update a payment method
     * PUT /api/companies/{companyId}/payment-methods/{id}
     */
    async update(
      companyId: string | number,
      id: string | number,
      data: CompanyPaymentMethodUpdateInput,
      token: string
    ): Promise<ApiResponse<{ method: CompanyPaymentMethod }>> {
      const url = `${BASE_URL}/api/companies/${companyId}/payment-methods/${id}`;
      return fetch(url, {
        method: 'PUT',
        headers: getAuthHeader(token),
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    /**
     * Owner: delete a payment method
     * DELETE /api/companies/{companyId}/payment-methods/{id}
     */
    async delete(
      companyId: string | number,
      id: string | number,
      token: string
    ): Promise<ApiResponse<{ success: boolean }>> {
      const url = `${BASE_URL}/api/companies/${companyId}/payment-methods/${id}`;
      return fetch(url, {
        method: 'DELETE',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },
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
      return fetch(`/api/proxy/api/companies/${companyId}/coupons`, {
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
      return fetch(`/api/proxy/api/companies/${companyId}/coupons`, {
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
      return fetch(`/api/proxy/api/companies/${companyId}/coupons/${couponId}`, {
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
      return fetch(`/api/proxy/api/companies/${companyId}/coupons/${couponId}`, {
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
      return fetch(`/api/proxy/api/companies/${companyId}/coupons/${couponId}`, {
        method: 'DELETE',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Validate a coupon code
     */
    async validateCoupon(
      companyId: string,
      data: CouponValidationRequest,
      token: string
    ): Promise<ApiResponse<CouponValidationResponse>> {
      return fetch(`/api/proxy/api/companies/${companyId}/coupons/validate`, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Assign coupon to specific users
     */
    async assignToUsers(
      companyId: string,
      couponId: string,
      data: CouponAssignmentRequest,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/companies/${companyId}/coupons/${couponId}/assign-users`, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Assign coupon by membership plan
     */
    async assignByMembership(
      companyId: string,
      couponId: string,
      data: CouponAssignByMembershipRequest,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/companies/${companyId}/coupons/${couponId}/assign-by-membership`, {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(data)
      }).then(handleResponse);
    },

    /**
     * Get available coupons for a user
     */
    async getUserCoupons(
      companyId: string,
      userId: string,
      token: string
    ): Promise<ApiResponse<{ coupons: Coupon[] }>> {
      return fetch(`/api/proxy/api/companies/${companyId}/users/${userId}/coupons`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Remove coupon assignment from user
     */
    async removeUserAssignment(
      companyId: string,
      couponId: string,
      userId: string,
      token: string
    ): Promise<ApiResponse> {
      return fetch(`/api/proxy/api/companies/${companyId}/coupons/${couponId}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },
  },

  // Orders API
  orders: ordersApi,

  // Activity API
  activity: {
    /**
     * Recent activity aggregated by category (sales, orders, users, comments, ...)
     * GET /api/recent-activity?limit=<n>
     */
    async getRecentActivity(
      params: { limit?: number } = {},
      token: string
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.limit !== undefined) search.set('limit', String(params.limit));
      const url = `${BASE_URL}/api/recent-activity${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },
  },

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
        coupon_code?: string; // optional: coupon code to apply
        notes?: string; // optional: sale notes
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

    /**
     * Monthly sales statistics
     * GET /api/sales/monthly-statistics?location_id&year
     * Returns array of { month: 'YYYY-MM', total_revenue, total_sales }
     */
    async getMonthlyStatistics(
      params: {
        location_id?: number | string;
        year?: number | string;
      } = {},
      token: string
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.location_id !== undefined) search.set('location_id', String(params.location_id));
      if (params.year !== undefined) search.set('year', String(params.year));
      const url = `${BASE_URL}/api/sales/monthly-statistics${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    /**
     * Average purchase per user monthly
     * GET /api/sales/average-purchase-per-user-monthly?location_id&year
     * Returns array of { month: 'YYYY-MM', average_purchase_value, total_users_with_purchases }
     */
    async getAveragePurchasePerUserMonthly(
      params: {
        location_id?: number | string;
        year?: number | string;
      } = {},
      token: string
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (params.location_id !== undefined) search.set('location_id', String(params.location_id));
      if (params.year !== undefined) search.set('year', String(params.year));
      const url = `${BASE_URL}/api/sales/average-purchase-per-user-monthly${search.toString() ? `?${search.toString()}` : ''}`;
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

    /**
     * Reorder products by updating their position
     */
    async reorderProducts(
      companyId: string,
      items: { product_id: string | number; position: number }[],
      token: string
    ): Promise<ApiResponse> {
      const headers = {
        ...getAuthHeader(token),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      return fetch(
        `${BASE_URL}/api/companies/${companyId}/products/reorder`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ items }),
        }
      ).then(handleResponse);
    },

    /**
     * Get inventory movements (kardex) for a company
     */
    async getInventoryMovements(
      companyId: string,
      token: string,
      options?: {
        per_page?: number;
        page?: number;
        from_date?: string;
        to_date?: string;
        product_id?: string | number;
        location_id?: string | number;
        type?: 'sale' | 'purchase' | 'adjustment' | 'transfer';
      }
    ): Promise<ApiResponse<LaravelPaginator<InventoryMovement>>> {
      const params = new URLSearchParams();

      if (options?.per_page) params.append('per_page', String(options.per_page));
      if (options?.page) params.append('page', String(options.page));
      if (options?.from_date) params.append('from_date', options.from_date);
      if (options?.to_date) params.append('to_date', options.to_date);
      if (options?.product_id) params.append('product_id', String(options.product_id));
      if (options?.location_id) params.append('location_id', String(options.location_id));
      if (options?.type) params.append('type', options.type);

      const url = params.toString()
        ? `${BASE_URL}/api/companies/${companyId}/inventory/movements?${params.toString()}`
        : `${BASE_URL}/api/companies/${companyId}/inventory/movements`;

      return fetch(url, {
        method: 'GET',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },
  },

  // Categories API
  categories: {
    /**
     * Get all categories
     */
    async getCategories(companyId: string | number, token: string): Promise<CategoryListResponse> {
      const response = await fetch(`${BASE_URL}/api/companies/${companyId}/categories`, {
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
      companyId: string | number,
      data: CategoryCreateInput,
      token: string
    ): Promise<CategoryResponse> {
      const response = await fetch(`${BASE_URL}/api/companies/${companyId}/categories`, {
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
      companyId: string | number,
      categoryId: string | number,
      token: string
    ): Promise<CategoryResponse> {
      const response = await fetch(`${BASE_URL}/api/companies/${companyId}/categories/${categoryId}`, {
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
      companyId: string | number,
      categoryId: string | number,
      data: CategoryUpdateInput,
      token: string
    ): Promise<CategoryResponse> {
      const response = await fetch(`${BASE_URL}/api/companies/${companyId}/categories/${categoryId}`, {
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
      companyId: string | number,
      categoryId: string | number,
      token: string
    ): Promise<{ status: string; message: string }> {
      const response = await fetch(`${BASE_URL}/api/companies/${companyId}/categories/${categoryId}`, {
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

  // Reviews/Comments endpoints (authenticated)
  reviews: {
    async list(
      companyId: string | number,
      token: string,
      filters?: { status?: ReviewStatus; channel?: string }
    ): Promise<ApiResponse<any>> {
      const search = new URLSearchParams();
      if (filters?.status) search.set('status', filters.status);
      if (filters?.channel) search.set('channel', filters.channel);
      const url = `${BASE_URL}/api/companies/${companyId}/reviews${search.toString() ? `?${search.toString()}` : ''}`;
      return fetch(url, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    async updateStatus(
      companyId: string | number,
      reviewId: number,
      status: ReviewStatus,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }).then(handleResponse);
    },

    async respond(
      companyId: string | number,
      reviewId: number,
      response: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`${BASE_URL}/api/companies/${companyId}/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      }).then(handleResponse);
    },
  },

  // WhatsApp API
  whatsapp: {
    // Dashboard and Stats
    async getStats(
      companyId: string,
      token: string,
      period?: '24h' | '7d' | '30d'
    ): Promise<ApiResponse<any>> {
      const params = period ? `?period=${period}` : '';
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/stats${params}`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    // Business Profile
    async getBusinessProfile(
      companyId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/business-profile`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    // Settings
    async getSettings(
      companyId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/settings`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    async updateSettings(
      companyId: string,
      data: {
        access_token?: string;
        phone_id?: string;
        webhook_url?: string;
        verify_token?: string;
      },
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/settings`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    async syncTemplates(
      companyId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/settings/sync-templates`, {
        method: 'POST',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    async testConnection(
      companyId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/test`, {
        method: 'POST',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    // Templates
    async getTemplates(
      companyId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/templates`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    // Contacts/Interactions
    async getContacts(
      companyId: string,
      token: string,
      options?: {
        search?: string;
        status?: 'all' | 'unread' | 'active_flow';
        page?: number;
        per_page?: number;
      }
    ): Promise<ApiResponse<any>> {
      const params = new URLSearchParams();
      if (options?.search) params.append('search', options.search);
      if (options?.status) params.append('status', options.status);
      if (options?.page) params.append('page', options.page.toString());
      if (options?.per_page) params.append('per_page', options.per_page.toString());

      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/contacts?${params.toString()}`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    async getMessages(
      companyId: string,
      contactId: string,
      token: string,
      options?: {
        page?: number;
        per_page?: number;
      }
    ): Promise<ApiResponse<any>> {
      const params = new URLSearchParams();
      if (options?.page) params.append('page', options.page.toString());
      if (options?.per_page) params.append('per_page', options.per_page.toString());

      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/contacts/${contactId}/messages?${params.toString()}`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

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
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/contacts/${contactId}/messages`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    async markAsRead(
      companyId: string,
      interactionId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/interactions/${interactionId}/read`, {
        method: 'POST',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    // Flows
    async getFlows(
      companyId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/flows`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    async createFlow(
      companyId: string,
      data: {
        name: string;
        description: string;
        trigger: 'manual' | 'first_message' | 'keyword' | 'post_purchase' | 'abandoned_cart';
        triggerKeywords?: string[];
        steps: any[];
        isActive: boolean;
      },
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/flows`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    async updateFlow(
      companyId: string,
      flowId: string,
      data: Partial<any>,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/flows/${flowId}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    async deleteFlow(
      companyId: string,
      flowId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/flows/${flowId}`, {
        method: 'DELETE',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    async triggerFlow(
      companyId: string,
      contactId: string,
      flowId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/contacts/${contactId}/flows/${flowId}/trigger`, {
        method: 'POST',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    // Campaigns
    async getCampaigns(
      companyId: string,
      token: string,
      options?: {
        status?: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'failed';
        page?: number;
        per_page?: number;
      }
    ): Promise<ApiResponse<any>> {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.page) params.append('page', options.page.toString());
      if (options?.per_page) params.append('per_page', options.per_page.toString());

      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/campaigns?${params.toString()}`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    async createCampaign(
      companyId: string,
      data: {
        name: string;
        description: string;
        templateId: string;
        recipientType: 'all' | 'customers' | 'vip' | 'new';
        scheduledAt?: string;
      },
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/campaigns`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(handleResponse);
    },

    async sendCampaign(
      companyId: string,
      campaignId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    async pauseCampaign(
      companyId: string,
      campaignId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/campaigns/${campaignId}/pause`, {
        method: 'POST',
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    async getCampaignStats(
      companyId: string,
      campaignId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/companies/${companyId}/campaigns/${campaignId}/stats`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },

    // Sessions (for QR connection)
    async createSession(
      companyId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/sessions`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_id: companyId }),
      }).then(handleResponse);
    },

    async getSessionStatus(
      companyId: string,
      token: string
    ): Promise<ApiResponse<any>> {
      return fetch(`/api/proxy/api/whatsapp/sessions/status?company_id=${companyId}`, {
        headers: getAuthHeader(token),
      }).then(handleResponse);
    },
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

export const subscriptionApi = api.subscriptions;