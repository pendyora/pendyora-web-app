import React from 'react';

import HeroSection from '@/components/home/HeroSection';
import InspiredByCommunity from '@/page/InspiredByCommunity';
import { decrypt } from '@/utils/enc-decy';

import CustomizedForYou from './CustomizedForYou';
import ShopByCategory from './ShopByCategory';
import { FeaturedIn } from '../../page';
import WhyAllorya from './../../components/WhyAllorya';
import AlloryaStory from './AlloryaStory';
import Craftsmanship from './Craftsmanship';
import Drops from './Drops';
import HomepageBanner from './HomepageBanner';
import Motion from './Motion';
import OurBestSellers from './OurBestSellers';
import OurCollabrations from './OurCollabrations';
import RingBuilder from './RingBuilder';
import ShopByLook from './ShopByLook';
import ShopGemStone from './ShopGemStone';
import Testimonials from './Testimonials';
import GiftguideFrame67 from '../giftguide/GiftguideFrame67';

async function getBannerData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner/1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      // cache: 'no-store',
      next: { revalidate: 10 }, // Cache for 10 ms
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: any = await response.json();
    if (data.status === 200) {
      const banner = decrypt(data.data);
      return banner;
    }
    return null;
  } catch (error) {
    console.error('Error fetching banner data:', error);
    return null;
  }
}
async function getCategoryBannerData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner/2`, {
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
      const banner = decrypt(data.data);

      return banner.banner_image;
    }
    return null;
  } catch (error) {
    console.error('Error fetching banner data:', error);
    return null;
  }
}

export default async function HOMEPAGEPage() {
  const initialBannerData = await getBannerData();
  const initialCategoryBannerData = await getCategoryBannerData();
  // const masterData = await getMasterData();
  return (
    <div className="w-full bg-[#ffffff] sm:relative">
      <div>
        <HeroSection />
        {/* <HomepageBanner bannerData={initialBannerData} />
        <Motion />
        <ShopByCategory bannerData={initialCategoryBannerData} />
        <OurBestSellers />
        <Craftsmanship />
        <ShopByLook />
        <OurCollabrations />
        <RingBuilder />
        <Drops />
        <Testimonials /> */}

        {/* ------ */}
        {/* <div className="mt-16 sm:mt-10" /> */}
        {/* <CustomizedForYou /> */}
        {/* <ShopGemStone /> */}

        {/* <AlloryaStory /> */}

        {/* <GiftguideFrame67 /> */}
        {/* <WhyAllorya /> */}
        {/* <FeaturedIn /> */}
        {/* <InspiredByCommunity /> */}
      </div>
    </div>
  );
}
