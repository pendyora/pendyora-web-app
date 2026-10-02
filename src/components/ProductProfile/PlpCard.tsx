'use client';
import React from 'react';

// Presentational card for the product listing page (design reference: design-mockups/plp/index.html).
// All data and variant logic stays in ProductProfile; this component only renders.

export type PlpMetalTone = 'yellow' | 'white' | 'rose' | 'black';

export interface PlpSwatch {
  key: string;
  label: string;
  tone: PlpMetalTone;
  active: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onPreviewEnd: () => void;
}

export interface PlpBadge {
  label: string;
  tone?: 'gilt' | 'muted' | 'sale';
}

interface PlpCardProps {
  href: string;
  onOpen: () => void;
  name: string;
  mainImage: string;
  hoverImage?: string | null;
  spec?: string;
  price: React.ReactNode;
  comparePrice?: React.ReactNode;
  offLabel?: string | null;
  badges?: PlpBadge[];
  ctaLabel: string;
  swatches?: PlpSwatch[];
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

const FALLBACK_IMAGE = '/images/no_images.svg';

// Full class strings so Tailwind's JIT can see them.
export const METAL_SWATCH: Record<PlpMetalTone, string> = {
  yellow: 'bg-gradient-to-br from-metal-yellow-light via-metal-yellow-mid to-metal-yellow-deep',
  white: 'bg-gradient-to-br from-metal-white-light via-metal-white-mid to-metal-white-deep',
  rose: 'bg-gradient-to-br from-metal-rose-light via-metal-rose-mid to-metal-rose-deep',
  black: 'bg-gradient-to-br from-metal-black-light via-metal-black-mid to-metal-black-deep',
};

const BADGE_TONE = {
  gilt: 'font-semibold text-gilt',
  muted: 'font-medium text-ink-soft',
  sale: 'font-semibold bg-ink px-[7px] py-[3px] tracking-[0.14em] text-paper',
};

export default function PlpCard({
  href,
  onOpen,
  name,
  mainImage,
  hoverImage,
  spec,
  price,
  comparePrice,
  offLabel,
  badges = [],
  ctaLabel,
  swatches = [],
  isWishlisted,
  onToggleWishlist,
}: PlpCardProps) {
  const hasAlt = !!hoverImage && hoverImage !== FALLBACK_IMAGE && hoverImage !== mainImage;
  const open = (e: React.MouseEvent) => {
    // Modified clicks (new tab / window) behave like a normal link.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
      return;
    }
    e.preventDefault();
    onOpen();
  };

  return (
    <article className="group flex min-w-0 flex-col">
      <div className="relative overflow-hidden">
        <a href={href} onClick={open} aria-label={name} className="relative block aspect-[4/5] overflow-hidden bg-stone">
          {badges.length > 0 && (
            <span className="pointer-events-none absolute left-3.5 right-3.5 top-[13px] z-[2] grid justify-items-start gap-1">
              {badges.map((b) => (
                <span key={b.label} className={`text-[10px] uppercase leading-[1.3] tracking-[0.18em] ${BADGE_TONE[b.tone ?? 'gilt']}`}>
                  {b.label}
                </span>
              ))}
            </span>
          )}
          <img
            src={mainImage || FALLBACK_IMAGE}
            alt={name}
            loading="lazy"
            onError={(e) => {
              if (!e.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
                e.currentTarget.src = FALLBACK_IMAGE;
              }
            }}
            className={`absolute inset-0 h-full w-full object-contain mix-blend-multiply transition duration-700 ease-luxe group-hover:scale-[1.035] ${
              hasAlt ? 'group-hover:opacity-0' : ''
            }`}
          />
          {hasAlt && (
            <img
              src={hoverImage as string}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain opacity-0 mix-blend-multiply transition-opacity duration-700 ease-luxe group-hover:opacity-100"
            />
          )}
        </a>
        <a
          href={href}
          onClick={open}
          tabIndex={-1}
          className="absolute bottom-2.5 left-2.5 right-2.5 z-[2] flex min-h-[46px] translate-y-[calc(100%+14px)] items-center justify-center bg-paper/95 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink backdrop-blur-md transition-transform duration-500 ease-luxe hover:text-ink group-focus-within:translate-y-0 group-hover:translate-y-0 [@media(hover:none)]:hidden"
        >
          {ctaLabel}
        </a>
      </div>

      <div className="grid gap-[5px] pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3
            title={name}
            className="m-0 line-clamp-2 font-libre text-[12px] font-medium uppercase leading-[1.45] tracking-[0.13em] text-ink sm:text-[11px] sm:tracking-[0.1em]"
          >
            <a href={href} onClick={open} className="text-inherit hover:text-inherit">
              {name}
            </a>
          </h3>
          <button
            type="button"
            aria-pressed={isWishlisted}
            aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            className="-mt-[3px] grid h-[22px] w-[22px] flex-none place-items-center text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className={`h-4 w-4 stroke-current stroke-[1.2] transition-colors ${isWishlisted ? 'fill-ink' : 'fill-none'}`}
            >
              <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />
            </svg>
          </button>
        </div>
        <div className="min-h-[1.45em] text-[12.5px] leading-[1.45] text-ink-soft sm:text-[11.5px]">{spec}</div>
        <div className="flex flex-wrap items-baseline gap-2 text-[13px] tabular-nums tracking-[0.02em] text-ink">
          <span>{price}</span>
          {comparePrice && <s className="text-[12px] text-ink-soft">{comparePrice}</s>}
          {comparePrice && offLabel && <span className="text-[11px] tracking-[0.08em] text-gilt">{offLabel}</span>}
        </div>
        <div className="mt-[9px] flex min-h-4 flex-wrap items-center gap-2.5" role={swatches.length > 1 ? 'group' : undefined} aria-label="Metal">
          {swatches.length > 1
            ? swatches.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={s.active}
                  aria-label={s.label}
                  title={s.label}
                  onClick={s.onSelect}
                  onMouseEnter={s.onPreview}
                  onMouseLeave={s.onPreviewEnd}
                  className={`relative h-4 w-4 rounded-full ${METAL_SWATCH[s.tone]} after:absolute after:-inset-1 after:rounded-full after:border after:border-transparent after:transition-colors after:content-[''] hover:after:border-ink-soft aria-pressed:after:border-ink`}
                />
              ))
            : swatches.length === 1 && <span title={swatches[0].label} className={`h-4 w-4 rounded-full ${METAL_SWATCH[swatches[0].tone]}`} />}
        </div>
      </div>
    </article>
  );
}
