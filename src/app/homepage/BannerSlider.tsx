'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Image } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import ProtectedVideo from '@/components/ProtectedVideo';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

export default function BannerSwiper({ bannerData }: any) {
  const route = useRouter();
  const [showNavigation, setShowNavigation] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const desktopSwiperRef = useRef<any>(null);
  const mobileSwiperRef = useRef<any>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [showFonts, setShowFonts] = useState(false);

  // Track active slide to restart zoom animation
  const [realIndex, setRealIndex] = useState(0);
  const animTickRef = useRef(0);
  const [animTick, setAnimTick] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setShowNavigation(true);
    }, 300);

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // ResizeObserver for container
    if (containerRef.current) {
      const el = containerRef.current;
      const rect = el.getBoundingClientRect();
      setContainerWidth(rect.width);
      setContainerHeight(rect.height);

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setContainerWidth(width);
          setContainerHeight(height);
        }
      });
      observer.observe(el);

      return () => {
        observer.disconnect();
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !bannerData) {
      return;
    }

    const fonts: string[] = [];

    bannerData?.banner_image?.forEach((banner: any) => {
      const desktopElements = banner.desktop_elements || [];
      const mobileElements = banner.mobile_elements || [];
      [...desktopElements, ...mobileElements].forEach((el: any) => {
        const fontFamily = el?.style?.fontFamily;
        if (fontFamily && !fonts.includes(fontFamily)) {
          fonts.push(fontFamily);
        }
      });
    });

    if (fonts.length > 0) {
      import('webfontloader').then((WebFont) => {
        WebFont.load({
          google: {
            families: fonts,
          },
          active: () => {
            setShowFonts(true);
          },
          inactive: () => {
            setShowFonts(true);
          },
        });
      });
    }
  }, [bannerData]);

  const preventRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Apply responsive scaling for element styles
  const getScaledStyle = (el: any) => {
    const scaledFontSize = el.fontSizePercent ? (el.fontSizePercent / 100) * containerWidth : parseFloat(el?.style?.fontSize || '16'); // fallback to px if missing
    const { style, size, alignment, position } = el;

    return {
      ...el.style,
      fontSize: `${scaledFontSize}px`,
      width: size?.widthPercent ? `${(size.widthPercent / 100) * containerWidth}px` : 'auto',
      height: size?.heightPercent ? `${(size.heightPercent / 100) * containerHeight}px` : 'auto',
      position: 'absolute',
      top: `${position.yPercent}%`,
      left: `${position.xPercent}%`,
      padding: 0,
      display: alignment.display,
      alignItems: alignment.alignItems,
      justifyContent: alignment.justifyContent,
    };
  };
  const getButtonStyle = (el: any) => {
    const { style, variant, alignment } = el;

    const base: React.CSSProperties = {
      fontSize: `${(el.fontSizePercent / 100) * containerWidth}px`,
      fontFamily: style.fontFamily,
      color: style.color,
      borderRadius: style.borderRadius,
      padding: style.padding,
      fontWeight: style.fontWeight,
      border: style.borderWidth ? `${style.borderWidth} solid ${style.borderColor || '#000'}` : undefined,
      backgroundColor: style.backgroundColor,
      display: alignment.display,
      alignItems: alignment.alignItems,
      justifyContent: alignment.justifyContent,
    };

    if (variant === 'outline') {
      return {
        ...base,
        backgroundColor: 'transparent',
        border: `${style.borderWidth || '1px'} solid ${style.borderColor || style.color}`,
        color: style.color,
      };
    }

    if (variant === 'text') {
      return {
        ...base,
        backgroundColor: 'transparent',
        border: 'none',
        color: style.color,
        padding: '0',
      };
    }

    // default = filled
    return base;
  };

  const handleSlideChange = (swiper: any) => {
    animTickRef.current += 1;
    setAnimTick(animTickRef.current);
    setRealIndex(swiper.realIndex);
    setIsVideoPlaying(true);
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <div ref={containerRef} onContextMenu={preventRightClick} style={{ WebkitTouchCallout: 'none', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        @keyframes bannerZoomIn {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
      `}</style>

      {/* Desktop Banner */}
      <div className="sm:hidden h-full">
        <Swiper
          ref={desktopSwiperRef}
          navigation={
            showNavigation
              ? {
                  prevEl: '.swiper-button-prev-custom',
                  nextEl: '.swiper-button-next-custom',
                }
              : false
          }
          pagination={{
            clickable: true,
          }}
          modules={[Navigation, Autoplay, Pagination]}
          className="homepage-banner-swiper !h-full"
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          speed={1000}
          onSlideChange={handleSlideChange}
          onAfterInit={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
        >
          {bannerData?.banner_image?.map((banner: any, index: number) => (
            <SwiperSlide key={index} className="!h-full !w-full !relative overflow-hidden">
              {!banner?.is_desktop_image ? (
                banner?.desktop_image?.toLowerCase().includes('.mp4') && (
                  <ProtectedVideo src={banner?.desktop_image} autoPlay={isVideoPlaying} link={banner?.http_link || null} className="max-h-[700px]" />
                )
              ) : (
                <div className="!w-full !h-full overflow-hidden">
                  {/* key changes when this slide becomes active, restarting the zoom */}
                  <div
                    key={index === realIndex ? `zoom-desktop-${animTick}` : `static-desktop-${index}`}
                    className="w-full h-full"
                    style={{ animation: 'bannerZoomIn 6s ease-out forwards', transformOrigin: 'center center' }}
                  >
                    <Image
                      src={banner?.desktop_image}
                      preview={false}
                      draggable={false}
                      loading="lazy"
                      wrapperStyle={{ width: '100%', height: '100%', display: 'block' }}
                      className="!w-full !h-full pointer-events-none"
                      style={{ WebkitTouchCallout: 'none', objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                  {banner?.http_link && <Link href={banner.http_link} className="absolute inset-0 w-full h-full" />}
                </div>
              )}

              {/* Render desktop elements */}
              {showFonts &&
                banner?.desktop_elements?.map((el: any, i: number) => (
                  <div key={i} style={getScaledStyle(el)}>
                    {el?.type !== 'button' ? (
                      <span style={{ userSelect: 'text', cursor: 'text' }} className="swiper-no-swiping">
                        {el?.content}
                      </span>
                    ) : (
                      <button className="w-full h-full" style={getButtonStyle(el)} onClick={() => route.push(el?.link)}>
                        {el?.content}
                      </button>
                    )}
                  </div>
                ))}
            </SwiperSlide>
          ))}
          {showNavigation && (
            <>
              <button
                className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                onClick={() => desktopSwiperRef.current?.swiper.slidePrev()}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                onClick={() => desktopSwiperRef.current?.swiper.slideNext()}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </Swiper>
      </div>

      {/* Mobile Banner */}
      <div className="hidden sm:block h-full">
        <Swiper
          ref={mobileSwiperRef}
          navigation={
            showNavigation
              ? {
                  prevEl: '.swiper-button-prev-mobile',
                  nextEl: '.swiper-button-next-mobile',
                }
              : false
          }
          modules={[Navigation, Autoplay, Pagination]}
          className="homepage-banner-swiper !h-full"
          loop={true}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          speed={1000}
          onSlideChange={handleSlideChange}
          onAfterInit={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
        >
          {bannerData?.banner_image?.map((banner: any, index: number) => (
            <SwiperSlide key={index} className="!h-full !w-full !relative overflow-hidden">
              {!banner?.is_mobile_image ? (
                banner?.mobile_image?.toLowerCase().includes('.mp4') && (
                  <ProtectedVideo src={banner?.mobile_image} autoPlay={isVideoPlaying} link={banner?.http_link || null} className="max-h-[700px]" />
                )
              ) : (
                <div className="!w-full h-full overflow-hidden">
                  {/* key changes when this slide becomes active, restarting the zoom */}
                  <div
                    key={index === realIndex ? `zoom-mobile-${animTick}` : `static-mobile-${index}`}
                    className="w-full h-full"
                    style={{ animation: 'bannerZoomIn 6s ease-out forwards', transformOrigin: 'center center' }}
                  >
                    <Image
                      src={banner?.mobile_image}
                      preview={false}
                      draggable={false}
                      loading="lazy"
                      fallback="/images/ashclair_pdp_logo_image.svg"
                      wrapperStyle={{ width: '100%', height: '100%', display: 'block' }}
                      className="!w-full !h-full pointer-events-none"
                      style={{ WebkitTouchCallout: 'none', objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                  {banner?.http_link && <Link href={banner.http_link} className="absolute inset-0 w-full h-full" />}
                </div>
              )}

              {/* Render mobile elements */}
              {showFonts &&
                banner?.mobile_elements?.map((el: any, i: number) => (
                  <div key={i} style={getScaledStyle(el)}>
                    {el?.type !== 'button' ? (
                      <span className="text-center swiper-no-swiping" style={{ userSelect: 'text', cursor: 'text' }}>
                        {el?.content}
                      </span>
                    ) : (
                      <button className="w-full h-full" style={getButtonStyle(el)} onClick={() => route.push(el?.link)}>
                        {el?.content}
                      </button>
                    )}
                  </div>
                ))}
            </SwiperSlide>
          ))}
          {showNavigation && (
            <>
              <button
                className="swiper-button-prev-mobile absolute left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                onClick={() => mobileSwiperRef.current?.swiper.slidePrev()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                className="swiper-button-next-mobile absolute right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                onClick={() => mobileSwiperRef.current?.swiper.slideNext()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </Swiper>
      </div>
    </div>
  );
}
