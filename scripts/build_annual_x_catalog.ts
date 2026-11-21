/**
 * PromptShift X (Twitter) Annual Catalog Builder — v4 "High-Converting Impulse & Deep-Link" edition
 *
 * Tone: simple, direct, commercial English. Every main tweet ends with a clear
 * call-to-action strictly pointing to the reply ("👇 Link in the reply", "Link in the reply 👇").
 * The main tweet never relies on bio links and never contains a URL (keeps full X reach,
 * especially when reposted by @promptshift_dev).
 *
 * Every upcoming auto-reply pitches the high-converting impulse hook:
 * 1-Click Stack/GitHub Rules Generator + free preview + $1.99 one-time pass (includes 50+ Master Rules Vault),
 * and links directly to the matching /convert/[pair] route (when the post topic matches a pair) or https://promptshift.dev.
 *
 * Posts already broadcast (listed in data/x_posts_history.json) are preserved
 * verbatim at the top of the catalog so the autopilot resumes at the next slot.
 *
 * Run: npx tsx scripts/build_annual_x_catalog.ts
 */

import * as fs from 'fs';
import * as path from 'path';

export interface XPost {
  id: string;
  category:
    | 'ast-parity'
    | 'security'
    | 'ci-cd'
    | 'multi-agent'
    | 'terminal'
    | 'token-optimization'
    | 'mcp-ecosystem'
    | 'syntax-traps';
  slot?: 'morning' | 'afternoon';
  mainTweet: string;
  replyTweet: string;
}

type Category = XPost['category'];

interface Draft {
  family: string;
  key: string; // used to space out similar posts
  category: Category;
  body: string; // main tweet WITHOUT CTA
  leads: string[]; // candidate first lines for the reply
  pairSlug?: string; // optional /convert/[pair] deep route
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CATALOG_FILE = path.join(DATA_DIR, 'x_annual_posts_catalog.json');
const HISTORY_FILE = path.join(DATA_DIR, 'x_posts_history.json');
const TOTAL_DAYS = 365;
const SIX_MONTH_POSTS = 368;

/**
 * X weighted length: chars > U+10FF (emojis, CJK, arrows) count as 2,
 * every http(s) URL counts as 23 (t.co).
 */
function getXWeightedLength(text: string): number {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  let count = urls.length * 23;
  for (const ch of text.replace(urlRegex, '')) {
    count += (ch.codePointAt(0) || 0) > 0x10ff ? 2 : 1;
  }
  return count;
}

/**
 * Mirrors scripts/x-autopilot.ts injectUtmParams so we guarantee raw string length < 280 even AFTER UTM injection.
 */
function previewInjectUtmParams(text: string, postId: string): string {
  const utmParams = `utm_source=x&utm_medium=social&utm_campaign=devrel_daily&utm_content=${encodeURIComponent(postId)}`;
  return text.replace(/https:\/\/promptshift\.dev[^\s]*/g, (rawMatch) => {
    const punctMatch = rawMatch.match(/[.,;:!?)'"\]]+$/);
    const trailingPunct = punctMatch ? punctMatch[0] : '';
    const cleanUrl = trailingPunct ? rawMatch.slice(0, -trailingPunct.length) : rawMatch;
    if (cleanUrl.includes('utm_campaign=')) return rawMatch;
    const hashIndex = cleanUrl.indexOf('#');
    const beforeHash = hashIndex >= 0 ? cleanUrl.slice(0, hashIndex) : cleanUrl;
    const hashPart = hashIndex >= 0 ? cleanUrl.slice(hashIndex) : '';
    const separator = beforeHash.includes('?') ? '&' : '?';
    return `${beforeHash}${separator}${utmParams}${hashPart}${trailingPunct}`;
  });
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Reorders so the same key never appears within `window` consecutive items (best effort). */
function spreadByKey(items: Draft[], window = 3): Draft[] {
  const arr = [...items];
  for (let i = 1; i < arr.length; i++) {
    const recent = new Set(arr.slice(Math.max(0, i - window), i).map((d) => d.key));
    if (!recent.has(arr[i].key)) continue;
    for (let j = i + 1; j < arr.length; j++) {
      if (!recent.has(arr[j].key)) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        break;
      }
    }
  }
  return arr;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ============================================================================
// CALLS-TO-ACTION (11 = prime, rotates independently of the family pattern)
// ============================================================================

const CTAS = [
  '👇 Link in the reply.',
  'Try it free. Link in the reply 👇',
  'See the link in the reply 👇',
  'Free for small repos. Link in the reply 👇',
  '👇 Link in the first reply.',
  'Takes 10 seconds. Link in the reply 👇',
  'Free to start. 👇 Link in the reply.',
  'No signup needed. Link in the reply 👇',
  'Try it now. 👇 Link in the reply.',
  'Start free. Link in the reply 👇',
  '👇 Link in the reply to this post.',
];

// ============================================================================
// HIGH-CONVERTING IMPULSE REPLY OFFERS (11 = prime)
// Every offer pitches: 1-Click Stack/GitHub Generator + Free preview + $1.99 pass (+ 50+ Vault)
// ============================================================================

const OFFERS = [
  '⚡ 1-Click Stack/GitHub Builder • 2 files free • 8-file 4-in-1 + 50+ Vault: $1.99',
  '⚡ 1-Click Stack/GitHub Generator • Free preview • $1.99 pass (+ 50+ Rules Vault)',
  '⚡ Build from Stack or GitHub URL • 2 files free • $1.99 4-in-1 + 50+ Rules Vault',
  '⚡ 1-Click Stack & GitHub Rules • Free preview • $1.99 one-time (+ 50+ Vault)',
  '⚡ Paste GitHub URL or pick stack • 2 files free • $1.99 4-in-1 + 50+ Vault',
  '⚡ 1-Click 8-File Stack/GitHub Suite • Free preview • Unlock all + 50+ Vault: $1.99',
  '⚡ Instant Stack/GitHub Builder • 2 files free • $1.99 one-time + 50+ Rules Vault',
  '⚡ Generate 8 rules from Stack/GitHub • Free preview • $1.99 4-in-1 + 50+ Vault',
  '⚡ 1-Click Stack/GitHub Importer • 2 files free • $1.99 pass (+ 50+ Rules Vault)',
  '⚡ No local ZIP needed: Stack/GitHub Builder • Free preview • $1.99 + 50+ Vault',
  '⚡ 1-Click Stack Chips or GitHub Repo • 2 files free • $1.99 4-in-1 + 50+ Vault',
];

const GENERIC_LEADS = [
  'Your AI rules, in every editor.',
  'Write once. Sync everywhere.',
  'Free preview in RAM. No signup.',
  'Cursor, Claude, Copilot & Windsurf in 1 click.',
  'Stop copy-pasting AI rules.',
  'Built for multi-IDE developers.',
  'Test your stack or GitHub repo now.',
  'One rulebook for every AI editor.',
];

// ============================================================================
// 1. HANDCRAFTED POSTS (simple, punchy, commercial)
// ============================================================================

const HANDCRAFTED: Record<string, { category: Category; leads: string[]; posts: string[] }> = {
  pain: {
    category: 'ast-parity',
    leads: [
      'Write AI rules once. Run in every editor.',
      'Stop rewriting AI rules by hand.',
      'Your AI rules in every IDE in 1 click.',
    ],
    posts: [
      `You spent hours writing the perfect AI rules for Cursor.\n\nThen you tried Claude Code and had to start from zero.\n\nWe fixed that. PromptShift converts your rules to any AI editor in 1 click.`,
      `Your AI keeps ignoring your coding rules?\n\nMost of the time the rules are fine. They're just in the wrong format for that editor.\n\nPromptShift fixes the format for you.`,
      `Copy-pasting AI rules between Cursor, Claude Code and Copilot is not a workflow.\n\nIt's a bug factory.\n\nWrite them once. Let PromptShift sync the rest.`,
      `Every AI editor wants its rules in a different file:\n\n• Cursor: .cursor/rules\n• Claude Code: CLAUDE.md\n• Copilot: copilot-instructions.md\n• Windsurf: .windsurfrules\n\nPromptShift writes all 4 for you.`,
      `Monday: you update your Cursor rules.\nFriday: Claude Code still uses the old ones.\n\nSound familiar?\n\nPromptShift keeps every AI editor on the same page.`,
      `The most expensive bug in AI coding isn't in your code.\n\nIt's the rule you updated in one editor and forgot in the other three.`,
      `You don't need a new AI editor.\n\nYou need your current rules to work in every AI editor.\n\nThat's exactly what PromptShift does.`,
      `Switching AI editors shouldn't feel like moving house.\n\nPack your rules once. Unpack them anywhere. In seconds.`,
      `Stop maintaining 4 copies of the same AI instructions.\n\nOne source of truth. Every editor in sync. Zero copy-paste.`,
      `"Why did the AI write it like that?"\n\nUsually because it never saw your rules.\n\nPromptShift makes sure every AI editor gets them.`,
      `AI coding tools change every month.\n\nYour coding standards shouldn't.\n\nKeep them portable with PromptShift.`,
      `A new AI editor drops. Everyone wants to try it.\n\nThe hard part isn't installing it. It's moving your rules.\n\nWe made that part take 10 seconds.`,
      `Your AI rules are your team's brain.\n\nDon't lock them inside one editor.`,
      `Rewriting AI rules by hand is the new copying code from Stack Overflow.\n\nIt works. Until it doesn't.\n\nAutomate it.`,
      `If your AI rules live in only one tool, your team has a single point of failure.\n\nExport them to every editor in 1 click.`,
    ],
  },
  offer: {
    category: 'terminal',
    leads: [
      'Generate your 8-file suite or drop your repo:',
      'Start free. Unlock all 8 files for $1.99:',
      'Instant in-RAM preview + $1.99 pass:',
    ],
    posts: [
      `Our pricing is simple:\n\n• Free: up to 2 rule files\n• $1.99: one-time pass for any repo\n• $5.99/mo: unlimited\n• $19.99/mo: teams + CI\n\nNo sales call. No contract.`,
      `$1.99.\n\nThat's what it costs to convert your whole repo's AI rules to Cursor, Claude Code, Copilot & Windsurf.\n\nCheaper than the coffee you'd drink doing it by hand.`,
      `Try before you pay.\n\nPromptShift is free for up to 2 rule files. No account. No credit card.\n\nIf it saves you time, upgrade. If not, it cost you nothing.`,
      `What 2 hours of your time is worth: a lot.\nWhat PromptShift costs: $1.99.\n\nEasy math.`,
      `No subscription required.\n\nNeed it once? Pay $1.99 once.\nNeed it every week? $5.99/mo unlimited.\n\nYou choose.`,
      `For teams: $19.99/mo.\n\nEvery pull request gets checked, so your AI rules never drift apart between editors.\n\nSetup takes 10 seconds.`,
      `We don't ask for your email to test the product.\n\nOpen it, drop your rule files, see the result. Free.`,
      `Free plan, for real:\n\n✅ Up to 2 rule files\n✅ All major AI editors\n✅ No signup\n✅ Nothing stored on our servers`,
      `Small repo? Free.\nBig repo? $1.99 one time.\nWhole team? $19.99/mo.\n\nThat's the whole pricing page.`,
      `The cheapest productivity upgrade you'll buy this year costs $1.99.\n\nYour AI rules, in every editor, in 1 click.`,
      `Pro plan: $5.99/mo.\n\nUnlimited repos. Unlimited conversions. Every AI editor.\n\nLess than one lunch a month.`,
      `Agencies: one Team plan, every client repo.\n\nClient on Copilot? Client on Cursor? Same rules, right format, every time.\n\n$19.99/mo.`,
      `Most dev tools want a demo call.\n\nWe want you to try it in 10 seconds. For free.\n\nThen decide.`,
    ],
  },
  before: {
    category: 'ast-parity',
    leads: [
      'Try the "after" on your stack:',
      'Go from hours to 2 seconds:',
      'See the live diff on your repo:',
    ],
    posts: [
      `Before PromptShift:\n• Write rules for Cursor\n• Rewrite them for Claude Code\n• Rewrite again for Copilot\n• Forget to update one\n\nAfter:\n• Write once\n• Click once\n• Done`,
      `Before: 2 hours copy-pasting AI rules between editors.\nAfter: 10 seconds.\n\nSame rules. Every editor. No mistakes.`,
      `Old way: every dev on your team has their own AI rules.\nNew way: one shared rulebook, synced to every editor, in git.\n\nCleaner PRs. Fewer debates.`,
      `Without synced rules: Cursor writes one style, Copilot another, and Claude invents its own folder structure.\n\nWith PromptShift: one style. Every editor.`,
      `Before: "Wait, which file does Copilot read again?"\n\nAfter: you don't care. PromptShift writes it for you.`,
      `Day 1 without PromptShift: copy rules to the new editor.\nDay 30: rules are out of sync.\nDay 60: nobody trusts the AI.\n\nWith PromptShift: one click on day 1. Still in sync on day 60.`,
      `Onboarding a new dev, before:\n"Here's our 40-page wiki."\n\nAfter:\nTheir AI editor already knows your rules on day 1. Whatever editor they use.`,
      `Manual conversion: you summarize, you skip things, you lose rules.\n\nPromptShift: every rule kept, formatted correctly for each editor.`,
      `Before: "Works great in Cursor, terrible in Claude Code."\n\nAfter: works great in both. Same rules underneath.`,
      `Switching AI editors used to cost a weekend.\n\nNow it costs a click.`,
    ],
  },
  security: {
    category: 'security',
    leads: [
      'Scan & convert your AI rules in RAM:',
      'Convert + redact leaked keys in 1 click:',
      '100% In-RAM. Zero files stored on disk:',
    ],
    posts: [
      `Quick check before you push:\n\nIs there an API key in your AI rules file?\n\nPeople paste example code with real keys all the time. PromptShift finds and hides them automatically.`,
      `Your CLAUDE.md is public the moment you push it to a public repo.\n\nMake sure it doesn't contain your OpenAI or Stripe keys.`,
      `We never store your files.\n\nPromptShift processes everything in memory and forgets it right after.\n\nYour rules stay yours.`,
      `Pasting your company's AI rules into a random online tool?\n\nThose rules describe your architecture. Use a tool that doesn't keep them.`,
      `The feature nobody asks for until they need it:\n\nPromptShift removes API keys, tokens and passwords from your AI rules before writing the new files.`,
      `AI rule files are the new .env files.\n\nPeople forget they contain secrets. Bots don't.`,
      `Convert your AI rules + scan them for leaked keys.\n\nOne tool. One click. Zero data stored.`,
      `Deleted an API key from your rules file?\n\nIt's still in your git history.\n\nCatch it before the commit, not after.`,
      `Security team asks: "Where do our prompts go?"\n\nWith PromptShift: nowhere. Processed in memory, never saved.`,
      `15+ types of API keys detected and hidden automatically: OpenAI, Anthropic, AWS, GitHub, Stripe and more.\n\nBuilt into every conversion.`,
      `Sharing your AI rules with a contractor?\n\nClean out the secrets first. PromptShift does it automatically.`,
    ],
  },
  question: {
    category: 'multi-agent',
    leads: [
      'Keep your AI rules synced everywhere:',
      'Generate rules for all 4 editors:',
      'One rulebook. Every AI editor:',
    ],
    posts: [
      `Quick poll for devs:\n\nWhich AI editor are you using right now?\n\n1. Cursor\n2. Claude Code\n3. Copilot\n4. Windsurf\n\nWhatever you pick, PromptShift keeps your rules working in all of them.`,
      `Honest question:\n\nHow many AI editors has your team tried this year?\n\nAnd how many times did you rewrite your rules?`,
      `What's harder?\n\nA) Picking the best AI editor\nB) Moving your rules to it\n\nWe solved B.`,
      `How long are your AI rules?\n\n10 lines? 500 lines?\n\nEither way, you shouldn't have to write them twice.`,
      `Do your AI rules live in git, or in someone's local settings?\n\nIf it's the second one, that's a problem waiting to happen.`,
      `If you could only keep one AI editor, which one would it be?\n\nGood news: with PromptShift, you don't have to choose.`,
      `Does your team agree on one AI editor?\n\nIf not, you don't need a meeting. You need synced rules.`,
      `Ever noticed your AI writes better code in one editor than another?\n\nCheck the rules. They're probably not the same.`,
      `What's the one rule you always have to remind your AI about?\n\nPut it in your rulebook once. Sync it everywhere.`,
      `Cursor or Claude Code?\n\nWrong question. Use both. Keep the rules in sync.`,
    ],
  },
  proof: {
    category: 'mcp-ecosystem',
    leads: [
      'Web studio, CLI or Grade-A MCP server:',
      'Verified Grade A on Glama MCP registry:',
      'Get started in 10 seconds:',
    ],
    posts: [
      `PromptShift is rated Grade A on Glama, the MCP server registry.\n\nYour AI agents can use it directly from Claude Desktop or Cursor.`,
      `Use PromptShift without leaving your AI chat.\n\nAdd it as an MCP server, then just ask: "convert my Cursor rules for Claude Code."\n\nDone.`,
      `Did you know Claude can convert your rules for you?\n\nPromptShift works as an MCP tool. One line of config.`,
      `Grade A on Glama ✅\nWorks in Claude Desktop ✅\nWorks in Cursor ✅\nNo data stored ✅\n\nThe PromptShift MCP server.`,
      `3 ways to use PromptShift:\n\n1. Web app (drag & drop)\n2. Terminal: npx promptshift\n3. MCP inside Claude or Cursor\n\nSame result. Pick your style.`,
      `Your AI agent can now keep its own rules in sync.\n\nPromptShift MCP: convert, check and clean AI rules from inside any MCP client.`,
      `One command in your terminal:\n\nnpx promptshift\n\nIt finds your AI rules and converts them for the editor you want.`,
      `Prefer the browser?\n\nDrag your rule files into PromptShift and download every format in 1 click.\n\nNothing to install.`,
      `Add one line to your CI and every PR gets checked for out-of-sync AI rules and leaked keys:\n\nnpx promptshift --init-ci`,
      `Built by devs who use Cursor and Claude Code every day and got tired of copy-pasting rules between them.`,
    ],
  },
  math: {
    category: 'token-optimization',
    leads: [
      'Get your engineering time back:',
      'Leaner rules, smarter AI, lower bills:',
      'Test it on your stack or repo:',
    ],
    posts: [
      `Quick math:\n\n4 AI editors × 30 min to rewrite your rules × every time you update them\n\n= hours lost every month.\n\nOr 10 seconds with PromptShift.`,
      `Bloated AI rules cost you twice:\n\n1. More tokens on every request\n2. Worse answers, because the AI gets lost\n\nPromptShift cleans and splits them for you.`,
      `Long rule files = slower, more expensive AI.\n\nSplit them so each file only loads when it's needed. PromptShift does it automatically.`,
      `Your AI reads your rules on every single message.\n\nRemove the duplicates and you save tokens all day, every day.`,
      `Shorter, cleaner rules = faster AI answers.\n\nPromptShift removes duplicates and keeps every rule that matters.`,
      `If your team updates its AI rules once a week and has 3 editors to sync, that's 150+ manual updates a year.\n\nOr zero.`,
      `Time to set up AI rules for a new project:\n\nBy hand: 1-2 hours.\nWith PromptShift: under a minute.`,
      `Every minute you spend formatting AI rules is a minute you're not shipping.\n\nAutomate the boring part.`,
      `One giant rules file loads everything, every time.\nSmaller scoped rules load only what matters.\n\nLess noise. Better code.`,
    ],
  },
};

function inferHandcraftedPairSlug(body: string): string | undefined {
  const lower = body.toLowerCase();
  const hasCursor = lower.includes('cursor');
  const hasClaude = lower.includes('claude');
  const hasCopilot = lower.includes('copilot');
  const hasWindsurf = lower.includes('windsurf');
  if (hasCursor && hasClaude && !hasCopilot && !hasWindsurf) {
    return 'cursor-to-claude';
  }
  return undefined;
}

function buildHandcrafted(): Draft[] {
  const order = ['pain', 'offer', 'before', 'security', 'question', 'proof', 'math'];
  const out: Draft[] = [];
  const max = Math.max(...order.map((k) => HANDCRAFTED[k].posts.length));
  for (let i = 0; i < max; i++) {
    for (const fam of order) {
      const bank = HANDCRAFTED[fam];
      if (i < bank.posts.length) {
        const body = bank.posts[i];
        out.push({
          family: 'hand',
          key: `hand-${fam}`,
          category: bank.category,
          body,
          leads: bank.leads,
          pairSlug: inferHandcraftedPairSlug(body),
        });
      }
    }
  }
  return out;
}

// ============================================================================
// 2. EDITOR-SWITCH POSTS (12 pairs × 6 templates = 72) — Deep-linked to /convert/[pair]
// ============================================================================

const EDITOR_PAIRS: Array<[string, string, string]> = [
  ['Cursor', 'Claude Code', 'cursor-to-claude'],
  ['Claude Code', 'Cursor', 'claude-to-cursor'],
  ['Cursor', 'GitHub Copilot', 'cursor-to-copilot'],
  ['GitHub Copilot', 'Cursor', 'copilot-to-cursor'],
  ['Windsurf', 'Cursor', 'windsurf-to-cursor'],
  ['Cursor', 'Windsurf', 'cursor-to-windsurf'],
  ['Claude Code', 'GitHub Copilot', 'claude-to-copilot'],
  ['Cursor', 'Gemini CLI', 'cursor-to-gemini'],
  ['Claude Code', 'Windsurf', 'claude-to-windsurf'],
  ['GitHub Copilot', 'Claude Code', 'copilot-to-claude'],
  ['Windsurf', 'Claude Code', 'windsurf-to-claude'],
  ['Claude Code', 'Gemini CLI', 'claude-to-antigravity'],
];

const PAIR_TEMPLATES: Array<(a: string, b: string) => string> = [
  (a, b) => `Moving from ${a} to ${b}?\n\nDon't rewrite your AI rules by hand.\nPromptShift converts them in 1 click, so ${b} follows the same rules ${a} did.`,
  (a, b) => `${a} rules → ${b} rules.\n\nSame instructions. Right format. Zero copy-paste.\n\nThat's all PromptShift does, and it does it in seconds.`,
  (a, b) => `Tried ${b} and it ignored all your coding rules?\n\nIt's not the AI. Your rules are still in ${a}'s format.\n\nConvert them once and ${b} gets it right from the first prompt.`,
  (a, b) => `Your team uses ${a}. You prefer ${b}.\n\nNo need to argue.\n\nKeep one set of rules and export it to both with PromptShift.`,
  (a, b) => `Want to test ${b} without losing your ${a} setup?\n\nConvert your rules, try ${b} for a week, switch back anytime.\n\nNo lock-in. Free for small projects.`,
  (a, b) => `How long did it take you to write your ${a} rules?\n\nHours? Days?\n\nDon't do it again for ${b}. PromptShift moves everything over in seconds.`,
];

function buildPairs(): Draft[] {
  const out: Draft[] = [];
  EDITOR_PAIRS.forEach(([a, b, slug]) => {
    PAIR_TEMPLATES.forEach((tpl) => {
      out.push({
        family: 'pair',
        key: `${a}>${b}`,
        category: 'multi-agent',
        body: tpl(a, b),
        leads: [`${a} → ${b} in 1 click.`, `Move ${a} rules to ${b}:`],
        pairSlug: slug,
      });
    });
  });
  return spreadByKey(shuffle(out, 20261105), 4);
}

// ============================================================================
// 3. PERSONA POSTS (10 personas × 4 templates = 40)
// ============================================================================

const PERSONAS = [
  { who: 'solo founders', one: 'a solo founder', pain: `You jump between Cursor and Claude Code all day. Your rules shouldn't get lost on the way.`, benefit: 'More shipping, less setup.' },
  { who: 'agencies', one: 'an agency', pain: 'Every client wants a different AI editor.', benefit: 'One rulebook for every client repo.' },
  { who: 'CTOs', one: 'a CTO', pain: `Your devs all use different AI editors. Your code standards can't depend on that.`, benefit: 'Consistent code, whatever the editor.' },
  { who: 'freelancers', one: 'a freelancer', pain: 'New client, new repo, new AI setup. Every single time.', benefit: 'Set up any repo in under a minute.' },
  { who: 'open-source maintainers', one: 'an open-source maintainer', pain: 'Contributors send PRs from Cursor, Copilot, Claude Code and Windsurf.', benefit: 'Every AI-assisted PR follows your style.' },
  { who: 'startup teams', one: 'a startup team', pain: '5 devs. 4 AI editors. 1 codebase.', benefit: 'Everyone ships the same style of code.' },
  { who: 'tech leads', one: 'a tech lead', pain: 'You write the rules. Half the team never sees them because they use another editor.', benefit: 'Your rules reach every editor automatically.' },
  { who: 'indie hackers', one: 'an indie hacker', pain: 'You try every new AI tool the week it launches.', benefit: 'Try any new editor without losing your setup.' },
  { who: 'junior devs', one: 'a junior dev', pain: `Your team's AI rules only exist for the editor you don't use.`, benefit: 'Get the same AI guidance as everyone else.' },
  { who: 'vibe coders', one: 'a vibe coder', pain: 'Your AI forgets how you like things done every time you change tools.', benefit: 'Your AI remembers your style everywhere.' },
];

const PERSONA_TEMPLATES: Array<(p: (typeof PERSONAS)[number]) => string> = [
  (p) => `For ${p.who}:\n\n${p.pain}\n\nPromptShift keeps your AI rules in sync across every editor.`,
  (p) => `Built for ${p.who}.\n\n${p.pain}\n\nOne click: same rules in Cursor, Claude Code, Copilot & Windsurf.`,
  (p) => `${cap(p.who)}, quick question:\n\nHow many copies of your AI rules do you maintain right now?\n\nIf it's more than 1, PromptShift will save you hours.`,
  (p) => `If you're ${p.one}, here's an easy win:\n\nWrite your AI rules once. Export them to every AI editor.\n\n${p.benefit}`,
];

function buildPersonas(): Draft[] {
  const out: Draft[] = [];
  PERSONAS.forEach((p) => {
    PERSONA_TEMPLATES.forEach((tpl) => {
      out.push({
        family: 'persona',
        key: p.who,
        category: 'multi-agent',
        body: tpl(p),
        leads: [`Built for ${p.who}.`, `PromptShift for ${p.who}:`],
      });
    });
  });
  return spreadByKey(shuffle(out, 1105), 4);
}

// ============================================================================
// 4. STACK POSTS (60 stacks × 9 templates = 540)
// ============================================================================

const STACKS = [
  'Next.js', 'React', 'Vue', 'Nuxt', 'Svelte', 'SvelteKit', 'Astro', 'Remix', 'Angular', 'SolidJS',
  'Node.js', 'Express', 'NestJS', 'Fastify', 'Hono', 'Bun', 'Deno', 'TypeScript', 'Python', 'FastAPI',
  'Django', 'Flask', 'Rust', 'Go', 'Java', 'Spring Boot', 'Kotlin', 'Swift', 'SwiftUI', 'Flutter',
  'React Native', 'Expo', 'Laravel', 'PHP', 'Ruby on Rails', 'Elixir', '.NET', 'C#', 'C++', 'Zig',
  'Supabase', 'Firebase', 'Prisma', 'Drizzle', 'PostgreSQL', 'MongoDB', 'Redis', 'Tailwind CSS', 'shadcn/ui', 'tRPC',
  'GraphQL', 'Docker', 'Kubernetes', 'Terraform', 'AWS', 'Cloudflare Workers', 'Vercel', 'Electron', 'Tauri', 'Solidity',
];

const STACK_TEMPLATES: Array<{ category: Category; tpl: (s: string) => string; pairSlug?: string }> = [
  { category: 'ast-parity', tpl: (s) => `Building with ${s}?\n\nYour AI editor needs to know your ${s} rules.\nWrite them once, use them in Cursor, Claude Code, Copilot & Windsurf.\n\nPromptShift does the conversion for you.` },
  { category: 'multi-agent', tpl: (s) => `${s} devs: stop pasting the same AI instructions into 3 different editors.\n\nOne source. Every editor. Always in sync.` },
  { category: 'syntax-traps', pairSlug: 'cursor-to-claude', tpl: (s) => `Your ${s} project has AI rules for Cursor but not for Claude Code?\n\nThat's why Claude keeps writing code your team rejects.\n\nFix it in 1 click.` },
  { category: 'token-optimization', tpl: (s) => `${s} + AI coding tip:\n\nKeep your rules in one place and sync them to every editor your team uses.\n\nLess review time. Fewer "why did the AI do that?" moments.` },
  { category: 'terminal', tpl: (s) => `Just started a new ${s} project?\n\nSet up AI rules for Cursor, Claude Code, Copilot & Windsurf in under a minute.\n\nFree for small projects.` },
  { category: 'ast-parity', tpl: (s) => `The fastest way to make AI write better ${s} code:\n\nGive every AI editor the same clear rules.\n\nPromptShift handles the formats. You handle the shipping.` },
  { category: 'multi-agent', tpl: (s) => `${s} team using different AI editors?\n\nOne dev on Cursor, one on Copilot, one on Claude Code = 3 different code styles.\n\nSync your rules. Get one.` },
  { category: 'ci-cd', tpl: (s) => `Hot take for ${s} devs:\n\nYour AI rules matter as much as your linter config.\nThey belong in git, in sync, in every editor.\n\nPromptShift makes that automatic.` },
  { category: 'ast-parity', tpl: (s) => `Shipping ${s} with AI?\n\nThe AI is only as good as the rules you give it.\n\nGive every editor the same ones. PromptShift syncs them in 1 click.` },
];

function buildStacks(): Draft[] {
  const out: Draft[] = [];
  STACKS.forEach((s) => {
    STACK_TEMPLATES.forEach(({ category, tpl, pairSlug }) => {
      out.push({
        family: 'stack',
        key: s,
        category,
        body: tpl(s),
        leads: [`${s} AI rules for all 4 IDEs in 1 click.`, `Sync your ${s} AI rules everywhere:`],
        pairSlug,
      });
    });
  });
  return spreadByKey(shuffle(out, 365), 6);
}

// ============================================================================
// ASSEMBLY
// ============================================================================

// Feed rhythm over 10 slots: 4 handcrafted, 3 stack, 2 editor-switch, 1 persona
const PATTERN = ['hand', 'stack', 'pair', 'hand', 'persona', 'stack', 'hand', 'pair', 'stack', 'hand'];

function loadPreserved(): XPost[] {
  const history = fs.existsSync(HISTORY_FILE) ? JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')) : { history: [] };
  const postedIds: string[] = history.history.map((h: { id: string }) => h.id);
  if (postedIds.length === 0) return [];
  const existing: XPost[] = fs.existsSync(CATALOG_FILE) ? JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf-8')) : [];
  const byId = new Map(existing.map((p) => [p.id, p]));
  return postedIds.map((id) => {
    const p = byId.get(id);
    if (!p) throw new Error(`Broadcast post ${id} missing from existing catalog; cannot preserve it.`);
    return p;
  });
}

export function generateOptimizedCatalog(): XPost[] {
  const preserved = loadPreserved();
  const postedIds = new Set(preserved.map((p) => p.id));

  const pools: Record<string, Draft[]> = {
    hand: buildHandcrafted(),
    stack: buildStacks(),
    pair: buildPairs(),
    persona: buildPersonas(),
  };
  const cursors: Record<string, number> = { hand: 0, stack: 0, pair: 0, persona: 0 };
  const fallback = ['stack', 'pair', 'persona', 'hand'];

  const extractBody = (main: string) => main.replace(/\n\n[^\n]+$/, '').trim();
  const usedBodies = new Set(preserved.map((p) => extractBody(p.mainTweet)));

  const next = (family: string): Draft | null => {
    for (const fam of [family, ...fallback]) {
      while (cursors[fam] < pools[fam].length) {
        const candidate = pools[fam][cursors[fam]++];
        if (!usedBodies.has(candidate.body.trim())) {
          usedBodies.add(candidate.body.trim());
          return candidate;
        }
      }
    }
    return null;
  };

  const catalog: XPost[] = [...preserved];
  const usedMain = new Set(preserved.map((p) => p.mainTweet.trim()));
  const usedReplies = new Set(preserved.map((p) => p.replyTweet.trim()));
  let n = 0;

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    for (const slot of ['morning', 'afternoon'] as const) {
      const id = `post-d${String(day).padStart(3, '0')}-${slot}`;
      if (postedIds.has(id)) continue;

      const draft = next(PATTERN[n % PATTERN.length]);
      if (!draft) throw new Error(`Ran out of drafts at ${id}`);

      const mainTweet = `${draft.body}\n\n${CTAS[n % CTAS.length]}`.trim();
      if (usedMain.has(mainTweet)) throw new Error(`Duplicate main tweet at ${id}`);
      usedMain.add(mainTweet);

      const targetUrl = draft.pairSlug
        ? `https://promptshift.dev/convert/${draft.pairSlug}`
        : 'https://promptshift.dev';

      // Pick the first unused (lead, offer) combination that keeps raw length (AFTER UTM injection) < 280
      const shift = n % draft.leads.length;
      const leads = [...draft.leads.slice(shift), ...draft.leads.slice(0, shift), ...GENERIC_LEADS];
      let replyTweet = '';
      search: for (let li = 0; li < leads.length; li++) {
        for (let oi = 0; oi < OFFERS.length; oi++) {
          const lead = leads[li];
          const offer = OFFERS[(n + oi) % OFFERS.length];
          const candidate = `${lead}\n${offer}\n👉 ${targetUrl}`;
          const withUtm = previewInjectUtmParams(candidate, id);
          if (
            !usedReplies.has(candidate) &&
            withUtm.length <= 278 &&
            getXWeightedLength(candidate) <= 278 &&
            getXWeightedLength(withUtm) <= 278
          ) {
            replyTweet = candidate;
            break search;
          }
        }
      }
      if (!replyTweet) throw new Error(`No unique reply under 280 chars available for ${id}`);
      usedReplies.add(replyTweet);

      catalog.push({ id, category: draft.category, slot, mainTweet, replyTweet });
      n++;
    }
  }
  return catalog;
}

// ============================================================================
// BUILD, AUDIT & WRITE
// ============================================================================

const catalog = generateOptimizedCatalog();
const preservedCount = loadPreserved().length;
let errors = 0;
const ids = new Set<string>();

for (const p of catalog) {
  if (ids.has(p.id)) {
    console.error(`❌ Duplicate ID: ${p.id}`);
    errors++;
  }
  ids.add(p.id);

  const isNew = catalog.indexOf(p) >= preservedCount;
  const mainW = getXWeightedLength(p.mainTweet);
  if (mainW > 278 || p.mainTweet.length >= 280) {
    console.error(`❌ Main tweet too long in ${p.id} (len=${p.mainTweet.length}, weighted=${mainW}):\n${p.mainTweet}\n`);
    errors++;
  }
  if (/https?:\/\/|promptshift\.dev|glama\.ai|polar\.sh/i.test(p.mainTweet)) {
    console.error(`❌ Main tweet contains a URL/domain in ${p.id}`);
    errors++;
  }
  if (isNew && !/link in the (first )?reply/i.test(p.mainTweet.split('\n').pop() || '')) {
    console.error(`❌ Main tweet missing "Link in the reply" CTA in ${p.id}`);
    errors++;
  }
  if (isNew && /\bbio\b/i.test(p.mainTweet)) {
    console.error(`❌ Main tweet mentions bio in ${p.id}`);
    errors++;
  }
  const replyWithUtm = previewInjectUtmParams(p.replyTweet, p.id);
  const replyW = getXWeightedLength(p.replyTweet);
  if (replyW > 278 || p.replyTweet.length >= 280) {
    console.error(`❌ Reply too long in ${p.id} (len=${p.replyTweet.length}, weighted=${replyW})`);
    errors++;
  }
  if (isNew && replyWithUtm.length >= 280) {
    console.error(`❌ Reply + UTM exceeds 280 raw chars in ${p.id} (len=${replyWithUtm.length}):\n${replyWithUtm}`);
    errors++;
  }
  if (isNew && !p.replyTweet.includes('$1.99')) {
    console.error(`❌ Upcoming reply missing $1.99 impulse offer in ${p.id}`);
    errors++;
  }
  if (!p.replyTweet.includes('https://promptshift.dev')) {
    console.error(`❌ Reply missing https://promptshift.dev in ${p.id}`);
    errors++;
  }
}

if (new Set(catalog.map((p) => p.mainTweet)).size !== catalog.length) {
  console.error('❌ Duplicate main tweets detected');
  errors++;
}
if (new Set(catalog.map((p) => p.replyTweet)).size !== catalog.length) {
  console.error('❌ Duplicate reply tweets detected');
  errors++;
}

if (errors > 0) {
  console.error(`\n🚨 Validation failed with ${errors} error(s).`);
  process.exit(1);
}

const upcoming = catalog.slice(preservedCount);
const deepLinkedCount = upcoming.filter((p) => p.replyTweet.includes('/convert/')).length;
const catCounts: Record<string, number> = {};
for (const p of upcoming.slice(0, SIX_MONTH_POSTS)) {
  catCounts[p.category] = (catCounts[p.category] || 0) + 1;
}

console.log(`✅ ${catalog.length} posts (${preservedCount} already broadcast preserved verbatim, next = ${upcoming[0]?.id}).`);
console.log(`✅ 100% of ${upcoming.length} upcoming replies pitch 1-Click Stack/GitHub Builder + Free Preview + $1.99 (+ 50+ Vault).`);
console.log(`✅ ${deepLinkedCount} upcoming pair posts deep-link directly to /convert/[pair].`);
console.log('✅ All upcoming mainTweet & replyTweet strictly < 280 chars even after injectUtmParams.');
console.log('📊 Next 6 months category mix:', catCounts);

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`💾 Saved ${CATALOG_FILE}`);

console.log('\n--- Preview of the next 6 posts ---');
for (const p of upcoming.slice(0, 6)) {
  console.log(`\n[${p.id}]\n${p.mainTweet}\n  ↳ ${p.replyTweet.replace(/\n/g, ' | ')}`);
}
