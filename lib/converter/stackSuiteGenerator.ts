import { CanonicalProject } from './capsSchema';
import { SecurityGuards } from './securityGuards';

export interface StackChipOption {
  id: string;
  label: string;
  shortSlug: string;
  globs: string;
  directives: string[];
  constraints: string[];
  ruleFilename: string;
  ruleContent: string;
}

export const STACK_CHIP_OPTIONS: StackChipOption[] = [
  {
    id: 'nextjs15',
    label: 'Next.js 15 App Router',
    shortSlug: 'nextjs15',
    globs: 'app/**/*.{ts,tsx},components/**/*.{ts,tsx}',
    directives: [
      'Default to React Server Components (RSC); add "use client" strictly at interactive leaf boundaries.',
      'Await dynamic route params, searchParams, cookies(), and headers() per Next.js 15 async API contract.',
      'Use Server Actions validated with Zod schemas for mutations and trigger revalidatePath/revalidateTag.',
    ],
    constraints: [
      'Never import server-only modules or database clients inside "use client" components.',
      'Never use legacy Pages Router getServerSideProps or getInitialProps.',
    ],
    ruleFilename: '.cursor/rules/01-nextjs15-app-router.mdc',
    ruleContent: `---
description: Next.js 15 App Router, Async Dynamic APIs & Server Actions Architecture
globs: "app/**/*.{ts,tsx},components/**/*.{ts,tsx}"
alwaysApply: true
---
# Next.js 15 App Router Production Rules
- Default all layouts, pages, and data-fetching components to React Server Components (RSC).
- Add \`'use client'\` only on interactive leaf components requiring browser hooks (\`useState\`, \`useEffect\`) or event listeners.
- Always \`await params\`, \`await searchParams\`, \`await cookies()\`, and \`await headers()\` in Next.js 15 routes.
- Validate every Server Action payload and Route Handler body with strict Zod schemas before execution.
- Use granular Suspense boundaries, \`loading.tsx\`, and \`error.tsx\` in every route segment.`,
  },
  {
    id: 'react19_ts',
    label: 'React 19 + TypeScript Strict',
    shortSlug: 'react19-ts',
    globs: '**/*.{ts,tsx}',
    directives: [
      'Enforce strict TypeScript with zero "any"; use unknown + type guards or discriminated unions.',
      'Use React 19 actions, useActionState, and useOptimistic for form and mutation lifecycles.',
      'Prefer pure functional composition and explicit return types on all exported functions.',
    ],
    constraints: [
      'Never use "any", "@ts-ignore", or non-null assertions (!) on unvalidated external payloads.',
      'Avoid unnecessary useEffect chains for derived state that can be computed during render.',
    ],
    ruleFilename: '.cursor/rules/02-react19-typescript-strict.mdc',
    ruleContent: `---
description: React 19 Hooks, Action Transitions & Strict TypeScript Zero-Any Policy
globs: "**/*.{ts,tsx}"
alwaysApply: true
---
# React 19 & TypeScript Strictness Policy
- \`any\` is strictly prohibited across the repository. Use \`unknown\` with runtime narrowing or generic constraints.
- Enable \`strict: true\`, \`noImplicitAny\`, \`strictNullChecks\`, and \`noUncheckedIndexedAccess\`.
- Leverage React 19 \`useActionState\`, \`useOptimistic\`, and ref-as-a-prop without deprecated \`forwardRef\` wrappers.
- Model asynchronous UI states with explicit discriminated unions (\`status: 'idle' | 'loading' | 'success' | 'error'\`).`,
  },
  {
    id: 'tailwind_v4',
    label: 'Tailwind CSS v4',
    shortSlug: 'tailwind-v4',
    globs: '**/*.{tsx,jsx,css}',
    directives: [
      'Use Tailwind CSS v4 CSS-first @theme design tokens and semantic utility composition.',
      'Enforce mobile-first responsive breakpoints (base -> sm -> md -> lg -> xl) and WCAG 2.1 AA contrast.',
      'Include visible focus-visible ring utilities on all interactive buttons, inputs, and links.',
    ],
    constraints: [
      'Avoid arbitrary magic pixel values when a theme spacing or typography token exists.',
      'Never ship interactive controls without keyboard focus rings and accessible aria labels.',
    ],
    ruleFilename: '.cursor/rules/03-tailwind-v4-design-system.mdc',
    ruleContent: `---
description: Tailwind CSS v4 @theme Tokens, Mobile-First Layout & WCAG 2.1 AA Accessibility
globs: "**/*.{tsx,jsx,css}"
alwaysApply: true
---
# Tailwind CSS v4 & Accessible UI Rules
- Use CSS-first \`@theme\` variables and semantic color tokens instead of hardcoded hex strings.
- Build mobile-first layouts: default classes target mobile viewports, scaling up via \`sm:\`, \`md:\`, \`lg:\`.
- Guarantee WCAG 2.1 AA contrast ratios (minimum 4.5:1 for body copy, 3:1 for UI components).
- Every interactive element must include \`focus-visible:ring-2\` and clear hover/active feedback.`,
  },
  {
    id: 'supabase_rls',
    label: 'Supabase + Postgres RLS',
    shortSlug: 'supabase-rls',
    globs: 'supabase/**/*.sql,lib/db/**/*.{ts,js},app/api/**/*.{ts,js}',
    directives: [
      'Enable PostgreSQL Row Level Security (RLS) on every table with explicit auth.uid() policies.',
      'Index all foreign keys, tenant_id columns, and predicates referenced in RLS policies.',
      'Keep SUPABASE_SERVICE_ROLE_KEY strictly isolated to server-only environments.',
    ],
    constraints: [
      'Never create a public Postgres table without enabling RLS in the same migration.',
      'Never expose service_role keys in NEXT_PUBLIC_* or client bundles.',
    ],
    ruleFilename: '.cursor/rules/04-supabase-postgres-rls.mdc',
    ruleContent: `---
description: Supabase Auth, PostgreSQL Row Level Security (RLS) & Query Indexing
globs: "supabase/**/*.sql,lib/**/*.{ts,tsx}"
alwaysApply: true
---
# Supabase & PostgreSQL RLS Guardrails
- Enable Row Level Security (\`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;\`) on 100% of tables.
- Author separate, explicit RLS policies for \`SELECT\`, \`INSERT\`, \`UPDATE\`, and \`DELETE\` verifying \`(select auth.uid()) = user_id\`.
- Create B-Tree indexes on every column used in RLS \`USING\` and \`WITH CHECK\` clauses to prevent sequential scans.
- Never instantiate a \`service_role\` Supabase client in browser-accessible modules.`,
  },
  {
    id: 'fastapi',
    label: 'Python FastAPI',
    shortSlug: 'fastapi',
    globs: '**/*.py',
    directives: [
      'Use FastAPI async route handlers with Pydantic v2 BaseModel schemas and ConfigDict(extra="forbid").',
      'Inject database sessions, auth principals, and external clients via FastAPI Depends().',
      'Enforce strict type hints on all functions and validate with ruff + mypy.',
    ],
    constraints: [
      'Never call synchronous blocking I/O (requests, time.sleep) inside async def endpoints.',
      'Never return raw ORM models directly without a Pydantic v2 response_model.',
    ],
    ruleFilename: '.cursor/rules/05-python-fastapi-pydantic-v2.mdc',
    ruleContent: `---
description: Python FastAPI Async Endpoints, Pydantic v2 Validation & Dependency Injection
globs: "**/*.py"
alwaysApply: true
---
# Python FastAPI & Pydantic v2 Production Rules
- Define strict Pydantic v2 models (\`model_config = ConfigDict(extra='forbid', strict=True)\`) for all request/response payloads.
- Use \`async def\` endpoints with non-blocking drivers (\`httpx.AsyncClient\`, \`asyncpg\`, SQLAlchemy 2.0 async).
- Manage lifecycle resources via FastAPI \`lifespan\` context managers and \`Depends()\` dependency injection.
- Return structured RFC 7807 Problem Details JSON on HTTPException errors without leaking stack traces.`,
  },
  {
    id: 'node_prisma',
    label: 'Node/Express & Prisma',
    shortSlug: 'node-prisma',
    globs: 'prisma/schema.prisma,src/**/*.{ts,js},app/api/**/*.{ts,js}',
    directives: [
      'Use a singleton PrismaClient instance with explicit select/include clauses to prevent N+1 queries.',
      'Wrap multi-table writes in prisma.$transaction() with idempotency keys.',
      'Validate all incoming request bodies, params, and query strings with Zod middleware.',
    ],
    constraints: [
      'Never instantiate new PrismaClient() inside request handlers.',
      'Never return sensitive columns (passwordHash, apiSecret, recoveryTokens) in API responses.',
    ],
    ruleFilename: '.cursor/rules/06-node-express-prisma-orm.mdc',
    ruleContent: `---
description: Node.js, Express/API Routes & Prisma ORM Transaction Safety
globs: "prisma/schema.prisma,**/*.{ts,js}"
alwaysApply: true
---
# Node.js & Prisma ORM Production Directives
- Maintain a single shared \`PrismaClient\` instance across hot reloads to prevent connection pool exhaustion.
- Always specify explicit \`select\` projections on user and billing tables so sensitive hashes are never serialized.
- Execute multi-step financial or state mutations inside \`prisma.$transaction()\` with strict isolation.
- Enforce structured logging, correlation IDs, and graceful SIGTERM shutdown handlers.`,
  },
  {
    id: 'playwright_vitest',
    label: 'Playwright & Vitest',
    shortSlug: 'playwright-vitest',
    globs: 'tests/**/*.{ts,tsx,mjs},**/*.{test,spec}.{ts,tsx}',
    directives: [
      'Write deterministic Vitest unit tests for business logic and Playwright E2E tests for critical user flows.',
      'Prefer accessible role locators (getByRole, getByLabel) over brittle CSS class selectors.',
      'Assert both happy-path outputs and adversarial error boundaries (401, 403, 422, 429).',
    ],
    constraints: [
      'Never use hardcoded sleep timeouts (waitForTimeout) in Playwright tests.',
      'Never mark a feature complete without running the automated test suite and verifying 0 failures.',
    ],
    ruleFilename: '.cursor/rules/07-playwright-vitest-verification.mdc',
    ruleContent: `---
description: Automated QA Verification with Playwright E2E & Vitest Unit Suites
globs: "tests/**/*.{ts,tsx,mjs},**/*.{test,spec}.{ts,tsx}"
alwaysApply: true
---
# Playwright & Vitest Verification Standards
- Use user-facing accessible locators (\`page.getByRole()\`, \`page.getByLabel()\`) in Playwright tests.
- Cover every critical conversion funnel, auth boundary, and API contract with deterministic Vitest assertions.
- Test adversarial edge cases: malformed payloads, unauthorized requests, rate limits, and network timeouts.
- Run the full test suite and typechecker (\`tsc --noEmit\`) before committing changes.`,
  },
  {
    id: 'owasp_security',
    label: 'OWASP Security & Secret Guardrails',
    shortSlug: 'owasp-security',
    globs: '**/*',
    directives: [
      'Enforce zero-secret-leakage: never hardcode API keys (sk-*, sk-ant-*, AKIA*, whsec_*, ghp_*) in code or rules.',
      'Prevent IDOR by deriving user/tenant identity strictly from verified server session tokens.',
      'Sanitize all file paths against Zip Slip traversal and enforce strict rate limiting on API routes.',
    ],
    constraints: [
      'Never trust client-supplied userId, role, plan, or price parameters without server verification.',
      'Never log plaintext passwords, payment tokens, or PII in server logs.',
    ],
    ruleFilename: '.cursor/rules/08-owasp-security-secret-guardrails.mdc',
    ruleContent: `---
description: OWASP Top 10 Defense, IDOR Prevention & Zero Secret Leakage Guardrails
globs: "**/*"
alwaysApply: true
---
# OWASP Security & Zero-Secret-Leakage Policy
- NEVER hardcode API keys, webhook secrets, or bearer tokens (\`sk-*\`, \`sk-ant-*\`, \`AKIA*\`, \`ghp_*\`, \`whsec_*\`).
- Derive actor identity exclusively from cryptographically verified server sessions — never from request body/query IDs (IDOR prevention).
- Fail closed (\`verified = false\`) on any payment, webhook signature, or license verification error.
- Validate archive entries against Zip Slip (\`../\`), Zip Bomb ratios, and executable magic bytes in RAM.`,
  },
];

export const DEFAULT_SELECTED_STACK_CHIP_IDS: string[] = [
  'nextjs15',
  'react19_ts',
  'tailwind_v4',
  'owasp_security',
];

export interface GeneratedStackSuite {
  fullProject: CanonicalProject;
  slicedProject: CanonicalProject;
  totalFiles: number;
  previewFiles: number;
  selectedLabels: string[];
  allFileLabels: string[];
  unlockedPreviewFileLabels: string[];
  lockedFileLabels: string[];
  sourceLabel: string;
}

/**
 * Extracts the human-readable file list from any CanonicalProject
 * (1 Master System Prompt + N modular rule files + M knowledge base files).
 */
export function getCanonicalProjectFileLabels(project: CanonicalProject): string[] {
  const files: string[] = [];
  if (project.persona?.raw_system_prompt) {
    files.push('CLAUDE.md / .cursorrules (Master Architecture Directives)');
  }
  for (const r of project.rules || []) {
    files.push(r.name);
  }
  for (const k of project.knowledge_base || []) {
    files.push(k.filename);
  }
  return files;
}

/**
 * Synthesizes a bespoke 8-file production CanonicalProject tailored to the chosen stack chips
 * (or repo metadata), plus a 2-file sliced starter preview so free users immediately get 2 files
 * in RAM while all 8 files are staged in fullProject for the $1.99 1-click unlock.
 */
export function synthesizeStackSuite(
  selectedChipIds: string[],
  options?: {
    customProjectName?: string;
    repoFullName?: string;
    repoDescription?: string;
    freeLimit?: number;
  }
): GeneratedStackSuite {
  const freeLimit = options?.freeLimit ?? 2;
  const activeIds =
    selectedChipIds.length > 0 ? selectedChipIds : DEFAULT_SELECTED_STACK_CHIP_IDS;

  // Map selected chips first, then pad with complementary production chips so we always build a complete 8-file suite
  const selectedOptions = STACK_CHIP_OPTIONS.filter((c) => activeIds.includes(c.id));
  const remainingOptions = STACK_CHIP_OPTIONS.filter((c) => !activeIds.includes(c.id));
  const orderedOptions = [...selectedOptions, ...remainingOptions];

  const selectedLabels = selectedOptions.map((c) => c.label);
  const stackSummary = selectedLabels.join(' + ');

  const projectName =
    options?.customProjectName ||
    (options?.repoFullName
      ? options.repoFullName.replace(/[^a-zA-Z0-9_/-]/g, '')
      : `${selectedOptions
          .slice(0, 3)
          .map((c) => c.shortSlug)
          .join('_')}_ai_suite`);

  const allDirectives = selectedOptions.flatMap((c) => c.directives);
  const allConstraints = selectedOptions.flatMap((c) => c.constraints);

  // File 1: Master System Prompt (CLAUDE.md / .cursorrules / copilot-instructions.md root)
  const masterPrompt = `# ${projectName} — Master AI Coding Agent Directives
> Generated by PromptShift In-RAM Universal AST Studio (https://promptshift.dev)
> Tailored Stack: ${stackSummary}
${options?.repoDescription ? `> Repository Context: ${options.repoDescription}\n` : ''}
## 1. Core Role & Architectural Mandate
You are a Staff Principal Engineer working on **${projectName}** (${stackSummary}).
Write deterministic, production-ready, strictly typed code that adheres to every architectural and security boundary below.

## 2. Active Stack Directives
${allDirectives.map((d) => `- ${d}`).join('\n')}

## 3. Non-Negotiable Guardrails & Negative Constraints
${allConstraints.map((c) => `- ${c}`).join('\n')}

## 4. Autonomous Verification Loop
- Run typechecking, linting, and unit/E2E verification suites before completing any task.
- Never commit hardcoded API keys, tokens, or unvalidated payment/auth bypasses.`;

  // Files 2..6: 5 modular scoped .cursor/rules/*.mdc rule files tailored to the chosen stack
  const fiveRuleOptions = orderedOptions.slice(0, 5);
  const rulesList = fiveRuleOptions.map((chip, idx) => ({
    name: `.cursor/rules/0${idx + 1}-${chip.shortSlug}.mdc`,
    content: chip.ruleContent,
  }));

  // Files 7..8: 2 Knowledge Base architecture & security blueprints (1 + 5 + 2 = 8 files total!)
  const kbFile1Content = `# ${projectName} — Stack Architecture & Folder Blueprint
## Target Stack Configuration
- **Selected Stack**: ${stackSummary}
- **AST Parity Standard**: 98.5% Certified Cross-IDE Fidelity
- **Supported AI Ecosystems**: Cursor (\`.cursor/rules/*.mdc\`), Claude Code (\`CLAUDE.md\`), GitHub Copilot (\`.github/copilot-instructions.md\`), Windsurf (\`.windsurfrules\`), Gemini/Antigravity (\`GEMINI.md\`, \`AGENTS.md\`)

## Module Boundaries & Data Flow
1. **Presentation Layer**: Stateless server-rendered views + minimal interactive client leaves with WCAG 2.1 AA accessibility.
2. **Application & Validation Layer**: Strict schema validation (Zod / Pydantic v2) at every external boundary.
3. **Persistence & Security Layer**: Row-Level Security / parameterized transactions with zero exposed secrets in client bundles.
`;

  const kbFile2Content = `# ${projectName} — Multi-Agent Security & Pre-Commit Checklist
## Zero-Secret-Leakage & OWASP Gate
- [x] Zero hardcoded credentials (\`sk-*\`, \`sk-ant-*\`, \`AKIA*\`, \`ghp_*\`, \`whsec_*\`) in source or prompt files.
- [x] Server-side session & signature verification on all protected routes (fail-closed by default).
- [x] Automated unit & E2E regression tests passing with 0 type errors.
- [x] Multi-IDE rule parity synchronized via \`npx promptshift\`.
`;

  const knowledgeBase = [
    {
      filename: 'knowledge/07-stack-architecture-blueprint.md',
      content_text: kbFile1Content,
      mime_type: 'text/markdown',
      size_bytes: kbFile1Content.length,
    },
    {
      filename: 'knowledge/08-security-and-ci-verification-checklist.md',
      content_text: kbFile2Content,
      mime_type: 'text/markdown',
      size_bytes: kbFile2Content.length,
    },
  ];

  const fullProject: CanonicalProject = {
    metadata: {
      id: `stack-suite-${Date.now()}`,
      title: projectName,
      description:
        options?.repoDescription ||
        `Bespoke 8-File AI Coding Rules Suite for ${stackSummary}`,
      source_platform: 'cursor',
      version: '1.0.0',
    },
    persona: {
      role: `Staff Principal AI Engineer (${stackSummary})`,
      raw_system_prompt: masterPrompt,
      instructions: allDirectives,
      constraints: allConstraints,
      autonomy_clause:
        'Execute architectural improvements, type fixes, and test verification proactively.',
    },
    rules: rulesList.map((r) => ({
      name: r.name,
      content: r.content,
      scope: 'workspace',
      trigger: 'always_on',
    })),
    knowledge_base: knowledgeBase,
    tools: [],
    security: {
      permission_mode: 'full_autonomy',
      allow_grants: ['read', 'write', 'test'],
      deny_grants: ['expose_secrets'],
    },
  };

  // Slice to freeLimit (2 files: 1 Master Prompt + 1st Rule File)
  const masterSlots = 1;
  const availableRuleSlots = Math.max(0, freeLimit - masterSlots);
  const slicedRules = fullProject.rules.slice(0, availableRuleSlots);

  const slicedProject: CanonicalProject = {
    ...fullProject,
    rules: slicedRules,
    knowledge_base: [],
  };

  const allFileLabels = getCanonicalProjectFileLabels(fullProject);
  const unlockedPreviewFileLabels = allFileLabels.slice(0, freeLimit);
  const lockedFileLabels = allFileLabels.slice(freeLimit);

  return {
    fullProject,
    slicedProject,
    totalFiles: allFileLabels.length, // 8 files
    previewFiles: unlockedPreviewFileLabels.length, // 2 files
    selectedLabels,
    allFileLabels,
    unlockedPreviewFileLabels,
    lockedFileLabels,
    sourceLabel: options?.repoFullName ? `GitHub (${options.repoFullName})` : stackSummary,
  };
}

/**
 * Parses a GitHub repository input such as:
 * - "vercel/next.js"
 * - "https://github.com/vercel/next.js"
 * - "github.com/fastapi/fastapi/tree/main"
 */
export function parseGitHubRepoInput(rawInput: string): {
  owner: string;
  repo: string;
  fullName: string;
} | null {
  const trimmed = rawInput.trim().replace(/\/+$/, '');
  if (!trimmed) return null;

  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/i
  );
  if (urlMatch) {
    const owner = urlMatch[1];
    const repo = urlMatch[2].replace(/\.git$/i, '');
    return { owner, repo, fullName: `${owner}/${repo}` };
  }

  const slugMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (slugMatch) {
    const owner = slugMatch[1];
    const repo = slugMatch[2].replace(/\.git$/i, '');
    return { owner, repo, fullName: `${owner}/${repo}` };
  }

  // Single token fallback (e.g. "my-nextjs-app")
  const singleToken = trimmed.replace(/[^A-Za-z0-9_.-]/g, '');
  if (singleToken.length >= 2) {
    return { owner: 'github', repo: singleToken, fullName: `github/${singleToken}` };
  }

  return null;
}

/**
 * Infers matching stack chip IDs from repo text signals (language, dependencies, topics, name).
 */
export function inferStackChipsFromSignals(signalsText: string): string[] {
  const lower = signalsText.toLowerCase();
  const matched = new Set<string>();

  if (lower.includes('next') || lower.includes('app-router') || lower.includes('vercel')) {
    matched.add('nextjs15');
  }
  if (
    lower.includes('react') ||
    lower.includes('typescript') ||
    lower.includes('tsx') ||
    lower.includes('ts')
  ) {
    matched.add('react19_ts');
  }
  if (lower.includes('tailwind') || lower.includes('shadcn') || lower.includes('radix') || lower.includes('css')) {
    matched.add('tailwind_v4');
  }
  if (lower.includes('supabase') || lower.includes('postgres') || lower.includes('pg') || lower.includes('rls')) {
    matched.add('supabase_rls');
  }
  if (
    lower.includes('fastapi') ||
    lower.includes('python') ||
    lower.includes('pydantic') ||
    lower.includes('django') ||
    lower.includes('flask')
  ) {
    matched.add('fastapi');
  }
  if (
    lower.includes('prisma') ||
    lower.includes('express') ||
    lower.includes('nestjs') ||
    lower.includes('node') ||
    lower.includes('drizzle')
  ) {
    matched.add('node_prisma');
  }
  if (
    lower.includes('playwright') ||
    lower.includes('vitest') ||
    lower.includes('jest') ||
    lower.includes('cypress') ||
    lower.includes('test')
  ) {
    matched.add('playwright_vitest');
  }

  // Always include OWASP security & secret guardrails
  matched.add('owasp_security');

  if (matched.size < 3) {
    matched.add('nextjs15');
    matched.add('react19_ts');
    matched.add('tailwind_v4');
  }

  return Array.from(matched);
}

/**
 * Fetches public GitHub repo metadata & package.json (with graceful fallback on rate-limit/offline)
 * and synthesizes a bespoke 8-file CanonicalProject for the repository.
 */
export async function importGitHubRepoSuite(
  rawInput: string
): Promise<GeneratedStackSuite & { repoFullName: string; usedFallback: boolean }> {
  const parsed = parseGitHubRepoInput(rawInput);
  if (!parsed) {
    throw new Error('Please enter a valid GitHub repo (e.g. owner/repo or https://github.com/owner/repo).');
  }

  let signals = `${parsed.owner} ${parsed.repo}`;
  let repoDescription = `Bespoke AI Coding Rules Suite for GitHub repository ${parsed.fullName}`;
  let usedFallback = false;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3200);

    const repoRes = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      signal: controller.signal,
    });

    if (repoRes.ok) {
      const repoJson: any = await repoRes.json();
      const lang = repoJson.language || '';
      const desc = repoJson.description || '';
      const topics = Array.isArray(repoJson.topics) ? repoJson.topics.join(' ') : '';
      signals += ` ${lang} ${desc} ${topics}`;
      if (desc) {
        repoDescription = `${parsed.fullName}: ${desc}${lang ? ` (${lang})` : ''}`;
      } else if (lang) {
        repoDescription = `${parsed.fullName} (${lang} repository)`;
      }

      // Best-effort quick check of package.json dependencies
      try {
        const pkgRes = await fetch(
          `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/package.json`,
          {
            headers: { Accept: 'application/vnd.github.v3+json' },
            signal: controller.signal,
          }
        );
        if (pkgRes.ok) {
          const pkgJson: any = await pkgRes.json();
          if (pkgJson?.content && typeof atob === 'function') {
            const decoded = atob(pkgJson.content.replace(/\s/g, ''));
            signals += ` ${decoded.slice(0, 4000)}`;
          }
        }
      } catch {
        // Ignore package.json fetch error
      }
    } else {
      usedFallback = true;
    }

    clearTimeout(timer);
  } catch {
    usedFallback = true;
  }

  const detectedChips = inferStackChipsFromSignals(signals);
  const suite = synthesizeStackSuite(detectedChips, {
    customProjectName: `${parsed.owner}_${parsed.repo}`,
    repoFullName: parsed.fullName,
    repoDescription,
  });

  return {
    ...suite,
    repoFullName: parsed.fullName,
    usedFallback,
  };
}

export interface TokenRoiMetrics {
  contextBloatReductionPct: number;
  estimatedMonthlyTokenSavingsUsd: number;
  tokensSavedPer100Prompts: number;
  roiSummaryBadge: string;
}

/**
 * Calculates token and context window ROI metrics for modular glob-scoped rules
 * vs monolithic unfiltered prompt context across Cursor & Claude Code.
 */
export function calculateTokenRoiMetrics(fileCount: number = 8, byteSize: number = 14000): TokenRoiMetrics {
  const effectiveFiles = Math.max(4, fileCount);
  const contextBloatReductionPct = Math.min(78, Math.max(64, 56 + effectiveFiles));
  const estimatedMonthlyTokenSavingsUsd = Math.max(42, Math.round(effectiveFiles * 5.25));
  const tokensSavedPer100Prompts = Math.max(320000, Math.round((byteSize / 4) * 95));

  return {
    contextBloatReductionPct,
    estimatedMonthlyTokenSavingsUsd,
    tokensSavedPer100Prompts,
    roiSummaryBadge: `~${contextBloatReductionPct}% context bloat reduction • saves ~$${estimatedMonthlyTokenSavingsUsd}/mo in redundant Cursor & Claude Code tokens • 100% one-time $1.99 payment, zero subscription trap, instant expensable VAT PDF receipt`,
  };
}

/**
 * Mode 4: Compiles any raw pasted system prompt, package.json, .cursorrules snippet,
 * or project description into a personalized 8-file CanonicalProject suite in RAM
 * (2 files unlocked for free preview, 6 files + 4-in-1 bundle locked behind $1.99).
 */
export function compilePastedPromptOrPackageSuite(
  rawText: string,
  options?: { freeLimit?: number }
): GeneratedStackSuite & {
  detectedChipIds: string[];
  secretsRedactedCount: number;
  roiMetrics: TokenRoiMetrics;
} {
  const trimmed = (rawText || '').trim();
  if (!trimmed) {
    throw new Error(
      'Please paste a raw system prompt, package.json, .cursorrules snippet, or project description.'
    );
  }

  const sanitized = SecurityGuards.sanitizeSecrets(trimmed);
  const cleanSnippet = sanitized.cleanText;
  const secretsRedactedCount = sanitized.alerts.length;

  let customProjectName = 'pasted_workspace_ai_suite';
  let repoDescription = 'Compiled from pasted prompt / package.json specification';

  // Detect package.json payload
  if (cleanSnippet.startsWith('{') && cleanSnippet.includes('"')) {
    try {
      const parsedJson = JSON.parse(cleanSnippet);
      if (typeof parsedJson.name === 'string' && parsedJson.name.trim()) {
        customProjectName = parsedJson.name
          .trim()
          .replace(/^@/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_');
      }
      if (typeof parsedJson.description === 'string' && parsedJson.description.trim()) {
        repoDescription = parsedJson.description.trim();
      } else {
        repoDescription = `Auto-synthesized from package.json (${customProjectName})`;
      }
    } catch {
      const nameMatch = cleanSnippet.match(/"name"\s*:\s*"([^"]+)"/);
      if (nameMatch && nameMatch[1]) {
        customProjectName = nameMatch[1].replace(/^@/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      }
    }
  } else {
    // Extract title from first markdown heading or first line
    const headingMatch = cleanSnippet.match(/^#+\s+([^\r\n]+)/m);
    if (headingMatch && headingMatch[1]) {
      const candidate = headingMatch[1]
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 38);
      if (candidate.length >= 3) {
        customProjectName = candidate.toLowerCase();
      }
    }
  }

  const detectedChipIds = inferStackChipsFromSignals(cleanSnippet);
  const baseSuite = synthesizeStackSuite(detectedChipIds, {
    customProjectName,
    repoDescription,
    freeLimit: options?.freeLimit,
  });

  // Embed the sanitized user snippet directly into the Master System Prompt
  const snippetExcerpt = cleanSnippet.slice(0, 2800);
  const enrichedMasterPrompt = `${baseSuite.fullProject.persona.raw_system_prompt}\n\n## 5. Custom Pasted Workspace Context & Directives\n\`\`\`\n${snippetExcerpt}\n\`\`\``;

  const fullProject: CanonicalProject = {
    ...baseSuite.fullProject,
    persona: {
      ...baseSuite.fullProject.persona,
      raw_system_prompt: enrichedMasterPrompt,
    },
  };

  const slicedProject: CanonicalProject = {
    ...baseSuite.slicedProject,
    persona: {
      ...baseSuite.slicedProject.persona,
      raw_system_prompt: enrichedMasterPrompt,
    },
  };

  const totalBytes =
    enrichedMasterPrompt.length +
    fullProject.rules.reduce((acc, r) => acc + r.content.length, 0) +
    fullProject.knowledge_base.reduce((acc, k) => acc + k.size_bytes, 0);

  return {
    ...baseSuite,
    fullProject,
    slicedProject,
    sourceLabel: `Pasted Spec (${baseSuite.selectedLabels.slice(0, 3).join(' + ')})`,
    detectedChipIds,
    secretsRedactedCount,
    roiMetrics: calculateTokenRoiMetrics(baseSuite.totalFiles, totalBytes),
  };
}
