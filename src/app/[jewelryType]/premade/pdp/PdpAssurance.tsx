import React from 'react';

// The promises the site already makes (formerly the "Why us" band). Edit here to change them everywhere on the PDP.
const ASSURANCES = [
  { label: 'Finest diamonds & gemstones', icon: 'M6.5 4h11l3.5 5-9 11L3 9zM3 9h18M9.5 4L8 9l4 11 4-11-1.5-5' },
  { label: '90-day warranty', icon: 'M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6zM8.8 12l2.3 2.3 4.2-4.6' },
  { label: 'Expert support from our jewelers', icon: 'M12 8.5a3.8 3.8 0 100-7.6 3.8 3.8 0 000 7.6zM4.5 20.5c1.2-3.8 4-5.6 7.5-5.6s6.3 1.8 7.5 5.6' },
  { label: 'Shop now, pay later', icon: 'M3 6.5h18v11H3zM3 10h18M7 14.5h4' },
];

/** Two-by-two trust list in the buying column. */
export default function PdpAssurance() {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-x-5 gap-y-4 p-0 sm:grid-cols-1">
      {ASSURANCES.map((a) => (
        <li key={a.label} className="flex items-center gap-3 text-[13px] leading-snug text-ink-soft">
          <svg viewBox="0 0 24 24" aria-hidden className="h-[22px] w-[22px] flex-none fill-none stroke-ink stroke-[1.2]">
            <path d={a.icon} />
          </svg>
          {a.label}
        </li>
      ))}
    </ul>
  );
}
