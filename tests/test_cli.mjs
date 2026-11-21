import { execSync } from 'child_process';
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const CLI_PATHS = [
  path.join(ROOT_DIR, 'packages', 'cli', 'bin', 'promptshift.js'),
  path.join(ROOT_DIR, 'bin', 'promptshift.js')
];

console.log('🧪 Testing PromptShift CLI & STDIO MCP Server...');

for (const cliPath of CLI_PATHS) {
  const label = path.relative(ROOT_DIR, cliPath);

  // 1. Test --version
  const versionOutput = execSync(`node "${cliPath}" --version`).toString();
  assert.ok(versionOutput.includes('promptshift v1.2.1'), `CLI version check failed for ${label}`);

  // 2. Test --help
  const helpOutput = execSync(`node "${cliPath}" --help`).toString();
  assert.ok(helpOutput.includes('npx promptshift [options]'), `CLI help check failed for ${label}`);
  assert.ok(helpOutput.includes('--mcp'), `CLI --mcp option missing in help for ${label}`);
  assert.ok(helpOutput.includes('--watch'), `CLI --watch option missing in help for ${label}`);

  // 3. Test --dry-run --to=cursor and flag aliases (--source / --target / --verify / --sanitize-secrets)
  const dryRunOutput = execSync(`node "${cliPath}" --dry-run --to=cursor`).toString();
  const cleanDryRun = dryRunOutput.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
  assert.ok(cleanDryRun.includes('Transpiling:'), `CLI dry-run transpilation failed for ${label}`);
  assert.ok(cleanDryRun.includes('AST Semantic Parity: 98.5%'), `Parity metric missing in CLI for ${label}`);
  assert.ok(cleanDryRun.includes('.cursorrules'), `.cursorrules missing in CLI output for ${label}`);

  const aliasOutput = execSync(`node "${cliPath}" --dry-run --source cursor --target copilot --sanitize-secrets`).toString();
  assert.ok(aliasOutput.includes('copilot-instructions.md'), `CLI --target copilot failed for ${label}`);

  const verifyOutput = execSync(`node "${cliPath}" --verify --dry-run`).toString();
  assert.ok(verifyOutput.includes('Audit Result: PASSED'), `CLI --verify alias failed for ${label}`);

  // 4. Test --mcp STDIO JSON-RPC Server (initialize, ping & tools/list)
  const mcpRequests = [
    JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
    JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'ping' }),
    JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} })
  ].join('\n') + '\n';

  const mcpOutput = execSync(`node "${cliPath}" --mcp`, { input: mcpRequests }).toString().trim().split('\n');
  assert.strictEqual(mcpOutput.length, 3, `Expected 3 JSON-RPC responses from --mcp for ${label}`);
  const initRes = JSON.parse(mcpOutput[0]);
  const pingRes = JSON.parse(mcpOutput[1]);
  const toolsRes = JSON.parse(mcpOutput[2]);
  assert.strictEqual(initRes.result.serverInfo.name, 'promptshift');
  assert.deepStrictEqual(pingRes.result, {});
  assert.strictEqual(toolsRes.result.tools.length, 3);
  assert.strictEqual(toolsRes.result.tools[0].name, 'promptshift_transpile');
  console.log(`  ✓ Verified ${label} (v1.2.0, flag aliases, ping, 3 MCP tools)`);
}

console.log('🎉 ALL CLI & MCP TESTS PASSED!');
