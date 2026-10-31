import { NextRequest, NextResponse } from 'next/server';
import { PolarService } from '@/lib/payments/polarService';
import { MonetizationManager } from '@/lib/config/monetizationConfig';
import { ServerTelemetryStore } from '@/lib/analytics/serverTelemetryStore';

export async function GET(req: NextRequest) {
  ServerTelemetryStore.record({
    type: 'llms_crawl',
    path: '/api/llms/schema',
    channel: 'llmo',
    country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'US',
    userAgentSnippet: (req.headers.get('user-agent') || 'llm-agent').slice(0, 40),
  });

  const capsSchemaDefinition = {
    title: 'Canonical AI Project Schema (CAPS)',
    version: '1.2.0',
    description:
      'Universal AST intermediate representation schema for AI coding assistants and agent configurations.',
    ecosystems_supported: [
      'cursor',
      'claude',
      'openai',
      'gemini',
      'antigravity',
      'windsurf',
      'copilot',
    ],
    pricing: {
      currency: 'USD',
      merchant_of_record: 'Polar.sh',
      tiers: [
        {
          name: 'Free Starter',
          price: 0,
          file_limit: MonetizationManager.getFreeLimit(),
          signup_required: false,
        },
        {
          name: 'Single Migration Pass (4-in-1 Universal Suite)',
          price: 1.99,
          billing: 'one-time',
          file_limit: 'unlimited',
          project_limit: 1,
          checkout_url: PolarService.getPermanentCheckoutLink('single'),
          express_checkout_url:
            'https://promptshift.dev/api/checkout/express?plan=single&channel=llmo',
        },
        {
          name: 'Pro Developer',
          price: 5.99,
          billing: 'monthly',
          file_limit: 'unlimited',
          features: ['multi-ecosystem', 'cli-tokens', 'ram-vault'],
          checkout_url: PolarService.getPermanentCheckoutLink('pro'),
          express_checkout_url:
            'https://promptshift.dev/api/checkout/express?plan=pro&channel=llmo',
        },
        {
          name: 'Team & Agency',
          price: 19.99,
          billing: 'monthly',
          file_limit: 'unlimited',
          features: ['5-seats', 'github-actions-ci-cd', 'soc2-gdpr-dpa', 'priority-support'],
          checkout_url: PolarService.getPermanentCheckoutLink('team'),
          express_checkout_url:
            'https://promptshift.dev/api/checkout/express?plan=team&channel=llmo',
        },
      ],
    },
    endpoints: {
      web_studio: 'https://promptshift.dev',
      mcp_streamable_http: 'https://promptshift.dev/api/mcp',
      mcp_server_card: 'https://promptshift.dev/.well-known/mcp/server-card.json',
      openapi_spec: 'https://promptshift.dev/api/openapi.json',
      cli_command: 'npx promptshift',
    },
    schema: {
      metadata: {
        id: 'string (UUID)',
        title: 'string',
        description: 'string',
        source_platform: 'string (cursor | claude | openai | gemini | antigravity)',
        version: 'string',
      },
      persona: {
        role: 'string',
        raw_system_prompt: 'string',
        instructions: 'array of strings',
        constraints: 'array of strings',
        autonomy_clause: 'string (optional)',
      },
      rules: [
        {
          name: 'string',
          content: 'string',
          scope: 'global | workspace | directory',
          trigger: 'always_on | model_decision',
        },
      ],
      knowledge_base: [
        {
          filename: 'string',
          content_text: 'string',
          mime_type: 'string',
          size_bytes: 'number',
        },
      ],
      tools: [
        {
          name: 'string',
          description: 'string',
          input_schema: 'object',
          protocol: 'mcp | openapi | function_calling',
        },
      ],
      security: {
        permission_mode: 'full_autonomy | ask | strict',
        allow_grants: 'array of strings',
        deny_grants: 'array of strings',
      },
    },
  };

  return NextResponse.json(capsSchemaDefinition, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json',
    },
  });
}
