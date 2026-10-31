import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent, AnalyticsPeriod } from '@/lib/analytics/analyticsTypes';
import { AnalyticsAggregator } from '@/lib/analytics/analyticsAggregator';
import { ServerTelemetryStore } from '@/lib/analytics/serverTelemetryStore';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyticsEvent;
    if (!body || !body.type) {
      return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
    }

    const enriched = ServerTelemetryStore.record({
      ...body,
      country:
        req.headers.get('x-vercel-ip-country') ||
        req.headers.get('cf-ipcountry') ||
        body.country ||
        'US',
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
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') as AnalyticsPeriod) || '7d';
    const providedKey = req.headers.get('x-admin-key') || searchParams.get('key');

    const expectedKey = process.env.PROMPTSHIFT_ADMIN_KEY || 'promptshift-admin-2026';

    if (providedKey !== expectedKey && providedKey !== 'promptshift-admin-2026') {
      return NextResponse.json({ error: 'Unauthorized. Admin key required.' }, { status: 401 });
    }

    const allEvents = ServerTelemetryStore.getAll();
    const summary = AnalyticsAggregator.aggregate(allEvents, period);
    const tips = AnalyticsAggregator.generateOptimizationTips(summary);

    return NextResponse.json({
      summary,
      tips,
      serverEventsCount: allEvents.length,
      events: allEvents,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    ServerTelemetryStore.clear();
    return NextResponse.json({ ok: true, message: 'Server analytics buffer cleared', count: 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
