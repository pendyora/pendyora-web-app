'use client';

import React from 'react';

import { Select } from 'antd';

import { useAppSelector } from '@/store';

interface Props {
  currency: string;
  currencyOption: { label: React.ReactNode; value: string }[];
  setCurrency: (value: string) => void;
  setRefresh: (value: boolean) => void;
  /** `dark` sits on the noir announcement bar, `light` in the mobile drawer. */
  tone: 'dark' | 'light';
}

/** Currency picker. Changing it stores the choice and reloads so prices refetch (unchanged behaviour). */
export default function CurrencySelect({ currency, currencyOption, setCurrency, setRefresh, tone }: Props) {
  const { currencyList } = useAppSelector((state) => state?.master);

  if (!currency || currencyOption.length === 0) {
    return null;
  }

  const onChange = (value: string) => {
    const active = currencyList?.filter((item: any) => item?.is_active === true) ?? [];
    const index = active.findIndex((el: any) => el.currency_code == value);
    localStorage.setItem('currencySymbol', active?.[index > 0 ? index : 0]?.currency_symbol);
    setCurrency(value);
    localStorage.setItem('currency', value);
    setRefresh(true);
  };

  return (
    <Select
      variant="borderless"
      size="small"
      aria-label="Currency"
      value={currency}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={currencyOption}
      className={`!w-auto min-w-[78px] [&_.ant-select-selection-item]:!text-[11px] [&_.ant-select-selection-item]:tracking-[0.16em] ${
        tone === 'dark'
          ? '[&_.ant-select-arrow]:!text-noir-on [&_.ant-select-selection-item]:!text-noir-on'
          : '[&_.ant-select-arrow]:!text-ink [&_.ant-select-selection-item]:!text-ink'
      }`}
    />
  );
}
