import { encrypt } from '@/utils/enc-decy';

import ApiService from './ApiService';

/**
 * Create an Affirm checkout via the backend.
 * Backend calculates the full order total server-side and returns the Affirm checkout data
 * for use with affirm.checkout() on the frontend.
 */
export async function apiCreateAffirmCheckout(data: any) {
  return ApiService.fetchData<any>({
    url: '/affirm/create-checkout',
    method: 'post',
    data: encrypt(data),
  });
}

/**
 * Capture an Affirm charge via the backend.
 * Called after user completes the Affirm modal and we receive the checkout_token.
 * Backend authorizes + captures the charge, verifies the amount, and finalizes the order.
 */
export async function apiCaptureAffirmCharge(data: { checkout_token: string; order_id: string }) {
  return ApiService.fetchData<any>({
    url: '/affirm/capture-charge',
    method: 'post',
    data: encrypt(data),
  });
}

/**
 * Cancel a pending Affirm order.
 * Called when user cancels the Affirm modal or payment fails on client side.
 */
export async function apiCancelAffirmOrder(orderId: string) {
  return ApiService.fetchData<any>({
    url: `/affirm/cancel-order/${orderId}`,
    method: 'post',
  });
}
