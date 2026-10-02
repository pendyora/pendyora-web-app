'use client';
import React from 'react';

import { Button } from 'antd';

interface PdpBuyBarProps {
  title: string;
  price: React.ReactNode;
  /** True once the main add-to-bag button has scrolled away (and the footer is not on screen). */
  visible: boolean;
  onBuy: () => void;
  buyLabel: string;
  loading?: boolean;
}

/** Mobile-only bottom bar with price and add-to-bag. */
export default function PdpBuyBar({ title, price, visible, onBuy, buyLabel, loading }: PdpBuyBarProps) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 hidden items-center gap-3.5 border-t border-line bg-paper px-4 pb-[calc(10px+env(safe-area-inset-bottom,0px))] pt-2.5 shadow-[0_-12px_40px_theme(colors.ink.DEFAULT/6%)] transition-transform duration-500 ease-luxe md:flex ${
        visible ? 'translate-y-0' : 'translate-y-[110%]'
      }`}
      aria-hidden={!visible}
    >
      <div className="grid min-w-0 flex-1">
        <span className="font-cormorant text-[22px] font-medium leading-tight tabular-nums text-ink">{price}</span>
        <span className="truncate text-[11px] text-ink-soft">{title}</span>
      </div>
      <Button
        type="primary"
        onClick={onBuy}
        loading={loading}
        tabIndex={visible ? 0 : -1}
        className="!h-12 !border-ink !bg-ink !px-6 !text-[11px] !uppercase !tracking-[0.2em] !text-paper hover:!bg-ink-hover"
      >
        {buyLabel}
      </Button>
    </div>
  );
}
