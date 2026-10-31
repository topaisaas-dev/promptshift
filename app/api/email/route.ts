import { NextRequest, NextResponse } from 'next/server';
import { EmailDispatcher, SendEmailPayload } from '@/lib/email/emailDispatcher';
import { ServerTelemetryStore } from '@/lib/analytics/serverTelemetryStore';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SendEmailPayload;

    if (!body || !body.email || !body.action) {
      return NextResponse.json(
        { error: 'Missing required parameters: email and action are mandatory.' },
        { status: 400 }
      );
    }

    ServerTelemetryStore.record({
      type: 'lead_captured',
      channel: 'web',
      projectTitleAnon: String(body.action).slice(0, 18),
      country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'US',
    });

    const result = await EmailDispatcher.dispatch(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/email] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
