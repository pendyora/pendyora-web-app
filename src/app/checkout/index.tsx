/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useRef, useState } from 'react';

import { ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LuLoader, LuLock } from 'react-icons/lu';

import { apiCancelAffirmOrder } from '@/services/affirmService';
import store, { useAppDispatch, useAppSelector } from '@/store';
import { fetchCountries, setBillingAddress, setDeliveryAddress } from '@/store/slices/Address/addressSlice';
import { clearAuthState, getUpdateUser } from '@/store/slices/auth/authSlice';
import {
  clearCartProducts,
  fetchCartProducts,
  fetchCartProductsList,
  fetchLocalCartProductsList,
  setGuestDetails,
} from '@/store/slices/Cart/cartSlice';
import { fetchPlaceOrder, setGuestUserOrderDetails } from '@/store/slices/Order/orderSlice';
import { trackAddPaymentInfo, trackInitiateCheckout } from '@/utils/metaPixel';

import BillingAddress from './BillingAddress';
import CheckoutPromoCode from './CheckoutPromoCode';
import CheckoutSteps from './CheckoutSteps';
import CheckoutSummary from './CheckoutSummary';
import { checkoutTheme, FORM_LABELS, GUTTER } from './checkoutTheme';
import DeliveryAddress from './DeliveryAddress';
import Payment from './Payment';
import SectionTitle from './SectionTitle';
import SignIn from './SignIn';

export default function CheckOutPage() {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 SignIn, 1 Billing, 2 Delivery, 3 Payment (includes promo)
  const [cartReady, setCartReady] = useState(false);
  const skipPersistStepRef = useRef(true);
  const checkoutStepScopeRef = useRef<string>('');
  const deliveryRefreshAttemptedForUserRef = useRef<string>('');
  const [isDeliveryAddress, setIsDeliveryAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [, setShipping] = useState(false);
  const [, setBillingAddressData] = useState(false);
  const [, setPayment] = useState(false);
  const { cartProducts, checkoutDetails, guestDetails } = useAppSelector((state) => state?.cart);
  const { user } = useAppSelector((state) => state.auth.auth);
  const [shippingDates, setShippingDates] = useState<any>([]);
  const [paymentError, setPaymentError] = useState<any>(null);
  const [cartListFromLocalStorage, setCartListFromLocalStorage] = useState([]);
  const [accountPassword, setAccountPassword] = useState<string | null>(null);

  const billingStepBeforeEditRef = useRef<number | null>(null);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const affirmCancelAttempted = useRef(false);

  const updatedbillingAddress = guestDetails?.billingAddress ? guestDetails?.billingAddress : user?.billing_address;
  const updatedDeliveryAddress = guestDetails?.deliveryAddress ? guestDetails?.deliveryAddress : user?.delivery_address;
  const couponData = useAppSelector((state: any) => state.cart.couponData);

  // Handle Affirm cancel redirect: when user cancels Affirm modal, Affirm redirects here
  // with payment_type=affirm&order_id=ORD... — cancel the pending order
  useEffect(() => {
    const paymentType = searchParams.get('payment_type');
    const affirmOrderId = searchParams.get('order_id');
    if (paymentType !== 'affirm' || !affirmOrderId || affirmCancelAttempted.current) {
      return;
    }
    affirmCancelAttempted.current = true;
    apiCancelAffirmOrder(affirmOrderId)
      .catch(() => {})
      .finally(() => {
        // Clean up query params from URL
        router.replace('/checkout', { scroll: false });
      });
  }, [searchParams, router]);

  useEffect(() => {
    // Always start checkout with a clean guest state to avoid stale email/address data.
    dispatch(setGuestDetails([]));
    try {
      sessionStorage.removeItem('majesca_checkout_step');
    } catch {
      /* ignore */
    }
    setCurrentStep(0);
    setIsDeliveryAddress(false);
    skipPersistStepRef.current = true;
  }, []);

  useEffect(() => {
    const cartData = localStorage.getItem('cartItems');
    if (cartData) {
      setCartListFromLocalStorage(JSON.parse(cartData));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (user && !user?.is_guest) {
          // After guest steps (e.g. billing), getUpdateUser() sets user — server cart can be empty while
          // items still live in localStorage + were loaded via fetchLocalCartProductsList. Merge first
          // (same as post-login in SignIn) so cartProducts is not cleared to [].
          const cartData = localStorage.getItem('cartItems');
          const cartList = cartData ? JSON.parse(cartData) : [];
          if (cartList?.length > 0) {
            const serializedCart = JSON.stringify(cartList);
            let shouldSyncGuestCart = true;
            try {
              const lastSyncedGuestCart = sessionStorage.getItem('majesca_checkout_synced_guest_cart');
              shouldSyncGuestCart = lastSyncedGuestCart !== serializedCart;
              if (shouldSyncGuestCart) {
                sessionStorage.setItem('majesca_checkout_synced_guest_cart', serializedCart);
              }
            } catch {
              // If sessionStorage is unavailable, continue with sync.
              shouldSyncGuestCart = true;
            }

            if (shouldSyncGuestCart) {
              // Merge first, then clear local cart only on successful sync.
              const syncRes: any = await dispatch(fetchCartProducts({ data: cartList }));
              if (syncRes?.meta?.requestStatus === 'fulfilled') {
                localStorage.removeItem('cartItems');
              } else {
                try {
                  sessionStorage.removeItem('majesca_checkout_synced_guest_cart');
                } catch {
                  /* ignore */
                }
              }
            }
          }
          await dispatch(fetchCartProductsList());
        } else {
          const cartData = localStorage.getItem('cartItems');
          const cartList = cartData ? JSON.parse(cartData) : [];
          if (cartList?.length > 0) {
            await dispatch(fetchLocalCartProductsList({ data: cartList }));
          }
        }
      } finally {
        if (!cancelled) {
          setCartReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.is_guest, dispatch]);

  // Ensure we have the latest user addresses for logged-in checkout.
  // (Billing may exist while delivery can still be missing until we refresh user.)
  useEffect(() => {
    if (!user || user?.is_guest) {
      return;
    }
    const userKey = String(user?.id ?? user?.email ?? 'auth');
    const hasDelivery = Boolean(user?.delivery_address && (user?.delivery_address?.id || user?.delivery_address?.address1));
    if (hasDelivery) {
      if (deliveryRefreshAttemptedForUserRef.current === userKey) {
        deliveryRefreshAttemptedForUserRef.current = '';
      }
      return;
    }
    if (deliveryRefreshAttemptedForUserRef.current === userKey) {
      return;
    }
    deliveryRefreshAttemptedForUserRef.current = userKey;
    if (!hasDelivery) {
      dispatch(getUpdateUser());
    }
  }, [user?.id, user?.email, user?.is_guest, user?.delivery_address?.id, user?.delivery_address?.address1, dispatch]);

  useEffect(() => {
    if (!cartReady || cartProducts.length === 0) {
      return;
    }
    const scope = !user || user?.is_guest ? 'guest' : `user:${user?.id ?? 'auth'}`;
    const scopeChanged = checkoutStepScopeRef.current !== scope;
    if (!scopeChanged && !skipPersistStepRef.current) {
      return;
    }
    checkoutStepScopeRef.current = scope;
    try {
      // Guest flow should always start from contact and should never restore stale saved step.
      if (scope === 'guest') {
        setCurrentStep(0);
        sessionStorage.removeItem('majesca_checkout_step');
        return;
      }
      const raw = sessionStorage.getItem('majesca_checkout_step');
      if (raw !== null) {
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n) && n >= 0 && n <= 3) {
          setCurrentStep(n);
        }
      }
    } catch {
      /* ignore */
    } finally {
      skipPersistStepRef.current = false;
    }
  }, [cartReady, cartProducts.length, user]);

  useEffect(() => {
    if (!cartReady || skipPersistStepRef.current) {
      return;
    }
    // Only persist steps for logged-in non-guest users.
    if (!user || user?.is_guest) {
      return;
    }
    try {
      sessionStorage.setItem('majesca_checkout_step', String(currentStep));
    } catch {
      /* ignore */
    }
  }, [currentStep, cartReady, user]);

  // Step sync for logged-in users:
  // If billing/delivery already exist, don't allow the UI to remain stuck on earlier steps.
  useEffect(() => {
    if (!cartReady) {
      return;
    }
    if (!user || user?.is_guest) {
      return;
    }

    const hasBilling = Boolean(
      user?.billing_address && (user?.billing_address?.id || user?.billing_address?.address1 || user?.billing_address?.first_name),
    );
    const hasDelivery = Boolean(
      user?.delivery_address && (user?.delivery_address?.id || user?.delivery_address?.address1 || user?.delivery_address?.first_name),
    );

    // 0 Sign in, 1 Billing, 2 Delivery, 3 Promo, 4 Payment
    let minStep = 0;
    if (hasBilling) {
      minStep = 1;
    }
    if (hasDelivery) {
      minStep = 2;
    }

    if (minStep > currentStep) {
      setCurrentStep(minStep);
    }
  }, [cartReady, user, currentStep]);

  useEffect(() => {
    const maxDeliveryDays: number[] = cartProducts.map((item: any) => item.cartJewelryDetails.estimated_delivery_days);
    const max = maxDeliveryDays.length > 0 ? Math.max(...maxDeliveryDays) : 0;
    setShippingDates([dayjs().add(max, 'days'), dayjs().add(15 + max, 'days')]);
    // dispatch(fetchCartProductsList());
    dispatch(fetchCountries());
    if (user?.delivery_address) {
      dispatch(setDeliveryAddress(user?.delivery_address));
    }
    if (user?.billing_address) {
      dispatch(setBillingAddress(user?.billing_address));
    }
  }, []);

  const updatedCartProducts = cartProducts?.map((product: any) => {
    const match: any = cartListFromLocalStorage?.find((item: any) => item?.jewelry_id === product?.jewelry_id);
    if (match) {
      return {
        ...product,
        is_appraisal: match?.is_appraisal ?? product?.is_appraisal,
        engravingText: match?.engravingText ?? product?.engravingText,
        is_warranty: match?.selectedYearValue ? true : false,
        selectedYearValue: match?.selectedYearValue ? match?.selectedYearValue : null,
      };
    }
    return product;
  });

  const isDirectCheckOut: any = false;

  const productsToDisplay = isDirectCheckOut ? checkoutDetails : updatedCartProducts;

  const checkoutTracked = useRef(false);
  const paymentInfoTracked = useRef(false);

  const openBillingSection = () => {
    setCurrentStep((prev) => Math.max(prev, 1));
  };

  useEffect(() => {
    if (!productsToDisplay?.length) {
      return;
    }
    const numItems = productsToDisplay.reduce((s: number, p: any) => s + (p?.count ?? 1), 0);
    const value = productsToDisplay.reduce((sum: number, item: any) => {
      const p = item?.jewelry_sku?.discounted_price ?? item?.jewelry_sku?.selling_price ?? 0;
      const ring = item?.ringSizePricingDetails?.rate ?? 0;
      const diamond = item?.diamondDetails?.price ?? 0;
      const count = item?.count ?? 1;
      return sum + (Number(p) + Number(ring)) * count + Number(diamond);
    }, 0);
    if (!checkoutTracked.current) {
      checkoutTracked.current = true;
      trackInitiateCheckout({ value, currency: 'USD', num_items: numItems });
      // Google Ads Begin Checkout conversion event
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_NODE_ENV === 'production') {
        (window as any).gtag?.('event', 'conversion', {
          send_to: 'AW-17230998076/243LCOmSu4AcELzUsJhA',
          value: value,
          currency: 'USD',
        });
      }
    }
  }, [productsToDisplay?.length]);

  useEffect(() => {
    if (currentStep === 3 && productsToDisplay?.length && !paymentInfoTracked.current) {
      paymentInfoTracked.current = true;
      const value = productsToDisplay.reduce((sum: number, item: any) => {
        const p = item?.jewelry_sku?.discounted_price ?? item?.jewelry_sku?.selling_price ?? 0;
        const ring = item?.ringSizePricingDetails?.rate ?? 0;
        const diamond = item?.diamondDetails?.price ?? 0;
        const count = item?.count ?? 1;
        return sum + (Number(p) + Number(ring)) * count + Number(diamond);
      }, 0);
      trackAddPaymentInfo({ value, currency: 'USD' });
    }
  }, [currentStep, productsToDisplay]);

  const handlePlaceOrder = async (values: any) => {
    setIsPlacingOrder(true);
    if (user && !user?.is_guest) {
      dispatch(getUpdateUser());
    }
    // Always send the same lines shown in checkout (guest *and* logged-in). Server cart can be empty
    // while Redux still has items from local cart / verify flow — backend otherwise returns "cart is empty".
    // Read live cart from the store at submit time and fall back to hydrating from localStorage if needed.
    let localExtras: any[] = [];
    try {
      const raw = localStorage.getItem('cartItems');
      localExtras = raw ? JSON.parse(raw) : [];
    } catch {
      localExtras = [];
    }
    const mergeLocalCartExtras = (products: any[] | undefined | null) =>
      (products ?? []).map((product: any) => {
        const match: any = localExtras.find((item: any) => item?.jewelry_id === product?.jewelry_id);
        if (match) {
          return {
            ...product,
            is_appraisal: match?.is_appraisal ?? product?.is_appraisal,
            engravingText: match?.engravingText ?? product?.engravingText,
            is_warranty: match?.selectedYearValue ? true : false,
            selectedYearValue: match?.selectedYearValue ? match?.selectedYearValue : null,
          };
        }
        return product;
      });

    const liveCart = store.getState().cart.cartProducts;
    // Prefer the same line items as Order Summary first; then Redux; avoids rare cases where
    // server cart snapshot and UI diverge and the request would omit updatedCartProducts.
    const snapshotBase =
      productsToDisplay?.length > 0
        ? productsToDisplay
        : liveCart?.length > 0
          ? liveCart
          : updatedCartProducts?.length > 0
            ? updatedCartProducts
            : [];
    let clientCartSnapshot = mergeLocalCartExtras(snapshotBase);

    if (!clientCartSnapshot?.length && Array.isArray(localExtras) && localExtras.length > 0) {
      const r: any = await dispatch(fetchLocalCartProductsList({ data: localExtras }));
      if (r.meta.requestStatus === 'fulfilled' && Array.isArray(r.payload?.data) && r.payload.data.length > 0) {
        clientCartSnapshot = mergeLocalCartExtras(r.payload.data);
      }
    }

    const data = {
      delivery_address: updatedDeliveryAddress?.id,
      billing_address: updatedbillingAddress?.id,
      start_shipping_date: shippingDates?.[0],
      end_shipping_date: shippingDates?.[1],
      payment_method: 2,
      coupon_code: couponData?.coupon_code,
      ...values,
      ...(clientCartSnapshot?.length ? { updatedCartProducts: clientCartSnapshot } : {}),
      ...(accountPassword ? { password: accountPassword, confirmPassword: accountPassword } : {}),
    };

    const res = await dispatch(fetchPlaceOrder({ data: data }));
    if (res?.payload?.status === 200) {
      // Clear header/cart badge state immediately after successful order.
      dispatch(clearCartProducts());
      try {
        sessionStorage.removeItem('majesca_checkout_step');
      } catch {
        /* ignore */
      }
      const orderIdFromResponse =
        res?.payload?.data?.order_id ??
        res?.payload?.data?.orderId ??
        res?.payload?.data?.guestUserOrderDetails?.order_id ??
        res?.payload?.data?.guestUserOrderDetails?.orderId ??
        res?.payload?.data?.guestUserOrderDetails?.orderDetails?.order_id ??
        res?.payload?.data?.guestUserOrderDetails?.orderDetails?.orderId;
      if (res?.payload?.data?.is_guest) {
        const d = res?.payload?.data;
        const guestOrderPayload =
          d?.guestUserOrderDetails ?? d?.guest_user_order_details ?? d?.orderDetails ?? (d?.order_id || d?.orderId ? d : null);
        if (guestOrderPayload) {
          dispatch(setGuestUserOrderDetails(guestOrderPayload));
          try {
            if (orderIdFromResponse) {
              sessionStorage.setItem(`majesca_guest_order_${orderIdFromResponse}`, JSON.stringify(guestOrderPayload));
            }
          } catch {
            /* ignore */
          }
        }
        localStorage.removeItem('admin');
        dispatch(clearAuthState());
      }
      localStorage.removeItem('cartItems');
      const redirectUrl: string = res?.payload?.data?.redirectUrl ?? '/';

      // `ThankYouSection` expects `?order_id=`; without it it redirects to `/` (cart empty).
      if (redirectUrl.includes('/ordersuccesfull') && !redirectUrl.includes('order_id=') && orderIdFromResponse) {
        router.push(`${redirectUrl}?order_id=${orderIdFromResponse}`);
      } else {
        router.push(redirectUrl);
      }
    } else {
      const p = res?.payload as any;
      const msg =
        typeof p === 'string'
          ? p
          : p?.message ||
            p?.error ||
            (Array.isArray(p?.errors) ? p.errors.filter(Boolean).join(' ') : '') ||
            'Unable to complete order. Please try again.';
      setPaymentError(msg);
      setTimeout(() => {
        setPaymentError(null);
      }, 10000);
      setIsPlacingOrder(false);
    }
  };
  useEffect(() => {
    if (!cartReady) {
      return;
    }
    if (!isPlacingOrder && (!cartProducts || cartProducts.length === 0)) {
      try {
        const rawLocalCart = localStorage.getItem('cartItems');
        const parsedLocalCart = rawLocalCart ? JSON.parse(rawLocalCart) : [];
        if (Array.isArray(parsedLocalCart) && parsedLocalCart.length > 0) {
          return;
        }
      } catch {
        // ignore parse/storage errors and continue with fallback redirect
      }
      router.replace('/cart');
    }
  }, [cartReady, cartProducts?.length, isPlacingOrder, router]);

  const onPayment = currentStep >= 3;

  return !cartReady || (!isPlacingOrder && (!cartProducts || cartProducts.length === 0)) ? (
    <div className="flex min-h-[80vh] w-full items-center justify-center bg-paper">
      <LuLoader className="h-10 w-10 animate-spin text-ink" />
    </div>
  ) : (
    <ConfigProvider theme={checkoutTheme}>
      <div className={`w-full overflow-x-hidden bg-paper font-libre text-[14px] leading-[1.55] text-ink antialiased ${GUTTER} ${FORM_LABELS}`}>
        <div className="flex flex-wrap items-end justify-between gap-6 pb-[30px] pt-10 sm:pb-5 sm:pt-6">
          <div>
            <nav aria-label="Breadcrumb" className="mb-4 flex gap-2.5 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              <Link href="/" className="text-ink-soft hover:text-ink">
                Home
              </Link>
              <span aria-hidden className="text-line">
                /
              </span>
              <Link href="/cart" className="text-ink-soft hover:text-ink">
                Bag
              </Link>
              <span aria-hidden className="text-line">
                /
              </span>
              <span aria-current="page">{onPayment ? 'Payment' : 'Delivery'}</span>
            </nav>
            <h1 className="m-0 font-cormorant text-[clamp(44px,5.6vw,80px)] font-normal leading-[0.92] tracking-[-0.01em]">
              {onPayment ? (
                <em className="italic text-gilt">Payment</em>
              ) : (
                <>
                  Delivery <em className="italic text-gilt">details</em>
                </>
              )}
            </h1>
          </div>
          <CheckoutSteps current={onPayment ? 'payment' : 'delivery'} />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(320px,410px)] items-start gap-[clamp(28px,4vw,64px)] pb-20 md:grid-cols-1 md:gap-6">
          <div className="min-w-0 md:order-2">
            <section className="pb-[30px]">
              <SignIn
                isDeliveryAddress={isDeliveryAddress}
                setIsDeliveryAddress={setIsDeliveryAddress}
                setCurrentStep={setCurrentStep}
                onContactContinue={openBillingSection}
              />
            </section>

            <section id="checkout-billing-section" className="border-t border-line py-[26px]">
              {currentStep >= 1 ? (
                <BillingAddress
                  setPayment={setPayment}
                  setBillingAddress={setBillingAddressData}
                  setCurrentStep={setCurrentStep}
                  onAccountPasswordChange={setAccountPassword}
                  isActive={currentStep === 1}
                  onBillingEditStart={() => {
                    billingStepBeforeEditRef.current = currentStep;
                  }}
                  onBillingEditCancel={() => {
                    if (billingStepBeforeEditRef.current != null) {
                      setCurrentStep(billingStepBeforeEditRef.current);
                      billingStepBeforeEditRef.current = null;
                    }
                  }}
                  onBillingSaveSuccess={() => {
                    billingStepBeforeEditRef.current = null;
                  }}
                />
              ) : (
                <SectionTitle muted>Billing address</SectionTitle>
              )}
            </section>

            <section id="checkout-delivery-section" className="border-t border-line py-[26px]">
              {currentStep >= 2 ? (
                <DeliveryAddress setShipping={setShipping} setCurrentStep={setCurrentStep} isActive={currentStep === 2} />
              ) : (
                <SectionTitle muted>Delivery address</SectionTitle>
              )}
            </section>

            <section id="checkout-payment-section" className="border-t border-line pt-[26px]">
              {onPayment ? (
                <div className="grid gap-6 sm:gap-4">
                  <SectionTitle
                    action={
                      <p className="m-0 flex items-center gap-2 text-[12px] text-ink-soft">
                        <LuLock className="h-3.5 w-3.5 text-gilt" aria-hidden />
                        Encrypted and processed securely. We never store your card number.
                      </p>
                    }
                  >
                    Payment
                  </SectionTitle>

                  <CheckoutPromoCode guestCartProducts={updatedCartProducts} />

                  <Payment
                    handlePlaceOrder={handlePlaceOrder}
                    error={paymentError}
                    cartProducts={productsToDisplay}
                    deliveryAddressId={updatedDeliveryAddress?.id}
                    billingAddressId={updatedbillingAddress?.id}
                    couponCode={couponData?.coupon_code}
                    isGuest={Boolean(user?.is_guest || guestDetails?.token)}
                    shippingDates={{ start: shippingDates?.[0], end: shippingDates?.[1] }}
                    guestCartData={productsToDisplay}
                    setIsPlacingOrder={setIsPlacingOrder}
                  />
                  <p className="m-0 text-center text-[12px] text-ink-soft">
                    By placing your order you agree to our{' '}
                    <Link href="/terms-and-conditions" className="underline underline-offset-[3px]">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy-policy" className="underline underline-offset-[3px]">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <SectionTitle muted>Payment</SectionTitle>
              )}
            </section>
          </div>

          <div className="self-stretch md:order-1">
            {productsToDisplay?.length > 0 ? <CheckoutSummary products={productsToDisplay} promoCode={couponData?.coupon_code} /> : null}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
