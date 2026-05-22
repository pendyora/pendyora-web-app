/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { Button, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuLoader, LuShoppingBag } from 'react-icons/lu';

import { Text } from '@/components';
import CartProductDetails from '@/components/CartProductDetails';
import OrderSummary from '@/components/OrderSummary';
import { apiUpdateCountCartProduct } from '@/services/cartService';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  clearCouponData,
  fetchCartProductsList,
  fetchLocalCartProductsList,
  fetchRemoveProduct,
  setCartProducts,
  verifyCoupon,
} from '@/store/slices/Cart/cartSlice';

import OurBestSellers from '../homepage/OurBestSellers';

const Cart = () => {
  const route = useRouter();
  const { user, token } = useAppSelector((state) => state.auth.auth);
  const { cartProducts, loading, couponData } = useAppSelector((state) => state?.cart);
  const [reload, setReload] = useState(false);
  const [loader, setLoader] = useState(true);
  const [promoCode, setPromoCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isChecked, setIsChecked] = useState(false);
  const [showMessagingTermsError, setShowMessagingTermsError] = useState(false);
  const messagingTermsSectionRef = useRef<HTMLDivElement>(null);
  const [cartListFromLocalStorage, setCartListFromLocalStorage] = useState([]);
  const getSkuId = (item: any) => item?.sku_master_id ?? item?.sku_master;
  const getRingSizeKey = (item: any) => item?.ring_size_id ?? item?.ringSizePricingDetails?.id ?? null;

  useEffect(() => {
    const cartData = localStorage.getItem('cartItems');
    if (cartData) {
      setCartListFromLocalStorage(JSON.parse(cartData));
    }
  }, []);
  const updatedCartProducts = cartProducts?.map((product: any) => {
    const match: any = cartListFromLocalStorage?.find((item: any) => {
      const productSku = getSkuId(product);
      const localSku = getSkuId(item);
      const productRing = getRingSizeKey(product);
      const localRing = getRingSizeKey(item);
      if (productRing) {
        // For rings, match both sku and ring-size key
        return localSku === productSku && localRing === productRing;
      }
      // For other jewelry, match only sku key
      return localSku === productSku;
    });
    if (match) {
      return {
        ...product,
        is_appraisal: match?.is_appraisal ?? product?.is_appraisal,
        engravingText: match?.engravingText ?? product?.engravingText,
        is_warranty: product?.is_warranty,
        selectedYearValue: product?.is_warranty ? { year: product?.warranty_year, price: product?.warranty_amount } : null,
      };
    }
    return product;
  });

  const dispatch = useAppDispatch();
  const addToCartTracked = useRef(false);

  useEffect(() => {
    if (!addToCartTracked.current && cartProducts?.length > 0) {
      addToCartTracked.current = true;
      const value = cartProducts.reduce((sum: number, item: any) => {
        const price = item?.jewelry_sku?.discounted_price || item?.jewelry_sku?.selling_price || 0;
        const ringPrice = item?.ringSizePricingDetails?.rate ?? 0;
        const count = item?.count ?? 1;
        return sum + (Number(price) + Number(ringPrice)) * count;
      }, 0);
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_NODE_ENV === 'production') {
        (window as any).gtag?.('event', 'conversion', {
          send_to: 'AW-17230998076/188qCKWFqYAcELzUsJhA',
          value: value,
          currency: 'USD',
        });
      }
    }
  }, [cartProducts]);

  const handleUser = () => {
    // return !token ? `/login?callbackUrl=${'checkout'}` : '/checkout';
    return '/checkout';
  };

  const handleCheckout = async () => {
    if (!isChecked) {
      setShowMessagingTermsError(true);
      setTimeout(() => {
        messagingTermsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }, 0);
      return;
    }
    setShowMessagingTermsError(false);
    if (token) {
      await UpdateCartAPI();
    }
    route.push(handleUser());
  };
  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) {
      setErrorMessage('Promo code cannot be empty.');
      return;
    }

    try {
      const couponData = {
        coupon_code: promoCode,
        ...(!user ? { updatedCartProducts } : {}),
      };
      const res = await dispatch(verifyCoupon(couponData));

      if (res.payload?.status === 200) {
        setErrorMessage('');
      } else {
        setErrorMessage(res.payload?.response?.data?.message || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Error verifying coupon:', error);
      setErrorMessage('Something went wrong. Please try again.');
    }
  };
  const handleLocalCartProducts = () => {
    const cartData = localStorage.getItem('cartItems');
    const cartList = cartData ? JSON.parse(cartData) : [];

    if (cartList?.length > 0) {
      dispatch(fetchLocalCartProductsList({ data: cartList }));
    }
  };
  useEffect(() => {
    if (user) {
      dispatch(fetchCartProductsList());
    } else {
      handleLocalCartProducts();
    }
    setLoader(false);
  }, [user, reload]);

  const handleRemoveProducts = async (productDetails: any, index: number) => {
    const cartData = localStorage.getItem('cartItems');
    const cartList = cartData ? JSON.parse(cartData) : [];
    if (cartList.length > 0) {
      cartList.splice(index, 1);
      localStorage.setItem('cartItems', JSON.stringify(cartList));
      dispatch(fetchLocalCartProductsList({ data: cartList }));
      setReload(!reload);
    } else {
      const response = await dispatch(fetchRemoveProduct(productDetails.id));
      if (response?.payload?.status === 200) {
        dispatch(fetchCartProductsList());
      }
    }
  };

  const handleCount = useCallback(
    async (values: any) => {
      if (cartProducts && cartProducts.length > 0) {
        // Update the count for the product in Redux
        const updatedCartProducts = cartProducts.map((item: any) => {
          if (item?.ringSizePricingDetails?.id) {
            // For rings, match both sku_master_id and ring_size_id
            return item.sku_master_id === values.sku_master_id && item.ringSizePricingDetails?.id === values.ring_size_id
              ? { ...item, count: values.count }
              : item;
          }
          // For other jewelry, match only sku_master_id
          return item.sku_master_id === values.sku_master_id ? { ...item, count: values.count } : item;
        });
        dispatch(setCartProducts(updatedCartProducts));
        if (!user) {
          const cartData = localStorage.getItem('cartItems');
          const cartList = cartData ? JSON.parse(cartData) : [];
          const updatedCartList = cartList.map((item: any) => {
            const localSku = getSkuId(item);
            const localRing = getRingSizeKey(item);
            if (localRing) {
              // For rings, match both sku and ring-size key
              return localSku === values.sku_master_id && localRing === values.ring_size_id ? { ...item, count: values.count } : item;
            }
            // For other jewelry, match only sku key
            return localSku === values.sku_master_id ? { ...item, count: values.count } : item;
          });
          localStorage.setItem('cartItems', JSON.stringify(updatedCartList));
        }
      } else {
        // Handle empty cart scenario
        if (token) {
          // If user is logged in, you might want to fetch the cart again
        } else {
          // If user is not logged in, ensure local storage is empty
          localStorage.setItem('cartItems', JSON.stringify([]));
        }
      }
    },
    [user, cartProducts, dispatch],
  );
  const UpdateCartAPI = async () => {
    if (user) {
      await apiUpdateCountCartProduct(updatedCartProducts);
    }
  };

  useEffect(() => {
    if (!promoCode.trim()) {
      setErrorMessage('');
      dispatch(clearCouponData()); // Reset coupon data if input is cleared
    }
  }, [promoCode]);
  return (
    <div className="container-xs flex flex-col justify-center border-b border-solid border-gray-800_01 py-14 md:py-5 sm:py-4">
      <div className="mx-auto relative mb-[18px] sm:flex-col flex w-full items-start justify-center gap-8 md:gap-[10px] 2xl:px-[160px] xl:px-28 lg:px-20 md:px-5 sm:px-4">
        {!loader && (
          <div className="flex flex-1 sm:w-full flex-col items-start gap-8 sm:gap-4">
            {cartProducts?.length > 0 && (
              <Text as="p" size="text5xl" className="font-normal uppercase text-black-900">
                Shopping cart
              </Text>
            )}

            <div className="flex flex-col gap-[32px] self-stretch sm:gap-3">
              <Suspense fallback={<div>Loading feed...</div>}>
                {updatedCartProducts &&
                  updatedCartProducts?.map((d: any, index: number) => (
                    <CartProductDetails
                      productDetails={d}
                      {...d}
                      index={index}
                      key={'cartList' + index}
                      handleCount={handleCount}
                      handleRemoveProducts={handleRemoveProducts}
                    />
                  ))}
              </Suspense>
            </div>
          </div>
        )}
        {!loader && (
          <div className="flex w-[38%] sticky top-5 sm:w-full flex-col gap-[30px] md:gap-[10px] md:w-[50%] lg:w-[45%]">
            <div>
              {updatedCartProducts?.length > 0 ? <OrderSummary cartProducts={updatedCartProducts} promoCode={promoCode} /> : null}
              {cartProducts?.length > 0 && (
                <div className="flex-col bg-gray-50 px-[30px] md:px-[20px] pt-3 pb-6 md:pt-2 md:pb-4 sm:p-4 sm:pt-2 sm:px-3">
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-center justify-between gap-5 py-1 md:py-0">
                      <Text
                        as="p"
                        size="textxl"
                        className="text-[20px] font-normal uppercase tracking-[0px] text-black-900 lg:text-[18px] md:text-[16px]"
                      >
                        have a Promocode?
                      </Text>
                    </div>

                    <div className="flex justify-center items-center gap-3 lg:flex-col">
                      <Input
                        name="Promo Input"
                        placeholder={`Enter promo code`}
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        type="text"
                        className="flex flex-grow items-center justify-center bg-white-a700 capitalize lg:w-full"
                      />
                      <Button
                        type="default"
                        name="Apply Button"
                        onClick={handleApplyCoupon}
                        className="!bg-secondary !text-text_w w-fit sm:w-full md:w-full lg:w-full !h-[37px] tracking-[1.50px] 2xl:text-[16px] xl:text-[16px] lg:text-[14px] lg:!h-[37px] uppercase"
                      >
                        Apply
                      </Button>
                    </div>
                    {promoCode && promoCode == couponData?.coupon_code && (
                      <div className="text-green-600">
                        <p>
                          {couponData?.coupon_description
                            ? couponData?.coupon_description
                            : `You Saved ${couponData?.discount_type == 2 ? `${couponData?.discount_value}%` : `$${couponData?.discount_value} `}!`}
                        </p>
                      </div>
                    )}
                    {errorMessage && (
                      <div className="text-red-600">
                        <p>{errorMessage ? errorMessage : ``}</p>{' '}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {cartProducts?.length > 0 ? (
                <div className="px-5 sm:px-3 pb-5 bg-gray-50">
                  {/* <Link href={handleUser()} className="w-full"> */}
                  <Button
                    disabled={loading}
                    type="default"
                    loading={loading}
                    name="Checkout Button"
                    className="w-full !text-text_w !bg-secondary disabled:!bg-primary/50 !h-[45px] tracking-[1.50px] 2xl:text-[16px] xl:text-[16px] lg:text-[14px] lg:!h-[37px] uppercase"
                    onClick={handleCheckout}
                  >
                    checkout
                  </Button>
                  {/* </Link> */}
                </div>
              ) : null}
              {cartProducts?.length > 0 && (
                <div ref={messagingTermsSectionRef} className="scroll-mt-24 sm:scroll-mt-20" id="cart-messaging-terms-section">
                  <div className={'p-5 flex items-start gap-[10px] !cursor-pointer'}>
                    <input
                      className={`!text-secondary`}
                      type="checkbox"
                      id="checkoutCondition"
                      checked={isChecked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          setShowMessagingTermsError(false);
                        }
                        setIsChecked(checked);
                      }}
                    />
                    <label htmlFor="checkoutCondition" className="!text-[12px] !font-sans font-extralight tracking-[1.80px] sm:!text-[12px]">
                      By checking this box, you agree to receive automated personalized text messages (e.g. cart reminders, shipping updates, and
                      tracking info) from ASHCLAIR. Reply HELP for help and STOP to cancel.{' '}
                      <Link className="underline !cursor-pointer" href="/terms-and-conditions">
                        View Terms & Privacy
                      </Link>
                      .
                    </label>
                  </div>
                  {showMessagingTermsError && !isChecked && (
                    <p className="px-5 pb-5 -mt-3 text-red-600 text-[12px]" role="alert">
                      Please confirm the messaging terms to continue.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {(loading || loader) && (
        <div className="flex flex-col items-center gap-[60px] min-h-[50vh] justify-center">
          <div className="w-full flex justify-center items-center">
            <LuLoader className="h-10 w-10 animate-spin text-primary" />
          </div>
        </div>
      )}
      {!loader && !loading && cartProducts?.length == 0 && (
        // <div className="flex flex-col items-center gap-[60px] min-h-[50vh] justify-center">Cart is Empty !!</div>
        <>
          <div className="w-full mx-auto text-center mb-16">
            {/* <div className="relative h-48 w-48 mx-auto mb-5">
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <LuShoppingBag
                    className="h-24 w-24 text-gray-500/50"
                    strokeWidth={1.5}
                    // onMouseEnter={() => setIsHovering(true)}
                    // onMouseLeave={() => setIsHovering(false)}
                  />
                </div>
              </div>
            </div> */}

            <div className="mb-8 ">
              <h1 className="text-3xl font-serif font-medium mb-3 text-gray-800">Your Cart is Empty</h1>
              <p className="text-[14px] font-notosans mb-8 max-w-sm mx-auto text-gray-500">
                It seems you haven't added any precious jewelry to your collection yet. Discover our exquisite pieces and find something that speaks
                to you.
              </p>
            </div>
            {/* Product Suggestions Section */}
            <div>
              <OurBestSellers />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
