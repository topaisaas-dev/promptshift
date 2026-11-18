/**
 * PromptShift Analytics Engine — Type Definitions
 * Complete privacy-first, zero-retention telemetry schema for product intelligence.
 */

export type PlatformId = 'gemini' | 'claude' | 'cursor' | 'openai' | 'antigravity' | string;

export type AnalyticsPeriod = 'today' | '7d' | '30d' | 'all';

export type SocialNetworkId =
  | 'x'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'youtube'
  | 'linkedin'
  | 'threads'
  | 'pinterest';

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export type TelemetryChannel =
  | 'web'
  | 'pseo'
  | 'mcp'
  | 'cli'
  | 'llmo'
  | 'x_social'
  | 'social_instagram'
  | 'social_tiktok'
  | 'social_facebook'
  | 'social_youtube'
  | 'social_linkedin'
  | 'social_threads'
  | 'social_pinterest';

export type EventType =
  | 'page_view'
  | 'project_upload'
  | 'paywall_hit'
  | 'conversion_completed'
  | 'checkout_initiated'
  | 'order_bump_selected'
  | 'payment_completed'
  | 'promo_applied'
  | 'invoice_downloaded'
  | 'cli_token_copied'
  | 'target_selected'
  | 'mcp_probe'
  | 'mcp_tool_call'
  | 'llms_crawl'
  | 'cli_convert'
  | 'lead_captured';

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  timestamp: string; // ISO 8601
  path?: string;
  pairSlug?: string;
  channel?: TelemetryChannel;
  sourcePlatform?: PlatformId;
  targetPlatform?: PlatformId;
  projectTitleAnon?: string;
  fileCount?: number;
  sizeBytes?: number;
  parityScore?: number;
  isFreeTier?: boolean;
  planTier?: 'free' | 'single' | 'pro' | 'team' | 'vip';
  amountUsd?: number;
  promoCode?: string;
  currency?: string;
  durationMs?: number;
  secretsCount?: number;
  country?: string;
  userAgentSnippet?: string;
  sessionId?: string;
  referrer?: string;
  referrerDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  botName?: string;
  inferredIntent?: string;
  socialNetwork?: SocialNetworkId;
  deviceType?: DeviceType;
  campaignOrPost?: string;
  actionStage?: string;
}

export interface EdgeDeliveryStats {
  cloudflareCacheHitRatio: number | null; // External Cloudflare dashboard metric (null when unavailable in-RAM)
  edgeBandwidthSavedMB: number | null;
  averageEdgeLatencyMs: number | null;
  wafThreatsBlocked: number;
  aiBotsAllowedCount: number; // ClaudeBot, GPTBot, PerplexityBot
  vercelServerlessInvocations: number;
  vercelAverageExecutionDurationMs: number;
  coreWebVitalsLcpSec: number | null;
  coreWebVitalsInpMs: number | null;
  coreWebVitalsCls: number | null;
  dataSourceNote?: string;
}

export interface ArbitrageDecisionItem {
  id: string;
  pillar: 'ecosystem' | 'pricing' | 'channel' | 'security' | 'infra';
  pillarLabel: string;
  observedMetric: string;
  currentValue: string;
  trend: 'positive' | 'warning' | 'neutral';
  diagnostic: string;
  tradeoffA: string;
  tradeoffB: string;
  recommendedArbitrage: string;
  immediateAgileAction: string;
  urgency: 'critical' | 'high' | 'medium';
}

export interface TelemetryFilter {
  searchQuery?: string;
  period: AnalyticsPeriod;
  eventType?: EventType | 'all';
  sourcePlatform?: string | 'all';
  targetPlatform?: string | 'all';
  planTier?: 'all' | 'free' | 'single' | 'pro' | 'team' | 'vip';
  country?: string | 'all';
  sizeCategory?: 'all' | 'under5' | 'sixTo15' | 'sixteenTo50' | 'over50';
}

export interface SocialNetworkStat {
  id: SocialNetworkId;
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  uniqueSessions: number;
  totalPageViews: number;
  trafficSharePct: number; // Social traffic share (%)
  ordersAttributed: number; // Customer orders attributed
  revenueAttributedUsd: number; // Chiffre d'affaires ($)
  revenueAttributedEur: number; // Chiffre d'affaires (€)
  croRatePct: number; // Taux de conversion CRO (%)
}

export interface SocialInboundLogEntry {
  id: string;
  timestamp: string;
  socialNetwork: SocialNetworkId;
  socialNetworkName: string;
  path: string;
  campaignOrPost: string;
  deviceType: DeviceType;
  actionTriggered: string; // Page Visit, Project Upload, Paywall Hit (402), Polar Checkout Initiated, Payment Completed
  country?: string;
  amountUsd?: number;
  rawReferrer?: string;
}

export interface SocialTrafficSummary {
  totalSocialSessions: number;
  totalSocialPageViews: number;
  totalSocialOrders: number;
  totalSocialRevenueUsd: number;
  totalSocialRevenueEur: number;
  overallSocialCroPct: number;
  networks: Record<SocialNetworkId, SocialNetworkStat>;
  recentLogs: SocialInboundLogEntry[];
}

export interface MetricSummary {
  period: AnalyticsPeriod;
  totalPageViews: number;
  uniqueSessions: number;
  totalConversions: number;
  freeConversions: number;
  paidConversions: number;
  vipConversions: number;
  conversionRate: number; // percentage
  totalFilesProcessed: number;
  totalBytesProcessed: number;
  averageParityScore: number;
  totalSecretsSanitized: number;
  targetPlatformShare: Record<string, number>;
  sourcePlatformShare: Record<string, number>;
  fileCountDistribution: {
    under5Files: number; // Freemium range
    sixTo15Files: number;
    sixteenTo50Files: number;
    over50Files: number;
  };
  sizeDistribution: {
    under50KB: number;
    fiftyTo250KB: number;
    twoFiftyKBToOneMB: number;
    overOneMB: number;
  };
  currencyBreakdown: Record<string, number>;
  recentEvents: AnalyticsEvent[];
  timeline: {
    label: string;
    conversions: number;
    pageViews: number;
  }[];
  edgeStats: EdgeDeliveryStats;
  arbitrageMatrix: ArbitrageDecisionItem[];
  geoSearchInbound: {
    chatgptClicks: number;
    perplexityClicks: number;
    claudeClicks: number;
    googleSearchClicks: number;
    xSocialClicks: number;
    githubClicks: number;
    directOrOtherClicks: number;
    aiBotCrawls: number;
    recentReferrals: {
      id: string;
      timestamp: string;
      sourceName: string;
      domain: string;
      path: string;
      inferredIntent: string;
      country?: string;
      userAgentSnippet?: string;
      rawReferrer?: string;
    }[];
  };
  socialTraffic: SocialTrafficSummary;
}

export interface ProductOptimizationTip {
  id: string;
  category: 'growth' | 'pricing' | 'ux' | 'security' | 'marketing';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'critical';
  metricGrounding: string;
  actionableStep: string;
}
