/**
 * Coupon Helper Utilities
 * 
 * This file contains utility functions for working with coupons
 * throughout the application.
 */

import { Coupon } from '@/types/api';

/**
 * Check if a coupon is currently active based on dates
 */
export function isCouponActive(coupon: Coupon): boolean {
  const now = new Date();
  const startsAt = new Date(coupon.starts_at);
  const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;
  
  return (
    coupon.is_active &&
    now >= startsAt &&
    (!expiresAt || now <= expiresAt)
  );
}

/**
 * Check if coupon has usage remaining
 */
export function hasUsageRemaining(coupon: Coupon): boolean {
  if (!coupon.usage_limit) return true; // unlimited
  return (coupon.usage_count || 0) < coupon.usage_limit;
}

/**
 * Get coupon status
 */
export function getCouponStatus(coupon: Coupon): 'active' | 'expired' | 'used_up' | 'scheduled' | 'inactive' {
  if (!coupon.is_active) return 'inactive';
  
  const now = new Date();
  const startsAt = new Date(coupon.starts_at);
  const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;
  
  if (now < startsAt) return 'scheduled';
  if (expiresAt && now > expiresAt) return 'expired';
  if (!hasUsageRemaining(coupon)) return 'used_up';
  
  return 'active';
}

/**
 * Format discount display text
 */
export function formatDiscount(coupon: Coupon): string {
  switch (coupon.type) {
    case 'percentage':
      return `${coupon.discount_percentage}% de descuento`;
    case 'fixed_amount':
      const amount = typeof coupon.discount_amount === 'string' 
        ? parseFloat(coupon.discount_amount)
        : coupon.discount_amount;
      return `$${amount?.toFixed(2)} de descuento`;
    case 'free_shipping':
      return 'Envío gratis';
    case 'buy_x_get_y':
      return `Compra ${coupon.buy_quantity} lleva ${coupon.get_quantity}`;
    case 'free_item':
      return 'Producto gratis';
    default:
      return 'Descuento';
  }
}

/**
 * Calculate discount amount for a given subtotal
 */
export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  switch (coupon.type) {
    case 'percentage':
      if (!coupon.discount_percentage) return 0;
      return (subtotal * coupon.discount_percentage) / 100;
      
    case 'fixed_amount':
      if (!coupon.discount_amount) return 0;
      const amount = typeof coupon.discount_amount === 'string' 
        ? parseFloat(coupon.discount_amount)
        : coupon.discount_amount;
      return Math.min(amount, subtotal); // Don't discount more than subtotal
      
    case 'free_shipping':
      return 0; // Handled separately
      
    default:
      return 0;
  }
}

/**
 * Check if subtotal meets minimum purchase requirement
 */
export function meetsMinimumPurchase(coupon: Coupon, subtotal: number): boolean {
  if (!coupon.min_purchase_amount) return true;
  
  const minAmount = typeof coupon.min_purchase_amount === 'string'
    ? parseFloat(coupon.min_purchase_amount)
    : coupon.min_purchase_amount;
    
  return subtotal >= minAmount;
}

/**
 * Get user-friendly status badge variant
 */
export function getStatusBadgeVariant(coupon: Coupon): 'default' | 'secondary' | 'destructive' | 'outline' {
  const status = getCouponStatus(coupon);
  
  switch (status) {
    case 'active':
      return 'default';
    case 'scheduled':
      return 'secondary';
    case 'expired':
    case 'used_up':
    case 'inactive':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Get user-friendly status label
 */
export function getStatusLabel(coupon: Coupon): string {
  const status = getCouponStatus(coupon);
  
  switch (status) {
    case 'active':
      return 'Activo';
    case 'scheduled':
      return 'Programado';
    case 'expired':
      return 'Expirado';
    case 'used_up':
      return 'Agotado';
    case 'inactive':
      return 'Inactivo';
    default:
      return 'Desconocido';
  }
}

/**
 * Get remaining usage text
 */
export function getRemainingUsageText(coupon: Coupon): string {
  if (!coupon.usage_limit) return 'Ilimitado';
  
  const remaining = coupon.usage_limit - (coupon.usage_count || 0);
  return `${remaining} de ${coupon.usage_limit}`;
}

/**
 * Format date range for display
 */
export function formatDateRange(coupon: Coupon): string {
  const startDate = new Date(coupon.starts_at).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  if (!coupon.expires_at) {
    return `Desde ${startDate}`;
  }
  
  const endDate = new Date(coupon.expires_at).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return `${startDate} - ${endDate}`;
}

/**
 * Validate coupon code format (basic)
 */
export function isValidCouponCode(code: string): boolean {
  // Basic validation: alphanumeric, 3-20 characters
  const regex = /^[A-Z0-9]{3,20}$/;
  return regex.test(code);
}

/**
 * Generate a random coupon code
 */
export function generateCouponCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if coupon is restricted to specific memberships
 */
export function hasMembershipRestriction(coupon: Coupon): boolean {
  return !!(coupon.membership_plan_ids && coupon.membership_plan_ids.length > 0);
}

/**
 * Check if coupon has product/category restrictions
 */
export function hasScopeRestrictions(coupon: Coupon): boolean {
  return !!(
    (coupon.applicable_products && coupon.applicable_products.length > 0) ||
    (coupon.excluded_products && coupon.excluded_products.length > 0) ||
    (coupon.applicable_categories && coupon.applicable_categories.length > 0) ||
    (coupon.excluded_categories && coupon.excluded_categories.length > 0)
  );
}

/**
 * Get restriction summary text
 */
export function getRestrictionSummary(coupon: Coupon): string[] {
  const restrictions: string[] = [];
  
  if (hasMembershipRestriction(coupon)) {
    restrictions.push(`Solo para ${coupon.membership_plan_ids!.length} plan(es) de membresía`);
  }
  
  if (!coupon.is_public) {
    restrictions.push('Solo usuarios asignados');
  }
  
  if (coupon.applicable_products && coupon.applicable_products.length > 0) {
    restrictions.push(`Solo ${coupon.applicable_products.length} productos`);
  }
  
  if (coupon.excluded_products && coupon.excluded_products.length > 0) {
    restrictions.push(`Excluye ${coupon.excluded_products.length} productos`);
  }
  
  if (coupon.applicable_categories && coupon.applicable_categories.length > 0) {
    restrictions.push(`Solo ${coupon.applicable_categories.length} categorías`);
  }
  
  if (coupon.excluded_categories && coupon.excluded_categories.length > 0) {
    restrictions.push(`Excluye ${coupon.excluded_categories.length} categorías`);
  }
  
  if (coupon.min_purchase_amount) {
    const minAmount = typeof coupon.min_purchase_amount === 'string'
      ? parseFloat(coupon.min_purchase_amount)
      : coupon.min_purchase_amount;
    restrictions.push(`Compra mínima $${minAmount.toFixed(2)}`);
  }
  
  if (coupon.is_single_use) {
    restrictions.push('Un solo uso por usuario');
  }
  
  return restrictions;
}

/**
 * Sort coupons by priority (for display)
 * Active coupons first, then by discount amount
 */
export function sortCouponsByPriority(coupons: Coupon[]): Coupon[] {
  return [...coupons].sort((a, b) => {
    // Active status first
    const statusA = getCouponStatus(a);
    const statusB = getCouponStatus(b);
    
    if (statusA === 'active' && statusB !== 'active') return -1;
    if (statusB === 'active' && statusA !== 'active') return 1;
    
    // Then by discount amount (higher first)
    const discountA = calculateDiscount(a, 100); // Use 100 as baseline
    const discountB = calculateDiscount(b, 100);
    
    return discountB - discountA;
  });
}
