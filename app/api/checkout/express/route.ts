import { NextRequest, NextResponse } from 'next/server';
import { PolarService } from '@/lib/payments/polarService';
import { ServerTelemetryStore } from '@/lib/analytics/serverTelemetryStore';

export const dynamic = 'force-dynamic';

const BOT_OR_CRAWLER_PATTERN =
  /(bot|crawler|spider|slurp|bingpreview|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|headlesschrome|phantomjs|puppeteer|playwright|lighthouse|pagespeed|curl|wget|python-requests|python-urllib|go-http-client|java\/|axios|node-fetch|undici|ahrefs|semrush|mj12bot|bytespider|yandex|duckduckbot|applebot|gptbot|claudebot|perplexitybot|oai-searchbot|googlebot|bingbot|petalbot|scrapy)/i;

function isAutomatedPrefetchOrBot(req: NextRequest): boolean {
  const purpose = (
    req.headers.get('sec-purpose') ||
    req.headers.get('purpose') ||
    req.headers.get('x-purpose') ||
    ''
  ).toLowerCase();

  if (
    purpose.includes('prefetch') ||
    purpose.includes('preview') ||
    req.headers.get('next-router-prefetch') !== null ||
    req.headers.get('x-middleware-prefetch') !== null
  ) {
    return true;
  }

  const ua = (req.headers.get('user-agent') || '').trim();
  if (!ua || BOT_OR_CRAWLER_PATTERN.test(ua)) {
    return true;
  }

  return false;
}

/**
 * 1-Click Express Polar Checkout Redirector
 * Guards against crawlers and link prefetchers so bots crawling /convert/* never spawn
 * abandoned Polar checkout sessions, while forwarding real developer UTM attribution.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawPlan = (searchParams.get('plan') || 'single').toLowerCase();
  const plan: 'single' | 'pro' | 'team' =
    rawPlan === 'pro' ? 'pro' : rawPlan === 'team' ? 'team' : 'single';
  const channel = searchParams.get('channel') || 'web';
  const pair = searchParams.get('pair') || undefined;
  const utmSource = searchParams.get('utm_source') || undefined;
  const utmMedium = searchParams.get('utm_medium') || undefined;
  const utmCampaign = searchParams.get('utm_campaign') || undefined;
  const utmContent = searchParams.get('utm_content') || undefined;

  // Prevent search crawlers, link-previewers & browser prefetchers from spawning Polar sessions
  if (isAutomatedPrefetchOrBot(req)) {
    const safeLanding = pair
      ? `https://promptshift.dev/convert/${encodeURIComponent(pair)}`
      : 'https://promptshift.dev/#pricing';
    return NextResponse.redirect(safeLanding, {
      status: 302,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store',
      },
    });
  }

  const amountUsd = plan === 'single' ? 1.99 : plan === 'pro' ? 5.99 : 19.99;
  const allowedChannels = [
    'web',
    'pseo',
    'mcp',
    'cli',
    'llmo',
    'x_social',
    'social_instagram',
    'social_tiktok',
    'social_facebook',
    'social_youtube',
    'social_linkedin',
    'social_threads',
    'social_pinterest',
  ];
  const normalizedChannel = allowedChannels.includes(channel)
    ? channel
    : utmSource === 'x' || utmSource === 'twitter'
    ? 'x_social'
    : 'web';

  ServerTelemetryStore.record({
    type: 'checkout_initiated',
    planTier: plan,
    amountUsd,
    currency: 'USD',
    channel: normalizedChannel as any,
    pairSlug: pair,
    utmSource,
    utmMedium,
    utmCampaign,
    country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'US',
  });

  const checkout = await PolarService.createCheckout({
    plan,
    sourceChannel: normalizedChannel,
    conversionPair: pair,
    includeOrderBump: true,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
  });

  return NextResponse.redirect(checkout.checkoutUrl, {
    status: 307,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    },
  });
}
