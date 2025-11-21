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
