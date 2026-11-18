import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isAdminAuthorized,
  verifyAdminPasskey,
} from '@/lib/auth/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { authenticated: isAdminAuthorized(req) },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const passkey = typeof body?.passkey === 'string' ? body.passkey : '';

    if (!verifyAdminPasskey(passkey)) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid administrator security key.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const token = createAdminSessionToken();
    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'Admin key is not configured on the server.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const res = NextResponse.json(
      { authenticated: true },
      { headers: { 'Cache-Control': 'no-store' } }
    );
    res.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 12 * 60 * 60,
    });
    return res;
  } catch {
    return NextResponse.json(
      { authenticated: false, error: 'Authentication error.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json(
    { authenticated: false },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  res.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return res;
}
