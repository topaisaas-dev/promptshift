import { NextRequest, NextResponse } from 'next/server';
import { PolarService } from '@/lib/payments/polarService';
import { EmailDispatcher } from '@/lib/email/emailDispatcher';
import { ServerTelemetryStore } from '@/lib/analytics/serverTelemetryStore';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const headers = {
      id: req.headers.get('webhook-id'),
      timestamp: req.headers.get('webhook-timestamp'),
      signature: req.headers.get('webhook-signature'),
    };

    const isValid = PolarService.verifyWebhookSignature(rawBody, headers);

    if (!isValid) {
      console.warn('[Polar Webhook] Signature verification failed or missing headers.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.type;
    const data = event.data || {};

    console.info(`[Polar Webhook] Received verified event: ${eventType}`);

    // Handle order / subscription completion
    if (eventType === 'order.created' || eventType === 'subscription.created') {
      const customerEmail =
        data.customer_email ||
        data.customer?.email ||
        data.user?.email ||
        data.metadata?.customer_email;

      const planKey = (data.metadata?.plan || 'single') as 'single' | 'pro' | 'team';
      const planNameMap = {
        single: 'PromptShift - Single Project Pass',
        pro: 'PromptShift - Pro Developer Subscription',
        team: 'PromptShift - Team & Agency Pass',
      };
      const planName = planNameMap[planKey] || 'PromptShift Pass';
      const rawCents = typeof data.amount === 'number' ? data.amount : 0;
      const amount = rawCents > 0 ? (rawCents / 100).toFixed(2) : planKey === 'single' ? '1.99' : '5.99';
      const currency = (data.currency || 'USD').toUpperCase();
      const orderId = data.id || `polar_${Date.now()}`;

      if (rawCents > 0) {
        ServerTelemetryStore.record({
          type: 'payment_completed',
          planTier: planKey,
          amountUsd: Number((rawCents / 100).toFixed(2)),
          currency: 'USD',
          channel: (data.metadata?.channel as any) || 'web',
          pairSlug: data.metadata?.pair !== 'direct' ? data.metadata?.pair : undefined,
          projectTitleAnon: orderId.slice(0, 14),
        });
      }

      if (customerEmail && customerEmail.includes('@')) {
        await EmailDispatcher.dispatch({
          action: 'order_completed',
          email: customerEmail,
          planName,
          amount,
          currency,
          orderId,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Polar Webhook] Processing exception:', err);
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
