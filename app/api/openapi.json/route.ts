import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: '3.1.0',
    info: {
      title: 'PromptShift Universal AI Agent Transpiler API',
      version: '1.0.0',
      description:
        'Sovereign In-RAM transpiler and AST semantic bridge between Anthropic Claude, Cursor, OpenAI Custom GPTs, and Google Gemini / Antigravity.',
      contact: {
        name: 'PromptShift API Support',
        email: 'contact@promptshift.dev',
        url: 'https://promptshift.dev',
      },
      license: {
        name: 'Proprietary / Polar.sh Commercial MoR',
        url: 'https://promptshift.dev/terms',
      },
    },
    servers: [
      {
        url: 'https://promptshift.dev',
        description: 'Production Edge Server (Global Vercel Edge Network)',
      },
    ],
    paths: {
      '/api/convert': {
        post: {
          summary: 'Transpile an AI Agent Project in RAM',
          description:
            'Transpiles a CanonicalProject JSON payload into destination platform rules and generates a ready-to-run ZIP archive. Executes 100% in-RAM with zero server logging.',
          operationId: 'transpileProject',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TranspileRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Successful transpilation',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TranspileResponse',
                  },
                },
              },
            },
            '402': {
              description: 'Payment Required — Project exceeds free tier (2 files). Returns Polar.sh checkout session link.',
              headers: {
                'X-Payment-Required': {
                  schema: { type: 'string', example: 'true' },
                },
                'X-Polar-Checkout-Url': {
                  schema: { type: 'string', example: 'https://buy.polar.sh/polar_cl_fGe6iBikmKFXK6EUnPpBLNSP66Oc4P3K5b5Mb4ZvH5E' },
                },
                'X-Polar-Product-Id': {
                  schema: { type: 'string', example: '3e74e0dd-27da-4b78-8dee-f2e0fa36ed25' },
                },
              },
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' },
                      code: { type: 'integer', example: 402 },
                      pricing: {
                        type: 'object',
                        properties: {
                          single_pass_usd: { type: 'number', example: 1.99 },
                          pro_monthly_usd: { type: 'number', example: 5.99 },
                        },
                      },
                      checkout_url: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/payments/polar/create-checkout': {
        post: {
          summary: 'Create Polar.sh Checkout Session',
          description: 'Generates a secure checkout session URL powered by Polar.sh as Merchant of Record.',
          operationId: 'createPolarCheckout',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['plan'],
                  properties: {
                    plan: { type: 'string', enum: ['single', 'pro', 'team'], description: 'Subscription or pass tier' },
                    customerEmail: { type: 'string', format: 'email', description: 'Optional pre-filled customer billing email' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Checkout URL created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      url: { type: 'string', format: 'uri' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        TranspileRequest: {
          type: 'object',
          required: ['project', 'targetPlatform'],
          properties: {
            project: {
              type: 'object',
              properties: {
                metadata: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    source_platform: { type: 'string', enum: ['cursor', 'claude', 'openai', 'gemini', 'antigravity'] },
                  },
                },
                persona: {
                  type: 'object',
                  properties: {
                    role: { type: 'string' },
                    raw_system_prompt: { type: 'string' },
                    autonomy_clause: { type: 'string' },
                  },
                },
                rules: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      content: { type: 'string' },
                    },
                  },
                },
                knowledge_base: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      filename: { type: 'string' },
                      content_text: { type: 'string' },
                    },
                  },
                },
              },
            },
            targetPlatform: {
              type: 'string',
              enum: ['cursor', 'claude', 'openai', 'gemini'],
            },
          },
        },
        TranspileResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            transpileResult: {
              type: 'object',
              properties: {
                projectName: { type: 'string' },
                sourcePlatform: { type: 'string' },
                targetPlatform: { type: 'string' },
                parityScore: { type: 'number', example: 98.5 },
                files: { type: 'object', additionalProperties: { type: 'string' } },
                alerts: { type: 'array', items: { type: 'object' } },
              },
            },
            zipBase64: { type: 'string', format: 'byte' },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'Content-Type': 'application/json',
    },
  });
}
