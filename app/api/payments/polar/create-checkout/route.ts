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
    } = body;

    if (!plan || !['single', 'pro', 'team'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const amountUsd = plan === 'single' ? 1.99 : plan === 'pro' ? 5.99 : 19.99;

    ServerTelemetryStore.record({
      type: 'checkout_initiated',
      planTier: plan,
      amountUsd,
      currency: 'USD',
      channel: (sourceChannel as any) || (conversionPair ? 'pseo' : 'web'),
      pairSlug: conversionPair || undefined,
      projectTitleAnon: projectName ? String(projectName).slice(0, 18) : 'web-studio',
      country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'US',
    });

    if (customerEmail && String(customerEmail).includes('@')) {
      ServerTelemetryStore.record({
        type: 'lead_captured',
        planTier: plan,
        channel: (sourceChannel as any) || 'web',
        pairSlug: conversionPair || undefined,
        country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'US',
      });
    }

    const checkout = await PolarService.createCheckout({
      plan,
      customerEmail,
      projectName,
      returnUrl,
      successUrl,
      sourceChannel,
      conversionPair,
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
