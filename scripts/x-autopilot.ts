/**
 * PromptShift X (Twitter) Autonomous DevRel Publisher
 * 100% Self-Contained, Zero-Dependency Node.js engine for X API v2
 * Uses native crypto for OAuth 1.0a HMAC-SHA1 signatures.
 * 
 * Flow:
 * 1. Posts technical proof-of-work main tweet (high organic reach, zero external links).
 * 2. Immediately posts thread auto-reply with promptshift.dev & Polar checkout link.
 * 3. Persists run state to data/x_posts_history.json to prevent duplicate broadcasts.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

import { X_POSTS_CATALOG, type XPost } from './x-posts-catalog.ts';
export type { XPost };
export { X_POSTS_CATALOG };

const HISTORY_FILE = path.join(process.cwd(), 'data', 'x_posts_history.json');
const ANNUAL_CATALOG_FILE = path.join(process.cwd(), 'data', 'x_annual_posts_catalog.json');

function getCatalog(): XPost[] {
  if (fs.existsSync(ANNUAL_CATALOG_FILE)) {
    try {
      const raw = fs.readFileSync(ANNUAL_CATALOG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback
    }
  }
  return X_POSTS_CATALOG;
}

interface PostHistoryEntry {
  id: string;
  category: string;
  postedAt: string;
  mainTweetId: string;
  replyTweetId?: string;
  simulated?: boolean;
}

interface PostsHistory {
  lastRun: string | null;
  totalBroadcasts: number;
  history: PostHistoryEntry[];
}

function loadHistory(): PostsHistory {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Fallback on parse failure
    }
  }
  return {
    lastRun: null,
    totalBroadcasts: 0,
    history: []
  };
}

function saveHistory(history: PostsHistory): void {
  const dir = path.dirname(HISTORY_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

/**
 * Generates OAuth 1.0a HMAC-SHA1 Authorization Header (RFC 5849)
 * Zero external dependency implementation.
 */
function generateOAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0'
  };

  const paramKeys = Object.keys(oauthParams).sort();
  const paramString = paramKeys
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join('&');

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(paramString)
  ].join('&');

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  oauthParams.oauth_signature = signature;

  const headerParams = Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');

  return `OAuth ${headerParams}`;
}

function parseAndFormatXApiError(status: number, body: any, contextLabel: string): string {
  const title = body?.title || 'Unknown Error';
  const detail = body?.detail || JSON.stringify(body);
  const type = body?.type || '';

  let actionableAdvice = '';

  if (status === 402 || detail.includes('credits depleted') || type.includes('credits-depleted')) {
    actionableAdvice = `
--------------------------------------------------------------------------------
🚨 ROOT CAUSE: X Developer Account balance is $0.00 (Pay-Per-Use Tier).
🔧 3-MINUTE REMEDY:
  1. Open X Developer Console: https://developer.x.com
  2. Navigate to "Billing" or "Projects & Apps" -> "Billing / Credits".
  3. Attach an eligible credit/debit card to claim your $20 in FREE starter promotional credits!
  4. ($20 promotional credits covers >1,300 text-only posts, which powers over a full year of posts).
  5. Once active, re-run the GitHub Actions workflow.
--------------------------------------------------------------------------------`;
  } else if (status === 403 && (detail.includes('oauth1') || detail.includes('permissions') || type.includes('oauth1-permissions'))) {
    actionableAdvice = `
--------------------------------------------------------------------------------
🚨 ROOT CAUSE: Access Token lacks write permissions (OAuth 1.0a "Read-only" token).
🔧 2-MINUTE REMEDY:
  1. Open https://developer.x.com -> Projects & Apps -> Select the App.
  2. Under "User authentication settings", confirm permissions are set to "Read and write".
  3. Go to the "Keys and Tokens" tab.
  4. Next to "Access Token and Secret", click "Regenerate" (crucial: existing tokens don't upgrade automatically!).
  5. Update GitHub Secrets: ${contextLabel === 'booster' ? 'X_3K_ACCESS_TOKEN and X_3K_ACCESS_TOKEN_SECRET' : 'X_ACCESS_TOKEN and X_ACCESS_TOKEN_SECRET'}.
--------------------------------------------------------------------------------`;
  } else if (status === 401) {
    actionableAdvice = `
--------------------------------------------------------------------------------
🚨 ROOT CAUSE: Invalid or revoked API credentials.
🔧 REMEDY: Verify that API Key, API Secret, Access Token, and Access Token Secret match the same application.
--------------------------------------------------------------------------------`;
  } else if (status === 429) {
    actionableAdvice = `
--------------------------------------------------------------------------------
🚨 ROOT CAUSE: Rate Limit Reached (429).
🔧 REMEDY: The Twitter API 15-minute rate limit window will reset automatically.
--------------------------------------------------------------------------------`;
  }

  return `[${contextLabel.toUpperCase()}] X API HTTP ${status} (${title}): ${detail}\n${actionableAdvice}`;
}

async function postTweet(
  text: string,
  replyToId?: string,
  creds?: {
    consumerKey: string;
    consumerSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  }
): Promise<{ id: string }> {
  if (!creds) {
    throw new Error('Missing X API credentials');
  }

  const endpoint = 'https://api.twitter.com/2/tweets';
  const authHeader = generateOAuthHeader(
    'POST',
    endpoint,
    creds.consumerKey,
    creds.consumerSecret,
    creds.accessToken,
    creds.accessTokenSecret
  );

  const payload: any = { text };
  if (replyToId) {
    payload.reply = { in_reply_to_tweet_id: replyToId };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'User-Agent': 'PromptShift-DevRel-Autopilot/1.0'
    },
    body: JSON.stringify(payload)
  });

  const body: any = await response.json();

  if (!response.ok) {
    const formattedError = parseAndFormatXApiError(response.status, body, 'main');
    throw new Error(formattedError);
  }

  return { id: body.data?.id };
}

async function retweet(
  tweetId: string,
  creds: {
    consumerKey: string;
    consumerSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  },
  userId?: string
): Promise<{ retweeted: boolean }> {
  let targetUserId = userId;
  if (!targetUserId) {
    const meEndpoint = 'https://api.twitter.com/2/users/me';
    const meAuth = generateOAuthHeader('GET', meEndpoint, creds.consumerKey, creds.consumerSecret, creds.accessToken, creds.accessTokenSecret);
    const meRes = await fetch(meEndpoint, {
      method: 'GET',
      headers: { 'Authorization': meAuth, 'User-Agent': 'PromptShift-3K-Booster/1.0' }
    });
    const meData: any = await meRes.json();
    if (!meRes.ok) {
      const formattedError = parseAndFormatXApiError(meRes.status, meData, 'booster-user-lookup');
      throw new Error(formattedError);
    }
    targetUserId = meData.data?.id;
  }

  if (!targetUserId) {
    throw new Error('Unable to resolve user ID for retweet');
  }

  const endpoint = `https://api.twitter.com/2/users/${targetUserId}/retweets`;
  const authHeader = generateOAuthHeader(
    'POST',
    endpoint,
    creds.consumerKey,
    creds.consumerSecret,
    creds.accessToken,
    creds.accessTokenSecret
  );

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'User-Agent': 'PromptShift-3K-Booster/1.0'
    },
    body: JSON.stringify({ tweet_id: tweetId })
  });

  const body: any = await response.json();
  if (!response.ok) {
    const formattedError = parseAndFormatXApiError(response.status, body, 'booster');
    throw new Error(formattedError);
  }

  return { retweeted: Boolean(body.data?.retweeted) };
}

export async function runAutopilot(): Promise<void> {
  const args = process.argv.slice(2);
  const isForceDryRun = args.includes('--dry-run') || process.env.DRY_RUN === 'true';

  // Resolve primary broadcast credentials (falls back to 3K Booster account if primary X_* keys are unset)
  const consumerKey =
    process.env.X_API_KEY ||
    process.env.X_3K_API_KEY ||
    process.env.TWITTER_API_KEY ||
    '';
  const consumerSecret =
    process.env.X_API_SECRET ||
    process.env.X_3K_API_SECRET ||
    process.env.TWITTER_API_SECRET ||
    '';
  const accessToken =
    process.env.X_ACCESS_TOKEN ||
    process.env.X_3K_ACCESS_TOKEN ||
    process.env.TWITTER_ACCESS_TOKEN ||
    '';
  const accessTokenSecret =
    process.env.X_ACCESS_TOKEN_SECRET ||
    process.env.X_3K_ACCESS_TOKEN_SECRET ||
    process.env.TWITTER_ACCESS_TOKEN_SECRET ||
    '';

  const hasCredentials = Boolean(consumerKey && consumerSecret && accessToken && accessTokenSecret);
  const isDryRun = isForceDryRun || !hasCredentials;

  console.log('====================================================');
  console.log('🤖 PromptShift X (Twitter) Autonomous DevRel Engine');
  console.log(`Execution Mode: ${isDryRun ? '🧪 DRY-RUN (Simulation)' : '🚀 LIVE BROADCAST'}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('====================================================\n');

  if (!hasCredentials && !isForceDryRun) {
    console.warn('⚠️ Missing X API credentials in environment.');
    console.warn('Required variables: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET');
    console.warn('Falling back to safe DRY-RUN verification.\n');
  }

  // 1. Load History & Filter Available Posts
  const catalog = getCatalog();
  const history = loadHistory();
  const postedIds = new Set(history.history.map(h => h.id));

  let candidate = catalog.find(p => !postedIds.has(p.id));

  // If all posts have been broadcast, restart rotation cycle
  if (!candidate) {
    console.log(`🔄 All ${catalog.length} posts have completed a full annual broadcasting cycle. Resetting rotation.`);
    history.history = [];
    candidate = catalog[0];
  }

  console.log(`Loaded Post Catalog: ${catalog.length} annual posts available (${postedIds.size} already broadcast)`);

  console.log(`Selected Post ID: [${candidate.id}] (Category: ${candidate.category})`);
  console.log('----------------------------------------------------');
  console.log('📝 MAIN TWEET (Reach Maximized, Zero URLs):');
  console.log(candidate.mainTweet);
  console.log(`Length: ${candidate.mainTweet.length} / 280 chars`);
  console.log('----------------------------------------------------');
  console.log('💬 AUTO-REPLY TWEET (Conversion Link & Polar Pass):');
  console.log(candidate.replyTweet);
  console.log(`Length: ${candidate.replyTweet.length} / 280 chars`);
  console.log('----------------------------------------------------\n');

  if (isDryRun) {
    console.log('🧪 [DRY-RUN] Simulating broadcast without calling external API.');
    const mockMainId = 'mock_main_' + Date.now();
    const mockReplyId = 'mock_reply_' + Date.now();

    history.lastRun = new Date().toISOString();
    history.totalBroadcasts += 1;
    history.history.push({
      id: candidate.id,
      category: candidate.category,
      postedAt: new Date().toISOString(),
      mainTweetId: mockMainId,
      replyTweetId: mockReplyId,
      simulated: true
    });

    saveHistory(history);
    console.log(`✅ Simulation successfully recorded in data/x_posts_history.json`);
    return;
  }

  // 2. Live Broadcast
  try {
    const creds = { consumerKey, consumerSecret, accessToken, accessTokenSecret };
    
    console.log('📡 Step 1: Broadcasting main tweet...');
    const mainResult = await postTweet(candidate.mainTweet, undefined, creds);
    console.log(`✅ Main tweet published! ID: ${mainResult.id}`);

    // Wait 2 seconds before replying to avoid race conditions
    await new Promise(r => setTimeout(r, 2000));

    console.log('📡 Step 2: Broadcasting auto-reply thread...');
    const replyResult = await postTweet(candidate.replyTweet, mainResult.id, creds);
    console.log(`✅ Auto-reply published! ID: ${replyResult.id}`);

    // Step 3: Optional 3K Booster Retweet from personal account
    const boosterKey = process.env.X_3K_API_KEY || process.env.BOOSTER_API_KEY;
    const boosterSecret = process.env.X_3K_API_SECRET || process.env.BOOSTER_API_SECRET;
    const boosterToken = process.env.X_3K_ACCESS_TOKEN || process.env.BOOSTER_ACCESS_TOKEN;
    const boosterTokenSecret = process.env.X_3K_ACCESS_TOKEN_SECRET || process.env.BOOSTER_ACCESS_TOKEN_SECRET;

    let retweetedByBooster = false;
    if (boosterKey && boosterSecret && boosterToken && boosterTokenSecret) {
      console.log('📡 Step 3: Triggering 3K Booster Retweet from personal account (@JeanYvesGarcin)...');
      try {
        await new Promise(r => setTimeout(r, 3000));
        const boosterCreds = {
          consumerKey: boosterKey,
          consumerSecret: boosterSecret,
          accessToken: boosterToken,
          accessTokenSecret: boosterTokenSecret
        };
        const rtResult = await retweet(mainResult.id, boosterCreds);
        retweetedByBooster = rtResult.retweeted;
        console.log(`✅ 3K Booster Account retweeted successfully! (retweeted: ${retweetedByBooster})`);
      } catch (err: any) {
        console.warn('⚠️ 3K Booster Retweet warning (non-blocking):', err.message);
      }
    }

    history.lastRun = new Date().toISOString();
    history.totalBroadcasts += 1;
    history.history.push({
      id: candidate.id,
      category: candidate.category,
      postedAt: new Date().toISOString(),
      mainTweetId: mainResult.id,
      replyTweetId: replyResult.id,
      simulated: false,
      retweetedBy3K: retweetedByBooster
    });

    saveHistory(history);
    console.log('\n🎉 Autonomous DevRel dispatch completed with 100% success.');
  } catch (error: any) {
    console.error('❌ Broadcast failed:', error.message);
    process.exit(1);
  }
}

// Direct execution check
const isDirectRun = Boolean(process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href);
if (isDirectRun || process.argv.length > 1) {
  runAutopilot().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
