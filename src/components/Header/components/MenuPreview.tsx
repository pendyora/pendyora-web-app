'use client';
import React from 'react';

import { Image } from 'antd';
import { useRouter } from 'next/navigation';

import { Text } from '@/components/Text';
import { useAppSelector } from '@/store';

const menuColumnList = ['menu_column_one', 'menu_column_two', 'menu_column_three', 'menu_column_four'];
const MenuPreview = ({ Details, setActiveMenu }: any) => {
  const { data } = useAppSelector((state) => state.master);
  const router = useRouter();
  const reloadPage = () => {
    // window.location.reload();
    setActiveMenu(null);
  };
  // console.log(Details);

  return (
    <div className="flex flex-row cursor-default bg-white w-full z-[9999px] px-12 lg:px-0 shadow-md border items-start pt-[5px] pb-[5px]">
      <div className="w-full flex flex-row justify-between  p-5 gap-5 ">
        <div className="grid grid-cols-4 w-[calc(100%-270px)]">
          {menuColumnList?.map((item: any, index: number) => {
            if (Details[item]?.length > 0) {
              return (
                <div
                  key={index}
                  className={`flex gap-4 ${Details[item].length > 1 && index === 0 ? '' : 'border-l first-of-type:border-0'} px-4 lg:px-3 md:px-2 flex-col`}
                >
                  {Details?.[item]?.map((item: any, i: number) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div
                        className={`${item?.link ? 'cursor-pointer hover:text-[#256030] hover:underline' : ''} uppercase font-semibold text-[13px] lg:text-[11px] md:text-[10px]`}
                        onClick={() => {
                          if (item?.link) {
                            router.push(item.link);
                            reloadPage();
                          }
                        }}
                      >
                        {item?.title}
                      </div>
                      {(item?.sub_menu?.length || item?.master?.length > 0) && (
                        <div className="w-full">
                          {item?.master?.length > 0 && (
                            <div className="flex py-2 w-full flex-wrap gap-2">
                              {item.is_master === true &&
                                item?.master?.map((masterItem: any, masterIndex: number) => {
                                  const findData = data?.find((el: any) => el.id === masterItem?.id);
                                  return (
                                    <div
                                      key={masterIndex}
                                      onClick={() => {
                                        router.push(masterItem.value);
                                        reloadPage();
                                      }}
                                      className="flex hover:text-[#256030] items-center cursor-pointer min-w-[48%] h-[30px] lg:w-full flex-row gap-2 md:w-full"
                                    >
                                      {masterItem && (
                                        <Image
                                          src={findData?.image?.[0] ?? '/images/no_images.svg'}
                                          alt={findData?.name}
                                          fallback="/images/no_images.svg"
                                          className="!w-7 !h-7 p-[0px] object-contain"
                                          preview={false}
                                          // width={25}
                                          // height={25}
                                        />
                                      )}
                                      <div className={`cursor-pointer capitalize font-normal  text-[13px] lg:text-[11px] md:text-[10px]`}>
                                        {findData?.name}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                          {item.is_master === false && item?.sub_menu?.length > 0 && item?.is_multiple_column ? (
                            <div className="flex w-full flex-wrap py-2 gap-2">
                              {item.is_master === false &&
                                item?.sub_menu?.map((subItem: any, subIndex: number) => (
                                  <div
                                    key={subIndex}
                                    onClick={() => {
                                      router.push(subItem?.link);
                                      reloadPage();
                                    }}
                                    className="flex gap-2 hover:text-[#256030] cursor-pointer min-w-[48%] lg:w-full flex-row  h-[30px] items-center md:w-full"
                                  >
                                    {subItem.image && (
                                      <Image
                                        preview={false}
                                        src={subItem.image ?? '/images/no_images.svg'}
                                        fallback="/images/no_images.svg"
                                        className="object-contain !w-7 !h-7 p-[0px]"
                                        alt={subItem.title}
                                        // width={25}
                                        // height={25}
                                      />
                                    )}
                                    <div className={`cursor-pointer capitalize font-normal text-[13px] lg:text-[11px] md:text-[10px]`}>
                                      {subItem?.title}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="flex flex-col py-1 gap-1">
                              {item.is_master === false &&
                                item?.sub_menu?.map((subItem: any, subIndex: number) => (
                                  <div
                                    key={subIndex}
                                    onClick={() => {
                                      router.push(subItem?.link);
                                      reloadPage();
                                    }}
                                    className="flex gap-2 cursor-pointer hover:text-[#256030] h-[30px] items-center md:w-full flex-row"
                                  >
                                    {subItem.image && (
                                      <Image
                                        preview={false}
                                        src={subItem.image ?? '/images/no_images.svg'}
                                        fallback="/images/no_images.svg"
                                        className="object-contain !w-7 !h-7 p-[0px]"
                                        alt={subItem.title}
                                        // width={25}
                                        // height={25}
                                      />
                                    )}
                                    <div className={`cursor-pointer capitalize font-normal text-[13px] lg:text-[11px] md:text-[10px]`}>
                                      {subItem?.title}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            }
          })}
        </div>
        {Details?.menu_images?.length > 0 && (Details?.menu_images[0]?.link || Details?.menu_images[0]?.link) && (
          <div className="flex gap-3 border-l w-[270px] px-4 lg:px-3 md:px-2  lg:hidden flex-col ">
            {Details?.menu_images?.map((item: any, index: number) => (
              <div
                key={index}
                className="flex flex-col gap-2 cursor-pointer relative h-[180px] min-w-fit"
                onClick={() => {
                  router.push(item.link);
                  reloadPage();
                }}
              >
                <Image
                  src={`${item?.image ?? '/images/no_images.svg'}`}
                  fallback="/images/no_images.svg"
                  preview={false}
                  width={250}
                  height={180}
                  className="!h-[180px] object-cover"
                />
                <Text
                  size="textlg"
                  as="p"
                  className="absolute bottom-0  md:text-[11px] px-2 w-full !font-normal uppercase  bg-black/20 !text-[#ffffff]"
                >
                  {item?.title}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPreview;
