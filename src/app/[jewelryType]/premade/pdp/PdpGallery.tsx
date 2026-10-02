'use client';
import React, { useMemo, useState } from 'react';

import { Image, Skeleton } from 'antd';
import Link from 'next/link';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import ProtectedVideo from '@/components/ProtectedVideo';

import type { Swiper as SwiperClass } from 'swiper';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

export type GalleryMedia = { kind: 'image' | 'video' | 'model'; src: string };
export type Viewport = 'unknown' | 'desktop' | 'mobile';

const FALLBACK_IMAGE = '/images/no_images.svg';

/** Ordered media for a SKU: 360 view, first video, photos, second video. */
export function buildGalleryMedia(metadata: any): GalleryMedia[] {
  if (!metadata) {
    return [];
  }
  const media: GalleryMedia[] = [];
  if (typeof metadata.model_view === 'string' && metadata.model_view.startsWith('https://')) {
    media.push({ kind: 'model', src: metadata.model_view });
  }
  if (metadata.carat_video?.[0]) {
    media.push({ kind: 'video', src: metadata.carat_video[0] });
  }
  (metadata.carat_images ?? []).forEach((src: string) => media.push({ kind: 'image', src }));
  if (metadata.carat_video?.[1]) {
    media.push({ kind: 'video', src: metadata.carat_video[1] });
  }
  if (!media.some((m) => m.kind === 'image')) {
    media.push({ kind: 'image', src: FALLBACK_IMAGE });
  }
  return media;
}

function ModelView({ src }: { src: string }) {
  return (
    <div className="relative h-full w-full">
      <iframe
        key={src}
        title="360° view"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking; web-share"
        className="absolute inset-0 h-full w-full border-none"
        src={src}
      />
      <span className="pointer-events-none absolute bottom-4 right-4 z-[2] bg-paper px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
        360° view
      </span>
    </div>
  );
}

/** Photo tile that magnifies under the cursor; click opens the lightbox. */
function ZoomTile({ src, alt, onOpen }: { src: string; alt: string; onOpen: () => void }) {
  const [origin, setOrigin] = useState<string | null>(null);
  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      onMouseLeave={() => setOrigin(null)}
      aria-label={`Enlarge: ${alt}`}
      className="absolute inset-0 block h-full w-full cursor-zoom-in overflow-hidden"
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          if (!e.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
            e.currentTarget.src = FALLBACK_IMAGE;
          }
        }}
        style={origin ? { transformOrigin: origin, transform: 'scale(1.9)' } : undefined}
        className="h-full w-full object-contain mix-blend-multiply transition-transform duration-200 ease-out"
      />
    </button>
  );
}

function NoteTile() {
  return (
    <div className="flex aspect-square flex-col justify-between bg-noir p-[clamp(22px,2.6vw,40px)] text-noir-on">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gilt-soft">The Pendyora atelier</span>
      <p className="m-0 font-cormorant text-[clamp(22px,2.1vw,32px)] italic leading-[1.2] text-noir-on">
        “Made to be looked at closely, and worn every day.”
      </p>
      <ul className="m-0 grid list-none gap-2.5 p-0 text-[13px] text-noir-on/80">
        <li>
          <Link href="/virtual-appointment" className="text-noir-on/80 underline-offset-4 hover:text-noir-on hover:underline">
            Book a virtual appointment
          </Link>
        </li>
        <li>
          <Link href="/jewelry-care" className="text-noir-on/80 underline-offset-4 hover:text-noir-on hover:underline">
            How to care for your piece
          </Link>
        </li>
      </ul>
    </div>
  );
}

function MediaSlide({ item, alt }: { item: GalleryMedia; alt: string }) {
  if (item.kind === 'video') {
    return <ProtectedVideo src={item.src} autoPlay muted loop className="h-full w-full object-cover" />;
  }
  return (
    <img
      src={item.src}
      alt={alt}
      decoding="async"
      onError={(e) => {
        if (!e.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
          e.currentTarget.src = FALLBACK_IMAGE;
        }
      }}
      className="h-full w-full object-contain mix-blend-multiply"
    />
  );
}

interface PdpGalleryProps {
  media: GalleryMedia[];
  loading: boolean;
  title: string;
  viewport: Viewport;
}

export default function PdpGallery({ media, loading, title, viewport }: PdpGalleryProps) {
  const [thumbs, setThumbs] = useState<SwiperClass | null>(null);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

  const photos = useMemo(() => media.filter((m) => m.kind === 'image').map((m) => m.src), [media]);
  // 360 iframes only mount once the viewport is known, so desktop never boots the mobile one (iOS OOM, history entries).
  const visible = useMemo(() => media.filter((m) => m.kind !== 'model' || viewport !== 'unknown'), [media, viewport]);
  const has360 = visible.some((m) => m.kind === 'model');

  const openPhoto = (src: string) => setPreview({ open: true, index: Math.max(0, photos.indexOf(src)) });

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {[0, 1, 2].map((i) => (
          <Skeleton.Node
            key={i}
            active
            className={`!block !h-auto !w-full ${i === 0 ? 'col-span-2 md:col-span-1' : 'md:hidden'}`}
            style={{ width: '100%', height: 'auto', aspectRatio: '1 / 1', borderRadius: 0 }}
          />
        ))}
      </div>
    );
  }

  const lightbox = (
    <div className="hidden">
      <Image.PreviewGroup
        items={photos}
        preview={{
          visible: preview.open,
          current: preview.index,
          onVisibleChange: (open) => setPreview((p) => ({ ...p, open })),
          onChange: (index) => setPreview((p) => ({ ...p, index })),
        }}
      />
    </div>
  );

  // Desktop: lookbook mosaic. First piece spans both columns; an editorial tile fills an odd last slot.
  const rest = visible.slice(1);
  const desktop = viewport !== 'mobile' && (
    <div className="grid grid-cols-2 gap-2 md:hidden">
      {visible[0] && (
        <figure className="relative col-span-2 m-0 aspect-square overflow-hidden bg-stone">
          {visible[0].kind === 'model' ? (
            <ModelView src={visible[0].src} />
          ) : visible[0].kind === 'video' ? (
            <MediaSlide item={visible[0]} alt={title} />
          ) : (
            <ZoomTile src={visible[0].src} alt={title} onOpen={() => openPhoto(visible[0].src)} />
          )}
        </figure>
      )}
      {rest.map((item, i) => (
        <figure key={`${item.src}-${i}`} className="relative m-0 aspect-square overflow-hidden bg-stone">
          {item.kind === 'model' ? (
            <ModelView src={item.src} />
          ) : item.kind === 'video' ? (
            <MediaSlide item={item} alt={title} />
          ) : (
            <ZoomTile src={item.src} alt={`${title}, view ${i + 2}`} onOpen={() => openPhoto(item.src)} />
          )}
        </figure>
      ))}
      {rest.length % 2 === 1 && <NoteTile />}
    </div>
  );

  // Mobile: swipeable carousel with a thumbnail strip.
  const mobile = viewport !== 'desktop' && (
    <div className="hidden md:block">
      <Swiper
        // iOS Safari can reload the page when loop clones the 360 iframe slide.
        loop={visible.length > 1 && !has360}
        slidesPerView={1}
        spaceBetween={8}
        navigation
        thumbs={{ swiper: thumbs && !thumbs.destroyed ? thumbs : null }}
        modules={[FreeMode, Navigation, Thumbs]}
        onSlideChange={(s) => setActive(s.realIndex)}
        className="[--swiper-navigation-color:theme(colors.ink.DEFAULT)] [--swiper-navigation-size:18px]"
      >
        {visible.map((item, i) => (
          <SwiperSlide key={`${item.src}-${i}`} className="!aspect-square overflow-hidden bg-stone">
            {item.kind === 'model' ? (
              <ModelView src={item.src} />
            ) : (
              <button type="button" className="block h-full w-full" onClick={() => item.kind === 'image' && openPhoto(item.src)}>
                <MediaSlide item={item} alt={title} />
              </button>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="flex items-center gap-4 pt-3 text-[11px] uppercase tabular-nums tracking-[0.16em] text-ink-soft">
        <span>
          {String(active + 1).padStart(2, '0')} / {String(visible.length).padStart(2, '0')}
        </span>
        <span className="relative h-px flex-1 bg-line">
          <i
            className="absolute inset-y-0 left-0 bg-ink transition-all duration-300"
            style={{ width: `${100 / Math.max(visible.length, 1)}%`, left: `${(active / Math.max(visible.length, 1)) * 100}%` }}
          />
        </span>
      </div>
      {visible.length > 1 && (
        <Swiper onSwiper={setThumbs} slidesPerView={5} spaceBetween={6} freeMode watchSlidesProgress modules={[FreeMode, Thumbs]} className="mt-3">
          {visible.map((item, i) => (
            <SwiperSlide key={`thumb-${item.src}-${i}`} className="!aspect-square cursor-pointer">
              <div className={`h-full w-full border bg-stone p-0.5 transition-colors ${active === i ? 'border-ink' : 'border-transparent'}`}>
                {item.kind === 'image' ? (
                  <img src={item.src} alt="" loading="lazy" className="h-full w-full object-contain mix-blend-multiply" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-[9px] font-medium uppercase tracking-[0.14em] text-ink-soft">
                    {item.kind === 'model' ? '360°' : 'Video'}
                  </span>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );

  return (
    <>
      {desktop}
      {mobile}
      {lightbox}
    </>
  );
}
