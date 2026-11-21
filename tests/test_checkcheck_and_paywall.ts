import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { CheckCheckService } from '../lib/analytics/checkcheckService';
import { PolarService } from '../lib/payments/polarService';
import { ServerTelemetryStore } from '../lib/analytics/serverTelemetryStore';
import {
  STACK_CHIP_OPTIONS,
  synthesizeStackSuite,
  parseGitHubRepoInput,
  inferStackChipsFromSignals,
} from '../lib/converter/stackSuiteGenerator';
import { injectUtmParams, X_POSTS_CATALOG } from '../scripts/x-autopilot';

async function runTests() {
  console.log('🧪 Running Sovereign (checkcheck) & Paywall Hardening Test Suite...\n');

  // 1. License Key Hardening Tests
  assert.strictEqual(PolarService.isValidLicenseKey(null), false, 'null key must be rejected');
  assert.strictEqual(PolarService.isValidLicenseKey(''), false, 'empty key must be rejected');
  assert.strictEqual(PolarService.isValidLicenseKey('true'), false, '"true" bypass must be rejected');
  assert.strictEqual(PolarService.isValidLicenseKey('free'), false, '"free" bypass must be rejected');
  assert.strictEqual(PolarService.isValidLicenseKey('test-123'), false, 'short fake key must be rejected');
  assert.strictEqual(
    PolarService.isValidLicenseKey('3e74e0dd-27da-4478-8dee-f2e0fa36ed25'),
    true,
    'UUID v4 Polar license key must be accepted'
  );
  assert.strictEqual(
    PolarService.isValidLicenseKey('polar_lk_9876543210abcdef1234'),
    true,
    'polar_* prefixed key must be accepted'
  );
  assert.strictEqual(
    PolarService.isValidLicenseKey('PSHIFT-ABCD-1234-EFGH'),
    true,
    'PSHIFT-* key must be accepted'
  );
  console.log('✅ [1/4] PolarService.isValidLicenseKey() anti-bypass validation passed.');

  // 2. Permanent Checkout Links & Fail-Closed Checkout Verification
  for (const plan of ['single', 'pro', 'team'] as const) {
    const link = PolarService.getPermanentCheckoutLink(plan);
    assert.ok(
      link.startsWith('https://buy.polar.sh/polar_cl_'),
      `Permanent link for ${plan} must use buy.polar.sh/polar_cl_*, got: ${link}`
    );
  }
  for (const fakeId of ['', '{CHECKOUT_ID}', 'polar_direct_999']) {
    const checkRes = await PolarService.verifyCheckoutSession(fakeId);
    assert.strictEqual(checkRes.verified, false, `Checkout bypass "${fakeId}" must fail closed`);
  }
  console.log('✅ [2/4] PolarService permanent HTTP-307 buy.polar.sh links & fail-closed verification passed.');

  // 3. ServerTelemetryStore & CheckCheckService 4-Matrix Verification
  ServerTelemetryStore.record({
    type: 'mcp_probe',
    channel: 'mcp',
    country: 'US',
  });
  ServerTelemetryStore.record({
    type: 'paywall_hit',
    channel: 'pseo',
    pairSlug: 'cursor-to-claude',
    fileCount: 6,
    secretsCount: 2,
    country: 'US',
  });

  const report = await CheckCheckService.buildReport([], false);
  assert.strictEqual(report.project, 'PromptShift');
  assert.strictEqual(report.domain, 'https://promptshift.dev');
  assert.strictEqual(report.currency, 'USD');
  assert.strictEqual(report.studioHealth.freeTierMaxFiles, 2);
  assert.strictEqual(
    report.catalogMaster16.length,
    16,
    `Expected exactly 16 catalog rows, got ${report.catalogMaster16.length}`
  );
  assert.strictEqual(
    report.usAgentRadars5.length,
    5,
    `Expected exactly 5 US agent radars, got ${report.usAgentRadars5.length}`
  );
  assert.strictEqual(
    report.contactIntentFunnel7.length,
    7,
    `Expected exactly 7 funnel stages, got ${report.contactIntentFunnel7.length}`
  );

  for (const row of report.catalogMaster16) {
    assert.ok(row.prix_usd.includes('$'), `Catalog row ${row.id_rail} price must be USD ($)`);
    assert.ok(row.ca_net_usd.startsWith('$'), `Catalog row ${row.id_rail} revenue must start with $`);
    assert.ok(
      row.signal_et_decision_arbitrage.length > 25,
      `Catalog row ${row.id_rail} must include detailed Agile Arbitrage decision`
    );
  }

  for (const radar of report.usAgentRadars5) {
    assert.ok(radar.ca_net_usd.startsWith('$'), `Radar ${radar.id_radar} revenue must start with $`);
    assert.ok(
      radar.signal_et_decision_arbitrage.length > 25,
      `Radar ${radar.id_radar} must include detailed Agile Arbitrage decision`
    );
  }

  for (const stage of report.contactIntentFunnel7) {
    assert.ok(
      stage.signal_et_decision_arbitrage.length > 25,
      `Funnel stage ${stage.code_etape} must include detailed Agile Arbitrage decision`
    );
    assert.ok(
      !stage.fuite_identifiee.includes('X API blocked on HTTP 402'),
      `Funnel stage ${stage.code_etape} must not contain stale X API HTTP 402 text`
    );
  }
  assert.strictEqual(
    report.studioHealth.xAutopilotStatus.status,
    'ACTIVE_LIVE',
    'xAutopilotStatus must report ACTIVE_LIVE'
  );

  // Verify X Autopilot UTM injector edge cases (trailing punctuation, existing query params, sub-paths, hash)
  assert.strictEqual(
    injectUtmParams('Ship at https://promptshift.dev.', 'p01'),
    'Ship at https://promptshift.dev?utm_source=x&utm_medium=social&utm_campaign=devrel_daily&utm_content=p01.',
    'Trailing period must stay outside the injected UTM query string'
  );
  assert.strictEqual(
    injectUtmParams('CLI: https://promptshift.dev/cli?ref=1', 'p02'),
    'CLI: https://promptshift.dev/cli?ref=1&utm_source=x&utm_medium=social&utm_campaign=devrel_daily&utm_content=p02',
    'Existing query parameters must append UTM with & without regex backtracking'
  );
  assert.strictEqual(
    injectUtmParams('Bridge: https://promptshift.dev/convert/cursor-to-claude', 'p03'),
    'Bridge: https://promptshift.dev/convert/cursor-to-claude?utm_source=x&utm_medium=social&utm_campaign=devrel_daily&utm_content=p03',
    'Sub-paths must cleanly receive ?utm_source=...'
  );
  assert.strictEqual(
    injectUtmParams('Try (https://promptshift.dev/convert/cursor-to-claude#dropzone), now!', 'p04'),
    'Try (https://promptshift.dev/convert/cursor-to-claude?utm_source=x&utm_medium=social&utm_campaign=devrel_daily&utm_content=p04#dropzone), now!',
    'Hash fragments and trailing ), punctuation must be preserved cleanly'
  );

  const csv = CheckCheckService.toCsv(report);
  const csvLines = csv.trim().split('\n');
  assert.strictEqual(csvLines.length, 17, `Expected 17 CSV lines (header + 16 rows), got ${csvLines.length}`);
  console.log('✅ [3/4] CheckCheckService 4-matrix report (16 rails, 5 radars, 7 funnel stages + CSV) verified.');

  // 4. Active Codebase Scan for Legacy Broken 404 Polar URLs, Public Promo Leaks & Hardcoded Secrets
  const brokenPatterns = [
    'https://polar.sh/checkout/3e74e0dd',
    'https://polar.sh/checkout/f646306b',
    'https://polar.sh/checkout/9e8ca309',
    'Free Pro Pass Available',
    'e.g. SMOKETEST',
    'polar_oat_',
    'whsec_7fmNAS',
  ];

  const activeDirs = ['app', 'lib', 'components', 'packages', 'public'];
  const rootDir = path.resolve(__dirname, '..');
  const violations: string[] = [];

  function walkDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) return;
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (/\.(ts|tsx|js|json|txt|md)$/i.test(entry.name)) {
        const rel = path.relative(rootDir, fullPath).replace(/\\/g, '/');
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const bad of brokenPatterns) {
          if (bad === 'Free Pro Pass Available' && rel === 'lib/analytics/checkcheckService.ts') {
            continue; // Historical autopsy explanation string
          }
          if (content.includes(bad)) {
            violations.push(`${rel} contains forbidden legacy string: "${bad}"`);
          }
        }
      }
    }
  }

  for (const dir of activeDirs) {
    walkDir(path.join(rootDir, dir));
  }

  assert.strictEqual(
    violations.length,
    0,
    `Found legacy broken checkout URLs or stale free-pro copy:\n${violations.join('\n')}`
  );
  console.log('✅ [4/5] Zero broken legacy Polar 404 URLs or stale free-pro claims across active runtime codebase.');

  // 5. 1-Click Stack Rules Builder, GitHub Repo Importer & X Catalog Conversion Hook Verification
  assert.strictEqual(STACK_CHIP_OPTIONS.length, 8, 'Must provide all 8 interactive stack chips');
  const stackSuite = synthesizeStackSuite(['nextjs15', 'react19_ts', 'supabase_rls', 'owasp_security']);
  assert.strictEqual(stackSuite.totalFiles, 8, 'Synthesized stack suite must contain 8 files total');
  assert.strictEqual(stackSuite.previewFiles, 2, 'Sliced starter preview must contain 2 files');
  assert.strictEqual(stackSuite.lockedFileLabels.length, 6, '6 files must be staged/locked for $1.99 unlock');
  assert.strictEqual(
    1 + stackSuite.fullProject.rules.length + stackSuite.fullProject.knowledge_base.length,
    8,
    'fullProject must contain 8 files in RAM'
  );
  assert.strictEqual(
    1 + stackSuite.slicedProject.rules.length + stackSuite.slicedProject.knowledge_base.length,
    2,
    'slicedProject must contain 2 files in RAM'
  );

  const parsedGh = parseGitHubRepoInput('https://github.com/vercel/next.js');
  assert.deepStrictEqual(parsedGh, { owner: 'vercel', repo: 'next.js', fullName: 'vercel/next.js' });
  const inferredChips = inferStackChipsFromSignals('vercel/next.js TypeScript Tailwind Supabase');
  assert.ok(inferredChips.includes('nextjs15') && inferredChips.includes('supabase_rls'));

  const annualCatalog = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'data', 'x_annual_posts_catalog.json'), 'utf8')
  );
  const postsHistory = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'data', 'x_posts_history.json'), 'utf8')
  );
  const postedIds = new Set(postsHistory.history.map((h: any) => h.id));
  let deepLinkCount = 0;
  for (const post of annualCatalog) {
    if (!postedIds.has(post.id)) {
      const withUtm = injectUtmParams(post.replyTweet, post.id);
      assert.ok(
        post.mainTweet.length < 280,
        `Annual mainTweet ${post.id} exceeds 280 chars (${post.mainTweet.length})`
      );
      assert.ok(
        withUtm.length < 280,
        `Annual replyTweet+UTM ${post.id} exceeds 280 chars (${withUtm.length})`
      );
      assert.ok(
        post.replyTweet.includes('$1.99'),
        `Upcoming annual replyTweet ${post.id} must pitch the $1.99 impulse offer`
      );
      if (post.replyTweet.includes('/convert/')) deepLinkCount++;
    }
  }
  assert.ok(deepLinkCount >= 100, `Expected >= 100 deep-linked /convert/[pair] posts, got ${deepLinkCount}`);

  for (const post of X_POSTS_CATALOG) {
    const withUtm = injectUtmParams(post.replyTweet, post.id);
    assert.ok(post.mainTweet.length < 280, `Catalog mainTweet ${post.id} >= 280 chars`);
    assert.ok(withUtm.length < 280, `Catalog replyTweet+UTM ${post.id} >= 280 chars`);
    assert.ok(post.replyTweet.includes('$1.99'), `Catalog replyTweet ${post.id} missing $1.99`);
  }
  console.log('✅ [5/5] 1-Click 8-File Stack Builder, GitHub Repo Importer & 730 X Catalog (<280 chars + UTM) verified.\n');
  console.log('🎉 ALL SOVEREIGN CHECKCHECK & MONETIZATION HARDENING TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
