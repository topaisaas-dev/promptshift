/**
 * PromptShift Analytics Engine — Type Definitions
 * Complete privacy-first, zero-retention telemetry schema for product intelligence.
 */

export type PlatformId = 'gemini' | 'claude' | 'cursor' | 'openai' | 'antigravity' | string;

export type AnalyticsPeriod = 'today' | '7d' | '30d' | 'all';

export type TelemetryChannel = 'web' | 'pseo' | 'mcp' | 'cli' | 'llmo' | 'x_social';

export type EventType =
  | 'page_view'
  | 'project_upload'
  | 'paywall_hit'
  | 'conversion_completed'
  | 'checkout_initiated'
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
}

export interface EdgeDeliveryStats {
  cloudflareCacheHitRatio: number; // e.g. 94.2%
  edgeBandwidthSavedMB: number; // e.g. 48.6 MB
  averageEdgeLatencyMs: number; // e.g. 18 ms
  wafThreatsBlocked: number;
  aiBotsAllowedCount: number; // ClaudeBot, GPTBot, PerplexityBot
  vercelServerlessInvocations: number;
  vercelAverageExecutionDurationMs: number;
  coreWebVitalsLcpSec: number;
  coreWebVitalsInpMs: number;
  coreWebVitalsCls: number;
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
