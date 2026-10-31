import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { CheckCheckService } from '../lib/analytics/checkcheckService';
import { PolarService } from '../lib/payments/polarService';
import { ServerTelemetryStore } from '../lib/analytics/serverTelemetryStore';

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

  // 2. Permanent Checkout Links Integrity
  for (const plan of ['single', 'pro', 'team'] as const) {
    const link = PolarService.getPermanentCheckoutLink(plan);
    assert.ok(
      link.startsWith('https://buy.polar.sh/polar_cl_'),
      `Permanent link for ${plan} must use buy.polar.sh/polar_cl_*, got: ${link}`
    );
  }
  console.log('✅ [2/4] PolarService permanent HTTP-307 buy.polar.sh links verified.');

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
  }

  const csv = CheckCheckService.toCsv(report);
  const csvLines = csv.trim().split('\n');
  assert.strictEqual(csvLines.length, 17, `Expected 17 CSV lines (header + 16 rows), got ${csvLines.length}`);
  console.log('✅ [3/4] CheckCheckService 4-matrix report (16 rails, 5 radars, 7 funnel stages + CSV) verified.');

  // 4. Active Codebase Scan for Legacy Broken 404 Polar URLs
  const brokenPatterns = [
    'https://polar.sh/checkout/3e74e0dd',
    'https://polar.sh/checkout/f646306b',
    'https://polar.sh/checkout/9e8ca309',
    'Free Pro Pass Available',
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
  console.log('✅ [4/4] Zero broken legacy Polar 404 URLs or stale free-pro claims across active runtime codebase.\n');
  console.log('🎉 ALL SOVEREIGN CHECKCHECK & MONETIZATION HARDENING TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
