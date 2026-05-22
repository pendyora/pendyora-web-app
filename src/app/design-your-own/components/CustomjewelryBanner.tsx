import React from 'react';

import { Image } from 'antd';
import Link from 'next/link';

import { Button } from '../../../components';

const CustomJewelryBanner = ({ data }: any) => {
  return (
    <div>
      <div className="flex items-start w-full gap-0  sm:flex-col">
        <div className="relative w-1/2 sm:w-full md:!h-[450px] sm:h-[350px] content-center max-h-[560px]">
          <div className="flex !w-full !h-[560px] md:!h-[450px] sm:h-[350px] object-cover">
            <Image
              src={`${data?.banner_image?.[0]?.image ? data?.banner_image?.[0]?.image : '/images/img_mask_group_33.png'} `}
              alt="Mask Group 33"
              preview={false}
              width={'100%'}
              fallback="/images/img_mask_group_33.png"
              className="!w-full  !h-full sm:!h-[350px] object-cover"
            />
          </div>
          <Link href={'/custom-jewelry?type=2&state=s'}>
            <Button
              color="white_A700_01"
              shape="square"
              className="absolute bottom-[7%] sm:bottom-[15%] p-0 left-0 right-0 m-auto min-w-[448px] sm:min-w-[90%] md:min-w-[382px] w-1/2 2xl:w-3/6 tracking-[2.00px]"
            >
              START WITH A SETTING
            </Button>
          </Link>
          <Link href={'/custom-jewelry?type=1&state=d'}>
            <Button
              color="white_A700_01"
              shape="square"
              className="absolute p-0 hidden sm:block bottom-[2%] left-0 right-0 m-auto min-w-[448px] sm:min-w-[90%] md:min-w-[382px] w-1/2 2xl:w-3/6 tracking-[2.00px]"
            >
              START WITH A DIAMOND
            </Button>
          </Link>
        </div>
        <div className="relative w-1/2 sm:hidden md:!h-[450px]  content-center max-h-[560px] overflow-hidden">
          <div className="flex w-full md:!h-[450px] !h-[560px]">
            <Image
              src={`${data?.banner_image?.[1]?.image ? data?.banner_image?.[1]?.image : '/images/img_mask_group_39.png'}`}
              fallback="/images/img_mask_group_39.png"
              alt="Mask Group 33"
              preview={false}
              width={'100%'}
              className="object-cover w-full !h-full"
            />
          </div>
          <Link href={'/custom-jewelry?type=1&state=d'}>
            <Button
              color="white_A700_01"
              shape="square"
              className="absolute p-0 bottom-[7%] left-0 right-0 m-auto min-w-[448px] sm:min-w-[90%] md:min-w-[382px] w-1/2 2xl:w-3/6 tracking-[2.00px]"
            >
              START WITH A DIAMOND
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomJewelryBanner;
