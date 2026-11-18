import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { GlobalPageTracker } from '@/components/PageTracker';

export const metadata: Metadata = {
  metadataBase: new URL('https://promptshift.dev'),
  title: 'PromptShift — 1-Click Universal AI Project Bridge (promptshift.dev)',
  description: 'Shift AI projects between Gemini, Claude, OpenAI & Cursor in 1 click. Zero server logs, in-RAM secret sanitizer, and 98.5% certified semantic fidelity.',
  keywords: [
    'AI Converter',
    'Gemini to Claude',
    'OpenAI Custom GPT',
    'Cursor Rules',
    'Claude Projects to Cursor',
    'Universal Transpiler',
    'PromptShift',
    'Generative Engine Optimization',
    'AI Context Porter',
    'AI Developer Tools',
  ],
  authors: [{ name: 'PromptShift Engineering Team' }],
  creator: 'PromptShift',
  publisher: 'PromptShift',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://promptshift.dev',
    languages: {
      'en-US': 'https://promptshift.dev',
      'fr-FR': 'https://promptshift.dev',
      'x-default': 'https://promptshift.dev',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/assets/official_logo.jpg',
    apple: '/assets/official_logo.jpg',
  },
  openGraph: {
    title: 'PromptShift — 1-Click Universal AI Project Bridge',
    description: 'The sovereign, zero-retention bridge for AI coding assistants. Preserve 100% of your rules, master prompts, and autonomy directives with verified semantic fidelity.',
    url: 'https://promptshift.dev',
    siteName: 'PromptShift',
    images: [
      {
        url: '/assets/official_logo.jpg',
        width: 1200,
        height: 630,
        alt: 'PromptShift — Universal AI Project Transpiler',
      },
    ],
    locale: 'en_US',
    alternateLocale: ['fr_FR'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptShift — 1-Click Universal AI Project Bridge',
    description: 'Shift AI projects between Gemini, Claude, OpenAI & Cursor in 1 click. Sovereign zero-retention bridge with 98.5% certified semantic fidelity.',
    images: ['/assets/official_logo.jpg'],
  },
  category: 'technology',
  verification: {
    google: 'google195fa2438b836f4f',
  },
};

const jsonLdSchemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PromptShift',
    url: 'https://promptshift.dev',
    logo: 'https://promptshift.dev/assets/official_logo.jpg',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'contact@promptshift.dev',
        contactType: 'customer support',
      },
      {
        '@type': 'ContactPoint',
        email: 'compliance@promptshift.dev',
        contactType: 'compliance officer',
      },
      {
        '@type': 'ContactPoint',
        email: 'billing@promptshift.dev',
        contactType: 'billing support',
      },
    ],
    sameAs: [
      'https://github.com/topaisaas-dev/promptshift',
      'https://glama.ai/mcp/servers/topaisaas-dev/promptshift',
      'https://www.npmjs.com/package/promptshift',
      'https://x.com/promptshift_dev',
    ],
    knowsAbout: [
      'Cursor Rules (.cursorrules, .cursor/rules/*.mdc)',
      'Anthropic Claude Code (CLAUDE.md)',
      'GitHub Copilot Instructions (.github/copilot-instructions.md)',
      'Windsurf Cascade (.windsurfrules)',
      'Google Gemini & Antigravity (GEMINI.md, AGENTS.md)',
      'OpenAI Custom GPTs & Assistants v2',
      'Model Context Protocol (MCP)',
      'Abstract Syntax Tree (AST) Rule Transpilation',
      'In-RAM Ephemeral Secret Redaction',
    ],
    description: 'Sovereign 1-click universal transpiler and migration bridge for AI developer workspaces, instructions, and rules.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PromptShift',
    url: 'https://promptshift.dev',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://promptshift.dev/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PromptShift',
    url: 'https://promptshift.dev',
    image: 'https://promptshift.dev/assets/official_logo.jpg',
    screenshot: 'https://promptshift.dev/assets/official_logo.jpg',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'AI Developer Tool, Prompt Transpiler, Code Assistant Configuration Bridge',
    operatingSystem: 'Cross-platform (Web, macOS, Linux, Windows, Node.js CLI)',
    isAccessibleForFree: true,
    license: 'https://opensource.org/licenses/MIT',
    citation: 'https://promptshift.dev',
    sameAs: [
      'https://github.com/topaisaas-dev/promptshift',
      'https://glama.ai/mcp/servers/topaisaas-dev/promptshift',
      'https://www.npmjs.com/package/promptshift',
      'https://x.com/promptshift_dev',
    ],
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '19.99',
      priceCurrency: 'USD',
      offerCount: '4',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Starter',
          price: '0',
          priceCurrency: 'USD',
          description: 'Instant conversion for small projects up to 2 files with zero signup.',
        },
        {
          '@type': 'Offer',
          name: 'Single Migration Pass',
          price: '1.99',
          priceCurrency: 'USD',
          description: 'Instant 1-click single project export with full In-RAM secret redaction and 98.5% AST parity.',
        },
        {
          '@type': 'Offer',
          name: 'Pro Developer Subscription',
          price: '5.99',
          priceCurrency: 'USD',
          description: 'Unlimited multi-file conversions with multi-ecosystem bundle downloads, CLI tokens and RAM vault.',
        },
        {
          '@type': 'Offer',
          name: 'Team & Agency Pass',
          price: '19.99',
          priceCurrency: 'USD',
          description: 'Commercial multi-seat workspace with automated GitHub and GitLab CI/CD action sync and SOC-2 DPA.',
        },
      ],
    },
    description: 'Instant cross-ecosystem converter for AI coding assistants. Converts rules and master prompts across Cursor, Claude Projects, OpenAI Custom GPT, and Gemini Antigravity with zero server retention.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      ratingCount: '128',
    },
    featureList: [
      'In-RAM Zero-Retention Secret Sanitizer',
      'Universal AI Rules Transpiler',
      'Cursor .cursorrules and .mdc generation',
      'Claude Projects bundle conversion',
      'OpenAI Custom GPT schema and prompt extraction',
      'Gemini Antigravity workflow export',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is PromptShift?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PromptShift is a sovereign developer tool that translates entire AI assistant contexts, instruction files, master prompts, and system rules between Cursor (.cursorrules / .mdc), Anthropic Claude Projects, OpenAI Custom GPTs, and Google Gemini / Antigravity in one click.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my source code and proprietary API keys secure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. PromptShift operates with strict in-RAM processing and zero server retention. All uploads are processed ephemerally and sanitized in memory to redact leaked API keys (OpenAI, Anthropic, Stripe, AWS, HuggingFace, etc.) before conversion. Nothing is saved to a persistent server disk or database.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the pricing options and tiers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PromptShift offers a Free Starter tier (instant conversion for projects up to 2 files with zero signup), a Single Migration Pass at $1.99 for one-off full project exports, a Pro Developer plan at $5.99/mo for unlimited multi-ecosystem migrations, and a Team & Agency pass at $19.99/mo.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which AI platforms are currently supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PromptShift supports bidirectional migration between Anthropic Claude (.claude / system instructions), Cursor (.cursorrules / .cursor/rules/*.mdc), OpenAI Custom GPTs / Assistants v2, Google Gemini & Antigravity, and GitHub Copilot Workspace.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I convert back and forth without losing rules?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! PromptShift uses a unified AST intermediate representation (CAPS) that preserves 98.5%+ certified semantic fidelity. Autonomy directives, tone, architecture policies, and negative constraints are mapped without prompt drift.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I manage my billing, receipts, and VAT invoices?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All checkouts and subscriptions are securely processed by Polar.sh as Merchant of Record. You can access your 1-click self-service customer portal directly inside PromptShift to manage billing, download tax-compliant VAT invoices, and adjust plans anytime.',
        },
      },
    ],
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-darkBg text-textBright selection:bg-cyanGlow/20 selection:text-cyanGlow">
        {/* RGAA / WCAG 2.1 AA Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyanGlow focus:text-black focus:font-black focus:rounded-xl focus:shadow-neonCyan focus-visible:outline-none"
        >
          Skip to main content
        </a>

        <Navbar />
        <Suspense fallback={null}>
          <GlobalPageTracker />
        </Suspense>
        <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 focus:outline-none">
          {children}
        </main>
        <footer className="w-full border-t border-borderColor py-8 px-6 text-xs text-textMuted bg-darkBg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-300">&copy; 2026 PromptShift.dev</span>
              <span>•</span>
              <span>Universal AI Project Bridge</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">Zero Server Storage (In-RAM Only)</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <Link href="/discover" className="hover:text-cyan-400 font-semibold transition-colors">Guides</Link>
              <span>•</span>
              <Link href="/cli" className="hover:text-cyan-400 font-semibold transition-colors">CLI</Link>
              <span>•</span>
              <Link href="/security" className="hover:text-emerald-400 transition-colors">Security & DPA</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms & EULA</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
              <span>•</span>
              <a href="mailto:contact@promptshift.dev" className="hover:text-cyan-400 transition-colors">Support</a>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
