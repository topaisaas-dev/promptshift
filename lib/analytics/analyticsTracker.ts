/**
 * PromptShift Analytics Tracker — Sovereign Client & Server Telemetry
 * Captures user journey events, persists locally in client vault, and syncs to API.
 */

import { AnalyticsEvent, PlatformId, TelemetryChannel } from './analyticsTypes';

const STORAGE_KEY = 'promptshift_analytics_events';
const MAX_LOCAL_EVENTS = 500;

export class AnalyticsTracker {
  /**
   * Tracks an arbitrary telemetry event
   */
  public static track(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    if (typeof window === 'undefined') return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      id: 'ev_' + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      userAgentSnippet: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 40) : undefined,
    };

    // 1. Save locally in Sovereign Analytics store
    this.saveLocalEvent(fullEvent);

    // 2. Dispatch custom event for real-time reactivity in admin dashboard if open
    try {
      window.dispatchEvent(new CustomEvent('promptshift_analytics_updated', { detail: fullEvent }));
    } catch {
      // Ignore in non-browser environments
    }

    // 3. Asynchronous fire-and-forget sync to backend API
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullEvent),
      }).catch(() => {
        // Silent catch: network failures should never disrupt developer workflow
      });
    } catch {
      // Ignore
    }
  }

  public static trackPageView(path: string = '/', country?: string, currency?: string): void {
    const pairMatch = path.match(/^\/convert\/([a-z0-9-]+)$/i);
    const pairSlug = pairMatch ? pairMatch[1].toLowerCase() : undefined;
    const channel: TelemetryChannel = pairSlug ? 'pseo' : path.startsWith('/cli') ? 'cli' : 'web';

    this.track({
      type: 'page_view',
      path,
      pairSlug,
      channel,
      country,
      currency: currency || 'USD',
    });
  }

  public static trackProjectUpload(meta: {
    projectTitle: string;
    fileCount: number;
    sizeBytes: number;
    sourcePlatform: PlatformId;
    pairSlug?: string;
  }): void {
    this.track({
      type: 'project_upload',
      channel: meta.pairSlug ? 'pseo' : 'web',
      pairSlug: meta.pairSlug,
      projectTitleAnon: this.anonymizeTitle(meta.projectTitle),
      fileCount: meta.fileCount,
      sizeBytes: meta.sizeBytes,
      sourcePlatform: meta.sourcePlatform,
    });
  }

  public static trackPaywallHit(meta: {
    projectTitle: string;
    fileCount: number;
    sourcePlatform: PlatformId;
    targetPlatform: PlatformId;
    pairSlug?: string;
  }): void {
    this.track({
      type: 'paywall_hit',
      channel: meta.pairSlug ? 'pseo' : 'web',
      pairSlug: meta.pairSlug,
      projectTitleAnon: this.anonymizeTitle(meta.projectTitle),
      fileCount: meta.fileCount,
      sourcePlatform: meta.sourcePlatform,
      targetPlatform: meta.targetPlatform,
      planTier: 'single',
    });
  }

  public static trackConversion(meta: {
    projectTitle: string;
    sourcePlatform: PlatformId;
    targetPlatform: PlatformId;
    fileCount: number;
    sizeBytes: number;
    parityScore: number;
    isFreeTier: boolean;
    planTier: 'free' | 'single' | 'pro' | 'team' | 'vip';
    promoCode?: string;
    currency?: string;
    durationMs?: number;
    secretsCount?: number;
    pairSlug?: string;
  }): void {
    this.track({
      type: 'conversion_completed',
      channel: meta.pairSlug ? 'pseo' : 'web',
      pairSlug: meta.pairSlug,
      projectTitleAnon: this.anonymizeTitle(meta.projectTitle),
      sourcePlatform: meta.sourcePlatform,
      targetPlatform: meta.targetPlatform,
      fileCount: meta.fileCount,
      sizeBytes: meta.sizeBytes,
      parityScore: meta.parityScore,
      isFreeTier: meta.isFreeTier,
      planTier: meta.planTier,
      promoCode: meta.promoCode,
      currency: meta.currency || 'USD',
      durationMs: meta.durationMs,
      secretsCount: meta.secretsCount,
    });
  }

  public static trackCheckout(
    planTier: 'single' | 'pro' | 'team',
    amount?: string,
    currency?: string,
    pairSlug?: string
  ): void {
    const numericAmount = amount ? Number.parseFloat(amount) : planTier === 'single' ? 1.99 : planTier === 'pro' ? 5.99 : 19.99;
    this.track({
      type: 'checkout_initiated',
      channel: pairSlug ? 'pseo' : 'web',
      pairSlug,
      planTier,
      amountUsd: Number.isFinite(numericAmount) ? numericAmount : 1.99,
      currency: currency || 'USD',
    });
  }

  public static trackPromo(promoCode: string, discountPercent: number): void {
    this.track({
      type: 'promo_applied',
      channel: 'web',
      promoCode,
      planTier: discountPercent === 100 ? 'vip' : 'pro',
    });
  }

  public static trackInvoiceDownload(invoiceNumber: string, planTier?: 'free' | 'single' | 'pro' | 'team' | 'vip'): void {
    this.track({
      type: 'invoice_downloaded',
      channel: 'web',
      projectTitleAnon: invoiceNumber,
      planTier,
    });
  }

  public static trackCliTokenCopied(planTier?: 'free' | 'single' | 'pro' | 'team' | 'vip'): void {
    this.track({
      type: 'cli_token_copied',
      channel: 'cli',
      planTier,
    });
  }

  /**
   * Retrieves all stored analytics events from local sovereign store
   */
  public static getEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public static clearEvents(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('promptshift_analytics_updated'));
      fetch('/api/analytics', { method: 'DELETE' }).catch(() => {});
    } catch {
      // Ignore
    }
  }

  public static seedRealisticData(): void {
    if (typeof window === 'undefined') return;
    const seeded = this.generateRealisticSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    window.dispatchEvent(new CustomEvent('promptshift_analytics_updated'));
  }

  private static saveLocalEvent(event: AnalyticsEvent): void {
    try {
      const existing = this.getEvents();
      existing.unshift(event);
      if (existing.length > MAX_LOCAL_EVENTS) {
        existing.splice(MAX_LOCAL_EVENTS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // Local storage quota exceeded or disabled
    }
  }

  private static anonymizeTitle(rawTitle: string): string {
    if (!rawTitle) return 'ai-agent-bundle';
    const clean = rawTitle.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    if (clean.length <= 4) return clean;
    return clean.substring(0, 14);
  }

  /**
   * Generates realistic telemetry distribution for optional sandbox simulation
   */
  private static generateRealisticSeedData(): AnalyticsEvent[] {
    const events: AnalyticsEvent[] = [];
    const now = Date.now();

    const targets: PlatformId[] = ['claude', 'claude', 'claude', 'cursor', 'cursor', 'openai', 'gemini'];
    const sources: PlatformId[] = ['antigravity', 'antigravity', 'gemini', 'gemini', 'claude', 'openai'];
    const currencies = ['USD', 'USD', 'USD', 'EUR', 'GBP', 'CAD', 'JPY'];
    const plans: ('free' | 'single' | 'pro' | 'team' | 'vip')[] = ['free', 'free', 'single', 'pro', 'vip', 'team'];

    for (let i = 0; i < 140; i++) {
      const offsetMs = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
      events.push({
        id: 'ev_pv_' + i,
        type: 'page_view',
        path: '/',
        channel: 'web',
        timestamp: new Date(now - offsetMs).toISOString(),
        currency: currencies[i % currencies.length],
        country: ['US', 'FR', 'DE', 'GB', 'CA', 'JP'][i % 6],
      });
    }

    for (let i = 0; i < 34; i++) {
      const offsetMs = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
      const fileCount = Math.floor(Math.random() * 18) + 2;
      const sizeBytes = fileCount * 7800 + Math.floor(Math.random() * 45000);
      const isFree = fileCount <= 2;
      const plan = isFree ? (i % 5 === 0 ? 'vip' : 'free') : plans[i % plans.length];
      const target = targets[i % targets.length];
      const source = sources[i % sources.length];
      const secrets = i % 3 === 0 ? Math.floor(Math.random() * 3) + 1 : 0;

      events.push({
        id: 'ev_conv_' + i,
        type: 'conversion_completed',
        channel: 'web',
        timestamp: new Date(now - offsetMs).toISOString(),
        sourcePlatform: source,
        targetPlatform: target,
        projectTitleAnon: `agent-${target}-${i + 1}`,
        fileCount,
        sizeBytes,
        parityScore: 98.2 + Math.round(Math.random() * 15) / 10,
        isFreeTier: isFree,
        planTier: plan,
        promoCode: plan === 'vip' ? 'DEVVIP' : undefined,
        currency: currencies[i % currencies.length],
        secretsCount: secrets,
        durationMs: 450 + Math.floor(Math.random() * 800),
      });
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
