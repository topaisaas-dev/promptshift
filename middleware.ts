import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

/**
 * PromptShift Edge Middleware — Agent Discovery Headers & Maintenance Shield
 * Injects standard RFC 8288 Link headers for AI crawlers & MCP registries
 * (GPTBot, ClaudeBot, PerplexityBot, Smithery, Glama, Cursor) on public HTML routes.
 */
export const IS_MAINTENANCE_MODE = false;

const AGENT_DISCOVERY_LINKS = [
  '<https://promptshift.dev/llms.txt>; rel="llms-txt"',
  '<https://promptshift.dev/.well-known/mcp/server-card.json>; rel="mcp-server"',
  '<https://promptshift.dev/.well-known/agent.json>; rel="agent-card"',
  '<https://promptshift.dev/api/openapi.json>; rel="service-desc"',
].join(', ');

export function middleware(request: NextRequest, event?: NextFetchEvent) {
  const pathname = request?.nextUrl?.pathname || '/';
  const _sessionCookie = request?.cookies?.get?.('promptshift_session');

  // 0. Google Search Console Site Verification (serves both root and prefix /sitemap.xml/)
  if (
    pathname === '/google195fa2438b836f4f.html' ||
    pathname === '/sitemap.xml/google195fa2438b836f4f.html'
  ) {
    return new NextResponse('google-site-verification: google195fa2438b836f4f.html\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  if (!IS_MAINTENANCE_MODE) {
    const response = NextResponse.next();
    const isInternalOrApi =
      pathname.startsWith('/bouboule') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api');

    if (!isInternalOrApi) {
      response.headers.set('Link', AGENT_DISCOVERY_LINKS);
    }

    // AI Bot Crawler Detection & Inbound Telemetry (properly awaited via Edge waitUntil)
    const ua = (request?.headers?.get?.('user-agent') || '').toLowerCase();
    const isAiCrawler =
      ua.includes('gptbot') ||
      ua.includes('oai-searchbot') ||
      ua.includes('chatgpt-user') ||
      ua.includes('perplexitybot') ||
      ua.includes('claudebot') ||
      ua.includes('anthropic-ai') ||
      ua.includes('google-extended');

    if (
      isAiCrawler &&
      !isInternalOrApi &&
      !pathname.startsWith('/assets') &&
      typeof event?.waitUntil === 'function'
    ) {
      const botName =
        ua.includes('gptbot') || ua.includes('oai-searchbot')
          ? 'GPTBot'
          : ua.includes('chatgpt-user')
          ? 'ChatGPT-User'
          : ua.includes('perplexitybot')
          ? 'PerplexityBot'
          : ua.includes('claudebot') || ua.includes('anthropic-ai')
          ? 'ClaudeBot'
          : 'Google-Extended';

      try {
        const analyticsUrl = new URL('/api/analytics', request.url);
        const beacon = fetch(analyticsUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'llms_crawl',
            channel: 'llmo',
            path: pathname,
            botName,
            userAgentSnippet: (request?.headers?.get?.('user-agent') || '').slice(0, 60),
            country:
              request?.headers?.get?.('x-vercel-ip-country') ||
              request?.headers?.get?.('cf-ipcountry') ||
              'US',
          }),
        }).catch(() => {});
        event.waitUntil(beacon);
      } catch {
        // ignore
      }
    }

    return response;
  }

  // 1. Whitelist static files and Next.js internal assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // 2. Allow access to the admin route: /bouboule
  if (pathname.startsWith('/bouboule')) {
    return NextResponse.next();
  }

  // 3. For API routes, return clean 503 JSON response
  if (pathname.startsWith('/api')) {
    return NextResponse.json(
      {
        error: 'Service Unavailable',
        code: 'MAINTENANCE_MODE_ACTIVE',
        message: 'PromptShift is temporarily offline for scheduled maintenance and engine updates.',
      },
      {
        status: 503,
        headers: {
          'Retry-After': '3600',
        },
      }
    );
  }

  // 4. For the maintenance page itself, let it render directly
  if (pathname === '/maintenance') {
    return NextResponse.next();
  }

  // 5. Rewrite any other page request to /maintenance with 503 status
  const maintenanceUrl = new URL('/maintenance', request.url);
  const response = NextResponse.rewrite(maintenanceUrl);
  response.headers.set('Retry-After', '3600');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
