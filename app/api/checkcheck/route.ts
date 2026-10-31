import { NextRequest, NextResponse } from 'next/server';
import { CheckCheckService } from '@/lib/analytics/checkcheckService';
import { AnalyticsEvent } from '@/lib/analytics/analyticsTypes';

export const dynamic = 'force-dynamic';

/**
 * PromptShift Official (checkcheck) Executive Endpoint
 * GET  /api/checkcheck              -> Full JSON 4-matrix report (100% USD, Polar Live Ground Truth, Zero PII)
 * GET  /api/checkcheck?format=csv   -> 16-row Master Catalog CSV export with Agile Arbitrage decisions
 * POST /api/checkcheck              -> Merges optional browser session telemetry with Server RAM + Live Polar API
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get('format') || 'json').toLowerCase();
    const refresh = searchParams.get('refresh') === '1';

    const report = await CheckCheckService.buildReport([], refresh);

    if (format === 'csv') {
      const csv = CheckCheckService.toCsv(report);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="promptshift-checkcheck-16-rails.csv"',
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json(report, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to compute PromptShift checkcheck report' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const clientEvents: AnalyticsEvent[] = Array.isArray(body?.clientEvents) ? body.clientEvents : [];
    const refresh = Boolean(body?.refresh);
    const report = await CheckCheckService.buildReport(clientEvents, refresh);
    return NextResponse.json(report, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to compute PromptShift checkcheck report' },
      { status: 500 }
    );
  }
}
