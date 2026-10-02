import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

const STAGES = [
  { n: 'i.', title: 'Drawing', body: 'Proportions set to your size' },
  { n: 'ii.', title: 'Casting', body: 'Metal poured and refined' },
  { n: 'iii.', title: 'Setting', body: 'Every stone placed by hand' },
  { n: 'iv.', title: 'Finishing', body: 'Polished and inspected' },
];

/** Onyx band: how a piece is made, with routes to an appointment and the brand story. */
export default function PdpAtelier() {
  return (
    <section aria-labelledby="pdp-atelier-title" className="bg-noir text-noir-on">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-[clamp(28px,5vw,80px)] px-[clamp(16px,3.2vw,56px)] py-[clamp(56px,7vw,96px)] md:grid-cols-1">
        <div className="relative aspect-[4/5] overflow-hidden bg-noir">
          <Image
            src="/images/Model/marcin-sajur-Q44fOUMn-p0-unsplash.jpg"
            alt="Portrait in low light wearing sculptural gold jewelry"
            fill
            sizes="(max-width: 769px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gilt-soft">The atelier</span>
          <h2
            id="pdp-atelier-title"
            className="m-0 mb-5 mt-3.5 text-balance font-cormorant text-[clamp(32px,3.6vw,48px)] font-normal leading-[1.04] text-noir-on"
          >
            Fourteen pairs of hands, <em className="italic text-gilt-soft">one piece</em>
          </h2>
          <p className="m-0 max-w-[52ch] text-[15px] leading-[1.7] text-noir-on/75">
            A Pendyora piece passes through fourteen pairs of hands before it leaves the atelier. Want to see it before you decide? Book time with one
            of our jewelers over video.
          </p>
          <ol className="my-8 grid list-none grid-cols-4 border-t border-noir-on/15 p-0 sm:grid-cols-2 sm:gap-y-3">
            {STAGES.map((s) => (
              <li key={s.title} className="grid gap-1 pr-3 pt-4">
                <i className="font-cormorant text-[16px] text-gilt-soft">{s.n}</i>
                <b className="font-cormorant text-[20px] font-normal text-noir-on">{s.title}</b>
                <span className="text-[12px] text-noir-on/60">{s.body}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/virtual-appointment"
              className="inline-flex h-14 items-center gap-3 border border-noir-on bg-noir-on px-6 text-[11px] font-medium uppercase tracking-[0.2em] text-noir transition-colors duration-300 hover:bg-transparent hover:text-noir-on"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-none stroke-current stroke-[1.2]">
                <path d="M3 6.5h13v11H3zM16 10.5l5-3v9l-5-3z" />
              </svg>
              Book an appointment
            </Link>
            <Link
              href="/about-us"
              className="inline-flex h-14 items-center border border-noir-on px-6 text-[11px] font-medium uppercase tracking-[0.2em] text-noir-on transition-colors duration-300 hover:bg-noir-on hover:text-noir"
            >
              Our story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
