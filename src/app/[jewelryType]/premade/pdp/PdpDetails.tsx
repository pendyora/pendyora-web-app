'use client';
import React, { useMemo } from 'react';

import Link from 'next/link';

import { useAppSelector } from '@/store';

const SUMMARY =
  "flex h-14 cursor-pointer list-none items-center justify-between text-[14px] font-medium text-ink [&::-webkit-details-marker]:hidden after:text-[20px] after:font-light after:text-ink-soft after:content-['+'] group-open:after:content-['–']";
const BODY = 'pb-5 text-[13.5px] leading-[1.7] text-ink-soft';

/** Description, attributes and policies as accordions inside the buy box (design-mockups/product-page-v4). */
export default function PdpDetails({ deliveryNote }: { deliveryNote?: React.ReactNode }) {
  // `extra_titles` comes from the API but is missing from the slice's typed shape.
  const product: any = useAppSelector((state) => state.products?.selectedProduct?.product_details);

  const attributes = useMemo(
    () =>
      (product?.extra_titles ?? [])
        .map((item: any) => ({ id: item?.id, label: item?.master_name?.trim?.() ?? '', value: item?.value?.trim?.() ?? '' }))
        .filter((item: { value: string }) => Boolean(item.value)),
    [product?.extra_titles],
  );

  if (!product?.jewelry_id) {
    return null;
  }

  return (
    <div id="pdp-details" className="border-t border-line">
      {(product?.description || attributes.length > 0) && (
        <details open className="group border-b border-line">
          <summary className={SUMMARY}>The piece</summary>
          <div className={BODY}>
            {product?.description && <p className="m-0 mb-3.5 whitespace-pre-line">{product.description}</p>}
            {attributes.length > 0 && (
              <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2">
                {attributes.map((a: { id?: string; label: string; value: string }, i: number) => (
                  <React.Fragment key={`${a.id ?? a.value}-${i}`}>
                    <dt className="text-ink-faint">{a.label || 'Detail'}</dt>
                    <dd className="m-0 tabular-nums text-ink">{a.value}</dd>
                  </React.Fragment>
                ))}
              </dl>
            )}
          </div>
        </details>
      )}
      <details className="group border-b border-line">
        <summary className={SUMMARY}>Shipping &amp; returns</summary>
        <div className={`${BODY} grid gap-2`}>
          {deliveryNote}
          <p className="m-0">
            Read the full{' '}
            <Link href="/returns-shipping" className="text-ink underline underline-offset-4 hover:text-ink">
              shipping and returns policy
            </Link>
            .
          </p>
        </div>
      </details>
      <details className="group border-b border-line">
        <summary className={SUMMARY}>Care</summary>
        <div className={BODY}>
          <p className="m-0">
            Clean with warm water and a soft brush, and store each piece on its own.{' '}
            <Link href="/jewelry-care" className="text-ink underline underline-offset-4 hover:text-ink">
              How to care for your jewelry
            </Link>
          </p>
        </div>
      </details>
    </div>
  );
}
