import { NextRequest, NextResponse } from 'next/server';
import { PolarService } from '@/lib/payments/polarService';
import { ServerTelemetryStore } from '@/lib/analytics/serverTelemetryStore';

/**
 * A2A Agent Card (/.well-known/agent.json)
 * Standard Agent-to-Agent discovery manifest for US autonomous coding and procurement agents.
 */
export async function GET(req: NextRequest) {
  ServerTelemetryStore.record({
    type: 'llms_crawl',
    path: '/.well-known/agent.json',
    channel: 'llmo',
    country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'US',
    userAgentSnippet: (req.headers.get('user-agent') || 'a2a-agent').slice(0, 40),
  });

  const agentCard = {
    name: 'PromptShift Universal AST Transpiler',
    description:
      'Zero-retention In-RAM compiler that converts AI coding rules across Cursor, Claude Code, Windsurf, OpenAI, Copilot, and Google Gemini / Antigravity with 98.5% AST semantic fidelity and active API key redaction.',
    url: 'https://promptshift.dev',
    version: '1.2.0',
    provider: {
      organization: 'PromptShift',
      url: 'https://promptshift.dev',
      contactEmail: 'contact@promptshift.dev',
    },
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
      zeroDataRetentionInRam: true,
      http402CommerceReady: true,
    },
    authentication: {
      schemes: ['None', 'ApiKey'],
      headerName: 'X-PromptShift-Key',
      freeQuota: 'Up to 2 rule files per workspace at $0.00 with zero signup',
      commercialUnlock: {
        merchantOfRecord: 'Polar.sh',
        currency: 'USD',
        singlePass: {
          priceUsd: 1.99,
          checkoutUrl: PolarService.getPermanentCheckoutLink('single'),
        },
        proDeveloper: {
          priceUsd: 5.99,
          billing: 'monthly',
          checkoutUrl: PolarService.getPermanentCheckoutLink('pro'),
        },
        teamAgency: {
          priceUsd: 19.99,
          billing: 'monthly',
          checkoutUrl: PolarService.getPermanentCheckoutLink('team'),
        },
      },
    },
    endpoints: {
      mcpJsonRpc: 'https://promptshift.dev/api/mcp',
      restConvert: 'https://promptshift.dev/api/convert',
      openApiSpec: 'https://promptshift.dev/api/openapi.json',
      llmsTxt: 'https://promptshift.dev/llms.txt',
    },
    skills: [
      {
        id: 'transpile-ai-rules',
        name: 'Cross-Ecosystem AI Rules Transpilation',
        description:
          'Convert .cursorrules, .cursor/rules/*.mdc, CLAUDE.md, GEMINI.md, AGENTS.md, and OpenAI Assistant v2 configs with 98.5% AST parity.',
        tags: ['cursor', 'claude-code', 'windsurf', 'copilot', 'gemini', 'ast-transpiler'],
      },
      {
        id: 'sanitize-prompt-secrets',
        name: 'In-RAM Credential & API Key Redaction',
        description:
          'Automatically detect and mask exposed OpenAI, Anthropic, AWS, GitHub, and Stripe tokens in memory before exporting rules.',
        tags: ['security', 'secret-scanning', 'owasp', 'zero-retention'],
      },
    ],
  };

  return NextResponse.json(agentCard, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json',
    },
  });
}
