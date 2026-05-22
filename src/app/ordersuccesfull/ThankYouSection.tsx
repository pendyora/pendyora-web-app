/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { Suspense, useEffect, useMemo } from 'react';

import { Image } from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LuLoader } from 'react-icons/lu';

import ProductName from '@/components/CartProductDetails/ProductName';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCities, fetchCountries, fetchStates } from '@/store/slices/Address/addressSlice';
import { fetchGetOrdeDetails, setGuestUserOrderDetails } from '@/store/slices/Order/orderSlice';
import { formatCurrency } from '@/utils/common';
import { trackPurchase } from '@/utils/metaPixel';

import { Heading } from '../../components/Heading';
import { Img } from '../../components/Img';
import JewelryDetails from '../../components/JewelryDetails';
import { Text } from '../../components/Text';

export default function ThankYouSection() {
  const { orderDetails, loading, status, guestUserOrderDetails } = useAppSelector((state) => state.order);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth.auth);
  const { countries, states, cities } = useAppSelector((state) => state.address);
  const searchParams = useSearchParams();
  const id = searchParams.get('order_id');
  const router = useRouter();

  const orderIdMatches = Boolean(
    id &&
    orderDetails &&
    (orderDetails.order_id === id ||
      orderDetails.orderId === id ||
      String(orderDetails.order_id) === String(id) ||
      String(orderDetails.orderId) === String(id)),
  );
  const verifiedUser =
    Boolean(guestUserOrderDetails) ||
    (Boolean(user) && orderIdMatches && orderDetails?.user_id == user?.id) ||
    (Boolean(!user) && orderIdMatches && status === 'fulfilled');

  useEffect(() => {
    if (!id) {
      return router.push(`/`);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    if (user) {
      dispatch(fetchGetOrdeDetails(id));
      return;
    }
    try {
      const raw = sessionStorage.getItem(`majesca_guest_order_${id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch(setGuestUserOrderDetails(parsed));
        return;
      }
    } catch {
      /* ignore */
    }
    dispatch(fetchGetOrdeDetails(id));
  }, [id, user, dispatch]);

  useEffect(() => {
    if (orderDetails?.billingAddressDetails?.country_id) {
      dispatch(fetchCountries()).then(() => dispatch(fetchStates(orderDetails?.billingAddressDetails?.country_id)));
    }
    if (orderDetails?.billingAddressDetails?.state_id) {
      dispatch(fetchCities(orderDetails?.billingAddressDetails?.state_id));
    }
  }, [orderDetails]);
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_NODE_ENV === 'production' && orderDetails?.order_id) {
      (window as any).gtag?.('event', 'conversion', {
        send_to: 'AW-17230998076/MKZ6CIbEuoAcELzUsJhA',
        value: orderDetails?.after_gst_amount ?? 0,
        currency: orderDetails?.currency_code ?? 'USD',
        transaction_id: orderDetails?.order_id ?? '',
      });
      const contentIds =
        orderDetails?.orderDetails
          ?.map((item: any) => String(item?.skuOrderItems?.id ?? item?.jewelryOrderItems?.id ?? item?.jewelry_id))
          .filter(Boolean) ?? [];
      const numItems = orderDetails?.orderDetails?.reduce((s: number, item: any) => s + (item?.count ?? 1), 0) ?? 0;
      trackPurchase({
        value: orderDetails?.after_gst_amount ?? 0,
        currency: orderDetails?.currency_code ?? 'USD',
        order_id: orderDetails?.order_id ?? '',
        content_ids: contentIds.length ? contentIds : undefined,
        num_items: numItems,
      });
    }
  }, [orderDetails]);
  const { pricesByCategories, overallCategoriesPrice, groupPriceNew, discountedTotalPrice } = useMemo(() => {
    let overallCategoriesPrice = 0;
    let discountedTotalPrice = 0;

    // Group and calculate total prices by categories considering the quantity
    const groupedPrices = orderDetails?.orderDetails?.reduce((acc: any, item: any) => {
      const type = item?.jewelryOrderItems?.jewelrySubType?.group;
      const diamondData = item?.diamondDetails
        ? {
            name: item?.diamondDetails?.fullTitle,
            price: item?.diamondDetails?.price,
          }
        : null;
      const price = item?.jewelry_coupon_price
        ? item?.jewelry_discount_price
          ? item?.jewelry_discount_price
          : item?.jewelry_price
        : item?.skuOrderItems?.selling_price;
      const discounted_price = item?.jewelry_coupon_price
        ? item?.jewelry_coupon_price
        : item?.jewelry_discount_price
          ? item?.jewelry_discount_price
          : item?.jewelry_price;
      const count = item?.count || 1; // Default to 1 if count is not specified

      if (!acc[type]) {
        acc[type] = 0;
      }

      // Multiply price by the count of the item
      const totalItemPrice = diamondData ? price * count + diamondData?.price : price * count;
      const totalItemDiscountedPrice = diamondData ? discounted_price * count + diamondData?.price : discounted_price * count;
      acc[type] += totalItemPrice;
      overallCategoriesPrice += totalItemPrice;
      discountedTotalPrice += totalItemDiscountedPrice;
      return acc;
    }, {});
    const groupPriceNew = orderDetails?.orderDetails?.map((item: any) => {
      // const appraisalPrice = item?.is_appraisal ? item?.appraisal_amount : 0;
      // const warrantyPrice = item?.selectedYearValue?.price ? item?.selectedYearValue?.price : item?.warranty_amount;
      const ringPrice = item?.ring_size_rate ?? null;
      const diamondData = item?.ordered_diamond_details
        ? {
            name: item?.ordered_diamond_details?.fullTitle,
            price: ringPrice ? item?.ordered_diamond_details?.price + ringPrice : item?.ordered_diamond_details?.price,
          }
        : null;
      const new_price = item?.jewelry_coupon_price
        ? item?.jewelry_discount_price
          ? item?.jewelry_discount_price
          : item?.jewelry_price
        : item?.jewelry_price;
      const new_discounted_price = item?.jewelry_coupon_price
        ? item?.jewelry_coupon_price
        : item?.jewelry_discount_price
          ? item?.jewelry_discount_price
          : item?.jewelry_price;
      // + appraisalPrice + warrantyPrice + (item.engravingText != '' ? item?.engraving_price : 0)
      // + appraisalPrice + warrantyPrice
      // + appraisalPrice + warrantyPrice + (item.engravingText != '' ? item?.engraving_price : 0)
      // + appraisalPrice + warrantyPrice + (item.engravingText != '' ? item?.engraving_price : 0)
      return {
        ...item,
        name: item?.jewelryOrderItems?.title,
        price: ringPrice ? new_price + ringPrice : new_price,
        discounted_price: new_discounted_price ? (ringPrice ? new_discounted_price + ringPrice : new_discounted_price) : null,
        count: item?.count || 1,
        diamondData: diamondData,
      };
    });

    const pricesByCategories = Object?.entries(groupedPrices ? groupedPrices : []).map(([name, price]) => ({ name, price }));

    return {
      pricesByCategories,
      overallCategoriesPrice,
      groupPriceNew,
      discountedTotalPrice,
    };
  }, [orderDetails]);
  useEffect(() => {
    const handleBackNavigation = () => {
      router.push('/all');
    };

    window.addEventListener('popstate', handleBackNavigation);

    return () => {
      window.removeEventListener('popstate', handleBackNavigation);
    };
  }, [router]);

  return (
    <>
      {/* thank you section */}

      {verifiedUser && status == 'fulfilled' ? (
        <div className="mb-5 flex flex-col items-center">
          {orderDetails?.order_id && process.env.NEXT_PUBLIC_NODE_ENV === 'production' && (
            <div
              dangerouslySetInnerHTML={{
                __html: `
              <amp-analytics type="gtag" data-credentials="include">
                <script type="application/json">
                  {
                    "vars": {
                      "gtag_id": "AW-172306",
                      "config": {
                        "AW-17230998076": {
                          "groups": "default"
                        }
                      }
                    },

                    { "on": "visible", "vars": { "event_name": "conversion", "value": 1.0, "currency": "USD", "transaction_id": "", "send_to": ["AW-17230998076/8ggHCNmxs-IaELzUsJhA"] }
                    "triggers": {
                      "trackPageview":{
                        "on":"visible",
                        "request":"pageview"
                        "vars":{
                          "event_name":"conversion",
                          "value":"${orderDetails?.after_gst_amount}",
                          "currency":"${orderDetails?.currency_code} USD",
                          "transaction_id":"${orderDetails?.order_id}",
                          "send_to":["AW-17230998076/8ggHCNmxs-IaELzUsJhA"]
                        }
                      }
                    }
                  }
                </script>
              </amp-analytics>`,
              }}
            />
          )}

          <div className="mx-auto flex w-full max-w-[1600px] 2xl:px-[160px] xl:px-28 lg:px-20 flex-col gap-10 sm:gap-4 sm:px-3 md:px-5">
            <div className="mx-60 flex flex-col gap-1.5 md:mx-0 lg:mx-auto">
              <div className="flex flex-col items-center gap-[26px] sm:gap-4 md:mx-0">
                <Image preview={false} src="/images/img_group.svg" alt="Primary Image" className="h-[136px] w-[136px] sm:!h-12 sm:!w-12" />
                <div className="flex flex-col items-center gap-1 self-stretch">
                  <Text
                    as="p"
                    size="text5xl"
                    className="text-[40px] font-normal uppercase tracking-[0.80px] text-black-900 xl:text-[33px] lg:text-[34px] md:text-[34px] sm:!text-[18px]"
                  >
                    Thank you!
                  </Text>
                  <Text
                    as="p"
                    size="text5xl"
                    className="text-[40px] text-center sm:text-center font-normal uppercase tracking-[0.80px] text-black-900 2xl:text-[34px] xl:text-[30px] lg:text-[34px] md:text-[34px] sm:!text-[18px]"
                  >
                    Your Order has been received
                  </Text>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-8 sm:flex-col ">
              <div className="flex flex-1 sm:flex-none flex-col items-start gap-10 md:gap-[10px] sm:w-full">
                <Text as="p" size="textxl" className="text-[22px] font-normal uppercase md:mt-4 tracking-[0.44px] text-black-900 lg:text-[20px]">
                  Products
                </Text>

                <div className="flex flex-col gap-[22px] self-stretch">
                  <Suspense fallback={<div>Loading feed...</div>}>
                    {orderDetails?.orderDetails?.length > 0
                      ? orderDetails?.orderDetails?.map((d: any, index: number) => (
                          <JewelryDetails productDetails={d} {...d} key={'cartList' + index} />
                        ))
                      : null}
                  </Suspense>
                </div>
              </div>
              <div className="flex w-[38%] lg:w-[47%] md:w-[50%] flex-col gap-6 self-center sm:w-full">
                <div className="flex flex-col items-center gap-[38px] md:gap-[10px] bg-gray-50 p-[30px] lg:p-5 md:p-4 sm:p-4 sm:px-3">
                  <Text
                    as="p"
                    size="textxl"
                    className="text-[22px] font-normal uppercase tracking-[0.44px] text-black-900 md:text-[20px] lg:text-[18px]"
                  >
                    order information
                  </Text>
                  <div className="flex flex-col gap-[34px] self-stretch sm:gap-4">
                    <div className="flex flex-col md:gap-[16px] gap-5 sm:gap-3">
                      {groupPriceNew?.map((category: any, index: number) => (
                        <div
                          key={`price_${index}`}
                          className={`flex flex-col gap-1 border-b border-gray-400 last:border-0 pb-4 sm:pb-3 ${category?.diamondData ? '' : ''}`}
                        >
                          <div className="grid grid-cols-3 md:grid md:grid-cols-3 justify-between gap-5 md:gap-2 sm:gap-3">
                            <div className="col-span-2">
                              <ProductName productName={category?.name} count={category?.count} />
                            </div>
                            <div className="flex h-fit md:gap-1 col-span-1 items-center gap-2 justify-end">
                              <Text
                                as="p"
                                size="textlg"
                                className={`!font-castoro font-normal tracking-[0.20px] text-gray-800 lg:text-[17px] text-nowrap ${
                                  category?.discounted_price && category?.discounted_price !== category?.price
                                    ? 'line-through !text-gray-400 !text-[12px] sm:!text-[12px]'
                                    : 'sm:!text-[14px]'
                                }`}
                              >
                                {formatCurrency(Math.ceil(category?.price * category?.count))}
                              </Text>
                              {category?.discounted_price && category?.discounted_price !== category?.price && (
                                <Text
                                  as="p"
                                  size="textlg"
                                  className="!font-castoro font-normal tracking-[0.20px] text-gray-800 lg:text-[17px] md:text-[16px] text-nowrap sm:!text-[14px]"
                                >
                                  {formatCurrency(Math.ceil(category?.discounted_price * category?.count))}
                                </Text>
                              )}
                            </div>
                          </div>
                          {category?.is_appraisal && (
                            <div className="grid grid-cols-3 gap-5">
                              <div className="col-span-2 flex items-center">
                                <ProductName productName={'Appraisal'} count={category?.count} />
                              </div>
                              <div className="flex flex-row col-span-1 flex-wrap justify-end items-center gap-0">
                                <Text
                                  as="p"
                                  size="textlg"
                                  className={`!font-castoro text-[18px] text-right font-normal tracking-[0.20px] text-gray-800 lg:text-[17px] md:text-[16px]  'sm:!text-[14px]'
                            }`}
                                >
                                  {formatCurrency(Math.ceil(category?.appraisal_amount * (category?.count ?? 1)))}
                                </Text>
                              </div>
                            </div>
                          )}
                          {category?.is_warranty > 0 && (
                            <div className="grid grid-cols-3 gap-5">
                              <div className="col-span-2 flex items-center">
                                <ProductName productName={'Warranty'} count={category?.count} />
                              </div>
                              <div className="flex flex-row col-span-1 flex-wrap justify-end items-center gap-0">
                                <Text
                                  as="p"
                                  size="textlg"
                                  className={`!font-castoro text-[18px] text-right font-normal tracking-[0.20px] text-gray-800 lg:text-[17px] md:text-[16px]  'sm:!text-[14px]'
                            }`}
                                >
                                  {formatCurrency(Math.ceil((category?.warranty_amount ?? 0) * (category?.count ?? 1)))}
                                </Text>
                              </div>
                            </div>
                          )}
                          {category?.engravingText?.Text != '' && (
                            <div className="grid grid-cols-3 gap-5">
                              <div className="col-span-2 flex items-center">
                                <ProductName productName={'Engraving'} count={category?.count} />
                              </div>
                              <div className="flex flex-row col-span-1 flex-wrap justify-end items-center gap-0">
                                <Text
                                  as="p"
                                  size="textlg"
                                  className={`!font-castoro text-[18px] text-right font-normal tracking-[0.20px] text-gray-800 lg:text-[17px] md:text-[16px]  'sm:!text-[14px]'
                            }`}
                                >
                                  {formatCurrency(Math.ceil((category?.engraving_price ?? 0) * (category?.count ?? 1)))}
                                </Text>
                              </div>
                            </div>
                          )}
                          {category?.diamondData && (
                            <div className="grid grid-cols-3 gap-5">
                              <div className="col-span-2 flex items-center">
                                <ProductName productName={category?.diamondData?.name} />
                              </div>
                              <div className="flex flex-row col-span-1 justify-end items-center gap-2">
                                {category?.diamondData?.price && (
                                  <Text
                                    as="p"
                                    size="textlg"
                                    className="!font-castoro font-normal tracking-[0.20px] text-gray-800 lg:text-[17px] md:text-[16px] text-nowrap sm:!text-[14px]"
                                  >
                                    {formatCurrency(category?.diamondData?.price)}
                                  </Text>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {orderDetails?.gst_percentage > 0 && (
                        <div className="flex flex-wrap  border-gray-400  justify-between gap-5">
                          <Text
                            as="p"
                            size="textlg"
                            className="font-normal tracking-[0.40px] text-gray-800 lg:text-[17px] md:text-[16px] sm:!text-[13px]"
                          >
                            Tax
                          </Text>
                          <Text
                            as="p"
                            size="textlg"
                            className="font-normal tracking-[0.40px] text-gray-800 lg:text-[17px] md:text-[16px] sm:!text-[14px]"
                          >
                            {`${orderDetails?.gst_percentage}%`}
                          </Text>
                        </div>
                      )}
                      <div className="flex flex-wrap  border-gray-400  justify-between gap-5">
                        <Text
                          as="p"
                          size="textlg"
                          className="font-normal tracking-[0.40px] text-gray-800 lg:text-[17px] md:text-[16px] sm:!text-[13px]"
                        >
                          Shipping Charge
                        </Text>
                        <Text
                          as="p"
                          size="textlg"
                          className="font-normal tracking-[0.40px] text-gray-800 lg:text-[17px] md:text-[16px] sm:!text-[14px]"
                        >
                          Free
                        </Text>
                      </div>
                      {orderDetails?.total_coupon_price && (
                        <div className="flex flex-wrap border-t border-gray-400  pt-5 justify-between gap-5">
                          <Text
                            as="p"
                            size="textlg"
                            className="font-normal tracking-[0.20px] text-gray-800 lg:text-[17px] md:text-[16px] sm:!text-[13px]"
                          >
                            Applied Promocode
                          </Text>
                          <Text
                            as="p"
                            size="textlg"
                            className="!font-castoro font-normal tracking-[0.20px] text-gray-800 lg:text-[17px] md:text-[16px] sm:!text-[13px]"
                          >
                            {'- '}
                            {formatCurrency(
                              (orderDetails?.total_discount_price ? orderDetails?.total_discount_price : orderDetails?.total_price) -
                                orderDetails?.total_coupon_price,
                            )}
                          </Text>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap justify-between gap-5">
                      <Heading as="h6" size="headingxs" className="text-[20px] font-medium uppercase tracking-[0.48px] !text-black lg:text-[16px]">
                        Total Price
                      </Heading>
                      <div className="flex h-fit items-center gap-2">
                        <Heading
                          as="h6"
                          size="headingxs"
                          className={`!font-castoro text-[20px] font-medium tracking-[0.48px] !text-black lg:text-[16px] ${
                            orderDetails?.total_coupon_price || orderDetails?.total_discount_price
                              ? 'line-through !text-gray-400 !text-[16px] md:!text-[14px]'
                              : ''
                          }`}
                        >
                          {/* {formatCurrency(orderDetails?.after_gst_amount)} */}
                          {orderDetails?.total_coupon_price
                            ? formatCurrency(orderDetails?.total_discount_price)
                            : formatCurrency(orderDetails?.total_price)}
                        </Heading>
                        {(orderDetails?.total_coupon_price || orderDetails?.total_discount_price) && (
                          <Heading
                            as="h6"
                            size="headingxs"
                            className="!font-castoro text-[20px] font-medium tracking-[0.48px] !text-black md:text-[16px] lg:text-[16px]"
                          >
                            {orderDetails?.total_coupon_price
                              ? formatCurrency(orderDetails?.after_gst_amount ? orderDetails?.after_gst_amount : orderDetails?.total_coupon_price)
                              : orderDetails?.total_discount_price
                                ? formatCurrency(orderDetails?.after_gst_amount ? orderDetails?.after_gst_amount : orderDetails?.total_discount_price)
                                : formatCurrency(orderDetails?.after_gst_amount ? orderDetails?.after_gst_amount : orderDetails?.total_price)}
                          </Heading>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-3 bg-gray-50 md:px-4 px-[30px] py-3.5 sm:px-4">
                  <Text
                    as="p"
                    size="textmd"
                    className="text-[18px] font-medium uppercase tracking-[0.36px] text-black-900 lg:text-[16px] md:text-[16px]"
                  >
                    Arrives
                  </Text>
                  <Text as="p" size="textlg" className="font-normal tracking-[0.40px] text-gray-800 lg:text-[17px] md:text-[16px]">
                    {`${dayjs(orderDetails?.start_shipping_date).format(`MMMM DD, YYYY`)}  -  ${dayjs(orderDetails?.end_shipping_date).format(`MMMM DD, YYYY`)}`}
                  </Text>
                </div>
                <div className="flex flex-col gap-[22px] md:gap-[14px] bg-gray-50 p-[30px] md:p-4 sm:p-4">
                  <div className="flex flex-col items-start gap-6 md:gap-[14px]">
                    <Text
                      as="p"
                      size="textmd"
                      className="text-[18px] font-medium uppercase tracking-[0.36px] text-black-900 lg:text-[15px]  md:text-[16px]"
                    >
                      contact details
                    </Text>
                    <div className="flex flex-col items-start gap-2 self-stretch">
                      <Text as="p" size="textlg" className="font-normal tracking-[0.40px] text-gray-800 lg:text-[17px]  md:!text-[14px]">
                        Email : {orderDetails?.orderUserDetails?.email}
                      </Text>
                      <Text as="p" size="textlg" className="font-normal tracking-[0.40px] text-gray-800 lg:text-[17px]  md:!text-[14px]">
                        Phone : {orderDetails?.billingAddressDetails?.mobile ?? '---'}
                      </Text>
                    </div>
                  </div>
                  <div className="h-[1px] bg-gray-400" />

                  <div className="flex flex-col items-start gap-[22px] md:gap-[14px]">
                    <Text
                      as="p"
                      size="textmd"
                      className="text-[18px] font-medium uppercase tracking-[0.36px] text-black-900 lg:text-[15px]  md:!text-[16px]"
                    >
                      Delivery address
                    </Text>
                    <div className="mr-[22px] flex flex-col items-start gap-1.5 self-stretch md:mr-0">
                      <Text as="p" size="textlg" className="font-medium tracking-[0.40px] text-gray-600 lg:text-[17px] capitalize md:!text-[14px]">
                        {orderDetails?.deliveryAddressDetails?.first_name} {orderDetails?.deliveryAddressDetails?.last_name}
                      </Text>
                      <div className="flex flex-col items-start justify-center gap-0.5 self-stretch">
                        <Text as="p" size="textlg" className="font-normal tracking-[0.40px] text-gray-600 lg:text-[17px] md:!text-[14px]">
                          {orderDetails?.deliveryAddressDetails?.email}
                        </Text>
                        <Text as="p" size="textlg" className="font-normal tracking-[0.40px] text-gray-600 lg:text-[17px] capitalize md:!text-[14px]">
                          {orderDetails?.deliveryAddressDetails?.address1}
                          <br />
                          {(() => {
                            const cityName = cities.find((el: any) => el.id === orderDetails?.deliveryAddressDetails?.city_id)?.name;
                            const stateName = states.find((el: any) => el.id === orderDetails?.deliveryAddressDetails?.state_id)?.name;
                            const countryName = countries.find((el: any) => el.id === orderDetails?.deliveryAddressDetails?.country_id)?.name;
                            return (
                              <>
                                {cityName ? `${cityName}, ` : ''}
                                {stateName},
                                <br />
                                {countryName} - {orderDetails?.deliveryAddressDetails?.postal_code}
                              </>
                            );
                          })()}
                        </Text>
                        <Text as="p" size="textlg" className="font-normal tracking-[0.40px] text-gray-600 lg:text-[17px] md:!text-[14px]">
                          {orderDetails?.deliveryAddressDetails?.mobile}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div className="h-[1px] bg-gray-400" />
                  <div className="flex flex-col items-start gap-[22px] md:gap-[14px]">
                    <Text
                      as="p"
                      size="textmd"
                      className="text-[18px] font-medium uppercase tracking-[0.36px] text-black-900 lg:text-[15px]  md:!text-[16px]"
                    >
                      billing address
                    </Text>
                    <div className="mr-[22px] flex flex-col items-start gap-1.5 self-stretch md:mr-0">
                      <Text as="p" size="textlg" className="font-medium tracking-[0.40px] text-gray-600 lg:text-[17px] capitalize md:!text-[14px]">
                        {orderDetails?.billingAddressDetails?.first_name} {orderDetails?.billingAddressDetails?.last_name}
                      </Text>
                      <div className="flex flex-col items-start justify-center gap-0.5 self-stretch">
                        <Text as="p" size="textlg" className="font-normal tracking-[0.40px] text-gray-600 lg:text-[17px] md:!text-[14px]">
                          {orderDetails?.billingAddressDetails?.email}
                        </Text>
                        <Text as="p" size="textlg" className="font-normal tracking-[0.40px] text-gray-600 lg:text-[17px] capitalize md:!text-[14px]">
                          {orderDetails?.billingAddressDetails?.address1}
                          <br />
                          {(() => {
                            const cityName = cities.find((el: any) => el.id === orderDetails?.billingAddressDetails?.city_id)?.name;
                            const stateName = states.find((el: any) => el.id === orderDetails?.billingAddressDetails?.state_id)?.name;
                            const countryName = countries.find((el: any) => el.id === orderDetails?.billingAddressDetails?.country_id)?.name;
                            return (
                              <>
                                {cityName ? `${cityName}, ` : ''}
                                {stateName},
                                <br />
                                {countryName} - {orderDetails?.billingAddressDetails?.postal_code}
                              </>
                            );
                          })()}
                        </Text>
                        <Text as="p" size="textlg" className="font-normal tracking-[0.40px] text-gray-600 lg:text-[17px] md:!text-[14px]">
                          {orderDetails?.billingAddressDetails?.mobile}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div className="h-[1px] bg-gray-400" />
                  <div className="flex flex-col items-start gap-6 md:gap-[10px]">
                    <Text as="p" size="textlg" className="font-medium uppercase tracking-[0.36px] text-black-900 lg:text-[15px] md:!text-[16px]">
                      payment details
                    </Text>
                    <div className="flex items-center gap-6 md:gap-[10px] self-stretch">
                      <Text as="p" size="textlg" className="font-normal tracking-[0.40px] text-gray-800 lg:text-[17px] md:!text-[16px]">
                        Payment Method:{' '}
                      </Text>
                      {orderDetails?.payment_method === 2 ? (
                        <Img src="img_group_1287.svg" alt="Credit Card Image" width={34} height={20} className="h-[20px]" />
                      ) : orderDetails?.payment_method === 3 ? (
                        <span>
                          PayPal
                          {orderDetails?.paypal_payer_email && (
                            <span className="text-[13px] text-gray-600 ml-2">({orderDetails.paypal_payer_email})</span>
                          )}
                        </span>
                      ) : orderDetails?.payment_method === 4 ? (
                        <span className="font-medium">Affirm</span>
                      ) : (
                        'Cash'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : !loading && status == 'fulfilled' ? (
        <div className="w-full flex justify-center items-center min-h-[80vh]">You dont have permission for this order.</div>
      ) : !loading && status == '' ? (
        <div className="w-full flex justify-center items-center min-h-[80vh]">
          Order details are available after logging in. Please&nbsp;
          <Link href="/login">
            <span className="underline hover:italic cursor-pointer">{`sign in`}</span>
          </Link>
          &nbsp; to continue.
        </div>
      ) : (
        <div className="w-full flex justify-center items-center min-h-[80vh]">
          <div className="w-full flex justify-center items-center">
            <LuLoader className="h-10 w-10 animate-spin" />
          </div>
        </div>
      )}
    </>
  );
}
