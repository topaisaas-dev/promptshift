import assert from 'node:assert';
import crypto from 'node:crypto';
import { PolarService } from '../lib/payments/polarService';

async function main() {
  console.log('--- Testing Polar Service (Offline Unit Suite — Zero Live Checkout Spam) ---');

  // 1. Permanent HTTP-307 checkout link checks
  for (const plan of ['single', 'pro', 'team'] as const) {
    const link = PolarService.getPermanentCheckoutLink(plan);
    assert.ok(
      link.startsWith('https://buy.polar.sh/polar_cl_'),
      `Permanent checkout link for ${plan} must point to buy.polar.sh`
    );
  }
  console.log('✓ Permanent checkout links verified');

  // 2. Fail-closed verification on empty / placeholder / synthetic checkout IDs
  for (const badId of ['', '{CHECKOUT_ID}', 'polar_direct_123456', 'polar_err_fallback_1', 'short']) {
    const res = await PolarService.verifyCheckoutSession(badId);
    assert.strictEqual(
      res.verified,
      false,
      `verifyCheckoutSession("${badId}") MUST fail closed (verified: false)`
    );
  }
  console.log('✓ Fail-closed verifyCheckoutSession verified');

  // 3. Fallback when POLAR_ACCESS_TOKEN is unset (never throws 500, returns permanent buy.polar.sh)
  const prevToken = process.env.POLAR_ACCESS_TOKEN;
  delete process.env.POLAR_ACCESS_TOKEN;
  try {
    const fallbackCheckout = await PolarService.createCheckout({
      plan: 'single',
      projectName: 'diagnostic_test',
      utmSource: 'x',
      utmCampaign: 'unit_test',
    });
    assert.ok(
      fallbackCheckout.checkoutUrl.startsWith('https://buy.polar.sh/polar_cl_'),
      'Missing token must gracefully fall back to permanent buy.polar.sh link'
    );
  } finally {
    if (prevToken !== undefined) process.env.POLAR_ACCESS_TOKEN = prevToken;
  }
  console.log('✓ Zero-downtime permanent link fallback verified');

  // 4. Webhook signature verification (synthetic test secret only — ZERO hardcoded live secret)
  const prevWebhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  const syntheticSecret = `whsec_${Buffer.from('promptshift-unit-test-webhook-secret-2026').toString('base64')}`;
  process.env.POLAR_WEBHOOK_SECRET = syntheticSecret;
  try {
    const payload = JSON.stringify({ type: 'order.created', data: { id: 'ord_test_123' } });
    const id = 'msg_test123';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const toSign = `${id}.${timestamp}.${payload}`;
    const keyBuffer = Buffer.from(syntheticSecret.slice(6), 'base64');
    const signatureHash = crypto.createHmac('sha256', keyBuffer).update(toSign).digest('base64');
    const signature = `v1,${signatureHash}`;

    assert.strictEqual(
      PolarService.verifyWebhookSignature(payload, { id, timestamp, signature }),
      true,
      'Valid Svix webhook signature must pass'
    );

    assert.strictEqual(
      PolarService.verifyWebhookSignature(payload + ' ', { id, timestamp, signature }),
      false,
      'Tampered payload must fail webhook verification'
    );

    delete process.env.POLAR_WEBHOOK_SECRET;
    assert.strictEqual(
      PolarService.verifyWebhookSignature(payload, { id, timestamp, signature }),
      false,
      'Missing POLAR_WEBHOOK_SECRET must fail closed'
    );
  } finally {
    if (prevWebhookSecret !== undefined) process.env.POLAR_WEBHOOK_SECRET = prevWebhookSecret;
    else delete process.env.POLAR_WEBHOOK_SECRET;
  }
  console.log('✓ Constant-time Svix webhook verification (valid, tampered, fail-closed) passed');
  console.log('🎉 ALL POLAR SERVICE UNIT TESTS PASSED!');
}

main().catch((err) => {
  console.error('❌ Polar Service tests failed:', err);
  process.exit(1);
});
