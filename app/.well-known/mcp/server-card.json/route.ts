import { NextRequest, NextResponse } from 'next/server';
import { PolarService } from '@/lib/payments/polarService';
import { ServerTelemetryStore } from '@/lib/analytics/serverTelemetryStore';

/**
 * Official MCP Server Card (/.well-known/mcp/server-card.json)
 * Enables zero-config discovery by Smithery.ai, Glama.ai, Cursor MCP Directory,
 * Claude Desktop / Claude Code, and US autonomous developer agents.
 */
export async function GET(req: NextRequest) {
  ServerTelemetryStore.record({
    type: 'mcp_probe',
    path: '/.well-known/mcp/server-card.json',
    channel: 'mcp',
    country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'US',
    userAgentSnippet: (req.headers.get('user-agent') || 'mcp-registry').slice(0, 40),
  });

  const serverCard = {
    $schema: 'https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json',
    name: 'io.github.topaisaas-dev/promptshift',
    title: 'PromptShift — Universal AI Coding Rules AST Transpiler',
    description:
      'Deterministic AST transpiler & OWASP in-RAM secret sanitizer across Cursor (.cursorrules/.mdc), Anthropic Claude (CLAUDE.md/XML), Windsurf, OpenAI, and Google Gemini / Antigravity.',
    version: '1.2.0',
    websiteUrl: 'https://promptshift.dev',
    repository: {
      url: 'https://github.com/topaisaas-dev/promptshift',
      source: 'github',
    },
    remotes: [
      {
        transportType: 'streamable-http',
        url: 'https://promptshift.dev/api/mcp',
        headers: [
          {
            name: 'X-PromptShift-Key',
            description:
              'Optional Polar.sh Order UUID or Pro License Key to unlock repositories with >2 rule files',
            isRequired: false,
            isSecret: true,
          },
        ],
      },
    ],
    packages: [
      {
        registryName: 'npm',
        name: 'promptshift',
        version: '1.2.0',
        runtimeHint: 'npx',
        runtimeArguments: ['-y', 'promptshift', '--mcp'],
      },
    ],
    pricing: {
      currency: 'USD',
      freeStarterMaxFiles: 2,
      singlePassUsd: 1.99,
      singlePassCheckoutUrl: PolarService.getPermanentCheckoutLink('single'),
      proMonthlyUsd: 5.99,
      proCheckoutUrl: PolarService.getPermanentCheckoutLink('pro'),
      teamMonthlyUsd: 19.99,
      teamCheckoutUrl: PolarService.getPermanentCheckoutLink('team'),
    },
    tools: [
      'promptshift_transpile',
      'promptshift_sanitize_secrets',
      'promptshift_validate_ast',
    ],
  };

  return NextResponse.json(serverCard, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json',
    },
  });
}
