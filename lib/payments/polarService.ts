/**
 * PromptShift — Polar.sh Merchant of Record (MoR) Integration
 * Handles:
 * 1. Checkout session creation via Polar API v1 (with attribution metadata)
 * 2. Product ID & Permanent Checkout Link resolution (Single Pass, Pro Developer, Team & Agency)
 * 3. License key format & checkout session verification
 * 4. Live Ground-Truth Commercial Telemetry from Polar MoR (Zero-PII aggregate counters)
 * 5. Webhook signature verification (Standard Webhooks / Svix format)
 */

import crypto from 'node:crypto';

export interface PolarCheckoutRequest {
  plan: 'single' | 'pro' | 'team';
  customerEmail?: string;
  projectName?: string;
  returnUrl?: string;
  successUrl?: string;
  sourceChannel?: string;
  conversionPair?: string;
}

export interface PolarCheckoutResponse {
  checkoutUrl: string;
  checkoutId: string;
}

export interface PolarPlanMetrics {
  checkoutsInitiated: number;
  checkoutsExpired: number;
  checkoutsOpen: number;
  paidOrdersCount: number;
  compOrdersCount: number;
  grossRevenueUsd: number;
}

export interface PolarLiveCommercialSnapshot {
  source: 'polar_api_live' | 'fallback_zero';
  fetchedAt: string;
  currency: 'USD';
  totalCheckoutsInitiated: number;
  totalPaidOrders: number;
  totalCompTestOrders: number;
  totalNetRevenueUsd: number;
  byPlan: {
    single: PolarPlanMetrics;
    pro: PolarPlanMetrics;
    team: PolarPlanMetrics;
  };
  byChannelCheckouts: Record<string, number>;
  byPairCheckouts: Record<string, number>;
}

const EUR_TO_USD_RATE = 1.08;

let cachedSnapshot: { data: PolarLiveCommercialSnapshot; expiresAt: number } | null = null;

export class PolarService {
  private static getAccessToken(): string {
    return process.env.POLAR_ACCESS_TOKEN || 'polar_oat_bCrvRXLieKhThTzt1Q2TkRaviLKjSVEPPJtDu0wgOm3';
  }

  public static getProductId(plan: 'single' | 'pro' | 'team'): string {
    switch (plan) {
      case 'single':
        return process.env.POLAR_PRODUCT_SINGLE_PASS_ID || '3e74e0dd-27da-4b78-8dee-f2e0fa36ed25';
      case 'pro':
        return process.env.POLAR_PRODUCT_PRO_ID || 'f646306b-cddd-4478-8aba-ec282a93397a';
      case 'team':
        return process.env.POLAR_PRODUCT_TEAM_ID || '9e8ca309-7881-4d7e-bfb0-6e6eda85505b';
      default:
        return '3e74e0dd-27da-4b78-8dee-f2e0fa36ed25';
    }
  }

  public static getPermanentCheckoutLink(plan: 'single' | 'pro' | 'team'): string {
    switch (plan) {
      case 'single':
        return 'https://buy.polar.sh/polar_cl_fGe6iBikmKFXK6EUnPpBLNSP66Oc4P3K5b5Mb4ZvH5E';
      case 'pro':
        return 'https://buy.polar.sh/polar_cl_tRb5IIABbdflDV5GIJu3VcxPRMUrP6Ok99igV0zdJ5a';
      case 'team':
        return 'https://buy.polar.sh/polar_cl_Pk9oe3UPJgQRhOwDCDUdawKOOdi2cL2XHyRqZ3QFfvC';
      default:
        return 'https://buy.polar.sh/polar_cl_fGe6iBikmKFXK6EUnPpBLNSP66Oc4P3K5b5Mb4ZvH5E';
    }
  }

  /**
   * Validates that a provided license key or Polar Order/Checkout ID follows an authentic structure
   * (prevents trivial bypasses like passing "true" or "123" on CLI / MCP / HTTP-402 endpoints).
   */
  public static isValidLicenseKey(rawKey?: string | null): boolean {
    if (!rawKey) return false;
    const cleaned = rawKey.replace(/^Bearer\s+/i, '').trim();
    if (cleaned.length < 10) return false;

    // 1. Official Polar prefixes (polar_ord_*, polar_c_*, polar_cl_*, polar_*)
    if (/^polar_[a-zA-Z0-9_]{8,}$/.test(cleaned)) return true;

    // 2. Standard Polar Order / Subscription UUID v4
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleaned)) {
      return true;
    }

    // 3. PromptShift issued Pro / Team / Polar Benefit tokens
    if (/^(PS-PRO-|PS-TEAM-|PSHIFT-|POLAR-)[A-Z0-9_-]{6,}$/i.test(cleaned)) return true;

    return false;
  }

  public static async createCheckout(req: PolarCheckoutRequest): Promise<PolarCheckoutResponse> {
    const token = this.getAccessToken();
    const productId = this.getProductId(req.plan);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptshift.dev';

    const successUrl =
      req.successUrl || `${appUrl}/?checkout=success&plan=${req.plan}&checkout_id={CHECKOUT_ID}`;
    const returnUrl = req.returnUrl || `${appUrl}/#sandbox`;

    try {
      const response = await fetch('https://api.polar.sh/v1/checkouts/custom/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          customer_email:
            req.customerEmail && req.customerEmail.includes('@') ? req.customerEmail.trim() : undefined,
          success_url: successUrl,
          return_url: returnUrl,
          metadata: {
            app: 'promptshift',
            plan: req.plan,
            project_name: (req.projectName || 'custom_workspace').slice(0, 60),
            channel: req.sourceChannel || 'web_studio',
            pair: req.conversionPair || 'direct',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Polar API Checkout Error:', response.status, errorText);
        return {
          checkoutUrl: this.getPermanentCheckoutLink(req.plan),
          checkoutId: `polar_direct_${Date.now()}`,
        };
      }

      const data = await response.json();
      // Invalidate cached commercial metrics so new checkout shows up immediately
      cachedSnapshot = null;
      return {
        checkoutUrl: data.url,
        checkoutId: data.id,
      };
    } catch (err) {
      console.error('Polar Checkout Exception:', err);
      return {
        checkoutUrl: this.getPermanentCheckoutLink(req.plan),
        checkoutId: `polar_err_fallback_${Date.now()}`,
      };
    }
  }

  /**
   * Verifies a Polar checkout session status upon return to /?checkout=success
   */
  public static async verifyCheckoutSession(checkoutId: string): Promise<{
    verified: boolean;
    status: string;
    plan?: 'single' | 'pro' | 'team';
    amountUsd?: number;
  }> {
    if (!checkoutId || checkoutId === '{CHECKOUT_ID}' || checkoutId.startsWith('polar_direct_')) {
      return { verified: true, status: 'hosted_link_return' };
    }

    try {
      const token = this.getAccessToken();
      const res = await fetch(`https://api.polar.sh/v1/checkouts/custom/${encodeURIComponent(checkoutId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        return { verified: false, status: `http_${res.status}` };
      }

      const data = await res.json();
      const status = String(data.status || 'unknown').toLowerCase();
      const isPaid = status === 'succeeded' || status === 'confirmed';
      const productId = data.product_id || data.product?.id;
      const plan: 'single' | 'pro' | 'team' =
        productId === this.getProductId('team')
          ? 'team'
          : productId === this.getProductId('pro')
          ? 'pro'
          : 'single';
      const rawAmount = typeof data.amount === 'number' ? data.amount / 100 : 0;
      const currency = String(data.currency || 'usd').toLowerCase();
      const amountUsd = Number((currency === 'eur' ? rawAmount * EUR_TO_USD_RATE : rawAmount).toFixed(2));

      return {
        verified: isPaid,
        status,
        plan,
        amountUsd,
      };
    } catch {
      return { verified: false, status: 'network_error' };
    }
  }

  /**
   * Pulls Ground-Truth Commercial Metrics directly from Polar.sh MoR API (Zero PII stored).
   * Cached for 60s in memory to guarantee fast response times and zero rate-limiting.
   */
  public static async getLiveCommercialMetrics(forceRefresh = false): Promise<PolarLiveCommercialSnapshot> {
    if (!forceRefresh && cachedSnapshot && Date.now() < cachedSnapshot.expiresAt) {
      return cachedSnapshot.data;
    }

    const emptyPlan = (): PolarPlanMetrics => ({
      checkoutsInitiated: 0,
      checkoutsExpired: 0,
      checkoutsOpen: 0,
      paidOrdersCount: 0,
      compOrdersCount: 0,
      grossRevenueUsd: 0,
    });

    const snapshot: PolarLiveCommercialSnapshot = {
      source: 'fallback_zero',
      fetchedAt: new Date().toISOString(),
      currency: 'USD',
      totalCheckoutsInitiated: 0,
      totalPaidOrders: 0,
      totalCompTestOrders: 0,
      totalNetRevenueUsd: 0,
      byPlan: {
        single: emptyPlan(),
        pro: emptyPlan(),
        team: emptyPlan(),
      },
      byChannelCheckouts: {},
      byPairCheckouts: {},
    };

    try {
      const token = this.getAccessToken();
      const singleId = this.getProductId('single');
      const proId = this.getProductId('pro');
      const teamId = this.getProductId('team');
      const productToPlan: Record<string, 'single' | 'pro' | 'team'> = {
        [singleId]: 'single',
        [proId]: 'pro',
        [teamId]: 'team',
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      const [ordersRes, singleChkRes, proChkRes, teamChkRes] = await Promise.all([
        fetch('https://api.polar.sh/v1/orders/?limit=100', {
          headers,
          signal: controller.signal,
          cache: 'no-store',
        }),
        fetch(`https://api.polar.sh/v1/checkouts/?product_id=${singleId}&limit=100`, {
          headers,
          signal: controller.signal,
          cache: 'no-store',
        }),
        fetch(`https://api.polar.sh/v1/checkouts/?product_id=${proId}&limit=100`, {
          headers,
          signal: controller.signal,
          cache: 'no-store',
        }),
        fetch(`https://api.polar.sh/v1/checkouts/?product_id=${teamId}&limit=100`, {
          headers,
          signal: controller.signal,
          cache: 'no-store',
        }),
      ]);

      clearTimeout(timeout);

      if (ordersRes.ok) {
        snapshot.source = 'polar_api_live';
        const ordersData = await ordersRes.json();
        const items = Array.isArray(ordersData.items) ? ordersData.items : [];
        for (const ord of items) {
          const pid = ord.product_id || ord.product?.id;
          const plan = pid ? productToPlan[pid] : undefined;
          if (!plan) continue;

          const cents = typeof ord.amount === 'number' ? ord.amount : 0;
          const curr = String(ord.currency || 'usd').toLowerCase();
          if (cents > 0) {
            const usd = Number(((cents / 100) * (curr === 'eur' ? EUR_TO_USD_RATE : 1)).toFixed(2));
            snapshot.byPlan[plan].paidOrdersCount += 1;
            snapshot.byPlan[plan].grossRevenueUsd = Number(
              (snapshot.byPlan[plan].grossRevenueUsd + usd).toFixed(2)
            );
            snapshot.totalPaidOrders += 1;
            snapshot.totalNetRevenueUsd = Number((snapshot.totalNetRevenueUsd + usd).toFixed(2));
          } else {
            snapshot.byPlan[plan].compOrdersCount += 1;
            snapshot.totalCompTestOrders += 1;
          }
        }
      }

      const processCheckouts = async (res: Response, plan: 'single' | 'pro' | 'team') => {
        if (!res.ok) return;
        snapshot.source = 'polar_api_live';
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        for (const chk of items) {
          if (chk.metadata?.project_name === 'diagnostic_test') continue;
          snapshot.byPlan[plan].checkoutsInitiated += 1;
          snapshot.totalCheckoutsInitiated += 1;

          const st = String(chk.status || '').toLowerCase();
          if (st === 'expired') snapshot.byPlan[plan].checkoutsExpired += 1;
          if (st === 'open') snapshot.byPlan[plan].checkoutsOpen += 1;

          const ch = String(chk.metadata?.channel || 'web_studio');
          snapshot.byChannelCheckouts[ch] = (snapshot.byChannelCheckouts[ch] || 0) + 1;

          const pair = String(chk.metadata?.pair || '');
          if (pair && pair !== 'direct') {
            snapshot.byPairCheckouts[pair] = (snapshot.byPairCheckouts[pair] || 0) + 1;
          }
        }
      };

      await Promise.all([
        processCheckouts(singleChkRes, 'single'),
        processCheckouts(proChkRes, 'pro'),
        processCheckouts(teamChkRes, 'team'),
      ]);

      cachedSnapshot = {
        data: snapshot,
        expiresAt: Date.now() + 60_000,
      };
    } catch (err) {
      console.warn('[PolarService] Live telemetry fallback to zero-state:', err);
    }

    return snapshot;
  }

  public static verifyWebhookSignature(
    payload: string,
    headers: { id?: string | null; timestamp?: string | null; signature?: string | null }
  ): boolean {
    const secret =
      process.env.POLAR_WEBHOOK_SECRET || 'whsec_7fmNASsusuiVMgPloGjwg3jptlgtPVno7abJKKp2VHg=';
    if (!secret || !headers.id || !headers.timestamp || !headers.signature) {
      return false;
    }

    try {
      let keyBuffer: Buffer;
      if (secret.startsWith('whsec_')) {
        keyBuffer = Buffer.from(secret.slice(6), 'base64');
      } else {
        keyBuffer = Buffer.from(secret, 'utf-8');
      }

      const toSign = `${headers.id}.${headers.timestamp}.${payload}`;
      const hmac = crypto.createHmac('sha256', keyBuffer).update(toSign).digest('base64');

      const sigParts = headers.signature.split(' ');
      for (const part of sigParts) {
        const [version, hash] = part.split(',');
        if (version === 'v1' && hash === hmac) {
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Polar Webhook Signature Verification Error:', err);
      return false;
    }
  }
}
