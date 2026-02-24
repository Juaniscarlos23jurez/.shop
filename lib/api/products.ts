import { ApiResponse } from '@/types/api';
import { api } from './api';
import {
  Product,
  ProductListResponse,
  ProductResponse,
  ProductCreateInput,
  ProductUpdateInput
} from '@/types/product';

interface GetProductsParams {
  page?: number;
  per_page?: number;
  type?: 'physical' | 'made_to_order' | 'service';
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
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
    params?.type,
    params?.search,
    params?.orderBy,
    params?.orderDirection
  );
}

/**
 * TEMP: Public user's products by UID (stub)
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
): Promise<ApiResponse<ProductResponse>> {
  return api.products.getProduct(companyId, productId, token);
}

/**
 * Create a new product
 */
export async function createProduct(
  companyId: string,
  data: ProductCreateInput,
  token: string
): Promise<ApiResponse<ProductResponse>> {
  return api.products.createProduct(companyId, data, token);
}

/**
 * Update an existing product
 */
export async function updateProduct(
  companyId: string,
  productId: string,
  data: ProductUpdateInput,
  token: string
): Promise<ApiResponse<ProductResponse>> {
  return api.products.updateProduct(companyId, productId, data, token);
}

/**
 * Delete a product
 */
export async function deleteProduct(
  companyId: string,
  productId: string,
  token: string
): Promise<ApiResponse> {
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
): Promise<ApiResponse<ProductResponse>> {
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
): Promise<ApiResponse<ProductResponse>> {
  return api.products.toggleProductAvailability(companyId, productId, locationId, isAvailable, token);
}

/**
 * Reorder products by updating their position
 */
export async function reorderProducts(
  companyId: string,
  token: string,
  items: { product_id: string | number; position: number }[],
): Promise<ApiResponse> {
  return api.products.reorderProducts(companyId, items, token);
}
