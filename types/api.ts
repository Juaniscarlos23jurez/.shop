export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | any;
  raw?: any; // Raw response from the API
  [key: string]: any;
}

export interface BusinessHour {
  id: string;
  company_id: string;
  day_of_week: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessHoursResponse {
  hours: BusinessHour[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    firebase_uid?: string;
  };
}

export interface UserProfile {
  firebase_uid: string;
  firebase_email: string;
  firebase_name: string;
  company_id?: string;
}

export interface ProfileApiUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  firebase_uid?: string; // Add firebase_uid as it might be useful
}

export interface Benefit {
  text: string;
  type: string;
  description: string;
  sort_order?: number;
}

export interface Membership {
  id: number;
  company_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: 'months' | 'years';
  is_recurring: boolean;
  welcome_gift: boolean;
  birthday_gift: boolean;
  early_renewal_discount: number | null;
  max_users: number | null;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  benefits: Benefit[];
  created_at: string;
  updated_at: string;
}

export type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y' | 'free_item';

export interface Coupon {
  id: number;
  company_id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  discount_amount?: number | string;
  discount_percentage?: number;
  min_purchase_amount?: number | string;
  buy_quantity?: number;
  get_quantity?: number;
  item_id?: string;
  starts_at: string;
  expires_at?: string;
  usage_limit?: number;
  usage_count?: number;
  usage_limit_per_user?: number;
  is_active: boolean;
  is_public: boolean;
  is_single_use: boolean;
  membership_plan_ids?: number[];
  applicable_products?: number[];
  excluded_products?: number[];
  applicable_categories?: number[];
  excluded_categories?: number[];
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface CouponCreateInput {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  discount_amount?: number;
  discount_percentage?: number;
  min_purchase_amount?: number;
  buy_quantity?: number;
  get_quantity?: number;
  item_id?: string;
  starts_at: string;
  expires_at?: string;
  usage_limit?: number;
  usage_limit_per_user?: number;
  is_active?: boolean;
  is_public?: boolean;
  is_single_use?: boolean;
  membership_plan_ids?: number[];
  applicable_products?: number[];
  excluded_products?: number[];
  applicable_categories?: number[];
  excluded_categories?: number[];
  metadata?: any;
}

export interface CouponUpdateInput extends Partial<CouponCreateInput> {}

export interface CouponValidationRequest {
  code: string;
  user_id?: number | string;
  subtotal: number;
}

export interface CouponValidationResponse {
  valid: boolean;
  coupon?: Coupon;
  discount_amount?: number;
  discount_type?: string;
  final_subtotal?: number;
  errors?: string[];
}

export interface CouponAssignmentRequest {
  user_ids: number[];
  expires_at?: string;
}

export interface CouponAssignByMembershipRequest {
  membership_plan_ids: number[];
  expires_at?: string;
}

// Sales Types
export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    sku?: string;
    price: string;
  };
}

export interface Sale {
  id: number;
  location_id: number;
  employee_id?: number;
  user_id?: number;
  client_id?: number;
  total?: string; // from API
  total_amount?: string; // backward compatibility
  subtotal?: string;
  tax?: string;
  discount_amount?: string;
  discount_type?: string;
  coupon_id?: number;
  coupon_code?: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'points';
  payment_status: 'completed' | 'pending' | 'failed';
  sale_status: 'completed' | 'cancelled';
  points_earned?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  location?: {
    id: number;
    name: string;
    address?: string;
  };
  employee?: {
    id: number;
    name: string;
    email: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  client?: {
    id: number;
    name: string;
    email?: string;
  };
  items?: SaleItem[];
  coupon?: Coupon;
}

export interface SalesListResponse {
  data: Sale[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SalesStatistics {
  total_sales: number;
  total_revenue: string;
  average_sale: string;
  total_items_sold: number;
  sales_by_payment_method?: {
    cash: number;
    card: number;
    transfer: number;
    points: number;
  };
  sales_by_status?: {
    completed: number;
    pending: number;
    cancelled: number;
  };
}
