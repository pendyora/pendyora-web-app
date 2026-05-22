'use client';
import React, { useEffect, useState } from 'react';

import { Image } from 'antd';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Text } from './../../components';

// import { Text } from '@/components';

const imageData = [
  { img: '/images/90-days-guarantee.png', title: '90-days-guarantee' },
  { img: '/images/american-express.png', title: 'american-express' },
  { img: '/images/authorize-net-no-bg.png', title: 'authorize-net-no-bg' },
  { img: '/images/trustspot.png', title: 'trustspot' },
  { img: '/images/bill-me-later.png', title: 'bill-me-later' },
  { img: '/images/30-day-return-policy.png', title: '30-day-return-policy' },
];

export default function BuyWithConfidence() {
  const [showNavigation, setShowNavigation] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  useEffect(() => {
    setTimeout(() => {
      setShowNavigation(true);
    }, 300);
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <div className="flex flex-col items-center justify-center pt-[30px] pb-[30px] lg:py-8 md:py-5 sm:py-4 sm:pb-2 border-b">
      <div className="container-xs flex flex-col items-center gap-[30px] xl:px-28 lg:px-20 md:px-5 sm:px-3 sm:gap-3 2xl:px-[160px]">
        <Text size="text5xl" as="p" className="uppercase tracking-[2.20px] md:text-[26px] sm:w-full sm:text-center lg:text-[22px]">
          Buy with Confidence
        </Text>
        <div className="flex sm:flex-col gap-8 self-stretch justify-center lg:gap-3 xl:gap-3 2xl:gap-4 sm:gap-2 ">
          <Swiper
            loop={true}
            navigation={showNavigation}
            spaceBetween={30}
            slidesPerView={windowWidth <= 425 ? 1 : windowWidth <= 768 && windowWidth > 425 ? 4 : windowWidth <= 1024 && windowWidth > 768 ? 6 : 6}
            modules={[Navigation, Autoplay]}
            className="mySwiper2 sm:max-w-[95vw] sm:!hidden"
          >
            {imageData?.map((banner: any, index: number) => (
              <SwiperSlide key={index} className="">
                <div
                  key={index}
                  className="h-[85px] w-full !flex !justify-center !items-center grayscale opacity-50 hover:opacity-100 transition-all ease-in-out duration-[800ms] hover:grayscale-0"
                >
                  <Image src={banner?.img} preview={false} className="flex w-full p-2 !h-[85px] object-contain" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="!hidden sm:!grid grid-cols-3 gap-2 mt-2">
            {imageData?.map((banner: any, index: number) => (
              <div key={index} className="!h-[65px] w-full !flex !justify-center !items-center  transition-all ease-in-out duration-[800ms]">
                <Image src={banner?.img} preview={false} className="flex w-full p-2 !h-[65px] object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
