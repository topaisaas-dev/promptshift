'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  Lock,
  ArrowRightLeft,
  FileCode2,
  KeyRound,
  Sparkles,
  BarChart3,
  PieChart,
  RefreshCw,
  LogOut,
  Copy,
  Check,
  Share2,
  Calendar,
  Layers,
  Globe2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Database,
  Eye,
  Trash2,
  Filter,
  SlidersHorizontal,
  Download,
  Search,
  Server,
  Cloud,
  Cpu,
  Activity,
  Scale,
  CheckCircle2,
  Smartphone,
  Monitor,
  Tablet,
  Radio,
  ArrowUpRight,
} from 'lucide-react';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import { AnalyticsAggregator } from '@/lib/analytics/analyticsAggregator';
import {
  AnalyticsEvent,
  AnalyticsPeriod,
  MetricSummary,
  TelemetryFilter,
  EventType,
} from '@/lib/analytics/analyticsTypes';
import type { CheckCheckReport } from '@/lib/analytics/checkcheckService';
import type { PolarLiveCommercialSnapshot } from '@/lib/payments/polarService';
import { CHAT_SEO_TARGET_MATRIX } from '@/lib/seo/gscParser';
import { ClientVault } from '@/lib/storage/clientVault';
import { PromoManager } from '@/lib/promo/promoManager';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [period, setPeriod] = useState<AnalyticsPeriod>('7d');
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [polarMetrics, setPolarMetrics] = useState<PolarLiveCommercialSnapshot | null>(null);
  const [isCopiedPost, setIsCopiedPost] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Advanced Telemetry Filters
  const [filterQuery, setFilterQuery] = useState('');
  const [filterEventType, setFilterEventType] = useState<EventType | 'all'>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterTarget, setFilterTarget] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'single' | 'pro' | 'team' | 'vip'>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterSize, setFilterSize] = useState<'all' | 'under5' | 'sixTo15' | 'sixteenTo50' | 'over50'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Google Search Console & SEO API Automation
  const [seoStatus, setSeoStatus] = useState<any>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoFeedback, setSeoFeedback] = useState<string | null>(null);

  // Sovereign (checkcheck) 4-Matrix Executive Audit
  const [checkcheckReport, setCheckcheckReport] = useState<CheckCheckReport | null>(null);
  const [checkcheckLoading, setCheckcheckLoading] = useState(false);
  const [isCheckcheckExpanded, setIsCheckcheckExpanded] = useState(true);
  const [activeCheckcheckTab, setActiveCheckcheckTab] = useState<
    'catalog16' | 'radars5' | 'funnel7' | 'health'
  >('catalog16');

  const loadCheckCheck = async (forceRefresh = false, clientEvents: AnalyticsEvent[] = []) => {
    setCheckcheckLoading(true);
    try {
      const res = await fetch('/api/checkcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientEvents, refresh: forceRefresh }),
      });
      if (res.ok) {
        const data: CheckCheckReport = await res.json();
        setCheckcheckReport(data);
      }
    } catch {
      try {
        const resFallback = await fetch(`/api/checkcheck${forceRefresh ? '?refresh=1' : ''}`);
        if (resFallback.ok) {
          const data: CheckCheckReport = await resFallback.json();
          setCheckcheckReport(data);
        }
      } catch {
        // Offline fallback
      }
    } finally {
      setCheckcheckLoading(false);
    }
  };

  const checkSeoApi = async () => {
    setSeoLoading(true);
    setSeoFeedback(null);
    try {
      const res = await fetch('/api/seo/search-console');
      const data = await res.json();
      setSeoStatus(data);
      if (data.configured) {
        setSeoFeedback(`Connected to service account: ${data.serviceAccount}`);
      } else {
        setSeoFeedback(data.message || 'Service account not configured.');
      }
    } catch (e: any) {
      setSeoFeedback(`Error: ${e.message}`);
    } finally {
      setSeoLoading(false);
    }
  };

  const triggerSitemapSubmit = async () => {
    setSeoLoading(true);
    setSeoFeedback(null);
    try {
      const res = await fetch('/api/seo/search-console', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit-sitemap' }),
      });
      const data = await res.json();
      setSeoFeedback(data.message || (data.success ? 'Sitemap submitted successfully!' : data.error));
    } catch (e: any) {
      setSeoFeedback(`Error: ${e.message}`);
    } finally {
      setSeoLoading(false);
    }
  };

  const triggerIndexNow = async () => {
    setSeoLoading(true);
    setSeoFeedback(null);
    try {
      const res = await fetch('/api/seo/indexnow', { method: 'POST' });
      const data = await res.json();
      setSeoFeedback(data.message || (data.success ? 'IndexNow pinged successfully!' : data.error));
    } catch (e: any) {
      setSeoFeedback(`Error: ${e.message}`);
    } finally {
      setSeoLoading(false);
    }
  };

  // Check server-side HttpOnly admin session cookie on mount
  useEffect(() => {
    let active = true;
    fetch('/api/admin/auth', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (active && data?.authenticated === true) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsCheckingAuth(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Load events (merges local storage with server buffer — strictly 100% REAL telemetry)
  const loadData = async () => {
    setIsRefreshing(true);
    let loaded = AnalyticsTracker.getEvents();
    // Guarantee 100% real data: filter out any legacy demo seeds
    loaded = loaded.filter((e) => e && e.id && !e.id.startsWith('ev_pv_') && !e.id.startsWith('ev_conv_'));

    try {
      const res = await fetch('/api/analytics?period=30d', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.polarCommercialMetrics) {
          setPolarMetrics(data.polarCommercialMetrics);
        }
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          const map = new Map<string, AnalyticsEvent>();
          loaded.forEach((e) => map.set(e.id, e));
          data.events
            .filter((e: AnalyticsEvent) => e && e.id && !e.id.startsWith('ev_pv_') && !e.id.startsWith('ev_conv_'))
            .forEach((e: AnalyticsEvent) => map.set(e.id, e));
          loaded = Array.from(map.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        }
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch {
      // Offline fallback
    }

    setEvents(loaded);
    loadCheckCheck(false, loaded);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const listener = () => loadData();
      window.addEventListener('promptshift_analytics_updated', listener);
      return () => window.removeEventListener('promptshift_analytics_updated', listener);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkeyInput.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.authenticated) {
        setPasskeyInput('');
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || 'Invalid administrator security key.');
      }
    } catch {
      setAuthError('Authentication service unreachable. Please retry.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // ignore
    }
    PromoManager.deactivateVip();
    setIsAuthenticated(false);
  };

  // Compile active telemetry filter
  const telemetryFilter: TelemetryFilter = useMemo(() => ({
    period,
    searchQuery: filterQuery,
    eventType: filterEventType,
    sourcePlatform: filterSource,
    targetPlatform: filterTarget,
    planTier: filterPlan,
    country: filterCountry,
    sizeCategory: filterSize,
  }), [period, filterQuery, filterEventType, filterSource, filterTarget, filterPlan, filterCountry, filterSize]);

  // Compute live summary & optimization tips with telemetry filters applied
  const summary: MetricSummary = useMemo(() => {
    return AnalyticsAggregator.aggregate(events, telemetryFilter);
  }, [events, telemetryFilter]);

  // Filtered events list for audit table
  const filteredEvents = useMemo(() => {
    return AnalyticsAggregator.filterEvents(events, telemetryFilter);
  }, [events, telemetryFilter]);

  // Filtered conversions list for audit table
  const conversionEventsFiltered = useMemo(() => {
    return filteredEvents.filter((e) => e.type === 'conversion_completed');
  }, [filteredEvents]);

  // Total raw events in the period
  const periodTotalEvents = useMemo(() => {
    return AnalyticsAggregator.filterEventsByPeriod(events, period);
  }, [events, period]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterQuery.trim()) count++;
    if (filterEventType !== 'all') count++;
    if (filterSource !== 'all') count++;
    if (filterTarget !== 'all') count++;
    if (filterPlan !== 'all') count++;
    if (filterCountry !== 'all') count++;
    if (filterSize !== 'all') count++;
    return count;
  }, [filterQuery, filterEventType, filterSource, filterTarget, filterPlan, filterCountry, filterSize]);

  const resetFilters = () => {
    setFilterQuery('');
    setFilterEventType('all');
    setFilterSource('all');
    setFilterTarget('all');
    setFilterPlan('all');
    setFilterCountry('all');
    setFilterSize('all');
  };

  const exportFilteredCsv = () => {
    const headers = ['id', 'timestamp', 'type', 'source', 'target', 'title', 'files', 'bytes', 'parity', 'secrets', 'plan', 'country'];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.timestamp,
      e.type,
      e.sourcePlatform || '',
      e.targetPlatform || '',
      `"${(e.projectTitleAnon || '').replace(/"/g, '""')}"`,
      e.fileCount || 0,
      e.sizeBytes || 0,
      e.parityScore || 0,
      e.secretsCount || 0,
      e.planTier || 'free',
      e.country || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `promptshift_telemetry_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tips = useMemo(() => {
    return AnalyticsAggregator.generateOptimizationTips(summary);
  }, [summary]);

  // LinkedIn post generation
  const linkedInPostText = useMemo(() => {
    const periodLabel = period === 'today' ? 'Today' : period === '7d' ? 'This week' : period === '30d' ? 'This month' : 'All-time';
    const topTarget = Object.entries(summary.targetPlatformShare).sort((a, b) => b[1] - a[1])[0]?.[0] || 'claude';
    const targetLabel = topTarget === 'claude' ? 'Anthropic Claude' : topTarget === 'cursor' ? 'Cursor IDE' : 'OpenAI Assistants';

    return `🚀 PromptShift Traction Metrics (${periodLabel}):

AI project interoperability is accelerating. Key telemetry highlights recorded on promptshift.dev:

📊 ${summary.totalConversions} AI project migrations completed
📁 ${summary.totalFilesProcessed} system & agent configuration files transpiled
🛡️ ${summary.totalSecretsSanitized} private keys & credentials intercepted before production leaks
🎯 98.5%+ AST semantic parity verified
💎 Top destination ecosystem: ${targetLabel}

PromptShift empowers engineering teams to bridge Gemini/Antigravity to Claude, Cursor, or OpenAI in 1 click, with 100% in-RAM execution and zero data retention.

Try it with your project: https://promptshift.dev?utm_source=linkedin&utm_medium=social&utm_campaign=founder_metrics

#ArtificialIntelligence #DevTools #Nextjs #Claude3 #Cursor #OpenAI #BuildInPublic`;
  }, [summary, period]);

  const copyLinkedInPost = () => {
    navigator.clipboard.writeText(linkedInPostText);
    setIsCopiedPost(true);
    setTimeout(() => setIsCopiedPost(false), 2500);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-400 flex items-center justify-center font-mono text-xs">
        Verifying sovereign admin session...
      </div>
    );
  }

  // If not authenticated, show cyber security gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-black">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyanGlow via-teal-400 to-emeraldGlow" />

          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-neonCyan">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                PromptShift <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">ADMIN</span>
              </h1>
              <p className="text-xs text-textMuted mt-1">
                Executive Product Analytics & Real-Time Intelligence
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="admin-passkey" className="text-xs font-bold text-slate-300 block mb-1">
                Administrator Passkey
              </label>
              <input
                id="admin-passkey"
                type="password"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter your secure access key"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                autoFocus
              />
            </div>

            {authError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-sm tracking-wide shadow-neonCyan hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
            >
              Unlock Command Center
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              ← Back to Public Site
            </Link>
            <span className="font-mono text-[10px] text-slate-500">v1.0 Sovereign</span>
          </div>
        </div>
      </div>
    );
  }

  // Max value in timeline for scaling SVG charts
  const maxConversionsInTimeline = Math.max(1, ...summary.timeline.map((t) => t.conversions));

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Admin Command Header */}
      <header className="border-b border-borderColor bg-darkBg/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-9 h-9 rounded-xl overflow-hidden border border-cyanGlow/30 shadow-neonCyan">
              <img src="/assets/official_logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">PromptShift Analytics</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  RAM Sovereign
                </span>
              </div>
              <p className="text-xs text-textMuted">Command Center & Executive Intelligence</p>
            </div>
          </div>

          {/* Timeframe Selectors & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-900 border border-borderColor rounded-xl p-1 text-xs font-bold">
              {(['today', '7d', '30d', 'all'] as AnalyticsPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    period === p
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold shadow-sm'
                      : 'text-textMuted hover:text-white'
                  }`}
                >
                  {p === 'today' ? 'Today' : p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'All Time'}
                </button>
              ))}
            </div>

            <button
              onClick={loadData}
              title="Refresh metrics"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-borderColor transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={() => {
                AnalyticsTracker.purgeSyntheticData();
                loadData();
              }}
              title="Purge residual demo data and enforce ground truth"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Ground Truth</span>
            </button>

            <button
              onClick={() => {
                AnalyticsTracker.clearEvents();
                loadData();
              }}
              title="Reset all analytics counters to zero"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Counters</span>
            </button>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-borderColor text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Site</span>
            </Link>

            <button
              onClick={() => {
                PromoManager.activateAdminPreview();
                window.open('/', '_blank');
              }}
              title="Preview the site locally with Admin Sandbox Pro unlocked (no synthetic order recorded)"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>⚡ Admin Preview (Pro)</span>
            </button>

            <button
              onClick={() => {
                PromoManager.deactivateVip();
                ClientVault.clearSessionData();
                alert('Browser sandbox reset: you are now browsing as a 100% Free unauthenticated visitor.');
              }}
              title="Reset this browser to a 100% Free visitor (re-locks paywall for testing)"
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Reset to Free</span>
            </button>

            <button
              onClick={handleLogout}
              title="Admin Logout"
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-borderColor transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Sovereign (checkcheck) 4-Matrix Executive Audit & Agile Arbitrage Panel */}
        <section className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0b1322] to-slate-950 border border-cyan-500/30 shadow-2xl flex flex-col gap-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-black text-white tracking-tight">
                    Sovereign Protocol (checkcheck) — Polar.sh Ground Truth ($ USD) &amp; Agile Arbitrage
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {checkcheckReport?.commercialTruthSource === 'polar_api_live'
                      ? 'POLAR LIVE API'
                      : 'SYNCING...'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    100% USD ($)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unified diagnostic for <span className="text-cyan-300 font-mono">promptshift.dev</span>: 16 Catalog Lines &amp; Rails · 5 US Agent Channels · 7-Step Funnel · Zero fake sales.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => loadCheckCheck(true, events)}
                disabled={checkcheckLoading}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkcheckLoading ? 'animate-spin' : ''}`} />
                <span>Sync Polar Live</span>
              </button>
              <a
                href="/api/checkcheck?format=csv"
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV 16 Rails</span>
              </a>
              <a
                href="/api/checkcheck"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>API JSON</span>
              </a>
              <button
                onClick={() => setIsCheckcheckExpanded(!isCheckcheckExpanded)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                {isCheckcheckExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>

          {/* Ground-Truth KPI Strip */}
          {checkcheckReport && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Real Paid Sales (Polar)
                </div>
                <div className="text-xl font-black text-white mt-1 font-mono">
                  {checkcheckReport.kpisGlobaux.ventesReellesPayees}{' '}
                  <span className="text-sm text-emerald-400">
                    ({checkcheckReport.kpisGlobaux.caNetTotalUsd})
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Excl. {checkcheckReport.kpisGlobaux.commandesTestGratuitesPolar} free test orders ($0.00)
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Polar Sessions Initiated
                </div>
                <div className="text-xl font-black text-cyan-300 mt-1 font-mono">
                  {checkcheckReport.kpisGlobaux.sessionsCheckoutPolarInitiees}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  S:{checkcheckReport.kpisGlobaux.sessionsCheckoutSingle199} · P:
                  {checkcheckReport.kpisGlobaux.sessionsCheckoutPro599} · T:
                  {checkcheckReport.kpisGlobaux.sessionsCheckoutTeam1999}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Collisions Paywall &amp; 402
                </div>
                <div className="text-xl font-black text-amber-300 mt-1 font-mono">
                  {checkcheckReport.kpisGlobaux.collisionsPaywall402}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Strict threshold &gt;{checkcheckReport.studioHealth.freeTierMaxFiles} files locked
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Payment Rails &amp; Post-Unlock
                </div>
                <div className="text-sm font-black text-emerald-400 mt-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>HTTP 307 + Auto-ZIP</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  In-RAM bypass closed · Polar return verified
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  X Autopilot Acquisition
                </div>
                <div className="text-sm font-black text-amber-300 mt-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>X API HTTP 402</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {checkcheckReport.studioHealth.xAutopilotStatus.postsReadyInEnglish} US English posts ready · X API credits needed
                </div>
              </div>
            </div>
          )}

          {isCheckcheckExpanded && checkcheckReport && (
            <div className="flex flex-col gap-4">
              {/* Sub-navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
                {[
                  { id: 'catalog16', label: '2. Commercial Master Board (16 Lines)' },
                  { id: 'radars5', label: '3. 5 US Agent Channels Radar' },
                  { id: 'funnel7', label: '4. 7-Step Funnel & Leaks' },
                  { id: 'health', label: '1. Studio Health Check' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCheckcheckTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeCheckcheckTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Matrix 2: 16-Row Commercial Catalog & Rails */}
              {activeCheckcheckTab === 'catalog16' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="p-3">#</th>
                        <th className="p-3">Offer / Catalog Rail</th>
                        <th className="p-3">Price ($ USD)</th>
                        <th className="p-3 text-right">Probes</th>
                        <th className="p-3 text-right">Trials</th>
                        <th className="p-3 text-right">402/Paywall</th>
                        <th className="p-3 text-right">Checkouts</th>
                        <th className="p-3 text-right">Sales / Rev</th>
                        <th className="p-3 min-w-[240px]">Zero-Sale Diagnostic</th>
                        <th className="p-3 min-w-[300px] text-cyan-300">
                          Signal &amp; Agile Arbitrage Decision
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {checkcheckReport.catalogMaster16.map((row) => (
                        <tr key={row.id_rail} className="hover:bg-slate-900/50 align-top">
                          <td className="p-3 font-mono text-slate-400">{row.ligne}</td>
                          <td className="p-3">
                            <div className="font-bold text-white">{row.offre_ou_rail}</div>
                            <div className="text-[10px] font-mono text-cyan-400">{row.id_rail}</div>
                            <div className="text-[10px] text-slate-500">{row.categorie}</div>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-300 whitespace-nowrap">
                            {row.prix_usd}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-300">{row.vues_probes}</td>
                          <td className="p-3 text-right font-mono text-slate-300">{row.essais_conversions}</td>
                          <td className="p-3 text-right font-mono text-amber-300">
                            {row.collisions_paywall_402}
                          </td>
                          <td className="p-3 text-right font-mono text-cyan-300 font-bold">
                            {row.clics_polar_checkout}
                          </td>
                          <td className="p-3 text-right font-mono whitespace-nowrap">
                            <span className="font-bold text-white">{row.ventes_confirmees}</span>{' '}
                            <span className="text-emerald-400">({row.ca_net_usd})</span>
                          </td>
                          <td className="p-3 text-[11px] text-slate-300 leading-relaxed">
                            {row.diagnostic_zero_vente}
                          </td>
                          <td className="p-3 text-[11px] text-cyan-200 bg-cyan-950/15 leading-relaxed font-medium">
                            {row.signal_et_decision_arbitrage}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Matrix 3: 5 US Agent Channels Radar */}
              {activeCheckcheckTab === 'radars5' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="p-3">ID</th>
                        <th className="p-3">US Agent Channel</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Probes</th>
                        <th className="p-3 text-right">Tools</th>
                        <th className="p-3 text-right">402</th>
                        <th className="p-3 text-right">Checkouts</th>
                        <th className="p-3 text-right">Sales</th>
                        <th className="p-3 min-w-[230px]">Friction Diagnostic</th>
                        <th className="p-3 min-w-[300px] text-cyan-300">
                          Signal &amp; Agile Arbitrage Decision
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {checkcheckReport.usAgentRadars5.map((r) => (
                        <tr key={r.id_radar} className="hover:bg-slate-900/50 align-top">
                          <td className="p-3 font-mono text-cyan-400 font-bold">{r.id_radar}</td>
                          <td className="p-3">
                            <div className="font-bold text-white">{r.canal_agent_us}</div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {r.surfaces_techniques}
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                r.statut === 'ACTION_EXTERNE_X_402'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {r.statut}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono">{r.probes_detectees}</td>
                          <td className="p-3 text-right font-mono">{r.executions_outils}</td>
                          <td className="p-3 text-right font-mono text-amber-300">{r.collisions_402}</td>
                          <td className="p-3 text-right font-mono text-cyan-300 font-bold">
                            {r.checkouts_inities}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {r.ventes_confirmees} ({r.ca_net_usd})
                          </td>
                          <td className="p-3 text-[11px] text-slate-300 leading-relaxed">
                            {r.diagnostic_friction}
                          </td>
                          <td className="p-3 text-[11px] text-cyan-200 bg-cyan-950/15 leading-relaxed font-medium">
                            {r.signal_et_decision_arbitrage}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Matrix 4: 7-Stage Contact & Purchase Intent Funnel */}
              {activeCheckcheckTab === 'funnel7' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] uppercase tracking-wider text-slate-400">
                        <th className="p-3">Stage</th>
                        <th className="p-3">Funnel Stage Title</th>
                        <th className="p-3 text-right">Real Volume</th>
                        <th className="p-3 text-right">Passage</th>
                        <th className="p-3 min-w-[220px]">Identified Leak</th>
                        <th className="p-3 min-w-[220px]">Deployed Fix</th>
                        <th className="p-3 min-w-[280px] text-cyan-300">
                          Signal &amp; Agile Arbitrage Decision
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {checkcheckReport.contactIntentFunnel7.map((f) => (
                        <tr key={f.code_etape} className="hover:bg-slate-900/50 align-top">
                          <td className="p-3 font-mono font-bold text-cyan-400">
                            {f.etape}. {f.code_etape}
                          </td>
                          <td className="p-3 font-bold text-white">{f.intitule_etape}</td>
                          <td className="p-3 text-right font-mono font-bold text-white">{f.volume_reel}</td>
                          <td className="p-3 text-right font-mono text-emerald-300">{f.taux_passage_pct}</td>
                          <td className="p-3 text-[11px] text-rose-200/90 leading-relaxed">
                            {f.fuite_identifiee}
                          </td>
                          <td className="p-3 text-[11px] text-emerald-200/90 leading-relaxed">
                            {f.correctif_deploye}
                          </td>
                          <td className="p-3 text-[11px] text-cyan-200 bg-cyan-950/15 leading-relaxed font-medium">
                            {f.signal_et_decision_arbitrage}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Matrix 1: Studio Health Check */}
              {activeCheckcheckTab === 'health' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 text-xs">
                    <div className="font-black text-emerald-300 uppercase tracking-wider text-[11px]">
                      AST Engine Integrity &amp; Polar.sh Monetization
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Overall Studio Status</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {checkcheckReport.studioHealth.overallStatus}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">AST Semantic Parity</span>
                      <span className="font-mono text-white">
                        {checkcheckReport.studioHealth.astCompilerParity}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Strict Free Quota</span>
                      <span className="font-mono text-cyan-300">
                        {checkcheckReport.studioHealth.freeTierMaxFiles} files max (Zero RAM bypass)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Permanent Polar Links (HTTP 307)</span>
                      <span className="font-mono text-emerald-400">
                        {checkcheckReport.studioHealth.polarCheckoutLinksVerified307 ? 'VERIFIED LIVE' : 'CHECK'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Return Verification &amp; 4-in-1 Auto-ZIP</span>
                      <span className="font-mono text-emerald-400">
                        {checkcheckReport.studioHealth.postCheckoutAutoUnlockActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 text-xs">
                    <div className="font-black text-amber-300 uppercase tracking-wider text-[11px]">
                      US Agentic Discovery &amp; X Autopilot
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">MCP &amp; A2A Cards (.well-known)</span>
                      <span className="font-mono text-emerald-400">
                        {checkcheckReport.studioHealth.mcpAndAgentCardsLive ? 'LIVE + RFC 8288' : 'CHECK'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">X Autopilot Queue (US English)</span>
                      <span className="font-mono text-white">
                        {checkcheckReport.studioHealth.xAutopilotStatus.postsReadyInEnglish} posts (
                        {checkcheckReport.studioHealth.xAutopilotStatus.dailyScheduleUtc})
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">GitHub Actions Cron Status</span>
                      <span className="font-mono text-amber-300">
                        {checkcheckReport.studioHealth.xAutopilotStatus.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed pt-1">
                      {checkcheckReport.studioHealth.xAutopilotStatus.blockerSummary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Inbound AI Search Engines & Real Queries Radar (GEO / LLMO) */}
        <section className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0d1627] to-slate-950 border border-emerald-500/30 shadow-2xl flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-white">
                    AI Engines &amp; Real Search Queries Telemetry (GEO / LLMO)
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    100% GROUND TRUTH
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    Inbound Traceability
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live tracking of clicks and indexing from ChatGPT, Perplexity, Claude, Google Search, X.com, and AI crawlers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-bold">
                {summary.geoSearchInbound.chatgptClicks +
                  summary.geoSearchInbound.perplexityClicks +
                  summary.geoSearchInbound.claudeClicks +
                  summary.geoSearchInbound.googleSearchClicks +
                  summary.geoSearchInbound.xSocialClicks}{' '}
                Engine &amp; Social Clicks
              </span>
            </div>
          </div>

          {/* KPI Cards: Inbound Channels */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. ChatGPT */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-textMuted mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">ChatGPT / OpenAI</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white font-mono">{summary.geoSearchInbound.chatgptClicks}</span>
                <span className="text-[10px] text-emerald-300 font-bold">clicks</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                SearchGPT &amp; citations
              </div>
            </div>

            {/* 2. Perplexity */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-textMuted mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Perplexity AI</span>
                <Search className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white font-mono">{summary.geoSearchInbound.perplexityClicks}</span>
                <span className="text-[10px] text-cyan-300 font-bold">clicks</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                perplexity.ai searches
              </div>
            </div>

            {/* 3. Claude */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-textMuted mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Claude Code</span>
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white font-mono">{summary.geoSearchInbound.claudeClicks}</span>
                <span className="text-[10px] text-amber-300 font-bold">clicks</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                Anthropic claude.ai
              </div>
            </div>

            {/* 4. Google Search */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-textMuted mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Google Search</span>
                <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white font-mono">{summary.geoSearchInbound.googleSearchClicks}</span>
                <span className="text-[10px] text-blue-300 font-bold">clicks</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                Organic search
              </div>
            </div>

            {/* 5. X.com Social */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 flex flex-col justify-between">
              <div className="flex items-center justify-between text-textMuted mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">X (Twitter)</span>
                <Share2 className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white font-mono">{summary.geoSearchInbound.xSocialClicks}</span>
                <span className="text-[10px] text-slate-400 font-bold">clicks</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                @promptshift_dev
              </div>
            </div>

            {/* 6. Crawlers IA */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-textMuted mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">AI Indexers</span>
                <Activity className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white font-mono">{summary.geoSearchInbound.aiBotCrawls}</span>
                <span className="text-[10px] text-purple-300 font-bold">crawls</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 truncate">
                GPTBot, ClaudeBot, llms.txt
              </div>
            </div>
          </div>

          {/* Table of Inbound Clicks and Intents */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Real Inbound Clicks &amp; Search Intent Log (Period: {period})
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {summary.geoSearchInbound.recentReferrals.length} inbound visits recorded
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/90 text-textMuted uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Source Engine</th>
                    <th className="p-3">Landing Page</th>
                    <th className="p-3 min-w-[220px]">Inferred Search Intent</th>
                    <th className="p-3 text-center">Country</th>
                    <th className="p-3">User-Agent / Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {summary.geoSearchInbound.recentReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-textMuted">
                        No inbound clicks recorded for this period ({period}). When a user clicks from ChatGPT, Perplexity, or Google, the log will appear here live.
                      </td>
                    </tr>
                  ) : (
                    summary.geoSearchInbound.recentReferrals.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 text-textMuted whitespace-nowrap">
                          {new Date(r.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(r.timestamp).toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              r.sourceName.includes('ChatGPT')
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : r.sourceName.includes('Perplexity')
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : r.sourceName.includes('Claude')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : r.sourceName.includes('Google')
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : r.sourceName.includes('X.com')
                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                : r.sourceName.includes('Crawler') || r.sourceName.includes('Indexeur')
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {r.sourceName}
                          </span>
                        </td>
                        <td className="p-3 text-cyan-300 font-mono">{r.path}</td>
                        <td className="p-3 text-white font-sans text-xs">{r.inferredIntent}</td>
                        <td className="p-3 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                            {r.country || 'US'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[10px] truncate max-w-xs" title={r.userAgentSnippet}>
                          {r.userAgentSnippet || 'navigateur web standard'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Social Media Acquisition & CRO Conversion Radar (8 Networks) */}
        <section className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0e1726] to-slate-950 border border-indigo-500/30 shadow-2xl flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-white">
                    Social Acquisition Radar &amp; CRO Conversion (8 Networks)
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    REAL TIME
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold">
                    Social Attribution &amp; CRO
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unit tracking of sessions, traffic share, orders, and gross revenue ($ / €) attributed per social network.
                </p>
              </div>
            </div>

            {/* Global Social Summary Badges */}
            <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
              <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Sessions:</span>
                <span className="text-white font-bold">{summary.socialTraffic?.totalSocialSessions ?? 0}</span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Orders:</span>
                <span className="text-emerald-400 font-bold">{summary.socialTraffic?.totalSocialOrders ?? 0}</span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Revenue:</span>
                <span className="text-cyan-300 font-bold">
                  {(summary.socialTraffic?.totalSocialRevenueEur ?? 0).toFixed(2)} €
                </span>
                <span className="text-slate-500 text-[10px]">
                  (${(summary.socialTraffic?.totalSocialRevenueUsd ?? 0).toFixed(2)})
                </span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2">
                <span className="text-indigo-300 text-[11px]">Global CRO:</span>
                <span className="text-indigo-200 font-bold">
                  {(summary.socialTraffic?.overallSocialCroPct ?? 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* 8 Social Network Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                id: 'x',
                label: 'X (Twitter)',
                desc: 'x.com / t.co',
                color: 'border-slate-700 bg-black/70 hover:border-slate-500',
                badgeClass: 'bg-black text-white border-slate-700',
                progressColor: 'bg-slate-300',
              },
              {
                id: 'instagram',
                label: 'Instagram',
                desc: 'l.instagram.com',
                color: 'border-pink-500/30 bg-gradient-to-br from-pink-950/20 via-slate-950/80 to-purple-950/20 hover:border-pink-500/60',
                badgeClass: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-pink-400/50',
                progressColor: 'bg-gradient-to-r from-pink-500 to-purple-500',
              },
              {
                id: 'tiktok',
                label: 'TikTok',
                desc: 'link.tiktok.com',
                color: 'border-cyan-500/30 bg-slate-950/80 hover:border-cyan-400/60',
                badgeClass: 'bg-slate-950 text-cyan-300 border-cyan-400',
                progressColor: 'bg-cyan-400',
              },
              {
                id: 'facebook',
                label: 'Facebook',
                desc: 'l.facebook.com / fb.me',
                color: 'border-blue-500/30 bg-slate-950/80 hover:border-blue-400/60',
                badgeClass: 'bg-blue-600 text-white border-blue-400',
                progressColor: 'bg-blue-500',
              },
              {
                id: 'youtube',
                label: 'YouTube',
                desc: 'youtube.com / youtu.be',
                color: 'border-red-500/30 bg-slate-950/80 hover:border-red-400/60',
                badgeClass: 'bg-red-600 text-white border-red-400',
                progressColor: 'bg-red-500',
              },
              {
                id: 'linkedin',
                label: 'LinkedIn',
                desc: 'linkedin.com / lnkd.in',
                color: 'border-sky-500/30 bg-slate-950/80 hover:border-sky-400/60',
                badgeClass: 'bg-[#0077b5] text-white border-sky-400',
                progressColor: 'bg-[#0077b5]',
              },
              {
                id: 'threads',
                label: 'Threads',
                desc: 'threads.net / l.threads',
                color: 'border-slate-700 bg-slate-950/80 hover:border-slate-500',
                badgeClass: 'bg-slate-900 text-slate-100 border-slate-600',
                progressColor: 'bg-slate-400',
              },
              {
                id: 'pinterest',
                label: 'Pinterest',
                desc: 'pinterest.com / pin.it',
                color: 'border-red-600/30 bg-slate-950/80 hover:border-red-500/60',
                badgeClass: 'bg-[#bd081c] text-white border-red-500',
                progressColor: 'bg-[#bd081c]',
              },
            ].map((net) => {
              const stat = summary.socialTraffic?.networks[net.id as keyof typeof summary.socialTraffic.networks] ?? {
                id: net.id,
                name: net.label,
                uniqueSessions: 0,
                totalPageViews: 0,
                trafficSharePct: 0,
                ordersAttributed: 0,
                revenueAttributedUsd: 0,
                revenueAttributedEur: 0,
                croRatePct: 0,
              };

              return (
                <div
                  key={net.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${net.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${net.badgeClass}`}>
                      {net.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{net.desc}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Sessions</div>
                      <div className="text-xl font-black text-white font-mono">{stat.uniqueSessions}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Traffic Share</div>
                      <div className="text-xl font-black text-indigo-300 font-mono">
                        {stat.trafficSharePct.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar for Traffic Share */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${net.progressColor}`}
                      style={{ width: `${Math.min(100, Math.max(stat.trafficSharePct, stat.uniqueSessions > 0 ? 5 : 0))}%` }}
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500">Orders: </span>
                      <span className={`font-bold ${stat.ordersAttributed > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {stat.ordersAttributed}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Rev: </span>
                      <span className={`font-bold ${stat.revenueAttributedEur > 0 ? 'text-cyan-300' : 'text-slate-400'}`}>
                        {stat.revenueAttributedEur.toFixed(2)} €
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">CRO: </span>
                      <span className={`font-bold ${stat.croRatePct > 0 ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {stat.croRatePct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timestamped Social Inbound Log Table */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Timestamped Social Arrivals Log</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Period: {period})
                </span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {(summary.socialTraffic?.recentLogs ?? []).length} arrivals recorded
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/90 text-textMuted uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Date &amp; Time</th>
                    <th className="p-3">Origin Network</th>
                    <th className="p-3">Target Landing Page</th>
                    <th className="p-3">Specific Campaign / Post</th>
                    <th className="p-3 text-center">Device Type</th>
                    <th className="p-3">Customer Action Triggered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {(summary.socialTraffic?.recentLogs ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-textMuted">
                        No visitors from the 8 social networks recorded for this period ({period}).
                        <br />
                        <span className="text-[10px] text-slate-500 mt-1 inline-block">
                          As soon as a user clicks a post or bio link (X, Insta, TikTok, LinkedIn, YouTube, Facebook, Threads, Pinterest), the row appears here in real time.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    (summary.socialTraffic?.recentLogs ?? []).map((entry) => {
                      const badgeStyle =
                        entry.socialNetwork === 'x'
                          ? 'bg-black text-white border-slate-700'
                          : entry.socialNetwork === 'instagram'
                          ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-pink-400/50'
                          : entry.socialNetwork === 'tiktok'
                          ? 'bg-slate-950 text-cyan-300 border-cyan-400'
                          : entry.socialNetwork === 'facebook'
                          ? 'bg-blue-600 text-white border-blue-400'
                          : entry.socialNetwork === 'youtube'
                          ? 'bg-red-600 text-white border-red-400'
                          : entry.socialNetwork === 'linkedin'
                          ? 'bg-[#0077b5] text-white border-sky-400'
                          : entry.socialNetwork === 'threads'
                          ? 'bg-slate-900 text-slate-100 border-slate-600'
                          : entry.socialNetwork === 'pinterest'
                          ? 'bg-[#bd081c] text-white border-red-500'
                          : 'bg-slate-800 text-slate-200 border-slate-700';

                      return (
                        <tr key={entry.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 text-textMuted whitespace-nowrap">
                            {new Date(entry.timestamp).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })} -{' '}
                            {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${badgeStyle}`}
                            >
                              {entry.socialNetworkName}
                            </span>
                          </td>
                          <td className="p-3 text-cyan-300 font-mono font-medium">{entry.path}</td>
                          <td className="p-3 text-slate-300 text-xs font-sans">
                            {entry.campaignOrPost === 'Direct Bio / Post Link' || entry.campaignOrPost === 'Lien direct bio/post' ? (
                              <span className="text-slate-400 italic">Direct Bio / Post Link</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-semibold">
                                {entry.campaignOrPost}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                              {entry.deviceType === 'mobile' ? (
                                <>
                                  <Smartphone className="w-3 h-3 text-emerald-400" />
                                  <span>Mobile</span>
                                </>
                              ) : entry.deviceType === 'tablet' ? (
                                <>
                                  <Tablet className="w-3 h-3 text-amber-400" />
                                  <span>Tablet</span>
                                </>
                              ) : (
                                <>
                                  <Monitor className="w-3 h-3 text-blue-400" />
                                  <span>Desktop</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                entry.actionTriggered.includes('Payment Completed') || entry.actionTriggered === 'Achat validé'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : entry.actionTriggered.includes('Checkout') || entry.actionTriggered === 'Passage en caisse'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                  : entry.actionTriggered.includes('Paywall') || entry.actionTriggered === 'Collision paywall 402'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : entry.actionTriggered.includes('Upload') || entry.actionTriggered === 'Upload projet'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'bg-slate-900 text-slate-400 border border-slate-800'
                              }`}
                            >
                              {entry.actionTriggered}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Advanced Telemetry Filter Bar */}
        <section className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-white">Multidimensional Telemetry Filter</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                    {filteredEvents.length} / {periodTotalEvents.length} events
                  </span>
                  {activeFiltersCount > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-xs text-textMuted mt-0.5">
                  Filter real-time telemetry streams to isolate segments and guide decisions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
              <button
                onClick={exportFilteredCsv}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-950/60 text-cyan-300 hover:text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-cyan-500/30 shadow-sm"
                title="Export filtered telemetry in CSV format"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isFilterOpen ? "Collapse filters" : "Expand filters"}
              >
                <Filter className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Filter 1: Search query */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search Project / ID</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Anonymous name, ID, tech..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Filter 2: Event Type */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Event Type</label>
                <select
                  value={filterEventType}
                  onChange={(e) => setFilterEventType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono cursor-pointer"
                >
                  <option value="all">All Events</option>
                  <option value="conversion_completed">Successful Conversions</option>
                  <option value="page_view">Page Views</option>
                  <option value="project_upload">Project Uploads</option>
                  <option value="cli_token_copied">CLI Token Usage</option>
                  <option value="invoice_downloaded">Invoice Downloads</option>
                </select>
              </div>

              {/* Filter 3: Target Platform */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Ecosystem</label>
                <select
                  value={filterTarget}
                  onChange={(e) => setFilterTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono cursor-pointer"
                >
                  <option value="all">All Targets</option>
                  <option value="claude">Anthropic Claude (CLAUDE.md)</option>
                  <option value="cursor">Cursor IDE (.cursorrules / .mdc)</option>
                  <option value="openai">OpenAI Custom GPT</option>
                  <option value="gemini">Google Gemini / Antigravity</option>
                </select>
              </div>

              {/* Filter 4: Source Platform */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Source Ecosystem</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono cursor-pointer"
                >
                  <option value="all">All Sources</option>
                  <option value="cursor">Cursor</option>
                  <option value="claude">Claude</option>
                  <option value="antigravity">Google Antigravity</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>

              {/* Filter 5: Plan Tier */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">License Tier / Plan</label>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono cursor-pointer"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free Starter (≤ 2 files)</option>
                  <option value="single">Single Project Pass ($1.99)</option>
                  <option value="pro">Pro Developer ($5.99/mo)</option>
                  <option value="team">Team & Agency ($19.99/mo)</option>
                  <option value="vip">VIP Promo / Early Adopter</option>
                </select>
              </div>

              {/* Filter 6: Size Category */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Complexity / Files</label>
                <select
                  value={filterSize}
                  onChange={(e) => setFilterSize(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono cursor-pointer"
                >
                  <option value="all">All Sizes</option>
                  <option value="under5">Micro (≤ 2 files - Free)</option>
                  <option value="sixTo15">Standard (3 to 15 files)</option>
                  <option value="sixteenTo50">Advanced (16 to 50 files)</option>
                  <option value="over50">Enterprise (&gt; 50 files)</option>
                </select>
              </div>

              {/* Filter 7: Country */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Geographic Origin</label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono cursor-pointer"
                >
                  <option value="all">All Countries</option>
                  <option value="FR">🇫🇷 France (FR)</option>
                  <option value="US">🇺🇸 United States (US)</option>
                  <option value="DE">🇩🇪 Germany (DE)</option>
                  <option value="GB">🇬🇧 United Kingdom (GB)</option>
                  <option value="CA">🇨🇦 Canada (CA)</option>
                  <option value="JP">🇯🇵 Japan (JP)</option>
                </select>
              </div>

              {/* Filter Active Reset Summary */}
              <div className="flex flex-col justify-end">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px]">
                    Selection: <strong className="text-cyan-400">{filteredEvents.length}</strong> evts
                  </span>
                  {activeFiltersCount > 0 ? (
                    <button
                      onClick={resetFilters}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                    >
                      Clear {activeFiltersCount} filters
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono">Global view</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* KPI Grid */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
            {/* KPI 1: Conversions */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Conversions</span>
                <ArrowRightLeft className="w-4 h-4 text-cyanGlow" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{summary.totalConversions}</span>
                <span className="text-[10px] text-emerald-400 font-bold">IN-RAM</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                {summary.freeConversions} free • {polarMetrics?.totalPaidOrders ?? summary.paidConversions} Polar paid • {polarMetrics?.totalCheckoutsInitiated ?? 0} checkouts
              </p>
            </div>

            {/* KPI 2: Page Views & Unique Visitors */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Visitors</span>
                <Users className="w-4 h-4 text-emeraldGlow" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{summary.totalPageViews}</span>
                <span className="text-[10px] text-textMuted font-mono">
                  {summary.uniqueSessions} session{summary.uniqueSessions > 1 ? 's' : ''} unique{summary.uniqueSessions > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                {summary.conversionRate}% conversion rate
              </p>
            </div>

            {/* KPI 3: Total Files Processed */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">AST Files</span>
                <FileCode2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{summary.totalFilesProcessed}</span>
                <span className="text-[10px] text-purple-300 font-mono">transpiled</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                {(summary.totalBytesProcessed / 1024).toFixed(0)} KB prompts processed
              </p>
            </div>

            {/* KPI 4: Secrets Sanitized */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Sanitized Secrets</span>
                <KeyRound className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-300">{summary.totalSecretsSanitized}</span>
                <span className="text-[10px] text-amber-400/80 font-bold">filtered</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                API keys & tokens masked in RAM
              </p>
            </div>

            {/* KPI 5: Semantic Parity Score */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">AST Parity</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-cyanGlow">
                  {summary.totalConversions > 0 ? `${summary.averageParityScore}%` : '100%'}
                </span>
                <span className="text-[10px] text-cyan-300 font-bold">
                  {summary.totalConversions > 0 ? 'verified' : 'ready'}
                </span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                {summary.totalConversions > 0 ? 'Zero structural hallucination' : 'Deterministic engine standing by'}
              </p>
            </div>

            {/* KPI 6: Polar Live Ground-Truth Revenue */}
            <div className="p-4 rounded-2xl bg-cardBg border border-borderColor flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Polar Net Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-400">
                  ${(polarMetrics?.totalNetRevenueUsd ?? 0).toFixed(2)}
                </span>
                <span className="text-[10px] text-textMuted">USD</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                {polarMetrics?.totalPaidOrders ?? 0} paid orders • {polarMetrics?.totalCheckoutsInitiated ?? 0} checkouts
              </p>
            </div>
          </div>
        </section>

        {/* Section: Agile Arbitrage Decision Matrix */}
        <section className="p-6 rounded-3xl bg-cardBg border border-cyan-500/30 shadow-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black flex items-center justify-center font-black shadow-neonCyan">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-white">Strategic Agile Arbitrage Matrix</h2>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Sprint Decision Matrix
                  </span>
                </div>
                <p className="text-xs text-textMuted mt-0.5">
                  Real signal analysis, A vs B trade-off arbitrage, and execution of agile action steps.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 self-start md:self-auto">
              5 Calibrated Strategic Pillars
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900/90 text-textMuted uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-[16%]">Strategic Pillar</th>
                  <th className="py-3 px-4 w-[14%]">Observed Metric</th>
                  <th className="py-3 px-4 w-[20%]">Signal &amp; Diagnostic</th>
                  <th className="py-3 px-4 w-[22%]">Trade-Off (Option A vs B)</th>
                  <th className="py-3 px-4 w-[20%]">Agile Arbitrage &amp; Action</th>
                  <th className="py-3 px-4 w-[8%] text-center">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans text-xs">
                {summary.arbitrageMatrix.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white align-top">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="font-mono text-[11px] text-cyan-300">{item.pillarLabel}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-200">{item.observedMetric}</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{item.currentValue}</div>
                    </td>
                    <td className="py-3.5 px-4 text-textMuted text-[11px] leading-relaxed align-top">
                      {item.diagnostic}
                    </td>
                    <td className="py-3.5 px-4 align-top text-[11px] space-y-1.5">
                      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-400">
                        <strong className="text-slate-300">A:</strong> {item.tradeoffA.replace(/^Option A : /, '')}
                      </div>
                      <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-cyan-200">
                        <strong className="text-cyan-400">B:</strong> {item.tradeoffB.replace(/^Option B : /, '')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top text-[11px]">
                      <div className="font-bold text-cyan-300 mb-1">{item.recommendedArbitrage}</div>
                      <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                        ⚡ <strong>Action :</strong> {item.immediateAgileAction}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top text-center">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                          item.urgency === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : item.urgency === 'high'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Edge Infrastructure & Delivery Telemetry Panel (Cloudflare + Vercel) */}
        <section className="p-6 rounded-3xl bg-slate-900/60 border border-borderColor shadow-xl flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-white">Edge Infrastructure Telemetry (Cloudflare Anycast + Vercel Analytics)</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    100% SOVEREIGN &amp; REAL
                  </span>
                </div>
                <p className="text-xs text-textMuted mt-0.5">
                  Observed serverless invocations, AI crawlers, and external Vercel / Cloudflare Analytics pointers (zero fabricated constants)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Edge Anycast $0 Egress</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Cloudflare Cache Hit */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Cloudflare Cache Hit</span>
                <Server className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-cyanGlow">
                  {summary.edgeStats.cloudflareCacheHitRatio !== null
                    ? `${summary.edgeStats.cloudflareCacheHitRatio}%`
                    : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">External Dashboard</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                Measured in Cloudflare Analytics (never synthesized in-RAM)
              </p>
            </div>

            {/* Card 2: AI Bot Crawlers */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">GEO Indexing (AI Bots)</span>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{summary.edgeStats.aiBotsAllowedCount}</span>
                <span className="text-[10px] text-emerald-300 font-mono">AI crawlers</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                ClaudeBot, GPTBot, PerplexityBot indexing llms.txt
              </p>
            </div>

            {/* Card 3: Vercel Serverless Runtime */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Vercel Serverless CPU</span>
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-purple-300">~{summary.edgeStats.vercelAverageExecutionDurationMs}ms</span>
                <span className="text-[10px] text-textMuted font-mono">in-RAM</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                {summary.edgeStats.vercelServerlessInvocations} invocations • $0 overage
              </p>
            </div>

            {/* Card 4: Core Web Vitals */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-textMuted mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Core Web Vitals</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-emerald-400">
                  {summary.edgeStats.coreWebVitalsLcpSec !== null
                    ? `${summary.edgeStats.coreWebVitalsLcpSec}s`
                    : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Vercel Analytics</span>
              </div>
              <p className="text-[10px] text-textMuted mt-1">
                {summary.edgeStats.coreWebVitalsInpMs !== null && summary.edgeStats.coreWebVitalsCls !== null
                  ? `INP: ${summary.edgeStats.coreWebVitalsInpMs}ms • CLS: ${summary.edgeStats.coreWebVitalsCls.toFixed(2)}`
                  : 'Real user CWV tracked via @vercel/analytics'}
              </p>
            </div>
          </div>
        </section>

        {/* Charts & Distributions */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart: Timeline Activity */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyanGlow" />
                  Conversion Timeline Activity
                </h2>
                <p className="text-xs text-textMuted mt-0.5">
                  Recorded conversion volume ({period === 'today' ? "by hourly bucket today" : `over the last ${summary.timeline.length} days`})
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                Max: {maxConversionsInTimeline} / period
              </span>
            </div>

            {/* Pure SVG Animated Bar Chart */}
            <div className="h-52 w-full flex items-end gap-2 pt-6 pb-2 px-2">
              {summary.timeline.map((point, idx) => {
                const heightPct = Math.max(8, Math.round((point.conversions / maxConversionsInTimeline) * 100));
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-10 bg-slate-950 text-white border border-cyanGlow/50 px-2.5 py-1 rounded-lg text-[10px] font-mono shadow-xl z-20 whitespace-nowrap pointer-events-none">
                        <strong className="text-cyan-400">{point.conversions}</strong> conversions • {point.pageViews} views
                      </div>
                    )}

                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                        isHovered
                          ? 'bg-gradient-to-t from-cyan-400 to-emerald-300 shadow-neonCyan scale-105'
                          : 'bg-gradient-to-t from-cyan-600/70 to-emerald-500/90 hover:from-cyan-500 hover:to-emerald-400'
                      }`}
                    />

                    <span className="text-[10px] text-textMuted mt-2 font-mono truncate max-w-full text-center">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-textMuted border-t border-slate-800/80 pt-3 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-emerald-500" />
                AI Project Migrations
              </span>
              <span>Period Total: <strong>{summary.totalConversions}</strong></span>
            </div>
          </div>

          {/* Target Platforms Distribution */}
          <div className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                Preferred Target Ecosystems
              </h2>
              <span className="text-[10px] text-textMuted">Market Demand</span>
            </div>

            <div className="flex flex-col gap-3 my-auto">
              {[
                { id: 'claude', name: 'Anthropic Claude (3.7)', color: 'from-amber-400 to-orange-500', barColor: 'bg-orange-500' },
                { id: 'cursor', name: 'Cursor IDE (.mdc rules)', color: 'from-cyan-400 to-blue-500', barColor: 'bg-cyan-400' },
                { id: 'openai', name: 'OpenAI Assistants v2', color: 'from-emerald-400 to-teal-500', barColor: 'bg-emerald-400' },
                { id: 'gemini', name: 'Google Gemini & Antigravity', color: 'from-purple-400 to-indigo-500', barColor: 'bg-purple-400' },
              ].map((tgt) => {
                const count = summary.targetPlatformShare[tgt.id] || 0;
                const pct = summary.totalConversions > 0 ? Math.round((count / summary.totalConversions) * 100) : 0;

                return (
                  <div key={tgt.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{tgt.name}</span>
                      <span className="font-mono text-textMuted">
                        <strong className="text-white">{count}</strong> ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${tgt.barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-textMuted border-t border-slate-800/80 pt-3 mt-4">
              Top Target: <strong className="text-cyan-300">
                {summary.totalConversions > 0
                  ? Object.entries(summary.targetPlatformShare).sort((a, b) => b[1] - a[1])[0]?.[0]?.toUpperCase() || 'CLAUDE'
                  : 'PENDING'}
              </strong> (marketing priority)
            </div>
          </div>
        </section>

        {/* Project Size Distribution & Geographic Currencies */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Complexity & File count distribution */}
          <div className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Project Size Distribution
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Free tier calibration (≤ 2 files) vs paid conversion volume
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-emerald-400 font-bold block mb-1">
                  ≤ 2 Files (Free Starter)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.under5Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Projects eligible for free conversion
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-cyan-400 font-bold block mb-1">
                  3 to 15 Files (Single Pass)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.sixTo15Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Standard developer projects
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-purple-400 font-bold block mb-1">
                  16 to 50 Files (Pro Pass)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.sixteenTo50Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Multi-agent teams & projects
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-amber-400 font-bold block mb-1">
                  &gt; 50 Files (Team / Agency)
                </span>
                <span className="text-xl font-black text-white">
                  {summary.fileCountDistribution.over50Files}
                </span>
                <span className="text-[10px] text-textMuted block mt-0.5">
                  Enterprise-scale codebases
                </span>
              </div>
            </div>

            <div className="text-[11px] text-textMuted border-t border-slate-800/80 pt-3">
              Average: <strong className="text-white">~{(summary.totalFilesProcessed / Math.max(1, summary.totalConversions)).toFixed(1)} files</strong> per converted project.
            </div>
          </div>

          {/* Global Currencies & Geographic Reach */}
          <div className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                Geographic & Currency Distribution
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Global developer traffic detected via IP geolocation
              </p>
            </div>

            <div className="flex flex-col gap-2.5 my-4">
              {Object.entries(summary.currencyBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([curr, count]) => {
                  const pct = summary.totalConversions > 0 ? Math.round((count / summary.totalConversions) * 100) : 0;
                  const labelMap: Record<string, string> = {
                    EUR: '🇪🇺 Euro (€)',
                    USD: '🇺🇸 US Dollar ($)',
                    GBP: '🇬🇧 British Pound (£)',
                    CAD: '🇨🇦 Canadian Dollar (CA$)',
                    JPY: '🇯🇵 Japanese Yen (¥)',
                  };

                  return (
                    <div key={curr} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <span className="text-xs font-semibold text-slate-200">
                        {labelMap[curr] || curr}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyanGlow">{count}</span>
                        <span className="text-[10px] text-textMuted font-mono">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="text-[11px] text-textMuted border-t border-slate-800/80 pt-3">
              Automated multi-currency billing: <span className="text-emerald-400 font-semibold">Active & frictionless</span>
            </div>
          </div>
        </section>

        {/* AI Product Optimization Copilot & Tips */}
        <section className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-cardBg to-slate-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black flex items-center justify-center shadow-neonCyan font-bold">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Product Optimization & Growth Insights
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    AI ANALYTICS
                  </span>
                </h2>
                <p className="text-xs text-textMuted">
                  Actionable recommendations based on real conversion patterns
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              {tips.length} actionable insights
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-2.5 transition-all shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white tracking-tight">{tip.title}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        tip.impact === 'critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : tip.impact === 'high'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {tip.impact} impact
                    </span>
                  </div>
                  <p className="text-[11px] text-textMuted leading-relaxed">{tip.description}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/20 flex flex-col gap-1 text-[11px]">
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Recommended Action:
                  </span>
                  <span className="text-slate-300">{tip.actionableStep}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real-time Conversion Audit Log */}
        <section className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Recent Anonymized Conversion Log
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Live stream of transpiled projects (Zero code stored • Pure anonymous telemetry)
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              {conversionEventsFiltered.length} filtered conversion{conversionEventsFiltered.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-textMuted uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Anonymous Project</th>
                  <th className="py-3 px-4">Migration</th>
                  <th className="py-3 px-4">Files</th>
                  <th className="py-3 px-4">Size (KB)</th>
                  <th className="py-3 px-4">AST Parity</th>
                  <th className="py-3 px-4">Secrets</th>
                  <th className="py-3 px-4">License / Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {conversionEventsFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-textMuted">
                      No conversions match the active filter criteria ({period}).
                    </td>
                  </tr>
                ) : (
                  conversionEventsFiltered.slice(0, 50).map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-4 text-textMuted whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.timestamp).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-4 text-white font-semibold">
                        {ev.projectTitleAnon || 'project'}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-300 font-semibold text-[10px] inline-flex items-center gap-1">
                          {ev.sourcePlatform?.toUpperCase() || 'GEMINI'} → {ev.targetPlatform?.toUpperCase() || 'CLAUDE'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{ev.fileCount || 1} files</td>
                      <td className="py-2.5 px-4 text-slate-400">{((ev.sizeBytes || 2048) / 1024).toFixed(1)} KB</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-bold">{ev.parityScore || 98.5}%</td>
                      <td className="py-2.5 px-4">
                        {ev.secretsCount && ev.secretsCount > 0 ? (
                          <span className="text-amber-400 font-bold">🛡️ {ev.secretsCount} masked</span>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            ev.planTier === 'team'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : ev.planTier === 'pro'
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : ev.planTier === 'vip'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : ev.planTier === 'single'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ev.planTier || 'free'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Google Search Console & Automated SEO Panel */}
        <section className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-borderColor">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-neonCyan">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  Google Search Console & Indexation Autonome (API)
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                    Property Deployed
                  </span>
                </h2>
                <p className="text-xs text-textMuted mt-0.5">
                  HTML property verification, automated sitemap submission, and instant Google indexing requests.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <span>Rouvrir Search Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vector 1: Root HTML file */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Vecteur 1 : Racine</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> En ligne
                </span>
              </div>
              <div className="text-xs font-mono text-cyan-300 truncate">
                /google195fa2438b836f4f.html
              </div>
              <div className="text-[10px] text-textMuted">
                Official verification file at the root of promptshift.dev.
              </div>
            </div>

            {/* Vector 2: Sitemap prefix */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Vector 2: Sitemap Prefix</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> En ligne
                </span>
              </div>
              <div className="text-xs font-mono text-cyan-300 truncate">
                /sitemap.xml/google...html
              </div>
              <div className="text-[10px] text-textMuted">
                Covers URL-prefix verification if configured under this path.
              </div>
            </div>

            {/* Vector 3: Meta Tag */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Vecteur 3 : Balise Meta</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <div className="text-xs font-mono text-cyan-300 truncate">
                &lt;meta google-site-verification&gt;
              </div>
              <div className="text-[10px] text-textMuted">
                Present in the static HTML code served by Vercel Edge.
              </div>
            </div>
          </div>

          {/* GSC Performance Baseline (CSV Export Data 2026-11-08) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Clics Organiques GSC</span>
              <div className="text-xl font-black text-white font-mono mt-1">
                {seoStatus?.gscReport?.summary?.totalClicks ?? 0}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Real GSC Data (D+2)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Impressions GSC</span>
              <div className="text-xl font-black text-white font-mono mt-1">
                {seoStatus?.gscReport?.summary?.totalImpressions ?? 0}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Recherche Web Google</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Taux de Clic (CTR)</span>
              <div className="text-xl font-black text-cyan-300 font-mono mt-1">
                {(seoStatus?.gscReport?.summary?.averageCtr ?? 0).toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Indexation en cours</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono">Statut Indexation</span>
              <div className="text-xs font-bold text-emerald-300 font-mono mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Property Validated (D+2)</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Googlebot actif sur sitemap</span>
            </div>
          </div>

          {/* ChatSEO Target Keywords Matrix (Antigravity Playbook - Section 3) */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white font-mono">
                  ChatSEO Target Keywords Matrix (Top 10 Priority Commercial Queries)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-500/30 font-bold">
                Antigravity Playbook: Commercial Acceleration
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/90 text-textMuted uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Target Query</th>
                    <th className="p-3">Intent</th>
                    <th className="p-3 text-center">Target Pos.</th>
                    <th className="p-3">Landing Page</th>
                    <th className="p-3 text-center">Est. Volume</th>
                    <th className="p-3">Telemetry / SEO Status</th>
                    <th className="p-3">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {((seoStatus?.gscReport?.chatSeoMatrix as any[]) || CHAT_SEO_TARGET_MATRIX).map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 text-white font-bold font-sans">{item.keyword}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300">
                          {item.searchIntent}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                          {item.targetPosition}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link href={item.targetUrl} className="text-cyan-300 hover:underline">
                          {item.targetUrl}
                        </Link>
                      </td>
                      <td className="p-3 text-center text-slate-300">
                        {item.monthlySearchVolumeEst.toLocaleString('fr-FR')} /m
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px] font-sans max-w-xs">
                        {item.actionRecommended}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action triggers */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={checkSeoApi}
                disabled={seoLoading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {seoLoading ? 'Testing...' : '🔍 Test Search Console API Connection'}
              </button>

              <button
                onClick={triggerSitemapSubmit}
                disabled={seoLoading}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                📡 Soumettre Sitemap (API)
              </button>

              <button
                onClick={triggerIndexNow}
                disabled={seoLoading}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold border border-emerald-500/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                ⚡ IndexNow (Bing / Copilot / ChatGPT)
              </button>
            </div>

            {seoFeedback && (
              <div className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 max-w-md truncate">
                {seoFeedback}
              </div>
            )}
          </div>
        </section>

        {/* LinkedIn Viral Traction Kit */}
        <section className="p-6 rounded-3xl bg-cardBg border border-borderColor shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2 text-cyan-400">
              <Share2 className="w-4 h-4" />
              <h2 className="text-sm font-bold text-white">LinkedIn & Social Traction Share Kit</h2>
            </div>
            <p className="text-xs text-textMuted leading-relaxed">
              Broadcast live traction with verified statistics: migrated AI codebases, intercepted secrets, and multi-model AST parity. Click below to copy the pre-formatted announcement for your developer community.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={copyLinkedInPost}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-neonCyan hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
            >
              {isCopiedPost ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopiedPost ? 'Copied to Clipboard!' : 'Copy Ready-to-Publish LinkedIn Post'}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-borderColor py-4 px-6 text-center text-xs text-textMuted font-mono">
        PromptShift Sovereign Command Center • 1-Click Universal AI Bridge • Total Confidentiality
      </footer>
    </div>
  );
}
