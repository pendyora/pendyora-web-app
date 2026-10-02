import React, { useState, useEffect } from 'react';

import { LoadingOutlined } from '@ant-design/icons';
import { Image, Select } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAppSelector } from '@/store';
import { formatCurrency } from '@/utils/common';

import { BagIcon, HeartIcon, SearchIcon, UserIcon } from './components/HeaderIcons';
import HeaderViewDynamic from './components/HeaderViewDynamic';

const toolClass = 'flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.12em] text-ink hover:text-ink';

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
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // On the homepage the header floats over the hero until the page scrolls; everywhere else it is solid.
  const overHero = pathname === '/' && !scrolled && !isMegaMenuOpen;
  const wishlistCount = wishlistProducts?.reduce((total: any, category: any) => total + category.jewelry.length, 0) ?? 0;
  const isSignedIn = user !== null && !user?.is_guest;

  return (
    <div
      className={`relative grid w-full grid-cols-[1fr_auto_1fr] items-center gap-6 border-b px-[clamp(16px,3.2vw,56px)] py-[22px] text-ink transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
        overHero ? 'border-transparent bg-transparent' : 'border-line bg-paper/95 backdrop-blur-md'
      } ${scrolled && !isMegaMenuOpen ? 'shadow-sm shadow-ink/5' : ''}`}
    >
      <nav aria-label="Main" className="min-w-0">
        <HeaderViewDynamic headerData={headerMetaData} onMenuOpenChange={setIsMegaMenuOpen} />
      </nav>

      <Link href="/" aria-label="Pendyora home" className="flex items-center justify-center">
        <img src="/images/logo.png" alt="Pendyora" className="h-[34px] w-auto object-contain mix-blend-multiply" />
      </Link>

      <div className="flex items-center justify-end gap-[22px] xls:gap-4">
        {!isFocused ? (
          <button type="button" onClick={handleFocus} className={toolClass} aria-label="Search">
            <SearchIcon />
            <span>Search</span>
          </button>
        ) : (
          <Select
            showSearch
            value={''}
            variant="borderless"
            placeholder={'Search'}
            className="header-search w-[200px] border-b border-ink lg:w-[150px] [&_.ant-select-selection-placeholder]:text-[11.5px] [&_.ant-select-selection-placeholder]:uppercase [&_.ant-select-selection-placeholder]:tracking-[0.12em] [&_.ant-select-selection-placeholder]:text-ink-soft"
            defaultActiveFirstOption={false}
            suffixIcon={
              searchLoading && value?.length > 0 ? (
                <LoadingOutlined className="!text-ink text-[14px]" spin />
              ) : (
                <SearchIcon className="h-4 w-4 text-ink" />
              )
            }
            filterOption={false}
            popupMatchSelectWidth={false}
            size="small"
            onSearch={handleSearch}
            onChange={handleChange}
            placement={'bottomRight'}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                router.replace(`/search?q=${e.target.value}`);
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
                    <div className="flex h-[100px] items-center gap-3">
                      <div className="flex aspect-square h-full items-center justify-center bg-stone">
                        <Image
                          preview={false}
                          className="h-full w-full object-cover mix-blend-multiply"
                          fallback="/images/no_images.svg"
                          src={d?.jewelryDetails[0]?.carat_images?.[0] || '/images/no_images.svg'}
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-wrap text-ink">{d?.fullTitle}</p>
                        <p className="tabular-nums text-ink-soft">{formatCurrency(d?.jewelryDetails?.[0]?.selling_price)}</p>
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
                <div>No results found for "{value}"</div>
              </Select.Option>
            )}
          </Select>
        )}

        <Link href={isSignedIn ? '/profile' : '/login'} className={toolClass} aria-label={isSignedIn ? 'Your account' : 'Sign in'}>
          <UserIcon />
          {isSignedIn && (
            <span className="max-w-[9ch] truncate">
              {typeof window !== 'undefined' && window.innerWidth <= 1280 && user?.first_name?.length > 8
                ? `${user?.first_name?.slice(0, 8)}..`
                : user?.first_name}
            </span>
          )}
        </Link>

        <Link href="/wishlist" className={toolClass} aria-label={`Wishlist, ${wishlistCount} items`}>
          <HeartIcon />
          {wishlistCount > 0 && <span className="tabular-nums">{wishlistCount}</span>}
        </Link>

        <Link href="/cart" className={toolClass} aria-label={`Bag, ${cartProducts?.length ?? 0} items`}>
          <BagIcon />
          <span className="tabular-nums">{cartProducts?.length ?? 0}</span>
        </Link>

        {currency && (
          <Select
            variant="borderless"
            size="small"
            aria-label="Currency"
            className="home-header-select !w-[74px] [&_.ant-select-selection-item]:!text-[11.5px] [&_.ant-select-selection-item]:tracking-[0.08em] [&_.ant-select-selection-item]:text-ink"
            defaultValue={currencyOption[0]?.value}
            value={currency}
            popupMatchSelectWidth={false}
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
              currencyOption.map((ele: any) => (
                <Select.Option
                  key={ele?.value}
                  className="home-header-select !px-1 !py-3"
                  style={{ minHeight: '12px', fontSize: '14px' }}
                  value={ele?.value}
                >
                  {ele?.label}
                </Select.Option>
              ))}
          </Select>
        )}
      </div>
    </div>
  );
};

export default HeaderTopPart;
