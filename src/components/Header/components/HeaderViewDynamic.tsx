'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import MenuPreview from './MenuPreview';

const OPEN_DELAY = 100;
const CLOSE_DELAY = 200;

const HeaderViewDynamic = ({ headerData, onMenuOpenChange }: any) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const path = usePathname();

  const cancelOpen = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  };

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancelOpen();
      cancelClose();
    };
  }, []);

  const scheduleOpen = (id: string) => {
    cancelClose();
    cancelOpen();
    openTimeoutRef.current = setTimeout(() => {
      setActiveMenu(id);
      onMenuOpenChange?.(true);
    }, OPEN_DELAY);
  };

  const scheduleClose = () => {
    cancelOpen();
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
      onMenuOpenChange?.(false);
    }, CLOSE_DELAY);
  };

  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-1 p-0 xls:gap-x-5">
      {headerData?.length > 0 &&
        headerData?.map((item: any, index: number) => {
          const link: string | undefined = item?.main_menu_title_link;
          const isCurrent = !!link && link !== '/' && path.startsWith(link.split('?')[0]);
          const highlighted = isCurrent || activeMenu === item.id;
          const labelClass = `relative inline-block py-1 text-[11.5px] uppercase leading-normal tracking-[0.14em] transition-colors ${
            highlighted
              ? "text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-ink after:content-['']"
              : 'text-ink-soft hover:text-ink'
          }`;
          if (item?.is_web_visible == true) {
            return (
              <li key={index}>
                <div onMouseEnter={() => scheduleOpen(item.id)} onMouseLeave={scheduleClose}>
                  {link ? (
                    <Link href={link} className={labelClass} aria-current={isCurrent ? 'page' : undefined}>
                      {item.main_menu_title}
                    </Link>
                  ) : (
                    <span className={labelClass}>{item.main_menu_title}</span>
                  )}
                  {activeMenu == item.id && (
                    <div
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                      className="absolute left-0 top-full z-50 w-full bg-paper shadow-lg shadow-ink/5"
                    >
                      <MenuPreview Details={item} setActiveMenu={setActiveMenu} />
                    </div>
                  )}
                </div>
              </li>
            );
          }
        })}
    </ul>
  );
};

export default HeaderViewDynamic;
