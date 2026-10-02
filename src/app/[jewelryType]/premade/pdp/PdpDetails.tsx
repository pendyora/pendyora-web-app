'use client';
import React, { useMemo } from 'react';

import { Tabs } from 'antd';
import Link from 'next/link';

import { useAppSelector } from '@/store';

/** Description, product attributes and policies as tabs, beside a detail photo. */
export default function PdpDetails({ image, deliveryNote }: { image?: string; deliveryNote?: React.ReactNode }) {
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

  const items = [];
  if (product?.description) {
    items.push({
      key: 'piece',
      label: 'The piece',
      children: <p className="m-0 max-w-[62ch] whitespace-pre-line text-[14.5px] leading-[1.75] text-ink-soft">{product.description}</p>,
    });
  }
  if (attributes.length > 0) {
    items.push({
      key: 'specs',
      label: 'Specifications',
      children: (
        <dl className="m-0 grid max-w-[62ch] grid-cols-[auto_minmax(0,1fr)] gap-x-8 border-t border-line">
          {attributes.map((a: { id?: string; label: string; value: string }, i: number) => (
            <React.Fragment key={`${a.id ?? a.value}-${i}`}>
              <dt className="border-b border-line py-3 text-[11px] uppercase tracking-[0.14em] text-ink-soft">{a.label || 'Detail'}</dt>
              <dd className="m-0 border-b border-line py-3 text-[14px] tabular-nums text-ink">{a.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      ),
    });
  }
  items.push({
    key: 'shipping',
    label: 'Shipping & returns',
    children: (
      <div className="grid max-w-[62ch] gap-3 text-[14.5px] leading-[1.75] text-ink-soft">
        {deliveryNote}
        <p className="m-0">
          Shipping and returns are free. Read the full{' '}
          <Link href="/returns-shipping" className="text-ink underline underline-offset-4 hover:text-ink">
            shipping and returns policy
          </Link>
          , or see how to{' '}
          <Link href="/jewelry-care" className="text-ink underline underline-offset-4 hover:text-ink">
            care for your jewelry
          </Link>
          .
        </p>
      </div>
    ),
  });

  return (
    <section id="pdp-details" className="mx-auto w-full max-w-[1440px] px-[clamp(16px,3.2vw,56px)] pb-[clamp(56px,7vw,96px)]">
      <div className="grid grid-cols-2 items-start gap-[clamp(28px,5vw,80px)] border-t border-line pt-[clamp(56px,7vw,96px)] md:grid-cols-1">
        <figure className="m-0 aspect-[16/11] overflow-hidden bg-stone md:hidden">
          {image && <img src={image} alt={product?.fullTitle ?? ''} loading="lazy" className="h-full w-full object-contain mix-blend-multiply" />}
        </figure>
        <div className="min-w-0">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gilt">The details</span>
          <h2 className="m-0 mb-6 mt-2.5 text-balance font-cormorant text-[clamp(32px,3.6vw,48px)] font-normal leading-[1.04] text-ink">
            Everything about <em className="italic text-gilt">this piece</em>
          </h2>
          <Tabs items={items} className="[&_.ant-tabs-tab-btn]:uppercase [&_.ant-tabs-tab-btn]:tracking-[0.18em]" />
        </div>
      </div>
    </section>
  );
}
