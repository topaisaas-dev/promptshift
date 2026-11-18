/**
 * PromptShift Analytics Tracker — Sovereign Client & Server Telemetry
 * Captures user journey events, persists locally in client vault, and syncs to API.
 * Strictly 100% REAL telemetry with zero synthetic or mock event generation.
 */

import { AnalyticsEvent, DeviceType, PlatformId, SocialNetworkId, TelemetryChannel } from './analyticsTypes';

const STORAGE_KEY = 'promptshift_analytics_events';
const MAX_LOCAL_EVENTS = 500;
const SOCIAL_STORAGE_KEY = 'promptshift_social_source';
const CAMPAIGN_STORAGE_KEY = 'promptshift_social_campaign';
const ATTRIBUTION_STORAGE_KEY = 'promptshift_attribution_v1';
const ATTRIBUTION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface StoredAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  channel?: TelemetryChannel;
  referrerDomain?: string;
  landingPath?: string;
  socialNetwork?: SocialNetworkId;
  campaignOrPost?: string;
  capturedAt: number;
}

export class AnalyticsTracker {
  /**
   * Retrieves or creates a real session ID for the active browser tab
   */
  public static getSessionId(): string {
    if (typeof window === 'undefined') return 'sess_server';
    try {
      let sess = sessionStorage.getItem('promptshift_session_id');
      if (!sess) {
        sess = `ps_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('promptshift_session_id', sess);
      }
      return sess;
    } catch {
      return `ps_sess_ephemeral_${Date.now()}`;
    }
  }

  /**
   * Detects social network from referrer, UTM parameters, or in-app User Agent
   */
  public static detectSocialNetwork(
    referrer?: string,
    utmSource?: string,
    userAgent?: string
  ): SocialNetworkId | undefined {
    const ref = (referrer || '').toLowerCase();
    const utm = (utmSource || '').toLowerCase();
    const ua = (userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '').toLowerCase();

    // 1. X (Twitter)
    if (
      ref.includes('t.co') ||
      ref.includes('x.com') ||
      ref.includes('twitter.com') ||
      utm === 'x' ||
      utm === 'twitter' ||
      utm === 'x.com'
    ) {
      return 'x';
    }

    // 2. Instagram
    if (
      ref.includes('instagram.com') ||
      ref.includes('l.instagram.com') ||
      utm === 'instagram' ||
      utm === 'ig' ||
      ua.includes('instagram')
    ) {
      return 'instagram';
    }

    // 3. TikTok
    if (
      ref.includes('tiktok.com') ||
      ref.includes('link.tiktok.com') ||
      ref.includes('vt.tiktok.com') ||
      utm === 'tiktok' ||
      ua.includes('tiktok') ||
      ua.includes('musical_ly')
    ) {
      return 'tiktok';
    }

    // 4. Facebook
    if (
      ref.includes('facebook.com') ||
      ref.includes('fb.me') ||
      ref.includes('l.facebook.com') ||
      ref.includes('lm.facebook.com') ||
      utm === 'facebook' ||
      utm === 'fb' ||
      ua.includes('fbav') ||
      ua.includes('fban')
    ) {
      return 'facebook';
    }

    // 5. YouTube
    if (
      ref.includes('youtube.com') ||
      ref.includes('youtu.be') ||
      utm === 'youtube' ||
      utm === 'yt'
    ) {
      return 'youtube';
    }

    // 6. LinkedIn
    if (
      ref.includes('linkedin.com') ||
      ref.includes('lnkd.in') ||
      utm === 'linkedin'
    ) {
      return 'linkedin';
    }

    // 7. Threads
    if (
      ref.includes('threads.net') ||
      ref.includes('l.threads.net') ||
      utm === 'threads'
    ) {
      return 'threads';
    }

    // 8. Pinterest
    if (
      ref.includes('pinterest.com') ||
      ref.includes('pin.it') ||
      utm === 'pinterest'
    ) {
      return 'pinterest';
    }

    return undefined;
  }

  /**
   * Detects device type (mobile, tablet, desktop)
   */
  public static detectDeviceType(userAgent?: string): DeviceType {
    const ua = (userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '').toLowerCase();
    if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
      return 'tablet';
    }
    if (/mobi|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Formats campaign or post string (e.g. from UTM campaign / content)
   */
  public static detectCampaignOrPost(utmCampaign?: string, utmContent?: string): string {
    if (utmCampaign && utmCampaign.trim()) {
      if (utmContent && utmContent.trim()) {
        return `${utmCampaign} (${utmContent})`;
      }
      return utmCampaign;
    }
    if (utmContent && utmContent.trim()) {
      return utmContent;
    }
    return 'Direct Bio / Post Link';
  }

  /**
   * Attribution: persists social source across customer journey in sessionStorage
   */
  public static setAttributedSocialSource(socialNetwork: SocialNetworkId, campaignOrPost: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(SOCIAL_STORAGE_KEY, socialNetwork);
      sessionStorage.setItem(CAMPAIGN_STORAGE_KEY, campaignOrPost);
    } catch {
      // ignore
    }
  }

  public static getAttributedSocialSource(): { socialNetwork?: SocialNetworkId; campaignOrPost?: string } {
    if (typeof window === 'undefined') return {};
    try {
      const socialNetwork = (sessionStorage.getItem(SOCIAL_STORAGE_KEY) as SocialNetworkId) || undefined;
      const campaignOrPost = sessionStorage.getItem(CAMPAIGN_STORAGE_KEY) || undefined;
      if (socialNetwork || campaignOrPost) {
        return { socialNetwork, campaignOrPost };
      }
      const attr = this.getAttribution();
      return { socialNetwork: attr?.socialNetwork, campaignOrPost: attr?.campaignOrPost };
    } catch {
      return {};
    }
  }

  /**
   * Persists full first-touch / UTM attribution across sessionStorage + localStorage fallback
   * so mobile WebViews (X, LinkedIn, Reddit, HN, Discord) retain attribution all the way to Polar Checkout.
   */
  public static saveAttribution(attr: Omit<StoredAttribution, 'capturedAt'>): void {
    if (typeof window === 'undefined') return;
    const hasSignal = Boolean(
      attr.utmSource ||
        attr.utmMedium ||
        attr.utmCampaign ||
        attr.utmContent ||
        attr.utmTerm ||
        attr.socialNetwork ||
        (attr.channel && attr.channel !== 'web')
    );
    if (!hasSignal) return;

    const existing = this.getAttribution();
    const merged: StoredAttribution = {
      utmSource: attr.utmSource || existing?.utmSource,
      utmMedium: attr.utmMedium || existing?.utmMedium,
      utmCampaign: attr.utmCampaign || existing?.utmCampaign,
      utmContent: attr.utmContent || existing?.utmContent,
      utmTerm: attr.utmTerm || existing?.utmTerm,
      channel:
        attr.channel && attr.channel !== 'web'
          ? attr.channel
          : existing?.channel || attr.channel || 'web',
      referrerDomain:
        attr.referrerDomain && attr.referrerDomain !== 'direct'
          ? attr.referrerDomain
          : existing?.referrerDomain || attr.referrerDomain,
      landingPath: existing?.landingPath || attr.landingPath,
      socialNetwork: attr.socialNetwork || existing?.socialNetwork,
      campaignOrPost:
        attr.campaignOrPost && attr.campaignOrPost !== 'Direct Bio / Post Link'
          ? attr.campaignOrPost
          : existing?.campaignOrPost || attr.campaignOrPost,
      capturedAt: Date.now(),
    };

    const serialized = JSON.stringify(merged);
    try {
      sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, serialized);
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(ATTRIBUTION_STORAGE_KEY, serialized);
    } catch {
      // ignore
    }
  }

  /**
   * Retrieves persisted attribution (checks sessionStorage first, falls back to 7-day localStorage).
   */
  public static getAttribution(): StoredAttribution | null {
    if (typeof window === 'undefined') return null;
    const readStore = (storage: Storage): StoredAttribution | null => {
      try {
        const raw = storage.getItem(ATTRIBUTION_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredAttribution;
        if (!parsed || typeof parsed !== 'object') return null;
        if (parsed.capturedAt && Date.now() - parsed.capturedAt > ATTRIBUTION_TTL_MS) {
          storage.removeItem(ATTRIBUTION_STORAGE_KEY);
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    };

    return readStore(sessionStorage) || readStore(localStorage);
  }

  /**
   * Resolves the effective acquisition channel (preserving persisted UTM/social/LLMO channel
   * across navigation instead of overwriting with generic 'web').
   */
  public static resolveEffectiveChannel(explicitPairSlug?: string, fallback: TelemetryChannel = 'web'): TelemetryChannel {
    const attr = this.getAttribution();
    if (attr?.channel && attr.channel !== 'web') {
      return attr.channel;
    }
    if (attr?.socialNetwork) {
      return attr.socialNetwork === 'x'
        ? 'x_social'
        : (`social_${attr.socialNetwork}` as TelemetryChannel);
    }
    if (explicitPairSlug) return 'pseo';
    return fallback;
  }

  /**
   * Extracts clean domain from raw HTTP referrer
   */
  public static resolveReferrerDomain(rawReferrer?: string): string {
    if (!rawReferrer || !rawReferrer.trim()) return 'direct';
    const lower = rawReferrer.toLowerCase();
    if (lower.includes('chatgpt.com') || lower.includes('chat.openai.com')) return 'chatgpt.com';
    if (lower.includes('perplexity.ai')) return 'perplexity.ai';
    if (lower.includes('claude.ai')) return 'claude.ai';
    if (lower.includes('google.')) return 'google.com';
    if (lower.includes('t.co') || lower.includes('x.com') || lower.includes('twitter.com')) return 'x.com';
    if (lower.includes('instagram.com')) return 'instagram.com';
    if (lower.includes('tiktok.com')) return 'tiktok.com';
    if (lower.includes('facebook.com') || lower.includes('fb.me')) return 'facebook.com';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube.com';
    if (lower.includes('linkedin.com') || lower.includes('lnkd.in')) return 'linkedin.com';
    if (lower.includes('threads.net')) return 'threads.net';
    if (lower.includes('pinterest.com') || lower.includes('pin.it')) return 'pinterest.com';
    if (lower.includes('github.com')) return 'github.com';
    if (lower.includes('bing.com')) return 'bing.com';
    try {
      const u = new URL(rawReferrer);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return 'external';
    }
  }

  /**
   * Infers user intent based on landing URL and conversion slug
   */
  public static inferIntent(path: string, pairSlug?: string): string {
    if (pairSlug) {
      const parts = pairSlug.split('-to-');
      if (parts.length === 2) {
        return `Migration ${parts[0].toUpperCase()} ➔ ${parts[1].toUpperCase()}`;
      }
      return `Migration ${pairSlug}`;
    }
    if (path === '/discover') return 'AI Rules Authority Guide (GEO)';
    if (path === '/cli') return 'CLI npx & MCP Server Setup';
    if (path === '/privacy' || path === '/security') return 'Security & Zero-Retention Audit';
    if (path === '/terms') return 'Terms & License';
    if (path === '/') return 'Universal Studio Landing';
    return `Navigation ${path}`;
  }

  /**
   * Tracks an arbitrary telemetry event with automatic social attribution & device detection
   */
  public static track(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    if (typeof window === 'undefined') return;

    const attributed = this.getAttributedSocialSource();
    const storedAttr = this.getAttribution();
    const deviceType = event.deviceType || this.detectDeviceType();
    const socialNetwork = event.socialNetwork || attributed.socialNetwork || storedAttr?.socialNetwork;
    const campaignOrPost = event.campaignOrPost || attributed.campaignOrPost || storedAttr?.campaignOrPost;

    const fullEvent: AnalyticsEvent = {
      ...event,
      id: 'ev_' + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      userAgentSnippet: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 60) : undefined,
      sessionId: event.sessionId || this.getSessionId(),
      deviceType,
      socialNetwork,
      campaignOrPost,
      utmSource: event.utmSource || storedAttr?.utmSource,
      utmMedium: event.utmMedium || storedAttr?.utmMedium,
      utmCampaign: event.utmCampaign || storedAttr?.utmCampaign,
      utmContent: event.utmContent || storedAttr?.utmContent,
      utmTerm: event.utmTerm || storedAttr?.utmTerm,
    };

    // 1. Save locally in Sovereign Analytics store (real data only)
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

  public static trackPageView(
    pathOrOptions:
      | string
      | {
          path?: string;
          country?: string;
          currency?: string;
          referrer?: string;
          searchParams?: URLSearchParams | Record<string, string>;
        } = '/',
    countryArg?: string,
    currencyArg?: string
  ): void {
    let path = '/';
    let country = countryArg;
    let currency = currencyArg;
    let rawReferrer = typeof document !== 'undefined' ? document.referrer : undefined;
    let utmSource: string | undefined;
    let utmMedium: string | undefined;
    let utmCampaign: string | undefined;
    let utmTerm: string | undefined;
    let utmContent: string | undefined;

    if (typeof pathOrOptions === 'object' && pathOrOptions !== null) {
      path = pathOrOptions.path || '/';
      country = pathOrOptions.country || country;
      currency = pathOrOptions.currency || currency;
      if (pathOrOptions.referrer !== undefined) {
        rawReferrer = pathOrOptions.referrer;
      }
      if (pathOrOptions.searchParams) {
        if (pathOrOptions.searchParams instanceof URLSearchParams) {
          utmSource = pathOrOptions.searchParams.get('utm_source') || undefined;
          utmMedium = pathOrOptions.searchParams.get('utm_medium') || undefined;
          utmCampaign = pathOrOptions.searchParams.get('utm_campaign') || undefined;
          utmContent = pathOrOptions.searchParams.get('utm_content') || undefined;
          utmTerm = pathOrOptions.searchParams.get('utm_term') || pathOrOptions.searchParams.get('q') || undefined;
        } else {
          utmSource = pathOrOptions.searchParams.utm_source;
          utmMedium = pathOrOptions.searchParams.utm_medium;
          utmCampaign = pathOrOptions.searchParams.utm_campaign;
          utmContent = (pathOrOptions.searchParams as any).utm_content;
          utmTerm = pathOrOptions.searchParams.utm_term || pathOrOptions.searchParams.q;
        }
      }
    } else if (typeof pathOrOptions === 'string') {
      path = pathOrOptions;
    }

    if (typeof window !== 'undefined' && !utmSource) {
      try {
        const sp = new URLSearchParams(window.location.search);
        utmSource = sp.get('utm_source') || undefined;
        utmMedium = sp.get('utm_medium') || undefined;
        utmCampaign = sp.get('utm_campaign') || undefined;
        utmContent = sp.get('utm_content') || undefined;
        utmTerm = sp.get('utm_term') || sp.get('q') || undefined;
      } catch {
        // ignore
      }
    }

    const detectedSocial = this.detectSocialNetwork(rawReferrer, utmSource);
    const campaignOrPost = this.detectCampaignOrPost(utmCampaign, utmContent);

    if (detectedSocial) {
      this.setAttributedSocialSource(detectedSocial, campaignOrPost);
    }

    const referrerDomain = this.resolveReferrerDomain(rawReferrer);
    const pairMatch = path.match(/^\/convert\/([a-z0-9-]+)$/i);
    const pairSlug = pairMatch ? pairMatch[1].toLowerCase() : undefined;

    let channel: TelemetryChannel = 'web';
    if (detectedSocial) {
      channel = detectedSocial === 'x' ? 'x_social' : (`social_${detectedSocial}` as TelemetryChannel);
    } else if (referrerDomain.includes('chatgpt') || referrerDomain.includes('perplexity') || referrerDomain.includes('claude')) {
      channel = 'llmo';
    } else if (pairSlug) {
      channel = 'pseo';
    } else if (path.startsWith('/cli')) {
      channel = 'cli';
    }

    // Persist full attribution (including reddit/hn/producthunt/github/newsletter/google UTMs)
    this.saveAttribution({
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      channel,
      referrerDomain,
      landingPath: path,
      socialNetwork: detectedSocial,
      campaignOrPost: utmCampaign || utmContent ? campaignOrPost : undefined,
    });

    const effectiveChannel = channel !== 'web' ? channel : this.resolveEffectiveChannel(pairSlug, 'web');
    const inferredIntent = this.inferIntent(path, pairSlug);
    const sessionId = this.getSessionId();
    const deviceType = this.detectDeviceType();

    this.track({
      type: 'page_view',
      path,
      pairSlug,
      channel: effectiveChannel,
      country,
      currency: currency || 'USD',
      sessionId,
      referrer: rawReferrer || undefined,
      referrerDomain,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      inferredIntent,
      socialNetwork: detectedSocial,
      deviceType,
      campaignOrPost,
      actionStage: 'Page Visit',
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
      channel: this.resolveEffectiveChannel(meta.pairSlug),
      pairSlug: meta.pairSlug,
      projectTitleAnon: this.anonymizeTitle(meta.projectTitle),
      fileCount: meta.fileCount,
      sizeBytes: meta.sizeBytes,
      sourcePlatform: meta.sourcePlatform,
      actionStage: 'Project Upload',
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
      channel: this.resolveEffectiveChannel(meta.pairSlug),
      pairSlug: meta.pairSlug,
      projectTitleAnon: this.anonymizeTitle(meta.projectTitle),
      fileCount: meta.fileCount,
      sourcePlatform: meta.sourcePlatform,
      targetPlatform: meta.targetPlatform,
      planTier: 'single',
      actionStage: 'Paywall Hit (402)',
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
      channel: this.resolveEffectiveChannel(meta.pairSlug),
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
      actionStage: 'Conversion Completed',
    });
  }

  public static trackCheckout(
    planTier: 'single' | 'pro' | 'team',
    amount?: string,
    currency?: string,
    pairSlug?: string
  ): void {
    const numericAmount = amount ? Number.parseFloat(amount) : planTier === 'single' ? 1.99 : planTier === 'pro' ? 5.99 : 19.99;
    const finalAmount = Number.isFinite(numericAmount) ? numericAmount : 1.99;
    this.track({
      type: 'checkout_initiated',
      channel: this.resolveEffectiveChannel(pairSlug),
      pairSlug,
      planTier,
      amountUsd: finalAmount,
      currency: currency || 'USD',
      actionStage: 'Polar Checkout Initiated',
    });
  }

  public static trackPaymentCompleted(meta: {
    planTier: 'single' | 'pro' | 'team' | 'vip';
    amountUsd: number;
    currency?: string;
    checkoutId?: string;
    pairSlug?: string;
  }): void {
    this.track({
      type: 'payment_completed',
      channel: this.resolveEffectiveChannel(meta.pairSlug),
      pairSlug: meta.pairSlug,
      planTier: meta.planTier,
      amountUsd: meta.amountUsd,
      currency: meta.currency || 'USD',
      actionStage: `Payment Completed ($${meta.amountUsd.toFixed(2)})`,
    });
  }

  public static trackPromo(promoCode: string, discountPercent: number): void {
    this.track({
      type: 'promo_applied',
      channel: 'web',
      promoCode,
      planTier: discountPercent === 100 ? 'vip' : 'pro',
      actionStage: `Promo Applied (${promoCode})`,
    });
  }

  public static trackInvoiceDownload(invoiceNumber: string, planTier?: 'free' | 'single' | 'pro' | 'team' | 'vip'): void {
    this.track({
      type: 'invoice_downloaded',
      channel: 'web',
      projectTitleAnon: invoiceNumber,
      planTier,
      actionStage: 'Receipt Downloaded',
    });
  }

  public static trackCliTokenCopied(planTier?: 'free' | 'single' | 'pro' | 'team' | 'vip'): void {
    this.track({
      type: 'cli_token_copied',
      channel: 'cli',
      planTier,
      actionStage: 'CLI Key Copied',
    });
  }

  /**
   * Retrieves all stored analytics events from local sovereign store (real events only)
   */
  public static getEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Purge any legacy synthetic demo seeds to guarantee 100% ground-truth
      const realOnly = parsed.filter(
        (e: AnalyticsEvent) => e && e.id && !e.id.startsWith('ev_pv_') && !e.id.startsWith('ev_conv_')
      );
      if (realOnly.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realOnly));
      }
      return realOnly;
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

  /**
   * Purges any legacy synthetic demo events from local browser storage
   */
  public static purgeSyntheticData(): void {
    if (typeof window === 'undefined') return;
    const realOnly = this.getEvents();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(realOnly));
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
}
