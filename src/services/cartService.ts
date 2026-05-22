import { encrypt } from '@/utils/enc-decy';

import ApiService from './ApiService';

export async function apiAddToCart(data: any) {
  return ApiService.fetchData<any>({
    url: `/cart`,
    method: 'post',
    data: encrypt(data),
  });
}

export async function apiAddToCheckout(data: any) {
  return ApiService.fetchData<any>({
    url: `cart/checkout`,
    method: 'post',
    data: encrypt(data),
  });
}

export async function apiGetCartList() {
  return ApiService.fetchData({
    url: `/cart`,
    method: 'get',
  });
}
export async function apiGetLoalCartList(data: any) {
  return ApiService.fetchData<any>({
    url: `/cart/products/`,
    method: 'post',
    data: encrypt(data),
  });
}

export async function apiRemoveCart(id: any) {
  return ApiService.fetchData<any>({
    url: `/cart/${id}`,
    method: 'delete',
  });
}

export async function apiUpdateCountCartProduct(data: any) {
  return ApiService.fetchData<any>({
    url: `/cart/update-cart`,
    method: 'put',
    data: encrypt(data),
  });
}

export async function apiGetWishList(type: string) {
  return ApiService.fetchData<any>({
    url: `/wishlist?type=${type}`,
    method: 'get',
  });
}

export async function apiAddToWishList(data: any) {
  return ApiService.fetchData<any>({
    url: `/wishlist`,
    method: 'post',
    data: encrypt(data),
  });
}

export async function apiDeleteFromWishList(data: any) {
  // console.log(data);

  return ApiService.fetchData<any>({
    url: `/wishlist/delete-wishlist`,
    method: 'post',
    data: encrypt(data),
  });
}

export async function apiVerifyCoupon(data: any) {
  return ApiService.fetchData<any>({
    url: `/coupons/check-code`,
    method: 'post',
    data: encrypt(data),
  });
}
export async function getCouponData(id: any) {
  return ApiService.fetchData<any>({
    url: `/coupons/${id}`,
    method: 'get',
  });
}
export async function addSubmitSignUp(data: any) {
  return ApiService.fetchData<any>({
    url: `/user/subscribe`,
    method: 'post',
    data: encrypt(data),
  });
}

export async function varifyEmailApi(data: any) {
  return ApiService.fetchData<any>({
    url: `/user/verify-user`,
    method: 'post',
    data: encrypt(data),
  });
}

export async function apiMergeExistingCart(data: any) {
  return ApiService.fetchData<any>({
    url: `/cart/merge-existing`,
    method: 'post',
    data: encrypt(data),
  });
}
