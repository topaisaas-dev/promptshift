import { NextRequest, NextResponse } from 'next/server';
import { CONVERSION_PAIRS } from '@/lib/seo/conversionPairs';
import { isAdminAuthorized } from '@/lib/auth/adminAuth';

const INDEXNOW_KEY = 'c74384d4fa8448eb97a151b75249a05c';
const HOST = 'promptshift.dev';

function buildVerifiedKeyUrls(): string[] {
  const coreUrls = [
    `https://${HOST}/`,
    `https://${HOST}/discover`,
    `https://${HOST}/cli`,
    `https://${HOST}/security`,
    `https://${HOST}/terms`,
    `https://${HOST}/privacy`,
  ];
  const pairUrls = Object.keys(CONVERSION_PAIRS).map(
    (slug) => `https://${HOST}/convert/${slug}`
  );
  return [...coreUrls, ...pairUrls];
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const urlList = buildVerifiedKeyUrls();
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList,
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 200 || res.status === 202) {
      return NextResponse.json({
        success: true,
        message: `IndexNow pinged successfully! Submitted ${urlList.length} verified URLs to Bing, Copilot & AI search engines.`,
        urlCount: urlList.length,
      });
    }

    const errText = await res.text();
    return NextResponse.json(
      { success: false, status: res.status, error: errText },
      { status: res.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'IndexNow ping failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const urlList = buildVerifiedKeyUrls();
  return NextResponse.json({
    protocol: 'IndexNow',
    engines: ['Bing', 'Microsoft Copilot', 'ChatGPT Search', 'DuckDuckGo', 'Yandex', 'Seznam'],
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlCount: urlList.length,
  });
}
