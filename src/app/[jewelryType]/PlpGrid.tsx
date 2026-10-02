'use client';
import React from 'react';

import Link from 'next/link';

import ProductProfile from '@/components/ProductProfile';

export interface PlpBanner {
  desktop_image: string;
  mobile_image?: string;
  name?: string;
  redirect_url?: string;
}

export type PlpView = 'dense' | 'large';

// Products per editorial block. 12 cards + one 2×2 tile = 4 full rows on the 4-column grid.
const BLOCK_SIZE = 12;

/** Renders "Fine Jewelry" as "Fine <em>Jewelry</em>" — the last word is set in italic. */
export function EditorialTitle({ text, emClassName = '' }: { text?: string | null; emClassName?: string }) {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return null;
  }
  const last = words.pop();
  return (
    <>
      {words.length > 0 && `${words.join(' ')} `}
      <em className={`italic ${emClassName}`}>{last}</em>
    </>
  );
}

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} className="h-[13px] w-[13px]" aria-hidden>
    <path d="M3 13 13 3M5 3h8v8" />
  </svg>
);

function PromoTile({ banner, side, view }: { banner: PlpBanner; side: 'right' | 'left'; view: PlpView }) {
  const noir = side === 'left';
  const href = banner.redirect_url || '#';
  const placement = side === 'left' ? 'col-[1/span_2] md:col-[1/-1]' : 'col-span-2 md:col-span-full';
  const rows = view === 'large' ? 'row-span-1' : 'row-span-2 md:row-span-1';
  const frame =
    view === 'large'
      ? 'aspect-video flex-none md:aspect-[4/5]'
      : `min-h-[420px] flex-1 md:min-h-0 md:flex-none ${noir ? 'md:aspect-[3/4]' : 'md:aspect-[4/5]'}`;

  const picture = (
    <picture className="contents">
      {banner.mobile_image && <source media="(max-width: 550px)" srcSet={banner.mobile_image} />}
      <img
        src={banner.desktop_image}
        alt={banner.name || 'Featured collection'}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-luxe group-hover:scale-[1.03] ${
          noir ? 'object-[50%_30%]' : ''
        }`}
      />
    </picture>
  );

  if (noir) {
    return (
      <article className={`group flex min-w-0 flex-col ${placement} ${rows}`}>
        <Link
          href={href}
          className={`relative block overflow-hidden bg-noir after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:from-45% after:to-noir/85 after:content-[''] ${frame}`}
        >
          {picture}
          <div className="absolute inset-x-0 bottom-0 z-[1] flex flex-wrap items-end justify-between gap-5 p-[clamp(20px,3vw,40px)] text-noir-on">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-gilt-soft">Featured</div>
              {banner.name && (
                <h2 className="m-0 mt-1.5 text-balance font-cormorant text-[clamp(34px,3.4vw,52px)] font-normal leading-none text-noir-on">
                  <EditorialTitle text={banner.name} />
                </h2>
              )}
            </div>
            <span className="inline-flex flex-none items-center gap-2.5 rounded-full border border-noir-on px-5 py-[11px] text-[11px] uppercase tracking-[0.16em] text-noir-on transition-colors group-hover:bg-noir-on group-hover:text-noir">
              Shop now <ArrowIcon />
            </span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className={`group flex min-w-0 flex-col ${placement} ${rows}`}>
      <Link href={href} className={`relative block overflow-hidden bg-stone ${frame}`} aria-label={banner.name || 'Featured collection'}>
        {picture}
      </Link>
      <div className="flex items-end justify-between gap-5 pt-[18px] md:flex-col md:items-start">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-gilt">Featured</div>
          {banner.name && (
            <h2 className="m-0 mt-1.5 text-balance font-cormorant text-[clamp(34px,3.4vw,52px)] font-normal leading-none text-ink">
              <EditorialTitle text={banner.name} />
            </h2>
          )}
        </div>
        <Link
          href={href}
          className="inline-flex flex-none items-center gap-2.5 rounded-full border border-ink px-5 py-[11px] text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Discover <ArrowIcon />
        </Link>
      </div>
    </article>
  );
}

export function gridClassName(view: PlpView) {
  return view === 'large'
    ? 'grid grid-flow-row-dense grid-cols-2 gap-x-4 gap-y-14 pb-5 pt-[26px] md:grid-cols-1 md:gap-y-8'
    : 'grid grid-flow-row-dense grid-cols-4 gap-x-3 gap-y-11 pb-5 pt-[26px] lg:grid-cols-3 md:grid-cols-2 md:gap-x-2 md:gap-y-8';
}

interface PlpGridProps {
  products: any[];
  banners: PlpBanner[];
  view: PlpView;
}

export default function PlpGrid({ products, banners, view }: PlpGridProps) {
  const items: React.ReactNode[] = [];
  const usableBanners = banners.filter((b) => !!b?.desktop_image);

  for (let start = 0, block = 0; start < products.length; start += BLOCK_SIZE, block++) {
    const chunk = products.slice(start, start + BLOCK_SIZE);
    // Only full blocks get an editorial tile, so the grid never ends on a half-empty row.
    const banner = chunk.length === BLOCK_SIZE && usableBanners.length > 0 ? usableBanners[block % usableBanners.length] : null;
    const side = block % 2 === 0 ? 'right' : 'left';

    chunk.forEach((product, i) => {
      if (banner && ((side === 'left' && i === 0) || (side === 'right' && i === 2))) {
        items.push(<PromoTile key={`promo-${block}`} banner={banner} side={side} view={view} />);
      }
      items.push(<ProductProfile key={`${product?.sku_master_id ?? product?.jewelry_id}-${start + i}`} {...product} isStatic layout="plp" />);
    });
  }

  return <div className={gridClassName(view)}>{items}</div>;
}

export function PlpGridSkeleton({ view, count = 8 }: { view: PlpView; count?: number }) {
  const shimmer =
    "relative overflow-hidden bg-stone after:absolute after:inset-0 after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-paper/60 after:to-transparent after:bg-[length:220%_100%] after:content-['']";
  return (
    <div className={gridClassName(view)} aria-busy="true" aria-label="Loading pieces">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex min-w-0 flex-col">
          <div className={`aspect-[4/5] ${shimmer}`} />
          <div className="grid gap-2 pt-4">
            <span className={`block h-[11px] w-3/4 ${shimmer}`} />
            <span className={`block h-[11px] w-1/2 ${shimmer}`} />
            <span className={`block h-[11px] w-1/4 ${shimmer}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
