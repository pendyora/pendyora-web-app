import { encrypt } from '@/utils/enc-decy';

import ApiService from './ApiService';

export async function apiPlaceOrder(data: any) {
  return ApiService.fetchData<any>({
    url: `/order/add`,
    method: 'post',
    data: encrypt(data),
  });
}

export async function apiGetOrders(id: any) {
  return ApiService.fetchData<any>({
    url: `/order/${id}`,
    method: 'get',
  });
}
export async function getOrderList() {
  return ApiService.fetchData({
    url: `/order/list`,
    method: 'get',
  });
}

export async function apiRequestCustomJewelry<T>(data: any) {
  const formData = new FormData();

  // Extract image files
  const image_1 = data.image_1?.[0]?.originFileObj;
  const image_2 = data.image_2?.[0]?.originFileObj;
  const image_3 = data.image_3?.[0]?.originFileObj;

  // Remove file fields before encryption
  const { image_1: _, image_2: __, image_3: ___, ...textData } = data;

  // Append encrypted JSON data
  formData.append('data', encrypt(textData, true));
  // console.log(textData);

  // Append image files (optional)
  if (image_1) {
    formData.append('image_1', image_1);
  }
  if (image_2) {
    formData.append('image_2', image_2);
  }
  if (image_3) {
    formData.append('image_3', image_3);
  }

  // Call API
  return ApiService.fetchData<T>({
    url: '/jewelry/request-custom-jewelry',
    method: 'post',
    data: formData as any,
    headers: {
      'Content-Type': 'multipart/form-data', // Optional, sometimes inferred automatically
    },
  });
}
