/* eslint-disable import/no-unresolved */
'use client';
import React, { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import { useAppSelector } from '@/store';

const YotpoReview = () => {
  const searchParams = useSearchParams();
  let slug: string = searchParams?.get('slug') ?? '';
  const decodedSlug: string = slug ?? searchParams?.get('id');
  slug = decodeURIComponent(decodedSlug);
  const selectedProduct = useAppSelector((state) => state.products?.selectedProduct?.product_details);

  if (!selectedProduct) {
    return null;
  }

  return (
    <>
      <div
        className="yotpo-widget-instance"
        data-yotpo-instance-id={process.env.NEXT_PUBLIC_YOTPO_APP_INSTANCE_ID}
        data-yotpo-product-id={selectedProduct?.code}
        data-yotpo-name={selectedProduct.fullTitle}
        data-yotpo-image-url={selectedProduct.jewelry_sku?.find((item: any) => item.sku_slug == slug)?.carat_images?.[0]}
        data-yotpo-price={selectedProduct.jewelry_sku?.find((item: any) => item.sku_slug == slug)?.selling_price}
        // data-yotpo-currency={selectedProduct.jewelry_sku?.find((item) => item.sku_slug == slug)?.currency}
        data-yotpo-url={typeof window !== 'undefined' ? window.location.href : ''}
      ></div>
    </>
  );
};

export default YotpoReview;

export const YotpoStarReview = ({ selectedProduct }: any) => {
  const searchParams = useSearchParams();
  let slug = searchParams?.get('slug');
  const decodedSlug = slug ?? searchParams?.get('id');
  slug = decodeURIComponent(decodedSlug ?? '');
  if (!selectedProduct) {
    return null;
  }
  return (
    <>
      <div
        className="yotpo-widget-instance"
        data-yotpo-instance-id={process.env.NEXT_PUBLIC_YOTPO_APP_INSTANCE_STAR_ID}
        data-yotpo-product-id={selectedProduct?.code}
      ></div>
    </>
  );
};
