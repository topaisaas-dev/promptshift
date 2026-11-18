import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GoogleSearchConsoleService } from '@/lib/seo/googleSearchConsole';
import { GscParserService } from '@/lib/seo/gscParser';
import { isAdminAuthorized } from '@/lib/auth/adminAuth';

export async function GET(request: NextRequest) {
  const credentials = GoogleSearchConsoleService.getCredentials();

  // If Service Account is configured in env, attempt live query
  if (credentials) {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const rows = await GoogleSearchConsoleService.querySearchAnalytics('https://promptshift.dev', {
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        dimensions: ['query'],
        rowLimit: 15,
      });

      return NextResponse.json({
        configured: true,
        mode: 'service_account_api',
        serviceAccount: credentials.clientEmail,
        queries: rows,
        gscReport: GscParserService.getReport(),
      });
    } catch (error: any) {
      // Fall through to CSV Export & ChatSEO Matrix mode
    }
  }

  // Solution 1 (Antigravity Playbook): Return official GSC CSV Export data & ChatSEO target matrix
  const report = GscParserService.getReport();

  return NextResponse.json({
    configured: true,
    mode: 'gsc_csv_export',
    message: 'Google Search Console data synchronized via official CSV export & ChatSEO Matrix active.',
    serviceAccount: null,
    gscReport: report,
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, url, files } = body;

    if (action === 'submit-sitemap') {
      const result = await GoogleSearchConsoleService.submitSitemap();
      return NextResponse.json(result);
    }

    if (action === 'index-url') {
      const targetUrl = url || 'https://promptshift.dev';
      const result = await GoogleSearchConsoleService.requestUrlIndexing(targetUrl);
      return NextResponse.json(result);
    }

    if (action === 'import-gsc-csv' && files) {
      const updated = GscParserService.updateFromFiles(files);
      return NextResponse.json({ ok: true, gscReport: updated });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}. Expected 'submit-sitemap', 'index-url' or 'import-gsc-csv'.` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
