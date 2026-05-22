import React from 'react';

import { Image } from 'antd';
import Link from 'next/link';

import { Text } from './..';

interface Props {
  className?: string;
  userImage?: string;
  headlineText?: React.ReactNode;
  path?: string;
}

export default function UserProfile2({
  userImage = '/img_ashclair_polinach_11007534.png',
  headlineText = 'Less than 500$',
  path = '/',
  ...props
}: Props) {
  return (
    <Link href={path} {...props} className={`h-[60vh] w-full md:w-full relative 2xl:w-full ${props.className ?? ''}`}>
      <div className="mx-auto h-full w-full flex-1">
        <Image src={`/images${userImage}`} height={"100%"} width={"100%"} preview={false} alt="Ashclair Image" className="!object-cover h-auto" />
      </div>
      <div className="absolute w-full bottom-0">
        <Text
          size="text2xl"
          as="p"
          className=" bg-transparent p-5 sm:p-2 whitespace-nowrap  m-auto !font-cormorant uppercase !text-[#ffffff] sm:bottom-4 sm:left-2 sm:text-[13px] sm:text-center"
        >
          {headlineText}
        </Text>
      </div>
    </Link>
  );
}
