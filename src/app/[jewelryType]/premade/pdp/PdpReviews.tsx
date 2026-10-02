'use client';
import React from 'react';

import YotpoReview from '../yotpoReiew';

/** Client reviews (Yotpo widget) in the PDP's section frame. */
export default function PdpReviews() {
  return (
    <section id="pdp-reviews" className="bg-stone/50">
      <div className="mx-auto w-full max-w-[1440px] px-[clamp(16px,3.2vw,56px)] py-[clamp(56px,7vw,96px)]">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gilt">Client reviews</span>
        <h2 className="m-0 mb-8 mt-2.5 text-balance font-cormorant text-[clamp(32px,3.6vw,48px)] font-normal leading-[1.04] text-ink">
          Worn, loved, <em className="italic text-gilt">and reviewed</em>
        </h2>
        <YotpoReview />
      </div>
    </section>
  );
}
