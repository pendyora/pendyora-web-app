import React, { useState, useEffect } from 'react';

import { LoadingOutlined } from '@ant-design/icons';
import { Image, Select } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAppSelector } from '@/store';
import { formatCurrency } from '@/utils/common';

import { Text } from '../Text';
import HeaderViewDynamic from './components/HeaderViewDynamic';

const HeaderTopPart = ({
  isFocused,
  handleFocus,
  handleSearch,
  handleChange,
  currencyOption,
  currency,
  setCurrency,
  data,
  handleBlur,
  value,
  setRefresh,
  searchLoading,
  headerMetaData,
}: any) => {
  const { user } = useAppSelector((state) => state.auth.auth);
  const { cartProducts, wishlistProducts } = useAppSelector((state) => state?.cart);
  const { currencyList } = useAppSelector((state) => state?.master);
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
    className={`relative w-full flex items-center justify-between pt-[10px] px-10 md:px-5 transition-[background-color,backdrop-filter,box-shadow,color] duration-300 ease-out pb-[10px] text-black ${
      isMegaMenuOpen
        ? 'bg-white shadow-[0_1px_0_rgba(45,23,14,0.06),0_16px_40px_-20px_rgba(45,23,14,0.18)]'
        : scrolled
          ? 'bg-white/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_1px_0_rgba(45,23,14,0.06),0_16px_40px_-20px_rgba(45,23,14,0.18)]'
          : 'bg-transparent'
    }`}
  >
      <div className="w-[15%] flex justify-center items-center h-[57px]">

        <Link href="/" className="h-[30px] w-[100%] lg:h-[50px] lg:w-full flex justify-center items-center">
          <Image
            src="/images/logo.png"
            // width={180}
            preview={false}
            // height={70}
            alt="Ashclair Logo"
            className="object-cover lg:w-[60%]"
          />
        </Link>

      </div>
      <div className="w-[70%]">
        <HeaderViewDynamic headerData={headerMetaData} onMenuOpenChange={setIsMegaMenuOpen}  />
      </div>
      <div className="flex w-[15%]  justify-end gap-3 md:gap-2  items-center">
        <div className="flex items-center">
          {!isFocused ? (
            <Image
              src="/images/img_search.svg"
              preview={false}
              width={20}
              height={20}
              alt="Search"
              className="h-[18px] cursor-pointer w-[18px] md:h-[20px] md:w-[20px]"
              onClick={handleFocus}
            />
          ) : (
            <div className="">
              <Select
                showSearch
                value={''}
                placeholder={'Search'}
                className="w-[200px] header-search lg:w-[150px]  md:w-[150px] transition-all duration-300  transform scale-100"
                defaultActiveFirstOption={false}
                suffixIcon={searchLoading && value?.length > 0 ? <LoadingOutlined className="!text-primary text-[14px]" spin /> : null}
                filterOption={false}
                popupMatchSelectWidth={false}
                size="small"
                onSearch={handleSearch}
                onChange={handleChange}
                placement={'bottomRight'}
                onKeyDown={(value: any) => {
                  if (value.key === 'Enter') {
                    router.replace(`/search?q=${value.target.value}`);
                  }
                }}
                notFoundContent={null}
                onBlur={handleBlur}
                autoFocus
              >
                {data.length > 0 &&
                  data?.slice(0, 3)?.map((d: any) => {
                    const jewelryTypeName = d?.jewelrySubType?.parent_code;
                    const jewelryTypeData = jewelryTypeName?.toLowerCase()?.replace('_', '-');
                    return (
                      <Select.Option
                        key={
                          d?.is_customizable
                            ? `/custom-jewelry?type=2&state=s&id=${d?.jewelryDetails?.[0]?.sku_slug}`
                            : `/${jewelryTypeData}/premade?slug=${d?.jewelryDetails?.[0]?.sku_slug}`
                        }
                        style={{ width: '100%', maxWidth: '30vw', padding: '4px' }}
                        value={d?.d?.jewelryDetails?.[0]?.sku_slug}
                      >
                        <div className="flex items-center gap-3 h-[100px]">
                          <div className="h-full flex justify-center items-center aspect-square bg-[#fff]">
                            <Image
                              preview={false}
                              // width={50}
                              // height={50}
                              className="w-full h-full object-cover"
                              fallback="/images/no_images.svg"
                              src={d?.jewelryDetails[0]?.carat_images?.[0] || '/images/no_images.svg'}
                            />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-wrap">{d?.fullTitle}</p>
                            <p className="!font-castoro">{formatCurrency(d?.jewelryDetails?.[0]?.selling_price)}</p>
                          </div>
                        </div>
                      </Select.Option>
                    );
                  })}
                {data.length > 0 && (
                  <Select.Option style={{ width: '100%', maxWidth: '40vw' }} value={`${process.env.NEXT_PUBLIC_BASE_URL}/search?q=${value}`}>
                    <div className="hover:underline">See more results for "{value}"</div>
                  </Select.Option>
                )}
                {value.length > 0 && data.length == 0 && !searchLoading && (
                  <Select.Option style={{ width: '100%' }} value={'no-results'}>
                    <div>No Results Found for "{value}"</div>
                  </Select.Option>
                )}
              </Select>
            </div>
          )}
        </div>

        <Link href="/wishlist" className="relative">
          <Image
            src="/images/img_fi_833300.svg"
            width={20}
            preview={false}
            height={20}
            alt="wishlist"
            className="h-[18px] w-[18px] md:h-[20px] md:w-[20px]"
          />
          {wishlistProducts?.length > 0 && (
            <p className="absolute bottom-[-7px] left-3 m-auto flex h-[16px] w-[16px] items-center justify-center !rounded-lg !bg-secondary !text-text_w text-center tracking-[1.20px] !p-2 text-[10px]">
              {wishlistProducts?.reduce((total: any, category: any) => total + category.jewelry.length, 0)}
            </p>
          )}
        </Link>

        <Link href="/cart" className="relative">
          <Image src="/images/img_bag.svg" width={20} preview={false} height={20} alt="Bag" className="h-[18px] w-[18px] md:h-[20px] md:w-[20px]" />
          {cartProducts?.length > 0 && (
            <p className="absolute bottom-[-7px] left-3 m-auto flex h-[16px] w-[16px] items-center justify-center !rounded-lg !bg-secondary !text-text_w text-center tracking-[1.20px] !p-2 text-[10px]">
              {cartProducts.length}
            </p>
          )}
        </Link>

        <Link href={user !== null && !user?.is_guest ? '/profile' : '/login'} className="w-fit flex uppercase gap-1 items-center">
          <Image
            src="/images/img_fi_4331290.svg"
            width={24}
            height={24}
            preview={false}
            alt="profile"
            className="h-[18px] w-[18px] md:h-[20px] md:w-[20px]"
          />
          {user !== null && !user?.is_guest && (
            <Text size="texts" className="!text-[14px] font-extralight">
              {window.innerWidth <= 1024 && window.innerWidth >= 768 && user?.first_name?.length > 8
                ? `${user?.first_name?.slice(0, 8)}..`
                : user?.first_name}
            </Text>
          )}
        </Link>

        {/* <Link href="/virtual-appointment" className="flex gap-2">
          <Image src="/images/appointment.svg" preview={false} fallback="/images/no-images.svg" alt="appointment" width={20} height={20} />
        </Link> */}
        {currency && (
          <Select
            className="bg-transparent !w-[70px] p-0 home-header-select border-none"
            size="small"
            defaultValue={currencyOption[0]?.value}
            value={currency}
            onChange={(e) => {
              const activeCurrency = currencyList?.filter((item: any) => item?.is_active === true);
              const prevIndex = activeCurrency.findIndex((el: any) => el.currency_code == e);
              const currencySymbol = activeCurrency?.[prevIndex > 0 ? prevIndex : 0].currency_symbol;
              localStorage.setItem('currencySymbol', currencySymbol);
              setCurrency(e);
              localStorage.setItem('currency', e);
              setRefresh(true);
            }}
          >
            {currencyOption.length > 0 &&
              currencyOption.map((ele: any) => {
                return (
                  <Select.Option
                    size="small"
                    className="home-header-select !py-3 !px-1"
                    style={{
                      // padding: '1px',
                      minHeight: '12px',
                      fontSize: '14px',
                    }}
                    key={ele?.value}
                    optionPadding={10}
                    optionHeight={'10px'}
                    value={ele?.value}
                  >
                    {ele?.label}
                  </Select.Option>
                );
              })}
          </Select>
        )}
      </div>
    </div>
  );
};

export default HeaderTopPart;
