import { NextRequest, NextResponse } from 'next/server';
import { PolarService } from '@/lib/payments/polarService';
import { ServerTelemetryStore } from '@/lib/analytics/serverTelemetryStore';

export const dynamic = 'force-dynamic';

/**
 * 1-Click Express Polar Checkout Redirector
 * Used by MCP agents, CLI terminals, llms.txt crawlers, and programmatic SEO CTAs
 * to initiate an attributed Polar session with success_url in a single GET link.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawPlan = (searchParams.get('plan') || 'single').toLowerCase();
  const plan: 'single' | 'pro' | 'team' =
    rawPlan === 'pro' ? 'pro' : rawPlan === 'team' ? 'team' : 'single';
  const channel = searchParams.get('channel') || 'web';
  const pair = searchParams.get('pair') || undefined;

  const amountUsd = plan === 'single' ? 1.99 : plan === 'pro' ? 5.99 : 19.99;

  ServerTelemetryStore.record({
    type: 'checkout_initiated',
    planTier: plan,
    amountUsd,
    currency: 'USD',
    channel: (['web', 'pseo', 'mcp', 'cli', 'llmo', 'x_social'].includes(channel)
      ? channel
      : 'web') as any,
    pairSlug: pair,
    country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'US',
  });

  const checkout = await PolarService.createCheckout({
    plan,
    sourceChannel: channel,
    conversionPair: pair,
  });

  return NextResponse.redirect(checkout.checkoutUrl, { status: 307 });
}
