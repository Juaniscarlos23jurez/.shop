export interface Company {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  business_type?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  company_id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  id: string;
  location_id: string;
  day_of_week: string;
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyData {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  business_type?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  location?: {
    name: string;
    address: string;
  };
  business_hours?: Array<{
    day_of_week: string;
    is_open: boolean;
    open_time?: string;
    close_time?: string;
  }>;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  location_id?: string;
}
