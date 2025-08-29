import { getAuthHeader } from './api';
import { ApiResponse } from '@/types/api';
import { Company, CreateCompanyData, UpdateCompanyData } from '@/types/company';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';

export const companiesApi = {
  /**
   * Create a new company
   */
  async createCompany(data: CreateCompanyData, token: string): Promise<ApiResponse<{ company: Company }>> {
    const response = await fetch(`${BASE_URL}/api/companies`, {
      method: 'POST',
      headers: getAuthHeader(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create company');
    }

    return response.json();
  },

  /**
   * Get the authenticated user's company
   */
  async getMyCompany(token: string): Promise<ApiResponse<{ company: Company }>> {
    const response = await fetch(`${BASE_URL}/api/companies/me`, {
      headers: getAuthHeader(token),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch company');
    }

    return response.json();
  },

  /**
   * Update a company
   */
  async updateCompany(
    companyId: string, 
    data: UpdateCompanyData, 
    token: string
  ): Promise<ApiResponse<{ company: Company }>> {
    const response = await fetch(`${BASE_URL}/api/companies/${companyId}`, {
      method: 'PUT',
      headers: getAuthHeader(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update company');
    }

    return response.json();
  },

  /**
   * Get company by ID (public endpoint)
   */
  async getCompany(companyId: string): Promise<ApiResponse<{ company: Company }>> {
    const response = await fetch(`${BASE_URL}/api/companies/${companyId}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch company');
    }

    return response.json();
  },

  /**
   * Upload company logo
   */
  async uploadLogo(
    companyId: string, 
    file: File, 
    token: string
  ): Promise<ApiResponse<{ logo_url: string }>> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${BASE_URL}/api/companies/${companyId}/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to upload logo');
    }

    return response.json();
  },
};
