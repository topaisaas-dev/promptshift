import { NextRequest, NextResponse } from 'next/server';
import { PolarService } from '@/lib/payments/polarService';
import { ServerTelemetryStore } from '@/lib/analytics/serverTelemetryStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      plan,
      customerEmail,
      projectName,
      returnUrl,
      successUrl,
      sourceChannel,
      conversionPair,
      includeOrderBump,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
    } = body;

    if (!plan || !['single', 'pro', 'team'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const amountUsd = plan === 'single' ? 1.99 : plan === 'pro' ? 5.99 : 19.99;

    const effectiveChannel =
      sourceChannel ||
      (utmSource === 'x' || utmSource === 'twitter'
        ? 'x_social'
        : conversionPair
        ? 'pseo'
        : 'web');

    ServerTelemetryStore.record({
      type: 'checkout_initiated',
      planTier: plan,
      amountUsd,
      currency: 'USD',
      channel: effectiveChannel as any,
      pairSlug: conversionPair || undefined,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
      projectTitleAnon: projectName ? String(projectName).slice(0, 18) : 'web-studio',
      country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'US',
    });

    if (customerEmail && String(customerEmail).includes('@')) {
      ServerTelemetryStore.record({
        type: 'lead_captured',
        planTier: plan,
        channel: effectiveChannel as any,
        pairSlug: conversionPair || undefined,
        utmSource: utmSource || undefined,
        utmCampaign: utmCampaign || undefined,
        country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'US',
      });
    }

    const checkout = await PolarService.createCheckout({
      plan,
      customerEmail,
      projectName,
      returnUrl,
      successUrl,
      sourceChannel: effectiveChannel,
      conversionPair,
      includeOrderBump: Boolean(includeOrderBump),
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
    });

    return NextResponse.json(checkout);
  } catch (error: any) {
    console.error('[Polar Checkout API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Polar checkout session' },
      { status: 500 }
    );
  }
}
