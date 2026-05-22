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

  const generatePath = (title: string) => {
    return `${title.trim().replace(/\s+/g, '-').toLowerCase()}`;
  };
  return (
    <ul className="flex justify-center lg:justify-around gap-6 lg:gap-4 w-full text-[13px] ">
      {headerData?.length > 0 &&
        headerData?.map((item: any, index: number) => {
          const formattedPath = `${generatePath(item.main_menu_title)}`;
          let isActive = false;
          if (typeof window !== 'undefined') {
            isActive = path.includes(formattedPath)
              ? path.includes(formattedPath)
              : path.includes(window.location.pathname)
                ? path.includes(window.location.pathname)
                : false;
          }
          if (item?.is_web_visible == true) {
            return (
              <li key={index} className=" lg:mx-2  md:mx-0 ">
                <div onMouseEnter={() => scheduleOpen(item.id)} onMouseLeave={scheduleClose}>
                  <p className={`tracking-[0.22em] uppercase  text-[12px]  leading-normal pb-0 font-primary `}>
                    {item?.main_menu_title_link ? (
                      <Link href={item?.main_menu_title_link}>
                        <span className={`${activeMenu === item.id ? '!font-normal border-b border-black' : ''}`}>{item.main_menu_title}</span>
                      </Link>
                    ) : (
                      <span className={`${activeMenu === item.id ? '!font-normal border-b border-black' : ''}`}>{item.main_menu_title}</span>
                    )}
                  </p>
                  {activeMenu == item.id && (
                    <div
                      onMouseEnter={cancelClose}
                      onMouseLeave={scheduleClose}
                      className={`absolute top-full left-0 w-full bg-white shadow-lg z-50 transition-opacity duration-300 ease-in-out transform${
                        activeMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      }`}
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
