/**
 * PromptShift Server-Side Admin Authentication Guard
 * Strictly validates admin requests via `x-admin-key` header, Bearer token,
 * or signed HttpOnly admin session cookie against `process.env.PROMPTSHIFT_ADMIN_KEY`.
 * Fails CLOSED when `PROMPTSHIFT_ADMIN_KEY` is unset (zero hardcoded backdoors).
 */

import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'promptshift_admin_session';

function getConfiguredAdminKey(): string | null {
  const key = (process.env.PROMPTSHIFT_ADMIN_KEY || '').trim();
  return key.length >= 8 ? key : null;
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminPasskey(candidate?: string | null): boolean {
  const expected = getConfiguredAdminKey();
  if (!expected || !candidate) return false;
  return constantTimeEquals(candidate.trim(), expected);
}

export function createAdminSessionToken(): string | null {
  const expected = getConfiguredAdminKey();
  if (!expected) return null;
  const nonce = crypto.randomBytes(16).toString('hex');
  const issuedAt = Date.now().toString(36);
  const payload = `${issuedAt}.${nonce}`;
  const sig = crypto.createHmac('sha256', expected).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token?: string | null): boolean {
  const expected = getConfiguredAdminKey();
  if (!expected || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [issuedAt, nonce, providedSig] = parts;
  if (!issuedAt || !nonce || !providedSig) return false;

  // Enforce 12-hour session expiry
  const issuedMs = Number.parseInt(issuedAt, 36);
  if (!Number.isFinite(issuedMs) || Date.now() - issuedMs > 12 * 60 * 60 * 1000) {
    return false;
  }

  const expectedSig = crypto
    .createHmac('sha256', expected)
    .update(`${issuedAt}.${nonce}`)
    .digest('hex');
  return constantTimeEquals(providedSig, expectedSig);
}

export function isAdminAuthorized(req: NextRequest): boolean {
  // 1. Check x-admin-key header
  const headerKey = req.headers.get('x-admin-key');
  if (headerKey && verifyAdminPasskey(headerKey)) {
    return true;
  }

  // 2. Check Authorization: Bearer <key>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    if (verifyAdminPasskey(authHeader.slice(7))) {
      return true;
    }
  }

  // 3. Check signed HttpOnly admin session cookie
  const cookieVal = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (cookieVal && verifyAdminSessionToken(cookieVal)) {
    return true;
  }

  return false;
}
