import { NextRequest, NextResponse } from 'next/server';
import { CheckCheckService } from '@/lib/analytics/checkcheckService';
import { AnalyticsEvent } from '@/lib/analytics/analyticsTypes';
import { isAdminAuthorized } from '@/lib/auth/adminAuth';

export const dynamic = 'force-dynamic';

const PUBLIC_REFRESH_COOLDOWN_MS = 15_000;
let lastPublicRefreshAt = 0;

function resolveRefreshAllowed(req: NextRequest, requested: boolean): boolean {
  if (!requested) return false;
  if (isAdminAuthorized(req)) return true;
  const now = Date.now();
  if (now - lastPublicRefreshAt >= PUBLIC_REFRESH_COOLDOWN_MS) {
    lastPublicRefreshAt = now;
    return true;
  }
  return false;
}

/**
 * PromptShift Official (checkcheck) Executive Endpoint
 * GET  /api/checkcheck              -> Full JSON 4-matrix report (100% USD, Polar Live Ground Truth, Zero PII)
 * GET  /api/checkcheck?format=csv   -> 16-row Master Catalog CSV export with Agile Arbitrage decisions
 * POST /api/checkcheck              -> Merges optional browser session telemetry with Server RAM + Live Polar API
 * Unauthenticated `?refresh=1` calls are rate-limited to 15s cooldown to protect Polar API quota.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get('format') || 'json').toLowerCase();
    const refresh = resolveRefreshAllowed(req, searchParams.get('refresh') === '1');

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
    const refresh = resolveRefreshAllowed(req, Boolean(body?.refresh));
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
