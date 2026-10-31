import { NextRequest, NextResponse } from 'next/server';
import { PolarService } from '@/lib/payments/polarService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutId = searchParams.get('checkout_id') || '';

    const result = await PolarService.verifyCheckoutSession(checkoutId);
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    return NextResponse.json(
      { verified: false, status: 'error', error: err.message },
      { status: 500 }
    );
  }
}
