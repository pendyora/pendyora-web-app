/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { Navigation, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
const PromotionalStrip = ({ data }: any) => {
  // console.log(data);

  // const [data, setData] = useState<any>([]);
  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: any }>({});
  const routes = useRouter();
  // Fetch API only once
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (data) {
          const promoData = data?.data;
          updateRemainingTime(promoData);
        }
      } catch (error) {
        console.error('Error fetching promotional strip data', error);
      }
    };

    fetchData();
  }, []);

  const formatTime = (num: number) => String(num).padStart(2, '0');
  // Function to calculate remaining time
  const updateRemainingTime = (promoData: any[]) => {
    const updatedTimes = promoData.reduce((acc: any, item: any) => {
      if (item?.endDate) {
        const endDate = new Date(item.endDate).getTime();
        const now = Date.now();
        const timeDiff = endDate - now;

        acc[item.id] =
          timeDiff > 0
            ? {
                days: formatTime(Math.floor(timeDiff / (1000 * 60 * 60 * 24))),
                hours: formatTime(Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
                min: formatTime(Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))),
                sec: formatTime(Math.floor((timeDiff % (1000 * 60)) / 1000)),
              }
            : { days: 0, hours: 0, min: 0, sec: 0 };
      }
      return acc;
    }, {});

    setRemainingTimes(updatedTimes);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTimes((prevTimes) => {
        const newTimes = { ...prevTimes };

        Object.keys(newTimes).forEach((id) => {
          const days = Number(newTimes[id].days);
          const hours = Number(newTimes[id].hours);
          const min = Number(newTimes[id].min);
          const sec = Number(newTimes[id].sec);

          if (days === 0 && hours === 0 && min === 0 && sec === 0) {
            // Remove expired item
            delete newTimes[id];
            // setData((prevData: any) => prevData.filter((item: any) => item.id !== id));
          } else if (sec > 0) {
            newTimes[id].sec = formatTime(sec - 1);
          } else if (min > 0) {
            newTimes[id].min = formatTime(min - 1);
            newTimes[id].sec = '59';
          } else if (hours > 0) {
            newTimes[id].hours = formatTime(hours - 1);
            newTimes[id].min = '59';
            newTimes[id].sec = '59';
          } else if (days > 0) {
            newTimes[id].days = formatTime(days - 1);
            newTimes[id].hours = '23';
            newTimes[id].min = '59';
            newTimes[id].sec = '59';
          }
        });

        return newTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {data?.isActive && data?.data?.length > 0 && (
        <div className="bg-white">
          <Swiper modules={[Navigation, Autoplay]} className="mySwiper !h-full" loop autoplay={{ delay: 10000, disableOnInteraction: false }}>
            {data.data.map((item: any) =>
              item?.endDate &&
              remainingTimes?.[item?.id] &&
              remainingTimes?.[item?.id]?.days &&
              remainingTimes?.[item?.id]?.hours &&
              remainingTimes?.[item?.id]?.min ? (
                <SwiperSlide key={item.id} className="p-0 cursor-pointer bg-primary !h-auto shadow-md">
                  <div
                    className="uppercase p-[9px] md:p-[13px] sm:p-[6px] text-wrap text-center h-full  tracking-[1px] text-[12px] sm:text-[8px] text-white bg-primary flex-wrap whitespace-pre-wrap  sm:whitespace-normal  flex items-center justify-center gap-0.5"
                    onClick={() => routes.push(item?.link)}
                  >
                    {item?.prefixText && <p className="whitespace-nowrap text-[12px] sm:text-[11px]">{item.prefixText}</p>}
                    {item?.endDate && remainingTimes?.[item?.id] && remainingTimes?.[item.id]?.days && (
                      <div className="flex items-center gap-1">
                        <p className="bg-white py-[1px] px-1 text-[11px] sm:text-[8px] text-center rounded-md text-black">
                          {remainingTimes[item.id]?.days}D
                        </p>
                        <p className="bg-white py-[1px] px-1 text-[11px] sm:text-[8px] rounded-md text-center text-black">
                          {remainingTimes?.[item?.id]?.hours}H
                        </p>
                        :
                        <p className="bg-white py-[1px] px-1 text-[11px] sm:text-[8px] rounded-md text-center text-black">
                          {remainingTimes?.[item?.id]?.min}M
                        </p>
                        :
                        <p className="bg-white py-[1px] px-1 text-[11px] sm:text-[8px] rounded-md text-center text-black">
                          {remainingTimes?.[item?.id]?.sec}S
                        </p>
                      </div>
                    )}
                    {item?.title && <p className="text-wrap text-[12px] sm:text-[11px]"> {item.title}</p>}
                  </div>
                </SwiperSlide>
              ) : (
                !item?.enableEndDate && (
                  <SwiperSlide key={item.id} className="p-0 cursor-pointer bg-primary !h-auto shadow-md">
                    <div
                      className="uppercase p-[9px] md:p-[13px] sm:p-[6px] text-wrap text-center h-full  tracking-[1px] text-[12px] sm:text-[8px] text-white bg-primary flex-wrap whitespace-pre-wrap  sm:whitespace-normal  flex items-center justify-center gap-0.5"
                      onClick={() => routes.push(item?.link)}
                    >
                      {item?.title && <p className="text-wrap text-[12px] sm:text-[11px]"> {item.title}</p>}
                    </div>
                  </SwiperSlide>
                )
              ),
            )}
          </Swiper>
        </div>
      )}
    </>
  );
};

export default PromotionalStrip;
