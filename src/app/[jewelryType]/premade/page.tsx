import React from 'react';

import { Metadata, ResolvingMetadata } from 'next';

import { decrypt } from '@/utils/enc-decy';

import Page from '.';

type Props = {
  // params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined | any }>;
};

export async function generateMetadata({ searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  // read route params
  const { slug } = await searchParams;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jewelry/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      next: { revalidate: 10 }, // Cache for 10 ms
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: any = await response.json();
    if (data.status === 200) {
      const resData = decrypt(data.data);
      const product = resData.product_details;

      const title = product?.meta_title ?? 'Ashclair - Gems & Jewelry';
      const jewelryType = product?.subType?.jewelry_type?.name?.toLowerCase().replace(/\s+/g, '-');
      const jewelryDetails = product?.jewelry_sku?.find((item: any) => (item.sku_slug as string) == slug);
      const description =
        product?.meta_description ??
        'Ashclair offers handcrafted fine jewelry and premium gemstones—custom-designed with expert craftsmanship, direct from a family-run diamond house.';
      const imageUrl = jewelryDetails?.carat_images?.[1] || jewelryDetails?.carat_images?.[0];
      const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${jewelryType}/premade?slug=${slug}`;
      // return resData;
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: pageUrl,
          siteName: 'Ashclair',
          images: [
            {
              url: imageUrl,
              // width: 1200,
              // height: 630,
              alt: title,
            },
          ],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [imageUrl],
        },
      };
    }
    return {
      title: 'Ashclair - Gems & Jewelry',
      description:
        'Ashclair offers handcrafted fine jewelry and premium gemstones—custom-designed with expert craftsmanship, direct from a family-run diamond house.',
    };
  } catch (error) {
    console.error('Error fetching Meta data:', error);
    return {
      title: 'Ashclair - Gems & Jewelry',
      description:
        'Ashclair offers handcrafted fine jewelry and premium gemstones—custom-designed with expert craftsmanship, direct from a family-run diamond house.',
    };
  }
}
export default function PRODUCTPAGESPECIFICPRODUCTPage({ searchParams }: Props) {
  // console.log('sap', searchParams);
  return <Page />;
}
