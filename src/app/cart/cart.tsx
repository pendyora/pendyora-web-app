/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button, ConfigProvider, Drawer, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuGem, LuLoader, LuLock, LuMessageSquare, LuMonitor, LuRotateCcw, LuShieldCheck, LuTag, LuTruck } from 'react-icons/lu';

import OrderSummary, { useCurrencyCode, useOrderTotals } from '@/components/OrderSummary';
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
import { formatCurrency } from '@/utils/common';

import CartItem from './CartItem';
import CheckoutSteps from '../checkout/CheckoutSteps';
import { checkoutTheme, GUTTER, PRIMARY_BTN } from '../checkout/checkoutTheme';
import OurBestSellers from '../homepage/OurBestSellers';

const ASSURANCES = [
  { icon: LuGem, title: 'Certified diamonds', text: 'Lab-grown and ethically mined, certified at origin.' },
  { icon: LuShieldCheck, title: 'Secure payment', text: 'Card details are encrypted and never stored.' },
  { icon: LuTruck, title: 'Worldwide shipping', text: 'Complimentary shipping on every order.' },
  { icon: LuRotateCcw, title: '30-day returns', text: 'Refund or exchange within 30 days of shipment.' },
];
const PAYMENT_MARKS = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'PAYPAL', 'AFFIRM · US'];

const Cart = () => {
  const route = useRouter();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth.auth);
  const { cartProducts, loading, couponData } = useAppSelector((state) => state?.cart);
  const [reload, setReload] = useState(false);
  const [loader, setLoader] = useState(true);
  // The applied promo code. Starts from any code already verified this session.
  const [promoCode, setPromoCode] = useState<string>(couponData?.coupon_code ?? '');
  const [codeInput, setCodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [applying, setApplying] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [cartListFromLocalStorage, setCartListFromLocalStorage] = useState([]);
  const getSkuId = (item: any) => item?.sku_master_id ?? item?.sku_master;
  const getRingSizeKey = (item: any) => item?.ring_size_id ?? item?.ringSizePricingDetails?.id ?? null;
  const currency = useCurrencyCode();

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
  const totals = useOrderTotals(updatedCartProducts ?? [], promoCode);

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

  const UpdateCartAPI = async () => {
    if (user) {
      await apiUpdateCountCartProduct(updatedCartProducts);
    }
  };

  const handleCheckout = async () => {
    if (token) {
      await UpdateCartAPI();
    }
    route.push('/checkout');
  };

  const handleApplyCoupon = async () => {
    const code = codeInput.trim();
    if (!code) {
      setErrorMessage('Enter a code to apply it.');
      return;
    }
    setApplying(true);
    try {
      const res = await dispatch(verifyCoupon({ coupon_code: code, ...(!user ? { updatedCartProducts } : {}) }));
      if (res.payload?.status === 200) {
        setErrorMessage('');
        setPromoCode(code);
        setCodeInput('');
        setDrawerOpen(false);
      } else {
        setErrorMessage(res.payload?.response?.data?.message || `We couldn't find “${code}”. Check the spelling and try again.`);
      }
    } catch (error) {
      console.error('Error verifying coupon:', error);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const removeCoupon = () => {
    setPromoCode('');
    setErrorMessage('');
    dispatch(clearCouponData());
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
        const nextProducts = cartProducts.map((item: any) => {
          if (item?.ringSizePricingDetails?.id) {
            // For rings, match both sku_master_id and ring_size_id
            return item.sku_master_id === values.sku_master_id && item.ringSizePricingDetails?.id === values.ring_size_id
              ? { ...item, count: values.count }
              : item;
          }
          return item.sku_master_id === values.sku_master_id ? { ...item, count: values.count } : item;
        });
        dispatch(setCartProducts(nextProducts));
        if (!user) {
          const cartData = localStorage.getItem('cartItems');
          const cartList = cartData ? JSON.parse(cartData) : [];
          const updatedCartList = cartList.map((item: any) => {
            const localSku = getSkuId(item);
            const localRing = getRingSizeKey(item);
            if (localRing) {
              return localSku === values.sku_master_id && localRing === values.ring_size_id ? { ...item, count: values.count } : item;
            }
            return localSku === values.sku_master_id ? { ...item, count: values.count } : item;
          });
          localStorage.setItem('cartItems', JSON.stringify(updatedCartList));
        }
      } else if (!token) {
        localStorage.setItem('cartItems', JSON.stringify([]));
      }
    },
    [user, cartProducts, dispatch],
  );

  const pieceCount = updatedCartProducts?.reduce((s: number, p: any) => s + (Number(p?.count) || 1), 0) ?? 0;
  const hasItems = !loader && !loading && cartProducts?.length > 0;
  const isEmpty = !loader && !loading && cartProducts?.length == 0;

  return (
    <ConfigProvider theme={checkoutTheme}>
      <div className={`bg-paper font-libre text-[14px] leading-[1.55] text-ink antialiased ${GUTTER} ${hasItems ? 'sm:pb-24' : ''}`}>
        {/* Title row */}
        <div className="flex flex-wrap items-end justify-between gap-6 pb-[30px] pt-10 sm:pb-5 sm:pt-6">
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 flex gap-2.5 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              <Link href="/" className="text-ink-soft hover:text-ink">
                Home
              </Link>
              <span aria-hidden className="text-line">
                /
              </span>
              <span aria-current="page">Bag</span>
            </nav>
            <h1 className="m-0 font-cormorant text-[clamp(44px,5.6vw,80px)] font-normal leading-[0.92] tracking-[-0.01em]">
              Your <em className="italic text-gilt">Bag</em>
              {hasItems && (
                <small className="ml-2.5 align-super font-libre text-[12px] uppercase not-italic tracking-[0.14em] text-ink-soft">
                  {pieceCount} {pieceCount === 1 ? 'piece' : 'pieces'}
                </small>
              )}
            </h1>
          </div>
          {hasItems && <CheckoutSteps current="bag" />}
        </div>

        {(loading || loader) && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <LuLoader className="h-10 w-10 animate-spin text-ink" />
          </div>
        )}

        {hasItems && (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(320px,410px)] items-start gap-[clamp(28px,4vw,64px)] pb-20 lg:grid-cols-1">
            <section aria-label="Pieces in your bag">
              {!user && (
                <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-3.5 text-[13px] text-ink-soft">
                  <span>
                    <Link href="/login?callbackUrl=cart" className="text-ink underline underline-offset-[3px]">
                      Sign in
                    </Link>{' '}
                    to save your bag across devices.
                  </span>
                  <span className="tabular-nums">Prices in {currency}</span>
                </div>
              )}
              <ul className="m-0 list-none p-0">
                {updatedCartProducts?.map((d: any, index: number) => (
                  <CartItem
                    key={`${d?.id ?? d?.sku_master_id}-${index}`}
                    index={index}
                    productDetails={d}
                    handleCount={handleCount}
                    handleRemoveProducts={handleRemoveProducts}
                  />
                ))}
              </ul>

              <div className="mt-7 grid gap-3 border border-line px-6 py-[22px]">
                <h3 className="m-0 flex items-center gap-2.5 font-cormorant text-[22px] font-medium">
                  <LuMessageSquare className="h-5 w-5" aria-hidden />
                  Need advice?
                </h3>
                <p className="m-0 text-[13px] text-ink-soft">Our jewelry specialists can help with sizing, stones and delivery to your country.</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-[13px]">
                  <Link href="/virtual-appointment" className="flex items-center gap-2.5 text-ink hover:text-gilt">
                    <LuMonitor className="h-[18px] w-[18px]" aria-hidden />
                    Book a virtual appointment
                  </Link>
                  <Link href="/contactpage" className="flex items-center gap-2.5 text-ink hover:text-gilt">
                    <LuMessageSquare className="h-[18px] w-[18px]" aria-hidden />
                    Contact a specialist
                  </Link>
                </div>
              </div>
              <p className="mb-0 mt-[22px]">
                <Link href="/all" className="text-[11px] uppercase tracking-[0.12em] text-ink-soft underline underline-offset-4 hover:text-ink">
                  ← Continue shopping
                </Link>
              </p>
            </section>

            <aside aria-label="Order summary" className="sticky top-6 grid border border-line bg-paper lg:static">
              <div className="grid gap-[18px] px-7 py-[26px] sm:px-5">
                <h2 className="m-0 font-cormorant text-[30px] font-normal leading-none">Order summary</h2>
                {totals.couponCode ? (
                  <div className="flex items-center justify-between gap-3 bg-stone px-3.5 py-3">
                    <div className="flex items-center gap-2.5 text-[12px] font-semibold tracking-[0.14em]">
                      <LuTag className="h-[15px] w-[15px] text-gilt" aria-hidden />
                      <div>
                        {totals.couponCode}
                        {couponData?.coupon_description && (
                          <small className="mt-0.5 block text-[12px] font-normal tracking-normal text-ink-soft">
                            {couponData.coupon_description}
                          </small>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] uppercase tracking-[0.12em] text-ink-soft underline underline-offset-4 hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="flex w-full items-center gap-2.5 border border-dashed border-line-strong px-4 py-3.5 text-left text-[12px] uppercase tracking-[0.12em] transition-colors hover:border-ink"
                  >
                    <LuTag className="h-4 w-4" aria-hidden />
                    Add a promo code
                  </button>
                )}
                <OrderSummary cartProducts={updatedCartProducts} promoCode={promoCode} />
                <Button type="default" loading={loading} disabled={loading} onClick={handleCheckout} className={`${PRIMARY_BTN} !h-[52px] w-full`}>
                  <LuLock className="h-[15px] w-[15px]" aria-hidden /> Secure checkout
                </Button>
                <label className="flex cursor-pointer items-start gap-2.5 text-[11.5px] leading-[1.5] text-ink-soft">
                  <input
                    type="checkbox"
                    checked={smsOptIn}
                    onChange={(e) => setSmsOptIn(e.target.checked)}
                    className="mt-0.5 h-4 w-4 flex-none rounded-none border-line-strong text-ink focus:ring-ink"
                  />
                  <span>
                    Text me order and delivery updates from Pendyora. Optional. Message rates may apply; reply STOP to opt out.{' '}
                    <Link href="/terms-and-conditions" className="underline">
                      Terms &amp; Privacy
                    </Link>
                  </span>
                </label>
              </div>
              <div className="grid gap-3 border-t border-line bg-stone/45 px-7 py-5 sm:px-5">
                {ASSURANCES.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="grid grid-cols-[20px_1fr] items-start gap-3 text-[12.5px]">
                    <Icon className="h-[18px] w-[18px] text-gilt" aria-hidden />
                    <p className="m-0">
                      <b className="block font-medium text-ink">{title}</b>
                      <span className="text-ink-soft">{text}</span>
                    </p>
                  </div>
                ))}
                <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Accepted payment methods">
                  {PAYMENT_MARKS.map((m) => (
                    <span key={m} className="border border-line bg-paper px-[7px] py-1 text-[9.5px] font-semibold tracking-[0.08em] text-ink-soft">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {isEmpty && (
          <>
            <div className="grid justify-items-center gap-3.5 pb-16 pt-6 text-center">
              <h2 className="m-0 font-cormorant text-[clamp(40px,5vw,64px)] font-normal leading-none">
                Your bag is <em className="italic text-gilt">empty</em>
              </h2>
              <p className="m-0 max-w-[46ch] text-ink-soft">
                Nothing here yet. Start with our newest pieces, or ask a specialist to help you choose.
              </p>
              <div className="mt-2.5 flex flex-wrap justify-center gap-2.5">
                <Link
                  href="/new-arrivals"
                  className="inline-flex h-12 items-center bg-ink px-8 text-[11px] uppercase tracking-[0.18em] text-paper hover:bg-ink-hover hover:text-paper"
                >
                  Shop new arrivals
                </Link>
                <Link
                  href="/virtual-appointment"
                  className="inline-flex h-12 items-center border border-ink px-7 text-[11px] uppercase tracking-[0.18em] text-ink hover:bg-ink hover:text-paper"
                >
                  Book a virtual appointment
                </Link>
              </div>
            </div>
            <OurBestSellers />
          </>
        )}

        {/* Mobile total + checkout */}
        {hasItems && (
          <div className="fixed inset-x-0 bottom-0 z-30 hidden items-center justify-between gap-3.5 border-t border-line bg-paper px-4 pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-3 sm:flex">
            <div className="grid leading-tight">
              <small className="text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">Total</small>
              <strong className="font-cormorant text-[24px] font-medium tabular-nums">{formatCurrency(totals.total)}</strong>
            </div>
            <Button type="default" onClick={handleCheckout} disabled={loading} className={PRIMARY_BTN}>
              Checkout
            </Button>
          </div>
        )}

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="right"
          width="min(460px, 100vw)"
          closeIcon={null}
          title={<span className="font-cormorant text-[26px] font-medium text-ink">Promo codes</span>}
          extra={
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="bg-ink px-3.5 py-2 text-[10.5px] uppercase tracking-[0.18em] text-paper"
            >
              Close
            </button>
          }
          classNames={{ header: '!border-line !px-7 !py-[22px] sm:!px-[18px]', body: '!px-7 !py-6 sm:!px-[18px]' }}
        >
          <form
            noValidate
            className="grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void handleApplyCoupon();
            }}
          >
            <label htmlFor="promo-code" className="sr-only">
              Promo code
            </label>
            <div className="flex">
              <Input
                id="promo-code"
                autoComplete="off"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value);
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
                placeholder="Enter a promo code"
                status={errorMessage ? 'error' : undefined}
                className="!border-r-0 uppercase tracking-[0.12em] placeholder:normal-case placeholder:tracking-normal"
              />
              <Button htmlType="submit" loading={applying} className={`${PRIMARY_BTN} !px-6`}>
                Apply
              </Button>
            </div>
            {errorMessage && (
              <p role="alert" className="m-0 text-[12.5px] text-danger">
                {errorMessage}
              </p>
            )}
            <p className="m-0 text-[12px] text-ink-soft">One promo code per order.</p>
          </form>
        </Drawer>
      </div>
    </ConfigProvider>
  );
};

export default Cart;
