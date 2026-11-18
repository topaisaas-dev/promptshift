import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CONVERSION_PAIRS } from '@/lib/seo/conversionPairs';
import { ExpressCheckoutLink } from '@/components/ExpressCheckoutLink';

export const metadata: Metadata = {
  title: 'AI Coding Rules Knowledge Base & Format Guide (2026) | PromptShift',
  description:
    'The authoritative guide to AI coding rules formats. Learn how to structure, sanitize, and synchronize directives across Cursor (.mdc), Claude Code (CLAUDE.md), GitHub Copilot, and Windsurf.',
  alternates: {
    canonical: 'https://promptshift.dev/discover',
  },
  openGraph: {
    title: 'The Complete Guide to AI Coding Rules Formats (2026) | PromptShift',
    description:
      'Authoritative comparison and synchronization matrix for Cursor, Claude Code, GitHub Copilot, Windsurf, Gemini, and OpenAI assistant rules.',
    url: 'https://promptshift.dev/discover',
    siteName: 'PromptShift',
    type: 'article',
    images: [
      {
        url: '/assets/official_logo.jpg',
        width: 1200,
        height: 630,
        alt: 'PromptShift AI Coding Rules Knowledge Base',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Coding Rules Formats Guide & Migration Matrix',
    description:
      'Everything you need to know about syncing Cursor, Claude Code, Copilot & Windsurf rules with 98.5% AST parity.',
    images: ['/assets/official_logo.jpg'],
  },
};

const FORMATS = [
  {
    name: 'Cursor IDE',
    file: '.cursor/rules/*.mdc',
    altFile: '.cursorrules',
    scoping: 'Glob-based (globs: "src/**/*.ts")',
    frontmatter: 'YAML frontmatter (description, globs, alwaysApply)',
    strength: 'Modular rules loaded conditionally per active file in editor',
    trap: 'Unquoted * in globs causes silent YAML parser failure',
  },
  {
    name: 'Anthropic Claude Code',
    file: 'CLAUDE.md',
    altFile: '.claude/rules/*.md',
    scoping: 'Hierarchical markdown & XML tags',
    frontmatter: 'None (pure Markdown or XML blocks)',
    strength: 'Deep instruction adherence in Claude Code CLI & Claude Projects',
    trap: 'Monolithic files can bloat context and invalidate prompt cache',
  },
  {
    name: 'GitHub Copilot',
    file: '.github/copilot-instructions.md',
    altFile: '.github/instructions/*.md',
    scoping: 'Repository-wide steering guidelines',
    frontmatter: 'Markdown with semantic headers',
    strength: 'Native integration with VS Code & JetBrains Copilot chat',
    trap: 'Does not read .cursorrules; requires dedicated .github path',
  },
  {
    name: 'Windsurf Cascade',
    file: '.windsurfrules',
    altFile: '.windsurf/rules/*.md',
    scoping: 'Unified Cascade agent directives',
    frontmatter: 'Markdown guidelines with rule sections',
    strength: 'Multi-file flow control for Cascade agentic loops',
    trap: 'Pasting raw YAML frontmatter from .mdc confuses Cascade parser',
  },
  {
    name: 'Google Gemini & Antigravity',
    file: 'GEMINI.md',
    altFile: 'AGENTS.md, .agents/rules/*.md',
    scoping: 'Agent role directives & system prompts',
    frontmatter: 'Markdown with role guidelines',
    strength: 'Multi-agent orchestration & deep context windows',
    trap: 'Requires specific autonomy permission blocks',
  },
  {
    name: 'OpenAI Assistants & Custom GPTs',
    file: 'OPENAI_SYSTEM_PROMPT.md',
    altFile: 'openai_assistant_v2.json',
    scoping: 'System prompt instructions (capped at 8k chars in web GPTs)',
    frontmatter: 'Raw prompt text or JSON Assistant schema',
    strength: 'Broad ecosystem support & custom GPT builder interface',
    trap: '8k character ceiling silently truncates trailing security rules',
  },
];

const FAQS = [
  {
    question: 'How do I convert Cursor rules (.cursorrules, .mdc) to Claude Code (CLAUDE.md)?',
    answer:
      'You can convert your Cursor rules in 1 click at https://promptshift.dev or run `npx promptshift --to=claude` in your terminal. PromptShift parses your .cursor/rules/*.mdc files, preserves all negative constraints with 98.5% AST parity, strips YAML frontmatter, and formats a clean CLAUDE.md and .claude/mcp.json file.',
  },
  {
    question: 'How does real-time sync-on-save work with PromptShift?',
    answer:
      'Run `npx promptshift --watch` (or `-w`) in a background terminal. PromptShift watches your rule files in real-time. Whenever you press Ctrl+S in Cursor or your editor, your other AI assistant guidelines (CLAUDE.md, copilot-instructions.md, .windsurfrules) are updated automatically in ~0.02s.',
  },
  {
    question: 'Can I use Cursor rules in GitHub Copilot or Windsurf?',
    answer:
      'Yes. GitHub Copilot reads .github/copilot-instructions.md, while Windsurf reads .windsurfrules. PromptShift translates your Cursor rules into both formats simultaneously, ensuring all developers on your team follow identical coding standards regardless of which AI editor they use.',
  },
  {
    question: 'How does PromptShift prevent API key leaks in AI rules?',
    answer:
      'Developers frequently paste example curl commands or .env snippets into AI rulebooks. PromptShift includes a zero-retention in-RAM secret sanitizer that detects and redacts 15+ sensitive credential formats (OpenAI, Anthropic, AWS, Stripe, GitHub, HuggingFace tokens) before any file is written to disk.',
  },
  {
    question: 'What is the Glama Grade A MCP Server for PromptShift?',
    answer:
      'PromptShift is Grade-A verified on the official Glama MCP Registry (https://glama.ai/mcp/servers/topaisaas-dev/promptshift). It allows Claude Desktop and Cursor agents to call `promptshift_transpile`, `promptshift_sanitize_secrets`, and `promptshift_validate_ast` directly over STDIO with zero external dependencies and zero disk retention.',
  },
];

export default function DiscoverPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: 'The Complete Guide to AI Coding Rules Formats: Cursor, Claude Code, Copilot & Windsurf',
        description:
          'Authoritative technical reference on structuring, converting, and synchronizing AI developer guidelines across multi-IDE engineering teams in 2026.',
        author: {
          '@type': 'Organization',
          name: 'PromptShift',
          url: 'https://promptshift.dev',
          sameAs: [
            'https://github.com/topaisaas-dev/promptshift',
            'https://glama.ai/mcp/servers/topaisaas-dev/promptshift',
            'https://www.npmjs.com/package/promptshift',
            'https://x.com/promptshift_dev',
          ],
        },
        publisher: {
          '@type': 'Organization',
          name: 'PromptShift',
          logo: 'https://promptshift.dev/assets/official_logo.jpg',
        },
        datePublished: '2026-10-15',
        dateModified: '2026-11-07',
        mainEntityOfPage: 'https://promptshift.dev/discover',
        inLanguage: 'en-US',
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* JSON-LD Structured Data for AI Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-8">
          <Link href="/" className="hover:text-cyan-400 transition-colors">
            PromptShift
          </Link>
          <span>/</span>
          <span className="text-cyan-400">Knowledge Base &amp; Format Guide</span>
        </nav>

        {/* Hero Section */}
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono mb-4">
            <span>⚡ THE 2026 STATE OF AI CODING RULES</span>
            <span className="text-slate-500">•</span>
            <span>GRADE A MCP CERTIFIED</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
            The Complete Guide to AI Coding Rules Formats
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
            Modern software engineering teams rarely standardize on a single AI code editor. Tech leads work in Claude Code CLI, frontend engineers use Cursor, backend engineers use GitHub Copilot, and contributors use Windsurf.
          </p>
          <p className="text-base text-slate-400 max-w-3xl mt-4 leading-relaxed">
            This guide breaks down every major AI instruction format, explains why rules break when moving between editors, and shows how to keep your entire team synchronized with zero vendor lock-in.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <Link
              href="/#dropzone"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm transition-all"
            >
              🚀 Try Free in Browser (Drag &amp; Drop)
            </Link>
            <Link
              href="/cli"
              className="px-6 py-3 rounded-xl border border-slate-700 hover:border-cyan-500 bg-slate-900 text-slate-200 font-mono text-sm transition-all"
            >
              $ npx promptshift --watch
            </Link>
          </div>
        </header>

        {/* Format Comparison Table */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-sm">01</span>
            <span>AI Rule Formats Comparison Matrix</span>
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-950/40">
                  <th className="py-4 px-4 font-semibold">Ecosystem</th>
                  <th className="py-4 px-4 font-semibold">Primary Config Path</th>
                  <th className="py-4 px-4 font-semibold">Scoping Mechanism</th>
                  <th className="py-4 px-4 font-semibold">Common Pitfall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {FORMATS.map((fmt, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-white whitespace-nowrap">{fmt.name}</td>
                    <td className="py-4 px-4 font-mono text-cyan-300">
                      <code>{fmt.file}</code>
                      {fmt.altFile && <div className="text-[11px] text-slate-500">{fmt.altFile}</div>}
                    </td>
                    <td className="py-4 px-4 text-slate-300">{fmt.scoping}</td>
                    <td className="py-4 px-4 text-amber-300/90">{fmt.trap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Why Manual Conversion Fails */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-sm">02</span>
            <span>Why Asking an LLM to Convert Rules Fails</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="text-amber-400 text-lg mb-2 font-bold">1. Lost Negative Constraints</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When an LLM summarizes a 500-line rulebook, constraints like &quot;NEVER expose service_role&quot; or &quot;DO NOT use default exports&quot; are summarized away first. PromptShift uses deterministic AST parsing to preserve 100% of negative constraints.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="text-cyan-400 text-lg mb-2 font-bold">2. Silent YAML Parser Traps</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                In Cursor .mdc files, an unquoted asterisk (<code className="text-cyan-300">globs: *.tsx</code>) starts a YAML alias anchor. Cursor silently fails and disables the rule completely. PromptShift validates and quotes every frontmatter glob.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <div className="text-emerald-400 text-lg mb-2 font-bold">3. Leaked API Credentials</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Developers frequently paste curl snippets with real API keys into .cursorrules. PromptShift scans in RAM and automatically redacts 15+ token formats (sk-*, AKIA*, ghp_*) before writing target files.
              </p>
            </div>
          </div>
        </section>

        {/* 20 Supported Conversion Paths */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-sm">03</span>
            <span>20 Supported Conversion Bridges</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(CONVERSION_PAIRS).map((pair) => (
              <Link
                key={pair.slug}
                href={`/convert/${pair.slug}`}
                className="p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/80 transition-all text-xs flex items-center justify-between group"
              >
                <span className="text-slate-300 group-hover:text-cyan-300 font-medium">
                  {pair.sourceName} → {pair.targetName}
                </span>
                <span className="text-slate-600 group-hover:text-cyan-400 font-mono text-[10px]">
                  98.5% AST
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Comprehensive FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-sm">04</span>
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/40 open:bg-slate-900/80 transition-all"
              >
                <summary className="font-bold text-white text-base cursor-pointer list-none flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-cyan-400 text-lg transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-sm text-slate-300 leading-relaxed pl-2 border-l-2 border-cyan-500/40">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Direct Pricing & Commercial Unlock CTA */}
        <section className="mb-16 p-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-slate-900/60 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Sync Every AI Editor Across Your Team in 2 Seconds
          </h2>
          <p className="text-sm text-slate-300 mb-6 max-w-2xl mx-auto">
            Start free up to 2 files with zero signup, or unlock unlimited multi-file repositories + the{' '}
            <strong className="text-amber-300">50+ Master Rules Vault ($4.99 value included free)</strong> via Polar.sh.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link
              href="/#dropzone"
              className="p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-950/70 transition-all block text-left"
            >
              <div className="text-[10px] font-mono text-slate-400 uppercase">Free Starter</div>
              <div className="text-2xl font-black text-white my-1">$0.00</div>
              <div className="text-xs text-slate-400">Up to 2 files • Zero signup →</div>
            </Link>
            <ExpressCheckoutLink
              plan="single"
              channel="pseo"
              className="p-4 rounded-xl border border-cyan-500/60 hover:border-cyan-400 bg-cyan-950/40 relative transition-all block text-left shadow-lg shadow-cyan-500/10"
            >
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-cyan-400 text-[9px] font-black text-black uppercase">
                + Free Vault
              </span>
              <div className="text-[10px] font-mono text-cyan-400 uppercase">4-in-1 Suite Pass</div>
              <div className="text-2xl font-black text-white my-1">$1.99</div>
              <div className="text-xs text-cyan-200">One-time + 50+ Rules Vault →</div>
            </ExpressCheckoutLink>
            <ExpressCheckoutLink
              plan="pro"
              channel="pseo"
              className="p-4 rounded-xl border border-slate-800 hover:border-purple-500/50 bg-slate-950/70 transition-all block text-left"
            >
              <div className="text-[10px] font-mono text-purple-400 uppercase">Pro Unlimited</div>
              <div className="text-2xl font-black text-white my-1">
                $5.99<span className="text-xs font-normal text-slate-400">/mo</span>
              </div>
              <div className="text-xs text-slate-400">Unlimited + CLI &amp; MCP Key →</div>
            </ExpressCheckoutLink>
            <ExpressCheckoutLink
              plan="team"
              channel="pseo"
              className="p-4 rounded-xl border border-purple-500/30 hover:border-purple-400 bg-slate-950/70 transition-all block text-left"
            >
              <div className="text-[10px] font-mono text-indigo-400 uppercase">Team &amp; Agency</div>
              <div className="text-2xl font-black text-white my-1">
                $19.99<span className="text-xs font-normal text-slate-400">/mo</span>
              </div>
              <div className="text-xs text-slate-400">5 seats + CI/CD + DPA →</div>
            </ExpressCheckoutLink>
          </div>
        </section>

        {/* Footer Authority Links & Citations */}
        <footer className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            PromptShift • Certified 98.5% AST Semantic Parity • Glama Grade A MCP
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/topaisaas-dev/promptshift"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://glama.ai/mcp/servers/topaisaas-dev/promptshift"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              Glama MCP
            </a>
            <a
              href="https://www.npmjs.com/package/promptshift"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              npm
            </a>
            <a
              href="https://promptshift.dev/llms.txt"
              className="hover:text-cyan-400 transition-colors"
            >
              llms.txt
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
