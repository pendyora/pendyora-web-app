import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Button, Form, Input, Radio } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

import { Text } from '@/components';
import { apiCreateAffirmCheckout, apiCaptureAffirmCharge, apiCancelAffirmOrder } from '@/services/affirmService';
import { apiCreatePayPalOrder, apiCapturePayPalOrder, apiCancelPayPalOrder } from '@/services/paypalService';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearCartProducts } from '@/store/slices/Cart/cartSlice';
import { formatCurrency } from '@/utils/common';

type PaymentProps = {
  handlePlaceOrder: (values: any) => void;
  error: string;
  cartProducts: any[];
  deliveryAddressId?: string;
  billingAddressId?: string;
  couponCode?: string;
  isGuest?: boolean;
  shippingDates?: { start: string; end: string };
  guestCartData?: any;
  setIsPlacingOrder?: (v: boolean) => void;
};

const Payment = ({
  handlePlaceOrder,
  error,
  cartProducts,
  deliveryAddressId,
  billingAddressId,
  couponCode,
  isGuest,
  shippingDates,
  guestCartData,
  setIsPlacingOrder,
}: PaymentProps) => {
  const { loading } = useAppSelector((s) => s.order);
  const couponData = useAppSelector((state: any) => state.cart.couponData);

  const totalAmount = useMemo(() => {
    let total = 0;
    cartProducts?.forEach((item: any) => {
      const couponItem = couponData?.items?.find((el: any) => el?.sku_details?.id === item?.sku_master_id);
      const basePrice =
        couponItem?.sku_details?.coupon_discounted_price ??
        (item?.jewelry_sku?.discounted_price && item?.jewelry_sku?.discounted_price !== 0
          ? item?.jewelry_sku?.discounted_price
          : (item?.jewelry_sku?.selling_price ?? 0));
      const ringPrice = item?.ringSizePricingDetails?.rate ?? 0;
      const diamondPrice = item?.diamondDetails?.price ?? 0;
      const count = item?.count ?? 1;
      total += (Number(basePrice) + Number(ringPrice)) * count + Number(diamondPrice);
    });
    return Math.ceil(total);
  }, [cartProducts, couponData]);

  const [paymentType, setPaymentType] = useState<'card' | 'paypal' | 'affirm'>('card');
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalError, setPaypalError] = useState('');
  const [paypalRenderCycle, setPaypalRenderCycle] = useState(0);
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement | null>(null);
  const paypalRenderedRef = useRef(false);
  const pendingPayPalOrderIdRef = useRef<string | null>(null);

  // Affirm state
  const [affirmReady, setAffirmReady] = useState(false);
  const [affirmError, setAffirmError] = useState('');
  const [isProcessingAffirm, setIsProcessingAffirm] = useState(false);
  const pendingAffirmOrderIdRef = useRef<string | null>(null);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const paypalClientId = useMemo(() => process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '', []);
  const affirmPublicKey = useMemo(() => process.env.NEXT_PUBLIC_AFFIRM_PUBLIC_KEY || '', []);
  const affirmJsUrl = useMemo(() => process.env.NEXT_PUBLIC_AFFIRM_JS_URL || 'https://cdn1-sandbox.affirm.com/js/v2/affirm.js', []);

  // ─── PayPal Effects ───────────────────────────────────────────────

  useEffect(() => {
    if (paymentType !== 'paypal') {
      paypalRenderedRef.current = false;
    }
  }, [paymentType]);

  useEffect(() => {
    if (paymentType === 'paypal') {
      paypalRenderedRef.current = false;
      setPaypalRenderCycle((prev) => prev + 1);
    }
  }, [paymentType]);

  useEffect(() => {
    if (!paypalError) {
      return;
    }
    const timer = window.setTimeout(() => setPaypalError(''), 5000);
    return () => window.clearTimeout(timer);
  }, [paypalError]);

  useEffect(() => {
    if (paymentType !== 'paypal') {
      return;
    }

    if (!paypalClientId) {
      setPaypalError('PayPal client id is missing. Please add NEXT_PUBLIC_PAYPAL_CLIENT_ID in env.');
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-paypal-sdk="true"]');
    if (existingScript) {
      if ((window as any).paypal?.Buttons) {
        setPaypalReady(true);
      } else {
        existingScript.addEventListener('load', () => setPaypalReady(true), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paypalClientId)}&currency=USD&intent=capture`;
    script.async = true;
    script.dataset.paypalSdk = 'true';
    script.onload = () => setPaypalReady(true);
    script.onerror = () => setPaypalError('Unable to load PayPal. Please try again.');
    document.body.appendChild(script);
  }, [paymentType, paypalClientId]);

  useEffect(() => {
    if (paymentType !== 'paypal' || !paypalReady || paypalRenderedRef.current || !paypalContainerRef.current) {
      return;
    }

    const paypal = (window as any).paypal;
    if (!paypal?.Buttons) {
      setPaypalError('PayPal is not available. Please refresh and try again.');
      return;
    }

    const container = paypalContainerRef.current;
    container.innerHTML = '';

    paypal
      .Buttons({
        style: {
          shape: 'rect',
          layout: 'horizontal',
          height: 44,
          color: 'gold',
          label: 'pay',
          tagline: false,
        },
        // Backend-controlled: create PayPal order via our API (calculates correct total server-side)
        createOrder: async () => {
          setPaypalError('');
          try {
            const orderData: any = {
              delivery_address: deliveryAddressId,
              billing_address: billingAddressId,
              coupon_code: couponCode || undefined,
              start_shipping_date: shippingDates?.start,
              end_shipping_date: shippingDates?.end,
            };

            // Always send cart items so backend can use them as fallback
            // (handles case where DB cart is empty but Redux/localStorage has items)
            if (guestCartData?.length > 0) {
              orderData.updatedCartProducts = guestCartData;
            }

            const res: any = await apiCreatePayPalOrder(orderData);
            const paypalOrderId = res?.data?.data?.paypal_order_id;

            if (!paypalOrderId) {
              throw new Error('Failed to create PayPal order');
            }

            // Track the pending order ID so we can cancel it if user cancels/errors
            pendingPayPalOrderIdRef.current = paypalOrderId;
            return paypalOrderId;
          } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Failed to create PayPal order.';
            setPaypalError(message);
            throw err;
          }
        },
        // Backend-controlled: capture via our API (verifies amount + finalizes order)
        onApprove: async (data: any) => {
          setIsProcessingPayPal(true);
          setPaypalError('');
          // Prevent checkout page from redirecting to /cart when we clear the cart
          setIsPlacingOrder?.(true);
          try {
            const res: any = await apiCapturePayPalOrder(data.orderID);
            const responseData = res?.data?.data;

            // Clear frontend cart
            dispatch(clearCartProducts());
            localStorage.removeItem('cartItems');

            // Extract order ID and redirect
            const orderId = responseData?.order?.order_id || responseData?.redirectUrl?.split('order_id=')?.[1];

            // Store guest order details if needed
            if (responseData?.is_guest && responseData?.guestUserOrderDetails) {
              sessionStorage.setItem(`majesca_guest_order_${orderId}`, JSON.stringify(responseData.guestUserOrderDetails));
            }

            pendingPayPalOrderIdRef.current = null; // Clear — order is confirmed
            router.push(`/ordersuccesfull?order_id=${orderId}`);
          } catch (err: any) {
            setIsProcessingPayPal(false);
            setIsPlacingOrder?.(false);
            const message = err?.response?.data?.message || err?.message || 'PayPal payment could not be completed. Please try again.';
            setPaypalError(message);
          }
        },
        onError: () => {
          setPaypalError('PayPal payment failed. Please try again.');
          // Cancel the pending order in backend
          if (pendingPayPalOrderIdRef.current) {
            apiCancelPayPalOrder(pendingPayPalOrderIdRef.current).catch(() => {});
            pendingPayPalOrderIdRef.current = null;
          }
          paypalRenderedRef.current = false;
          setPaypalRenderCycle((prev) => prev + 1);
        },
        onCancel: () => {
          setPaypalError('PayPal payment was cancelled.');
          // Cancel the pending order in backend
          if (pendingPayPalOrderIdRef.current) {
            apiCancelPayPalOrder(pendingPayPalOrderIdRef.current).catch(() => {});
            pendingPayPalOrderIdRef.current = null;
          }
          paypalRenderedRef.current = false;
          setPaypalRenderCycle((prev) => prev + 1);
        },
      })
      .render(container);

    paypalRenderedRef.current = true;
  }, [
    deliveryAddressId,
    billingAddressId,
    couponCode,
    isGuest,
    shippingDates,
    guestCartData,
    dispatch,
    router,
    paymentType,
    paypalReady,
    paypalRenderCycle,
    setIsPlacingOrder,
  ]);

  // ─── Affirm Effects ───────────────────────────────────────────────

  // Clear Affirm error after 5 seconds
  useEffect(() => {
    if (!affirmError) {
      return;
    }
    const timer = window.setTimeout(() => setAffirmError(''), 5000);
    return () => window.clearTimeout(timer);
  }, [affirmError]);

  // Load Affirm.js SDK when Affirm payment type is selected
  useEffect(() => {
    if (paymentType !== 'affirm') {
      return;
    }

    if (!affirmPublicKey) {
      setAffirmError('Affirm public key is missing. Please add NEXT_PUBLIC_AFFIRM_PUBLIC_KEY in env.');
      return;
    }

    if (!(window as any)._affirm_config) {
      (window as any)._affirm_config = {
        public_api_key: process.env.NEXT_PUBLIC_AFFIRM_PUBLIC_KEY,
        script: affirmJsUrl,
      };
    }

    if (!document.querySelector('script[data-affirm-sdk]')) {
      const l = function (a: any, b: any, c: any) {
        return function (...args: unknown[]) {
          (a[b] as any)._.push([c, args]);
        };
      };
      const m = window as any;
      const cfg = (window as any)._affirm_config;
      const b: any = m['affirm'] || {};
      b['checkout'] = l(b, 'checkout', 'set');
      const f = b['checkout'];
      b['affirm'] = function (...args: unknown[]) {
        f.apply(b, args);
      };
      b['affirm']._ = [];
      f._ = [];
      b['affirm_' + 'checkout'] = l(b, 'affirm', 'init');
      b['ui'] = l(b, 'ui', 'set');
      b['ready'] = l(b, 'ready', 'set');

      const k = document.createElement('script');
      const p = document.getElementsByTagName('script')[0];
      k.async = true;
      k.src = cfg.script;
      k.dataset.affirmSdk = 'true';
      p.parentNode!.insertBefore(k, p);
      k.onload = () => setAffirmReady(true);
      m['affirm'] = b;
    } else {
      // SDK already loaded from PDP page
      setAffirmReady(true);
    }
  }, [paymentType, affirmPublicKey, affirmJsUrl]);

  // ─── Affirm Checkout Handler ──────────────────────────────────────

  const handleAffirmCheckout = async () => {
    setAffirmError('');
    setIsProcessingAffirm(true);

    try {
      // 1. Create checkout on backend (calculates total server-side, creates pending order)
      const orderData: any = {
        delivery_address: deliveryAddressId,
        billing_address: billingAddressId,
        coupon_code: couponCode || undefined,
        start_shipping_date: shippingDates?.start,
        end_shipping_date: shippingDates?.end,
      };

      if (guestCartData?.length > 0) {
        orderData.updatedCartProducts = guestCartData;
      }

      const res: any = await apiCreateAffirmCheckout(orderData);
      const responseData = res?.data?.data;
      const affirmCheckoutData = responseData?.affirm_checkout_data;
      const pendingOrderId = responseData?.pending_order_id;

      if (!affirmCheckoutData) {
        throw new Error('Failed to create Affirm checkout');
      }

      pendingAffirmOrderIdRef.current = pendingOrderId;

      // 2. Open Affirm modal using the checkout data from backend
      const affirm = (window as any).affirm;
      const checkoutDataWithModal = {
        ...affirmCheckoutData,
        metadata: {
          ...affirmCheckoutData.metadata,
          mode: 'modal',
        },
      };
      affirm.checkout(checkoutDataWithModal);
      affirm.checkout.open({
        onFail: () => {
          setIsProcessingAffirm(false);
          setAffirmError('Affirm checkout failed. Please try again.');
          if (pendingAffirmOrderIdRef.current) {
            apiCancelAffirmOrder(pendingAffirmOrderIdRef.current).catch(() => {});
            pendingAffirmOrderIdRef.current = null;
          }
        },
        onSuccess: async (data: any) => {
          setIsProcessingAffirm(true);
          setIsPlacingOrder?.(true);
          try {
            const res: any = await apiCaptureAffirmCharge({
              checkout_token: data.checkout_token,
              order_id: pendingOrderId,
            });
            const responseData = res?.data?.data;

            // Clear frontend cart
            dispatch(clearCartProducts());
            localStorage.removeItem('cartItems');

            // Extract order ID and redirect
            const orderId = responseData?.order?.order_id || pendingOrderId;

            // Store guest order details if needed
            if (responseData?.is_guest && responseData?.guestUserOrderDetails) {
              sessionStorage.setItem(`majesca_guest_order_${orderId}`, JSON.stringify(responseData.guestUserOrderDetails));
            }

            pendingAffirmOrderIdRef.current = null;
            router.push(`/ordersuccesfull?order_id=${orderId}`);
          } catch (err: any) {
            setIsProcessingAffirm(false);
            setIsPlacingOrder?.(false);
            const message = err?.response?.data?.message || err?.message || 'Affirm payment could not be completed. Please try again.';
            setAffirmError(message);
          }
        },
      });

      // Delay hiding the overlay so it stays visible while Affirm modal loads in the background
      setTimeout(() => setIsProcessingAffirm(false), 2000);
    } catch (err: any) {
      setIsProcessingAffirm(false);
      const message = err?.response?.data?.message || err?.message || 'Failed to start Affirm checkout.';
      setAffirmError(message);
    }
  };

  return (
    <>
      {/* PayPal processing overlay */}
      {isProcessingPayPal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white px-8 py-6 rounded-sm text-center shadow-lg">
            <div className="animate-spin h-8 w-8 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-[14px] uppercase tracking-[1.5px] text-[#5b5b5b] font-sans">Processing payment...</p>
            <p className="text-[12px] text-gray-400 mt-1 font-sans">Please don&apos;t close this page</p>
          </div>
        </div>
      )}

      {/* Affirm processing overlay */}
      {isProcessingAffirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white px-8 py-6 rounded-sm text-center shadow-lg">
            <div className="animate-spin h-8 w-8 border-2 border-secondary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-[14px] uppercase tracking-[1.5px] text-[#5b5b5b] font-sans">Processing payment...</p>
            <p className="text-[12px] text-gray-400 mt-1 font-sans">Please don&apos;t close this page</p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-end gap-5 lg:gap-5">
        {/* <div className="flex flex-col items-start md:-mb-6 sm:-mb-3 gap-4 self-stretch">
          <Text as="p" size="text5xl" className="text-black-900 font-normal uppercase">
            payment
          </Text>
        </div> */}
        <div className="w-full flex flex-col gap-4">
          {/* Credit Or Debit Card option */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setPaypalError('');
              setAffirmError('');
              setPaymentType('card');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setPaypalError('');
                setAffirmError('');
                setPaymentType('card');
              }
            }}
            className={`w-full border p-4 md:p-3 cursor-pointer transition-colors ${paymentType === 'card' ? 'border-black-900 border-[2px]' : 'border-gray-200'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio checked={paymentType === 'card'} className="pointer-events-none" />
                <Text as="p" size="textlg" className="text-black-900 text-[18px] font-normal">
                  Credit Or Debit Card
                </Text>
              </div>
              <div className="flex items-center gap-2">
                {/* Visa */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="md:h-5 h-7 w-auto">
                  <rect width="48" height="32" rx="4" fill="#1A1F71" />
                  <text
                    x="24"
                    y="20"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="14"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    fontStyle="italic"
                  >
                    VISA
                  </text>
                </svg>
                {/* Mastercard */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="md:h-5 h-7 w-auto">
                  <rect width="48" height="32" rx="4" fill="#252525" />
                  <circle cx="19" cy="16" r="8" fill="#EB001B" />
                  <circle cx="29" cy="16" r="8" fill="#F79E1B" />
                  <path d="M24 9.8a8 8 0 0 1 0 12.4 8 8 0 0 1 0-12.4z" fill="#FF5F00" />
                </svg>
                {/* American Express */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="md:h-5 h-7 w-auto">
                  <rect width="48" height="32" rx="4" fill="#2E77BC" />
                  <text x="24" y="14" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="Arial, sans-serif">
                    AMERICAN
                  </text>
                  <text x="24" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="Arial, sans-serif">
                    EXPRESS
                  </text>
                </svg>
                {/* Discover */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" className="md:h-5 h-7 w-auto">
                  <rect width="48" height="32" rx="4" fill="#F1F1F1" />
                  <text x="24" y="18" textAnchor="middle" fill="#FF6000" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">
                    DISCOVER
                  </text>
                  <circle cx="36" cy="15" r="5" fill="#FF6000" opacity="0.3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pay with PayPal option */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setPaypalError('');
              setAffirmError('');
              setPaymentType('paypal');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setPaypalError('');
                setAffirmError('');
                setPaymentType('paypal');
              }
            }}
            className={`w-full border p-4 md:p-3 cursor-pointer transition-colors ${paymentType === 'paypal' ? 'border-black-900 border-[2px]' : 'border-gray-200'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio checked={paymentType === 'paypal'} className="pointer-events-none" />
                <Text as="p" size="textlg" className="text-black-900 text-[18px] font-normal">
                  Pay with PayPal
                </Text>
              </div>
              <img src="/images/paypal_logo.png" alt="PayPal" className="h-6 object-contain" />
            </div>
          </div>

          {/* Buy Now, Pay Later (Affirm) option — only available for USD */}
          {(typeof window === 'undefined' || (localStorage.getItem('currency') || 'USD') === 'USD') && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setPaypalError('');
                setAffirmError('');
                setPaymentType('affirm');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setPaypalError('');
                  setAffirmError('');
                  setPaymentType('affirm');
                }
              }}
              className={`w-full border p-4 md:p-3 cursor-pointer transition-colors ${paymentType === 'affirm' ? 'border-black-900 border-[2px]' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Radio checked={paymentType === 'affirm'} className="pointer-events-none" />
                  <Text as="p" size="textlg" className="text-black-900 text-[18px] font-normal">
                    Buy Now, Pay Later
                  </Text>
                </div>
                <img src="/images/affirm_logo.svg" alt="Affirm" className="h-6 object-contain" />
              </div>
            </div>
          )}

          {/* Card details form */}
          {paymentType === 'card' && (
            <Form
              layout="vertical"
              onFinish={(values) => {
                handlePlaceOrder({
                  ...values,
                  payment_method: 2,
                  cardNumber: values?.cardNumber?.replace(/\s/g, ''),
                });
              }}
              className="flex flex-col gap-5 sm:gap-2 self-stretch"
            >
              <div className="flex flex-col gap-4 lg:gap-4 md:gap-[10px] sm:mb-2">
                <div className="flex">
                  <Text as="p" size="textlg" className="text-black-900 text-[20px] font-normal">
                    Enter Card Detail
                  </Text>
                </div>
              </div>
              <div className="flex flex-col ">
                <div className="grid grid-cols-2 gap-8 md:gap-4 sm:grid-col-1">
                  <Form.Item
                    name="cardName"
                    label="Name on Card"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter the name on your card!',
                      },
                      {
                        validator: (_, value) => {
                          if (value) {
                            if (value.trim().length > 0) {
                              return Promise.resolve();
                            } else {
                              return Promise.reject(new Error('Name cannot be just blank spaces!'));
                            }
                          } else {
                            return Promise.reject();
                          }
                        },
                      },
                    ]}
                  >
                    <Input placeholder="Name on Card" />
                  </Form.Item>
                  <Form.Item
                    name="cardNumber"
                    normalize={(value) => {
                      if (!value) {
                        return '';
                      }
                      const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
                      return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
                    }}
                    label="Card Number"
                    rules={[{ required: true, message: 'Please enter your card number!' }]}
                  >
                    <Input
                      placeholder="Card Number"
                      inputMode="numeric"
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      maxLength={19}
                    />
                  </Form.Item>
                </div>
                <div className="grid grid-cols-2 gap-8 md:gap-4 sm:grid-col-1">
                  <Form.Item
                    name="expiryDate"
                    label="Expiry Date"
                    normalize={(value) => {
                      if (!value) {
                        return '';
                      }
                      value = value.replace(/\D/g, '');

                      if (value.length > 2) {
                        value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
                      }

                      return value.slice(0, 5);
                    }}
                    rules={[
                      { required: true, message: 'Please enter the expiry date!' },
                      {
                        pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
                        message: 'Please enter a valid expiry date (MM/YY)',
                      },
                      {
                        validator: (_, value) => {
                          if (value) {
                            const [month, year] = value.split('/').map(Number);
                            const currentMonth = dayjs().month() + 1;
                            const currentYear = dayjs().year() % 100;

                            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                              return Promise.reject(new Error('The expiry date cannot be in the past'));
                            }
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input placeholder="MM/YY" maxLength={5} inputMode="numeric" />
                  </Form.Item>
                  <Form.Item name="cvv" label="CVV" rules={[{ required: true, message: 'Please enter your CVV!' }]}>
                    <Input
                      placeholder="CVV"
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      inputMode="numeric"
                      maxLength={4}
                    />
                  </Form.Item>
                </div>
              </div>
              {error && <p className="text-red-500">{'*' + error}</p>}
              <Form.Item>
                <div className="flex w-full">
                  <Button
                    htmlType="submit"
                    type="default"
                    loading={loading}
                    className="!text-text_w !bg-secondary w-full !h-[44px] md:!h-[38px] flex flex-row items-center justify-center text-center uppercase tracking-[2.00px]"
                  >
                    Pay {formatCurrency(totalAmount)}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          )}

          {/* Affirm payment section */}
          {paymentType === 'affirm' && (
            <div className="w-full flex flex-col gap-4">
              <div className="flex w-full">
                <Button
                  type="default"
                  loading={isProcessingAffirm}
                  disabled={!affirmReady || isProcessingAffirm}
                  onClick={handleAffirmCheckout}
                  className="!text-text_w !bg-secondary w-full !h-[44px] md:!h-[38px] flex flex-row items-center justify-center text-center uppercase tracking-[2.00px]"
                >
                  {affirmReady ? `Pay ${formatCurrency(totalAmount)}` : 'Loading Affirm...'}
                </Button>
              </div>
              {affirmError && <p className="text-red-500">{'*' + affirmError}</p>}
            </div>
          )}

          {/* PayPal payment section */}
          {paymentType === 'paypal' && (
            <div className="w-full flex flex-col gap-4">
              <div className="w-full">
                <div ref={paypalContainerRef} />
              </div>
              <p className="text-[13px] text-gray-600">
                Do not switch tabs while PayPal is opening. If the popup is blocked, allow popups and click PayPal again.
              </p>
              {paypalError && <p className="text-red-500">{'*' + paypalError}</p>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Payment;
