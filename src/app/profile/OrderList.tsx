'use client';
import React, { useEffect } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LuArrowLeft, LuDownload, LuLoader } from 'react-icons/lu';

import { Box, PanelHead, boxLink } from '@/components/Account/AccountShell';
import { Money, OrderTracker, StatusPill, orderDate } from '@/components/Account/orderBits';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchGetOrdeDetails } from '@/store/slices/Order/orderSlice';
import { formatCurrency } from '@/utils/common';

const FALLBACK = '/images/no_images.svg';
const imgOf = (item: any) => item?.skuOrderItems?.carat_images?.[0] || FALLBACK;

const STONE_TYPE: Record<string, string> = { N: 'Natural', L: 'Lab-grown', NG: 'Natural gemstone', LG: 'Lab-grown gemstone' };

/** Orders (design-mockups/account#orders): cards for every order; ?order=ID opens the detail view. */
export default function OrderList() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('order');
  return id ? <OrderDetail id={id} /> : <Orders />;
}

function Orders() {
  const { orderList, loading } = useAppSelector((state) => state.order);
  const orders: any[] = orderList ?? [];

  return (
    <>
      <PanelHead title="Orders" sub="Track, view and get help with your orders." />
      {loading && orders.length === 0 ? (
        <div className="grid min-h-[30vh] place-items-center">
          <LuLoader className="h-7 w-7 animate-spin text-ink-soft" />
        </div>
      ) : orders.length === 0 ? (
        <div className="grid justify-items-start gap-3 border border-line p-7">
          <b className="font-cormorant text-[24px] font-medium">No orders yet</b>
          <p className="m-0 text-ink-soft">When you place an order, you&apos;ll be able to track it here.</p>
          <Link
            href="/all"
            className="mt-1 inline-flex h-12 items-center bg-ink px-7 text-[12px] font-semibold uppercase tracking-[0.14em] text-paper hover:text-paper"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-3.5">
          {orders.map((o) => {
            const items: any[] = o?.orderDetails ?? [];
            const first = items[0];
            return (
              <article key={o.order_id} className="border border-line">
                <div className="grid grid-cols-[repeat(3,auto)_1fr] items-center gap-7 border-b border-line bg-haze px-5 py-3.5 text-[12.5px] text-ink-soft md:grid-cols-2 md:gap-x-4 md:gap-y-2.5">
                  <span>
                    Order<b className="block text-[14px] font-medium text-ink">{o.order_id}</b>
                  </span>
                  <span>
                    Placed<b className="block text-[14px] font-medium text-ink">{orderDate(o)}</b>
                  </span>
                  {o?.after_gst_amount != null && (
                    <span>
                      Total<b className="block text-[14px] font-medium tabular-nums text-ink">{formatCurrency(o.after_gst_amount)}</b>
                    </span>
                  )}
                  <Link
                    href={`/profile/purchases?order=${o.order_id}`}
                    className="justify-self-end border-b border-current text-[12px] font-semibold uppercase tracking-[0.12em] text-ink hover:text-ink md:col-span-2 md:justify-self-start"
                  >
                    View order
                  </Link>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 px-5 py-[18px] md:grid-cols-1">
                  <div className="flex items-center gap-2.5">
                    {items.slice(0, 3).map((it, i) => (
                      <img key={i} src={imgOf(it)} alt="" loading="lazy" className="h-20 w-16 flex-none bg-stone object-contain mix-blend-multiply" />
                    ))}
                    <span className="ml-1.5 text-[13.5px] text-ink-soft">
                      {first?.jewelryOrderItems?.fullTitle}
                      {items.length > 1 ? ` + ${items.length - 1} more` : ''}
                    </span>
                  </div>
                  <StatusPill status={Number(o.order_status ?? 0)} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-ink-faint">{label}</dt>
      <dd className="m-0 text-ink">{children}</dd>
    </>
  );
}

function OrderDetail({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const { orderDetails, loading } = useAppSelector((state) => state.order);
  const { data: master } = useAppSelector((state) => state.master);
  const nameOf = (mid: any) => master?.find((m: any) => m.id == mid)?.name;

  useEffect(() => {
    dispatch(fetchGetOrdeDetails(id));
  }, [dispatch, id]);

  const o: any = orderDetails?.order_id == id ? orderDetails : null;

  if (!o) {
    return (
      <div className="grid min-h-[30vh] place-items-center">
        {loading ? <LuLoader className="h-7 w-7 animate-spin text-ink-soft" /> : <p className="text-ink-soft">We couldn&apos;t find this order.</p>}
      </div>
    );
  }

  const items: any[] = o.orderDetails ?? [];
  const status = Number(o.order_status ?? 0);

  return (
    <>
      <Link href="/profile/purchases" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink">
        <LuArrowLeft className="h-4 w-4" strokeWidth={1.3} />
        All orders
      </Link>
      <PanelHead
        title={`Order ${o.order_id}`}
        sub={`Placed ${orderDate(o, 'D MMMM YYYY')} · ${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`}
        action={<StatusPill status={status} />}
      />
      <OrderTracker status={status} placedAt={o.createdAt} />

      <div className="mt-6 grid grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)] gap-6 lg:grid-cols-1">
        <ul className="m-0 list-none border-t border-line p-0">
          {items.map((item, i) => {
            const sku = item?.skuOrderItems ?? {};
            const isRing = ['WEDDING_BANDS', 'ENGAGEMENT_RINGS'].includes(item?.jewelryOrderItems?.jewelrySubType?.parent_code);
            const engraving = item?.engravingText?.Text?.trim();
            const stones = [
              ['Centre stone', sku.centerDiamondDetails, null],
              ['Accent stones', sku.accentDiamondDetails, sku.accent_diamond_count],
              ['Second accent', sku.secondAccentDiamondId, sku.second_accent_diamond_count],
            ].filter(([, d]) => d) as [string, any, any][];
            return (
              <li key={i} className="grid grid-cols-[88px_minmax(0,1fr)_auto] gap-4 border-b border-line py-5 md:grid-cols-[72px_minmax(0,1fr)]">
                <img src={imgOf(item)} alt="" className="h-[110px] w-[88px] bg-stone object-contain mix-blend-multiply md:h-[90px] md:w-[72px]" />
                <div className="min-w-0">
                  <b className="block text-[15px] font-medium">{item?.jewelryOrderItems?.fullTitle}</b>
                  <dl className="m-0 mt-2 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-[13px]">
                    <Spec label="Metal">{[nameOf(sku.metal_type_id), nameOf(sku.metal_color_id)].filter(Boolean).join(' ') || '—'}</Spec>
                    {isRing && <Spec label="Ring size">{item?.ring_size || '—'}</Spec>}
                    {sku.bracelet_length_ids && <Spec label="Length">{nameOf(sku.bracelet_length_ids)} in</Spec>}
                    {sku.band_width_ids && <Spec label="Band width">{nameOf(sku.band_width_ids)} mm</Spec>}
                    <Spec label="Quantity">{item?.count ?? 1}</Spec>
                    <Spec label="Code">{item?.jewelryOrderItems?.code || '—'}</Spec>
                    {engraving && (
                      <Spec label="Engraving">
                        <span style={{ fontFamily: item?.engravingText?.fontFamily }}>“{engraving}”</span>
                        {item?.engraving_price ? <span className="text-ink-faint"> · {formatCurrency(item.engraving_price)}</span> : null}
                      </Spec>
                    )}
                    {item?.is_warranty && (
                      <Spec label="Warranty">
                        {item?.warranty_year} year{item?.warranty_year > 1 ? 's' : ''} · {formatCurrency(item?.warranty_amount)}
                      </Spec>
                    )}
                    {item?.is_appraisal && (
                      <Spec label="Appraisal">
                        {formatCurrency(item?.appraisal_amount)}
                        {item?.appraisalDetails?.appraisal_link && (
                          <>
                            {' · '}
                            <a href={item.appraisalDetails.appraisal_link} target="_blank" rel="noreferrer" className={boxLink}>
                              Download
                            </a>
                          </>
                        )}
                      </Spec>
                    )}
                  </dl>

                  {item?.diamondDetails && (
                    <div className="mt-3.5 grid grid-cols-[56px_1fr] gap-3 bg-haze p-3">
                      <img src={item.diamondDetails.imageFile || FALLBACK} alt="" className="h-14 w-14 bg-paper object-contain" />
                      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-[12.5px]">
                        <Spec label="Diamond">
                          {[
                            item.diamondDetails.carats && `${item.diamondDetails.carats} ct`,
                            item.diamondDetails.shape_name,
                            item.diamondDetails.diamond_type == 2 ? 'Lab-grown' : 'Natural',
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </Spec>
                        <Spec label="Colour · Lab">{[item.diamondDetails.col, item.diamondDetails.lab].filter(Boolean).join(' · ') || '—'}</Spec>
                        <Spec label="Stone no.">{item.diamondDetails.stock_no || '—'}</Spec>
                        {item.diamondDetails.report_no && (
                          <Spec label="Certificate">
                            {item.diamondDetails.certificateFile ? (
                              <a href={item.diamondDetails.certificateFile} target="_blank" rel="noreferrer" className={boxLink}>
                                {item.diamondDetails.report_no}
                              </a>
                            ) : (
                              item.diamondDetails.report_no
                            )}
                          </Spec>
                        )}
                        {item?.diamond_amount ? <Spec label="Diamond price">{formatCurrency(item.diamond_amount)}</Spec> : null}
                      </dl>
                    </div>
                  )}

                  {stones.length > 0 && (
                    <div className="mt-3.5 grid grid-cols-3 gap-2 md:grid-cols-1">
                      {stones.map(([label, d, count]) => (
                        <dl key={label} className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 bg-haze p-3 text-[12.5px]">
                          <dt className="col-span-2 mb-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{label}</dt>
                          <Spec label="Shape">{nameOf(d?.name) || '—'}</Spec>
                          <Spec label="Type">{STONE_TYPE[d?.diamond_type] ?? 'Lab-grown gemstone'}</Spec>
                          <Spec label="Size">{d?.size || '—'}</Spec>
                          <Spec label="Colour">{nameOf(d?.color) || '—'}</Spec>
                          {count ? <Spec label="Count">{count}</Spec> : null}
                        </dl>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-right text-[14px] md:col-start-2 md:text-left">
                  <Money item={item} />
                </span>
              </li>
            );
          })}
        </ul>

        <div className="grid content-start gap-3.5">
          <Box title="Payment">
            <dl className="m-0 grid gap-2 text-[14px]">
              {o?.after_gst_amount != null && (
                <div className="flex justify-between border-t border-line pt-2.5 font-semibold">
                  <dt>Paid</dt>
                  <dd className="m-0 tabular-nums">{formatCurrency(o.after_gst_amount)}</dd>
                </div>
              )}
            </dl>
          </Box>
          <Box title="Need help?">
            <p className="m-0 text-[13.5px] text-ink-soft">Questions about delivery, sizing or a return? Mention order {o.order_id}.</p>
            <Link
              href="/contactpage"
              className="inline-flex h-12 items-center justify-center bg-ink text-[12px] font-semibold uppercase tracking-[0.14em] text-paper hover:text-paper"
            >
              Contact client care
            </Link>
            {items.some((it) => it?.appraisalDetails?.appraisal_link) && (
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint">
                <LuDownload className="h-3.5 w-3.5" /> Appraisal documents are linked on each piece.
              </span>
            )}
          </Box>
        </div>
      </div>
    </>
  );
}
