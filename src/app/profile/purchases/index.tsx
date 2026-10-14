'use client';
import React from 'react';

import AccountShell from '@/components/Account/AccountShell';

import OrderList from '../OrderList';

export default function MyPurchases() {
  return (
    <AccountShell active="orders">
      <OrderList />
    </AccountShell>
  );
}
