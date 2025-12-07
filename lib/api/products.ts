import { ApiResponse } from '@/types/api';
import { api } from './api';

export interface ProductLocation {
  id: number;
  is_available: boolean;
  stock?: number;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  product_type: 'physical' | 'made_to_order' | 'service';
  track_stock?: boolean;
  is_active: boolean;
  category: string;
  image_url?: string;
  locations: ProductLocation[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductListResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
}

interface GetProductsParams {
  page?: number;
  per_page?: number;
  type?: 'physical' | 'made_to_order' | 'service';
}

/**
 * Get all products for a company
 */
export async function getProducts(
  companyId: string,
  token: string,
  params?: GetProductsParams
): Promise<ApiResponse<ProductListResponse>> {
  return api.products.getProducts(
    companyId, 
    token, 
    params?.page, 
    params?.per_page,
    params?.type
  );
}

/**
 * TEMP: Public user's products by UID (stub)
 * This is provided to satisfy imports from `app/[uid]/page.tsx`.
 * Replace with a real public endpoint integration when available.
 */
export async function getUserProducts(uid: string): Promise<Product[]> {
  try {
    console.warn('[products.getUserProducts] Not implemented. Returning empty list for uid:', uid);
    return [];
  } catch (e) {
    console.error('[products.getUserProducts] error:', e);
    return [];
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(
  companyId: string,
  productId: string,
  token: string
): Promise<ApiResponse<{ product: Product }>> {
  return api.products.getProduct(companyId, productId, token);
}

/**
 * Create a new product
 */
export async function createProduct(
  companyId: string,
  data: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
  token: string
): Promise<ApiResponse<{ product: Product }>> {
  return api.products.createProduct(companyId, data, token);
}

/**
 * Update an existing product
 */
export async function updateProduct(
  companyId: string,
  productId: string,
  data: Partial<Product>,
  token: string
): Promise<ApiResponse<{ product: Product }>> {
  return api.products.updateProduct(companyId, productId, data, token);
}

/**
 * Delete a product
 */
export async function deleteProduct(
  companyId: string,
  productId: string,
  token: string
): Promise<ApiResponse<{}>> {
  return api.products.deleteProduct(companyId, productId, token);
}

/**
 * Update product stock (for physical products)
 */
export async function updateProductStock(
  companyId: string,
  productId: string,
  locationId: number,
  stock: number,
  token: string
): Promise<ApiResponse<{ product: Product }>> {
  return api.products.updateProductStock(companyId, productId, locationId, stock, token);
}

/**
 * Toggle product availability at a location
 */
export async function toggleProductAvailability(
  companyId: string,
  productId: string,
  locationId: number,
  isAvailable: boolean,
  token: string
): Promise<ApiResponse<{ product: Product }>> {
  return api.products.toggleProductAvailability(companyId, productId, locationId, isAvailable, token);
}

/**
 * Reorder products by updating their position
 */
export async function reorderProducts(
  companyId: string,
  token: string,
  items: { product_id: string | number; position: number }[],
): Promise<ApiResponse<{}>> {
  return api.products.reorderProducts(companyId, items, token);
}
