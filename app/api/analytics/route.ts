import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent, AnalyticsPeriod } from '@/lib/analytics/analyticsTypes';
import { AnalyticsAggregator } from '@/lib/analytics/analyticsAggregator';
import { ServerTelemetryStore } from '@/lib/analytics/serverTelemetryStore';
import { PolarService } from '@/lib/payments/polarService';
import { isAdminAuthorized } from '@/lib/auth/adminAuth';

function sanitizeReferrerUrl(raw?: string | null): string | undefined {
  if (!raw || !raw.trim()) return undefined;
  try {
    const parsed = new URL(raw);
    // Strip query string and hash to prevent capturing tokens or email params in referrers
    return `${parsed.origin}${parsed.pathname}`.slice(0, 200);
  } catch {
    return raw.split('?')[0].split('#')[0].slice(0, 200) || undefined;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyticsEvent;
    if (!body || !body.type) {
      return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
    }

    const userAgent = (req.headers.get('user-agent') || '').toLowerCase();
    let botName: string | undefined = body.botName;
    if (!botName) {
      if (userAgent.includes('gptbot') || userAgent.includes('oai-searchbot')) botName = 'GPTBot';
      else if (userAgent.includes('chatgpt-user')) botName = 'ChatGPT-User';
      else if (userAgent.includes('perplexitybot')) botName = 'PerplexityBot';
      else if (userAgent.includes('claudebot') || userAgent.includes('anthropic-ai')) botName = 'ClaudeBot';
      else if (userAgent.includes('google-extended')) botName = 'Google-Extended';
      else if (userAgent.includes('bingbot')) botName = 'Bingbot';
    }

    const rawReferrer = sanitizeReferrerUrl(body.referrer || req.headers.get('referer'));
    let referrerDomain = body.referrerDomain;
    if (!referrerDomain && rawReferrer) {
      const lower = rawReferrer.toLowerCase();
      if (lower.includes('chatgpt.com') || lower.includes('chat.openai.com')) referrerDomain = 'chatgpt.com';
      else if (lower.includes('perplexity.ai')) referrerDomain = 'perplexity.ai';
      else if (lower.includes('claude.ai')) referrerDomain = 'claude.ai';
      else if (lower.includes('google.')) referrerDomain = 'google.com';
      else if (lower.includes('t.co') || lower.includes('x.com') || lower.includes('twitter.com')) referrerDomain = 'x.com';
      else if (lower.includes('instagram.com')) referrerDomain = 'instagram.com';
      else if (lower.includes('tiktok.com')) referrerDomain = 'tiktok.com';
      else if (lower.includes('facebook.com') || lower.includes('fb.me')) referrerDomain = 'facebook.com';
      else if (lower.includes('youtube.com') || lower.includes('youtu.be')) referrerDomain = 'youtube.com';
      else if (lower.includes('linkedin.com') || lower.includes('lnkd.in')) referrerDomain = 'linkedin.com';
      else if (lower.includes('threads.net')) referrerDomain = 'threads.net';
      else if (lower.includes('pinterest.com') || lower.includes('pin.it')) referrerDomain = 'pinterest.com';
      else if (lower.includes('github.com')) referrerDomain = 'github.com';
      else {
        try {
          referrerDomain = new URL(rawReferrer).hostname.replace(/^www\./, '');
        } catch {
          referrerDomain = 'external';
        }
      }
    }

    let deviceType = body.deviceType;
    if (!deviceType) {
      if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent)) {
        deviceType = 'tablet';
      } else if (/mobi|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/.test(userAgent)) {
        deviceType = 'mobile';
      } else {
        deviceType = 'desktop';
      }
    }

    let socialNetwork = body.socialNetwork;
    if (!socialNetwork && (rawReferrer || body.utmSource)) {
      const ref = (rawReferrer || '').toLowerCase();
      const utm = (body.utmSource || '').toLowerCase();
      if (ref.includes('t.co') || ref.includes('x.com') || ref.includes('twitter.com') || utm === 'x' || utm === 'twitter') socialNetwork = 'x';
      else if (ref.includes('instagram.com') || utm === 'instagram' || utm === 'ig' || userAgent.includes('instagram')) socialNetwork = 'instagram';
      else if (ref.includes('tiktok.com') || utm === 'tiktok' || userAgent.includes('tiktok') || userAgent.includes('musical_ly')) socialNetwork = 'tiktok';
      else if (ref.includes('facebook.com') || ref.includes('fb.me') || utm === 'facebook' || utm === 'fb' || userAgent.includes('fbav') || userAgent.includes('fban')) socialNetwork = 'facebook';
      else if (ref.includes('youtube.com') || ref.includes('youtu.be') || utm === 'youtube' || utm === 'yt') socialNetwork = 'youtube';
      else if (ref.includes('linkedin.com') || ref.includes('lnkd.in') || utm === 'linkedin') socialNetwork = 'linkedin';
      else if (ref.includes('threads.net') || utm === 'threads') socialNetwork = 'threads';
      else if (ref.includes('pinterest.com') || ref.includes('pin.it') || utm === 'pinterest') socialNetwork = 'pinterest';
    }

    const campaignOrPost =
      body.campaignOrPost ||
      (body.utmCampaign
        ? body.utmContent || body.utmTerm
          ? `${body.utmCampaign} (${body.utmContent || body.utmTerm})`
          : body.utmCampaign
        : socialNetwork
        ? 'Direct Bio / Post Link'
        : undefined);

    const enriched = ServerTelemetryStore.record({
      ...body,
      referrer: rawReferrer,
      referrerDomain: referrerDomain || 'direct',
      botName,
      deviceType,
      socialNetwork,
      campaignOrPost,
      actionStage:
        body.actionStage ||
        (body.type === 'page_view'
          ? 'Page Visit'
          : body.type === 'conversion_completed'
          ? 'Conversion Completed'
          : body.type),
      country:
        req.headers.get('x-vercel-ip-country') ||
        req.headers.get('cf-ipcountry') ||
        body.country ||
        'US',
      userAgentSnippet: (req.headers.get('user-agent') || body.userAgentSnippet || 'browser').slice(0, 60),
    });

    return NextResponse.json({
      ok: true,
      id: enriched.id,
      count: ServerTelemetryStore.getAll().length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid admin session or x-admin-key header required.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') as AnalyticsPeriod) || '7d';

    const allEvents = ServerTelemetryStore.getAll();
    const summary = AnalyticsAggregator.aggregate(allEvents, period);
    const tips = AnalyticsAggregator.generateOptimizationTips(summary);
    const polarCommercialMetrics = await PolarService.getLiveCommercialMetrics().catch(() => null);

    return NextResponse.json(
      {
        summary,
        tips,
        serverEventsCount: allEvents.length,
        events: allEvents,
        polarCommercialMetrics,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid admin session or x-admin-key header required.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    ServerTelemetryStore.clear();
    return NextResponse.json({ ok: true, message: 'Server analytics buffer cleared', count: 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
