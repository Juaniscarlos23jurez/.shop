import { ApiResponse } from '@/types/api';

const BASE_URL = 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';

export interface ClientAuthResponse {
    token?: string;
    message?: string;
    data?: {
        client?: any;
        token?: string;
    };
    success?: boolean;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    fcm_token?: string;
    device_platform?: string;
    referral_code?: string;
}

export interface LoginData {
    email: string;
    password: string;
    fcm_token?: string;
    device_platform?: string;
}

export const clientAuthApi = {
    /**
     * Register a new customer.
     * POST /api/client/auth/register
     */
    async register(data: RegisterData): Promise<ApiResponse<ClientAuthResponse>> {
        const url = `${BASE_URL}/api/client/auth/register`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(res => handleResponse<ClientAuthResponse>(res));
    },

    /**
     * Login a customer.
     * POST /api/client/auth/login
     */
    async login(data: LoginData): Promise<ApiResponse<ClientAuthResponse>> {
        const url = `${BASE_URL}/api/client/auth/login`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(res => handleResponse<ClientAuthResponse>(res));
    },

    /**
     * Get customer profile.
     * GET /api/client/auth/profile
     */
    async getProfile(token: string): Promise<ApiResponse<ClientAuthResponse>> {
        const url = `${BASE_URL}/api/client/auth/profile`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(res => handleResponse<ClientAuthResponse>(res));
    },

    /**
     * Get product promotions.
     * GET /api/client/auth/product-promotions
     */
    async getProductPromotions(token: string, params: { company_id?: string; city_id?: string; page?: number; per_page?: number }): Promise<ApiResponse<any>> {
        const query = new URLSearchParams({
            per_page: (params.per_page || 15).toString(),
            page: (params.page || 1).toString(),
        });
        if (params.company_id) query.append('company_id', params.company_id);
        if (params.city_id) query.append('city_id', params.city_id);

        const url = `${BASE_URL}/api/client/auth/product-promotions?${query.toString()}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }).then(async (res) => {
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                return {
                    success: false,
                    error: errorData.message || `Error ${res.status}`,
                    raw: errorData,
                    status: res.status,
                };
            }
            const body = await res.json();

            // Flexible parsing logic similar to Dart code
            let list: any[] = [];
            let pagination: any = {};
            let categories: any[] = [];

            if (body.data && Array.isArray(body.data.data)) {
                // { data: { data: [...], meta: {...} } }
                list = body.data.data;
                pagination = body.data.meta || body.meta || {};
                if (Array.isArray(body.categories)) categories = body.categories;
            } else if (body.data && Array.isArray(body.data)) {
                // { data: [...], meta: {...} }
                list = body.data;
                pagination = body.meta || {};
                if (Array.isArray(body.categories)) categories = body.categories;
            } else if (Array.isArray(body)) {
                // [...]
                list = body;
            }

            return {
                success: true,
                data: {
                    items: list,
                    pagination,
                    categories,
                    raw: body
                },
                status: res.status
            };
        });
    },

    /**
     * Get companies the current user is a member of/follows.
     * GET /api/client/auth/followed-companies
     */
    async getFollowedCompanies(token: string): Promise<ApiResponse<any[]>> {
        const url = `${BASE_URL}/api/client/auth/followed-companies`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }).then(async (res) => {
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                return {
                    success: false,
                    error: errorData.message || `Error ${res.status}`,
                    raw: errorData,
                    status: res.status,
                };
            }
            const body = await res.json();
            // The API returns { status: 'success', data: [...] } or similar
            // We want to return the list of companies
            let companies: any[] = [];
            if (body.data && Array.isArray(body.data)) {
                companies = body.data;
            } else if (Array.isArray(body)) {
                companies = body;
            }

            return {
                success: true,
                data: companies,
                status: res.status
            };
        });
    },

    /**
     * Get customer membership pass (.pkpass).
     * GET /api/customer-memberships/{membershipId}/pass
     *
     * Nota: por ahora el membershipId está hardcodeado en "123".
     * La respuesta es binaria (application/vnd.apple.pkpass), no JSON.
     */
    async getMembershipPkpass(token: string, membershipId: string = '123'): Promise<Response> {
        const url = `${BASE_URL}/api/customer-memberships/${membershipId}/pass`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.apple.pkpass',
            },
        });
    },
};

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
            success: false,
            error: errorData.message || `Error ${response.status}`,
            raw: errorData,
            status: response.status,
        };
    }
    const data = await response.json();
    return { success: true, data, status: response.status };
}
