import { encrypt } from '@/utils/enc-decy';

import ApiService from './ApiService';

/**
 * Create a PayPal order via the backend.
 * Backend calculates the full order total server-side and creates the PayPal order.
 */
export async function apiCreatePayPalOrder(data: any) {
  return ApiService.fetchData<any>({
    url: '/paypal/create-order',
    method: 'post',
    data: encrypt(data),
  });
}

/**
 * Capture a PayPal order via the backend.
 * Backend captures the payment, verifies the amount, and finalizes the order
 * (invoice, email, order items, stock deduction, etc.)
 */
export async function apiCapturePayPalOrder(orderId: string) {
  return ApiService.fetchData<any>({
    url: `/paypal/capture-order/${orderId}`,
    method: 'post',
  });
}

/**
 * Cancel a pending PayPal order.
 * Called when user cancels the PayPal popup or payment fails on client side.
 */
export async function apiCancelPayPalOrder(orderId: string) {
  return ApiService.fetchData<any>({
    url: `/paypal/cancel-order/${orderId}`,
    method: 'post',
  });
}
