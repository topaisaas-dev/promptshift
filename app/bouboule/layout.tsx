import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'PromptShift Command Center — Sovereign Admin Analytics',
  description: 'Private operational analytics and Polar.sh ground-truth reconciliation console.',
  alternates: {
    canonical: 'https://promptshift.dev/bouboule',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function BoubouleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
