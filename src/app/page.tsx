import React from 'react';

import { Metadata } from 'next';

import Page from './homepage';

export const metadata: Metadata = {
  title: 'Ashclair - Gems & Jewelry',
  description: '',
  // ogTitle:'...'
};

export const dynamic = 'force-dynamic';

export default async function HOMEPAGEPage() {
  return <Page />;
}
