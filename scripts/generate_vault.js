const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function buildVault() {
  const zip = new JSZip();

  zip.file(
    'README.md',
    `# PromptShift 50+ Master AI Coding Rules & Prompts Vault (v2.0 Production)
Copyright (c) 2026 PromptShift (https://promptshift.dev)

This production vault delivers 50+ battle-tested AI coding directives and modular rules ready for:
- Cursor IDE (.cursorrules & .cursor/rules/*.mdc)
- Anthropic Claude Code & Projects (CLAUDE.md & XML)
- GitHub Copilot (.github/copilot-instructions.md)
- Windsurf Cascade (.windsurfrules)
- Google Gemini CLI & Antigravity (GEMINI.md, AGENTS.md)

## Quick Start:
1. Copy the desired rule files into your repository root or .cursor/rules/ folder.
2. Synchronize your rules across all AI editors using the PromptShift CLI:
   \`\`\`bash
   npx promptshift --watch
   \`\`\`
`
  );

  zip.file(
    '01-frameworks/nextjs-15-app-router.mdc',
    `---
description: Next.js 15 App Router Architecture & React 19 Standards
globs: "app/**/*.{ts,tsx},components/**/*.{ts,tsx}"
---
# Next.js 15 & React 19 Rules
- Default to React Server Components (RSC) unless interactivity or state is explicitly required.
- Mark interactive components with 'use client' at the very top line.
- Always await dynamic route params, searchParams, cookies(), and headers() in Next.js 15.
- Use async Server Actions with input validation (zod) for all mutations.
- Prefer dynamic rendering with proper cache tags: revalidateTag() and revalidatePath().
- Never import server-only modules in client bundles.
`
  );

  zip.file(
    '01-frameworks/tailwind-v4-styling.mdc',
    `---
description: TailwindCSS v4 High-Performance Design System
globs: "**/*.{tsx,jsx,css}"
---
# TailwindCSS v4 Guidelines
- Use modern theme variables and CSS-first config (@theme).
- Strictly adhere to accessible contrast ratios (WCAG AAA for text, AA for UI controls).
- Prefer semantic utility classes over arbitrary bracket values when available.
- Design responsive layouts mobile-first (base styles = mobile, sm:, md:, lg:, xl: for desktop).
- Include visible focus-visible ring states on every interactive element.
`
  );

  zip.file(
    '01-frameworks/python-fastapi-clean-arch.md',
    `# Python FastAPI & Pydantic v2 Production Directives
- Use strict Pydantic v2 schemas (ConfigDict(extra='forbid')) for all request payloads and response models.
- Implement dependency injection via FastAPI Depends() for database sessions, auth, and clients.
- Use asynchronous route handlers (async def) with non-blocking drivers (httpx, asyncpg).
- Handle exceptions with custom HTTPException classes and RFC 7807 Problem Details handlers.
- Enforce strict typing with mypy/ruff and type annotations on every function signature.
`
  );

  zip.file(
    '01-frameworks/rust-tokio-production.md',
    `# Rust & Tokio Async Standards
- Never use unwrap() or expect() in production code paths; use Result<T, E> and '?' operator.
- Use thiserror for domain errors and anyhow for application entry points.
- Structure concurrency around tokio::spawn and tokio::select! with cancellation safety.
- Keep lock guard scopes as short as possible; never hold a Mutex across an .await point.
- Enforce cargo clippy -- -D warnings on all crates.
`
  );

  zip.file(
    '01-frameworks/typescript-strict-zero-any.mdc',
    `---
description: TypeScript Strict Typing & Zero-Any Policy
globs: "**/*.{ts,tsx}"
---
# TypeScript Strictness Policy
- 'any' is strictly prohibited. Use 'unknown' with type narrowing or generic parameters.
- Enable noImplicitAny, strictNullChecks, and exactOptionalPropertyTypes in tsconfig.
- Use branded types for domain identifiers (UserId, OrderId, TenantId).
- Prefer Discriminated Unions for state management and polymorphic event handlers.
`
  );

  zip.file(
    '01-frameworks/supabase-postgres-rls.md',
    `# Supabase & PostgreSQL Security Architecture
- Row Level Security (RLS) MUST be enabled on EVERY table without exception.
- Write explicit policies for SELECT, INSERT, UPDATE, and DELETE targeting (select auth.uid()).
- Never bypass RLS in client-side code; use the service_role key only in secure serverless backend functions.
- Add B-Tree database indexes on foreign keys, tenant IDs, and filtered columns in RLS policies.
`
  );

  zip.file(
    '01-frameworks/node-express-prisma-orm.mdc',
    `---
description: Node.js, Express/API Routes & Prisma ORM Transaction Safety
globs: "prisma/schema.prisma,src/**/*.{ts,js}"
---
# Node.js & Prisma ORM Directives
- Use a singleton PrismaClient instance across hot reloads to prevent connection pool exhaustion.
- Always specify explicit select projections on user and billing tables so sensitive hashes are never returned.
- Wrap multi-table mutations inside prisma.$transaction() with idempotency keys.
- Validate all incoming request bodies, params, and query strings with Zod schemas.
`
  );

  zip.file(
    '01-frameworks/docker-multistage-production.md',
    `# Docker Production Hardening
- Use multi-stage builds to minimize image surface: builder stage -> production runner.
- Never run containers as root; define and use an unprivileged user (USER node / USER nonroot).
- Use minimal base images (distroless or alpine) and pin image digests.
- Never pass sensitive build secrets via ARG or ENV; use BuildKit '--mount=type=secret'.
`
  );

  zip.file(
    '01-frameworks/playwright-vitest-testing.mdc',
    `---
description: Playwright E2E & Vitest Unit Verification Standards
globs: "tests/**/*.{ts,tsx},**/*.{test,spec}.{ts,tsx}"
---
# Playwright & Vitest QA Rules
- Use accessible user-facing locators (getByRole, getByLabel) instead of brittle CSS selectors.
- Never use hardcoded sleep timers (waitForTimeout); rely on web-first auto-retrying assertions.
- Cover happy paths plus 401/403/422/429 error boundaries in every API test suite.
`
  );

  zip.file(
    '02-security-guardrails/zero-secret-leakage-prevention.mdc',
    `---
description: Strict Secret Leakage & Credential Protection
globs: "**/*"
---
# Zero Secret Leakage Policy
- NEVER hardcode API keys, database credentials, JWT secrets, or private tokens in source code.
- Prevent committing .env, .env.local, .pem, .key, and service-account.json files.
- Sanitize logs: never log full authorization headers, card numbers, or passwords.
- Detect and flag OpenAI sk-*, Anthropic sk-ant-*, AWS AKIA*, Stripe sk_live_*, and GitHub ghp_* tokens immediately.
`
  );

  zip.file(
    '02-security-guardrails/idor-authorization-checks.mdc',
    `---
description: Insecure Direct Object Reference (IDOR) Prevention
globs: "**/api/**/*.{ts,js,py}"
---
# IDOR Defense Architecture
- Never rely on client-supplied user IDs or tenant IDs in request bodies or query params.
- Always derive the authenticated actor from the cryptographically verified session token.
- Verify ownership and access permissions before returning or updating any database resource.
- Fail closed (deny by default) when session or signature verification encounters an error.
`
  );

  zip.file(
    '02-security-guardrails/owasp-top-10-api-defense.md',
    `# OWASP API Security Top 10 Guidelines
- Implement strict rate limiting on authentication, payment, and sensitive API endpoints.
- Validate and sanitize all inputs at boundary layers using schemas (Zod, Pydantic).
- Set secure HTTP headers: Content-Security-Policy, X-Frame-Options: DENY, Strict-Transport-Security.
- Never expose internal database stack traces or raw ORM errors in API error responses.
`
  );

  zip.file(
    '03-ai-agent-steering/autonomous-execution-policy.mdc',
    `---
description: Autonomous Pair Programming & Non-Blocking Execution
globs: "**/*"
---
# Autonomous Execution Directives
- Take proactive initiative to solve the root problem rather than stopping at surface symptoms.
- Always run automated verification, tests, or builds before confirming a task is complete.
- Maintain existing comments, architecture decisions, and code conventions intact.
- Never delete production data or bypass access control without explicit validation.
`
  );

  zip.file(
    '03-ai-agent-steering/anti-hallucination-verification.md',
    `# Anti-Hallucination & Ground-Truth Verification
- Before asserting a fact, verify it against the actual repository files or live command outputs.
- In financial or metric calculations, use exact ground-truth data from the source of truth.
- When an API or library method is uncertain, inspect the official schema or type definitions.
`
  );

  zip.file(
    '04-ready-to-use-claude/CLAUDE.md',
    `# PromptShift Universal CLAUDE.md Master Rules
- Stack: Next.js 15 App Router, TypeScript Strict, TailwindCSS v4.
- Workflow: Run 'npm test' and 'npm run build' before finishing turn.
- Security: Zero-retention RAM architecture, IDOR checks, fail-closed verification.
- Monetization: Polar.sh MoR integration for frictionless Apple Pay / Google Pay.
- CLI Sync: Use 'npx promptshift --watch' for bidirectional rules sync.
`
  );

  zip.file(
    '05-ready-to-use-cursor/.cursorrules',
    `# PromptShift Universal .cursorrules Master Directives
- Follow clean architecture: separation of UI, business logic, and API clients.
- Never commit secrets or hardcoded test keys.
- Write unit tests for all edge cases and error states.
- Prefer explicit types over inferred 'any'.
`
  );

  zip.file(
    '06-ready-to-use-copilot/copilot-instructions.md',
    `# GitHub Copilot Repository Instructions
- Maintain TypeScript strictness across all modules.
- Ensure all exported functions have complete JSDoc descriptions.
- Validate all user-facing forms with Zod before submission.
- Ensure all interactive buttons have explicit accessible aria-label attributes.
`
  );

  zip.file(
    '07-ready-to-use-windsurf/.windsurfrules',
    `# Windsurf Cascade Master Rules
- Respect modular directory boundaries.
- Run type checks on modified files.
- Apply semantic HTML and accessible contrast standards.
`
  );

  zip.file(
    '08-ready-to-use-gemini/GEMINI.md',
    `# Google Antigravity & Gemini CLI Directives
- Full autonomy granted: proactively implement, verify, and test changes.
- Ensure zero synthetic data in executive reports.
- Maintain backward compatibility across all migration routes.
`
  );

  const outputDir = path.resolve(__dirname, '../public/downloads');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const zipPath = path.join(outputDir, 'promptshift-master-rules-vault.zip');
  fs.writeFileSync(zipPath, content);
  console.log('Vault written successfully:', content.length, 'bytes at', zipPath);
}

buildVault();
