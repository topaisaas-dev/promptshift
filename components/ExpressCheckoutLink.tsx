'use client';

import React, { useMemo } from 'react';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';

interface ExpressCheckoutLinkProps {
  plan: 'single' | 'pro' | 'team';
  channel?: string;
  pair?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Attribution-preserving 1-Click Express Polar Checkout link.
 * - Uses rel="nofollow noopener" so search bots & prefetchers never crawl checkout creation endpoints.
 * - Automatically appends persisted UTM attribution from sessionStorage/localStorage on click
 *   so mobile WebViews retain source/campaign attribution in Polar metadata.
 */
export const ExpressCheckoutLink: React.FC<ExpressCheckoutLinkProps> = ({
  plan,
  channel = 'pseo',
  pair,
  className,
  children,
}) => {
  const baseHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('plan', plan);
    params.set('channel', channel);
    if (pair) params.set('pair', pair);
    return `/api/checkout/express?${params.toString()}`;
  }, [plan, channel, pair]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === 'undefined') return;
    const attr = AnalyticsTracker.getAttribution();
    const effectiveChannel =
      attr?.channel && attr.channel !== 'web' ? attr.channel : channel;

    const params = new URLSearchParams();
    params.set('plan', plan);
    params.set('channel', effectiveChannel);
    if (pair) params.set('pair', pair);
    if (attr?.utmSource) params.set('utm_source', attr.utmSource);
    if (attr?.utmMedium) params.set('utm_medium', attr.utmMedium);
    if (attr?.utmCampaign) params.set('utm_campaign', attr.utmCampaign);
    if (attr?.utmContent) params.set('utm_content', attr.utmContent);

    const targetUrl = `/api/checkout/express?${params.toString()}`;
    AnalyticsTracker.trackCheckout(
      plan,
      plan === 'single' ? '1.99' : plan === 'pro' ? '5.99' : '19.99',
      'USD',
      pair
    );

    e.preventDefault();
    window.location.href = targetUrl;
  };

  return (
    <a
      href={baseHref}
      rel="nofollow noopener"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
};
