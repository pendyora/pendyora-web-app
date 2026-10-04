/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { HeaderProps } from '@/@types/header.type';
import { getJewelrySearch } from '@/services/productService';
import { clearSelectedProduct, setShouldLoadFilter, useAppDispatch, useAppSelector } from '@/store';
import { fetchCartProductsList, fetchLocalCartProductsList, fetchWishListProducts, setWishlistProducts } from '@/store/slices/Cart/cartSlice';
import { setSelectedSettingStore } from '@/store/slices/customProducts/customProductSlice';
import {
  fetchCurrencyCountry,
  fetchHeaderData,
  fetchMasterData,
  fetchRingSizePriceList,
  getEngraving,
  getFastDeliveryDay,
  otherPriceData,
} from '@/store/slices/Master/masterSlice';

import OfferModel from './components/OfferModel';
import AnnouncementBar from './mega/AnnouncementBar';
import SiteHeader from './mega/SiteHeader';

let timeout: ReturnType<typeof setTimeout> | null;
let currentValue: string;

const Header: React.FC<HeaderProps> = ({ className, headerMetaData, promoStripData }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const headerRef = useRef<HTMLElement>(null);
  const { user } = useAppSelector((state) => state.auth.auth);
  const [currency, setCurrency] = useState<any>('');
  const [refresh, setRefresh] = useState<any>(false);
  const [currencyOption, setCurrencyOption] = useState<any>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [OfferModelOpen, setOfferModelOpen] = useState<string>('false');

  const handleLocalCartProducts = () => {
    const cartData = localStorage.getItem('cartItems');
    const cartList = cartData ? JSON.parse(cartData) : [];
    if (cartList?.length > 0) {
      dispatch(fetchLocalCartProductsList({ data: cartList }));
    }
  };
  const { currencyList } = useAppSelector((state) => state?.master);

  useEffect(() => {
    if (currencyList?.length > 0) {
      const currency = currencyList
        ?.filter((item: any) => item?.is_active === true)
        .map((item: any) => {
          return {
            label: (
              <div className="w-full h-fit flex gap-1 items-center">
                {item?.currency_code} <span className="text-[20px]">{item?.country_flags}</span>
              </div>
            ),
            value: item?.currency_code,
            symbol: item?.currency_symbol,
          };
        });
      // const currencySymbol = currencyList?.filter((item: any) => item?.is_active === true)?.[0].currency_symbol;
      // localStorage.setItem('currencySymbol', currencySymbol);
      const cu = localStorage.getItem('currency');
      if (cu && cu !== undefined && cu !== null && cu !== '') {
        setCurrency(cu);
      } else {
        setCurrency(currency[0]?.value);
      }
      setCurrencyOption(currency);
    }
  }, [currencyList]);

  useEffect(() => {
    if (refresh == true) {
      setRefresh(!refresh);
      window.location.reload();
    }
  }, [refresh]);

  const handleLocalWishlist = () => {
    const wishlistData = localStorage.getItem('wishListItems');
    const wishList = wishlistData ? JSON.parse(wishlistData) : [];

    if (wishList?.length > 0) {
      dispatch(setWishlistProducts(wishList));
    }
  };

  const handleOfferModel = () => {
    const subscribeOffer = localStorage.getItem('OfferModelSubscribe');
    if (subscribeOffer == null) {
      localStorage.setItem('OfferModelSubscribe', 'false');
    }
    if (subscribeOffer == 'true') {
      setOfferModelOpen(subscribeOffer);
    } else {
      setOfferModelOpen(subscribeOffer || 'false');
    }
  };

  useEffect(() => {
    const el = headerRef.current;
    if (!el) {
      return;
    }
    const updateHeight = () => {
      document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`);
    };
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    dispatch(fetchMasterData());
    dispatch(fetchCurrencyCountry());
    dispatch(getFastDeliveryDay('1'));
    dispatch(otherPriceData('2'));
    dispatch(getEngraving('3'));
    dispatch(fetchCurrencyCountry());
    dispatch(fetchHeaderData());
    dispatch(fetchRingSizePriceList());
    dispatch(setShouldLoadFilter(false));
    if (user) {
      dispatch(fetchCartProductsList());
      dispatch(fetchWishListProducts('all'));
    } else {
      handleLocalCartProducts();
      handleLocalWishlist();
    }
    handleOfferModel();
  }, []);

  const [data, setData] = useState<any>([]);
  const [value, setValue] = useState<string>('');

  const fetch = (value: string, callback: (data: { value: string; text: string }[]) => void) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;
    if (!value?.trim()) {
      setSearchLoading(false);
      callback([]);
      return;
    }
    setSearchLoading(true);
    const fake = async () => {
      try {
        const res: any = await getJewelrySearch(value);
        if (currentValue === value) {
          const { rows } = res.data.data;
          callback(rows);
        }
      } catch {
        if (currentValue === value) {
          callback([]);
        }
      } finally {
        if (currentValue === value) {
          setSearchLoading(false);
        }
      }
    };
    timeout = setTimeout(fake, 200);
  };
  const handleSearch = (newValue: string) => {
    fetch(newValue, setData);
    setValue(newValue);
  };
  const handleChange = (newValue: string) => {
    setValue(newValue);
    handleBlur();
    router.push(newValue);
    dispatch(clearSelectedProduct());
    dispatch(setSelectedSettingStore(null));
  };
  const handleBlur = () => {
    setValue('');
    setData([]);
    setSearchLoading(false);
  };

  const currencyProps = { currency, currencyOption, setCurrency, setRefresh, tone: 'dark' as const };

  return (
    <header ref={headerRef} className={`${className} z-[51] flex flex-col overflow-x-clip overflow-y-visible`}>
      <AnnouncementBar promoStripData={promoStripData} currencyProps={currencyProps} />
      <SiteHeader
        headerMetaData={headerMetaData}
        currencyProps={currencyProps}
        search={{ value, results: data, loading: searchLoading, onSearch: handleSearch, onPick: handleChange, onReset: handleBlur }}
      />
      {OfferModelOpen == 'false' && <OfferModel />}
    </header>
  );
};

export default Header;
