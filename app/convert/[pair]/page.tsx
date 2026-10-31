import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CONVERSION_PAIRS, ConversionPairData } from '@/lib/seo/conversionPairs';
import { PageTracker } from '@/components/PageTracker';

interface PageProps {
  params: Promise<{ pair: string }>;
}

export async function generateStaticParams() {
  return Object.keys(CONVERSION_PAIRS).map((pair) => ({ pair }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pair } = await params;
  const data = CONVERSION_PAIRS[pair];
  if (!data) return {};

  const url = `https://promptshift.dev/convert/${data.slug}`;

  return {
    title: data.title,
    description: data.metaDescription,
    keywords: [
      `${data.sourceName} to ${data.targetName}`,
      `convert ${data.sourceName} to ${data.targetName}`,
      `migrate ${data.sourceName} rules`,
      `${data.targetName} configuration converter`,
      'AI Project Transpiler',
      'AST Semantic Parity',
      'Zero Retention AI Bridge',
      'PromptShift',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: data.title,
      description: data.metaDescription,
      url,
      siteName: 'PromptShift',
      type: 'article',
      images: [
        {
          url: '/assets/official_logo.jpg',
          width: 1200,
          height: 630,
          alt: `${data.sourceName} to ${data.targetName} Migration Bridge`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.metaDescription,
      images: ['/assets/official_logo.jpg'],
    },
  };
}

export default async function ConversionPairPage({ params }: PageProps) {
  const { pair } = await params;
  const data = CONVERSION_PAIRS[pair];

  if (!data) {
    notFound();
  }

  // Schema.org structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://promptshift.dev',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Converters',
            item: 'https://promptshift.dev/#converters',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${data.sourceName} to ${data.targetName}`,
            item: `https://promptshift.dev/convert/${data.slug}`,
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: `PromptShift — ${data.sourceName} to ${data.targetName} Transpiler`,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web, Modern Browsers',
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: '0',
          highPrice: '19.99',
          priceCurrency: 'USD',
          offers: [
            {
              '@type': 'Offer',
              name: 'Free Starter',
              price: '0',
              priceCurrency: 'USD',
            },
            {
              '@type': 'Offer',
              name: 'Single Migration Pass',
              price: '1.99',
              priceCurrency: 'USD',
            },
            {
              '@type': 'Offer',
              name: 'Pro Developer Subscription',
              price: '5.99',
              priceCurrency: 'USD',
            },
            {
              '@type': 'Offer',
              name: 'Team & Agency Pass',
              price: '19.99',
              priceCurrency: 'USD',
            },
          ],
        },
      },
      {
        '@type': 'HowTo',
        name: `How to convert ${data.sourceName} to ${data.targetName}`,
        description: data.tagline,
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: `Upload your ${data.sourceName} project`,
            text: `Drag and drop your project repository or source files (${data.sourceFiles.join(', ')}) into PromptShift. All files are processed strictly in-RAM.`,
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Verify In-RAM Sanitization & AST Parity',
            text: `PromptShift automatically redacts sensitive API keys and evaluates semantic fidelity to ensure a ${data.astParity} parity score.`,
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: `Export ${data.targetName} bundle`,
            text: `Download your ready-to-run ZIP containing ${data.targetFiles.join(', ')} configured for immediate use.`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((faq) => ({
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

  const otherPairs = Object.values(CONVERSION_PAIRS).filter((p) => p.slug !== data.slug);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTracker path={`/convert/${data.slug}`} />

      <div className="w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-8 font-mono">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-500">Convert</span>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">{data.sourceName} → {data.targetName}</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-mono font-medium mb-6">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{data.astParity} Certified Semantic Parity</span>
            <span className="text-slate-500">•</span>
            <span>100% In-RAM Zero-Retention</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
            {data.h1}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
            {data.tagline}
          </p>

          {/* Quick CTA to Converter */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/?source=${data.sourceKey}&target=${data.targetKey}#dropzone`}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 text-center"
            >
              🚀 Drop &amp; Convert ({data.sourceName} → {data.targetName})
            </Link>
            <a
              href={`/api/checkout/express?plan=single&channel=pseo&pair=${data.slug}`}
              className="w-full sm:w-auto px-6 py-4 rounded-xl border border-cyan-500/40 hover:border-cyan-400 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 text-sm font-bold transition-all text-center"
            >
              ⚡ Unlock 4-in-1 Suite ($1.99)
            </a>
          </div>
        </div>

        {/* File Mapping Matrix */}
        <section className="mb-16">
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-sm">01</span>
              <span>Architecture & File Mapping</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Source Box */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Source Project Structure</div>
                <div className="text-base font-bold text-slate-200 mb-4">{data.sourceName}</div>
                <ul className="space-y-2">
                  {data.sourceFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <span className="text-slate-500">📄</span>
                      <code className="text-amber-300/90 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-500/20">{file}</code>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target Box */}
              <div className="p-5 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
                <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">Transpiled Target Structure</div>
                <div className="text-base font-bold text-cyan-300 mb-4">{data.targetName}</div>
                <ul className="space-y-2">
                  {data.targetFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-mono text-cyan-200">
                      <span className="text-emerald-400">✨</span>
                      <code className="text-cyan-300 bg-cyan-900/40 px-1.5 py-0.5 rounded border border-cyan-500/30">{file}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature Highlights Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-3 px-4">{data.sourceName} Directive</th>
                    <th className="py-3 px-4">{data.targetName} Equivalent</th>
                    <th className="py-3 px-4">Semantic Bridge Behavior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.mappingHighlights.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-mono text-slate-200 font-medium">{row.sourceFeature}</td>
                      <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">{row.targetFeature}</td>
                      <td className="py-3 px-4 text-slate-300">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Step-by-Step Migration Guide (AEO / GEO / Perplexity Optimized) */}
        <section id="walkthrough" className="mb-16">
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-sm">02</span>
              <span>Step-by-Step Migration Walkthrough</span>
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm border border-cyan-500/30">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Upload your {data.sourceName} workspace files
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Drag and drop your project repository or specific rule files ({data.sourceFiles.join(', ')}) into the PromptShift workspace. All reading and parsing is performed strictly in your browser RAM without disk persistence.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm border border-cyan-500/30">
                  2
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Inspect Automated Secret Sanitization & AST Fidelity
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    PromptShift executes active secret sanitization in memory, redacting exposed API keys (OpenAI, Anthropic, Stripe, AWS, HuggingFace) before compiling to the Canonical AI Project Schema (CAPS) with certified {data.astParity} semantic parity.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm border border-cyan-500/30">
                  3
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Export Ready-to-Run {data.targetName} Package
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Click download to receive your fully structured ZIP archive containing {data.targetFiles.join(', ')}. Drop these files directly into your workspace to instantly begin using your AI assistant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="mb-16">
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/30">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-sm">03</span>
              <span>Why Developers Choose PromptShift for {data.sourceName} → {data.targetName}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.keyBenefits.map((benefit, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 flex items-start gap-3">
                  <span className="text-emerald-400 font-bold text-base">✓</span>
                  <p className="text-sm text-slate-200">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Conversational FAQ Section (AEO / Voice Search / VSO) */}
        <section className="mb-16">
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-sm">04</span>
              <span>Frequently Asked Questions</span>
            </h2>

            <div className="space-y-4">
              {data.faqs.map((faq, i) => (
                <div key={i} className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/50">
                  <h3 className="text-base font-bold text-white mb-2">{faq.question}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Summary Card */}
        <section className="mb-16 p-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-slate-900/50 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Transparent Commercial Pricing</h2>
          <p className="text-sm text-slate-300 mb-6 max-w-xl mx-auto">
            Zero surprise fees. Instant 1-click checkout powered by Polar.sh as Merchant of Record with automated VAT receipts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
            <Link
              href={`/?source=${data.sourceKey}&target=${data.targetKey}#dropzone`}
              className="p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-950/70 transition-all block"
            >
              <div className="text-xs font-mono text-slate-400 uppercase">Free Starter</div>
              <div className="text-2xl font-black text-white my-1">$0.00</div>
              <div className="text-xs text-slate-400">Up to 2 files • Zero signup →</div>
            </Link>
            <a
              href={`/api/checkout/express?plan=single&channel=pseo&pair=${data.slug}`}
              className="p-4 rounded-xl border border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/40 relative transition-all block shadow-lg shadow-cyan-500/10"
            >
              <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-cyan-500 text-[10px] font-bold text-black uppercase">Most Popular</span>
              <div className="text-xs font-mono text-cyan-400 uppercase">4-in-1 Suite Pass</div>
              <div className="text-2xl font-black text-white my-1">$1.99</div>
              <div className="text-xs text-cyan-200">1-Click Polar Express →</div>
            </a>
            <a
              href={`/api/checkout/express?plan=pro&channel=pseo&pair=${data.slug}`}
              className="p-4 rounded-xl border border-slate-800 hover:border-purple-500/50 bg-slate-950/70 transition-all block"
            >
              <div className="text-xs font-mono text-purple-400 uppercase">Pro Developer</div>
              <div className="text-2xl font-black text-white my-1">$5.99<span className="text-xs font-normal text-slate-400">/mo</span></div>
              <div className="text-xs text-slate-400">Unlimited + CLI Key →</div>
            </a>
          </div>

          <Link
            href={`/?source=${data.sourceKey}&target=${data.targetKey}#dropzone`}
            className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-md transition-all"
          >
            Drop Your {data.sourceName} Workspace Free →
          </Link>
        </section>

        {/* Other Migration Pairs (Internal Link Equity) */}
        <section className="mb-16">
          <h2 className="text-lg font-bold text-white mb-4">Explore Other AI Migration Pairs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {otherPairs.map((p) => (
              <Link
                key={p.slug}
                href={`/convert/${p.slug}`}
                className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/30 hover:bg-slate-850 hover:border-cyan-500/40 transition-all group"
              >
                <div className="text-xs font-mono text-slate-400 group-hover:text-cyan-400 transition-colors">
                  {p.sourceName} → {p.targetName}
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1 truncate">
                  {p.h1}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
