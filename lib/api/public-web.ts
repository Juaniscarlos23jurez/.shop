import { ApiResponse, PublicCompany, PublicCompanyLocation, Announcement, PublicItem, PointRule, BusinessHour, BusinessType } from '@/types/api';
const BASE_URL = 'https://laravel-pkpass-backend-development-pfaawl.laravel.cloud';

export const publicWebApiClient = {
  /**
   * Search companies by name to get basic company info including ID and slug.
   * GET /api/companies/search?q={query}
   */
  async searchCompaniesByName(query: string): Promise<ApiResponse<PublicCompany[]>> {
    const url = `${BASE_URL}/api/companies/search?q=${encodeURIComponent(query)}`;
    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).then(res => handleResponse<PublicCompany[]>(res));
  },

  /**
   * Get public company details by ID.
   * GET /api/companies/{companyId}
   */
  async getCompanyById(companyId: string): Promise<ApiResponse<PublicCompany>> {
    const url = `${BASE_URL}/api/companies/${companyId}`;
    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).then(res => handleResponse<PublicCompany>(res));
  },

  /**
   * Get public locations for a company by ID.
   * GET /api/companies/{companyId}/locations
   */
  async getCompanyLocationsById(companyId: string): Promise<ApiResponse<PublicCompanyLocation[]>> {
    const url = `${BASE_URL}/api/companies/${companyId}/locations`;
    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).then(res => handleResponse<PublicCompanyLocation[]>(res));
  },

  /**
   * Get public announcements for a company by ID.
   * GET /api/public/companies/{companyId}/announcements
   */
  async getCompanyAnnouncementsById(companyId: string): Promise<ApiResponse<{ data: Announcement[] }>> {
    const url = `${BASE_URL}/api/public/companies/${companyId}/announcements`;
    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).then(res => handleResponse<{ data: Announcement[] }>(res));
  },

  /**
   * Get public items (products) for a specific location by ID.
   * GET /api/public/locations/{locationId}/products
   */
  async getPublicItemsByLocationId(locationId: string): Promise<ApiResponse<PublicItem[]>> {
    const url = `${BASE_URL}/api/public/locations/${locationId}/products`; // Corrected URL
    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).then(res => handleResponse<PublicItem[]>(res));
  },

  /**
   * Get public location details by ID.
   * GET /api/locations/{locationId}/details
   */
  async getLocationDetailsById(locationId: string): Promise<ApiResponse<PublicCompanyLocation>> {
    const url = `${BASE_URL}/api/locations/${locationId}/details`;
    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }).then(res => handleResponse<PublicCompanyLocation>(res));
  },
};

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json();
    return {
      success: false,
      error: errorData.message || 'An error occurred',
      raw: errorData,
      status: response.status,
    };
  }
  const data = await response.json();
  return { success: true, data, status: response.status };
}
