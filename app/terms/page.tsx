import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, CheckCircle2, Lock, Scale } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service & EULA | PromptShift.dev',
  description:
    'Terms of Service, License Grants, and Merchant of Record specifications for PromptShift.dev universal AI coding assistant transpiler.',
  alternates: {
    canonical: 'https://promptshift.dev/terms',
  },
  openGraph: {
    title: 'Terms of Service & EULA | PromptShift.dev',
    description:
      'Commercial license grants, Merchant of Record (Polar.sh), and usage terms for PromptShift.dev.',
    url: 'https://promptshift.dev/terms',
    siteName: 'PromptShift',
    type: 'website',
    images: [{ url: '/assets/official_logo.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service & EULA | PromptShift.dev',
    description: 'Terms of Service, license grants, and Polar.sh Merchant of Record terms.',
    images: ['/assets/official_logo.jpg'],
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-300">
      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to PromptShift Converter</span>
        </Link>

        {/* Header */}
        <div className="border-b border-slate-800 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wide mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>LEGAL & COMMERCIAL TERMS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Terms of Service & License Agreement
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Last updated: October 17, 2026 • Effective immediately for all users and licenses.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">1.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or using <strong>PromptShift.dev</strong> (&quot;the Service&quot;, &quot;we&quot;, &quot;us&quot;),
              you agree to be bound by these Terms of Service, all applicable laws, and regulations. If you do not agree with
              any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">2.</span> Merchant of Record & Billing (Polar.sh)
            </h2>
            <p>
              All commercial transactions, subscriptions, and single-pass license purchases on PromptShift.dev are processed
              by our authorized Merchant of Record, <strong>Polar.sh</strong> (Polar Technologies Inc. / Polar Software AB).
            </p>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <p className="text-xs text-slate-300">
                • <strong>Role of Polar.sh:</strong> Polar acts as the merchant of record for all order checkout flows, VAT/sales tax
                collection, remittance, customer dispute management, and invoices.
              </p>
              <p className="text-xs text-slate-300">
                • <strong>Payment Methods Supported:</strong> Apple Pay, Google Pay, Visa, Mastercard, American Express, and SEPA bank transfers.
              </p>
              <p className="text-xs text-slate-300">
                • <strong>Pricing & Currencies:</strong> Standard prices are denominated in USD ($1.99 for Single Pass, $5.99/mo for Pro Developer, $19.99/mo for Team & Agency). Applicable local taxes/VAT are calculated dynamically at checkout based on buyer jurisdiction.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">3.</span> License Grants & Usage Tiers
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-white text-xs uppercase tracking-wide">A. Free Starter Pass (≤ 2 files)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Complimentary, registration-free license granting non-exclusive rights to convert and export projects containing
                  up to 2 knowledge base/rule files (1 master prompt + 1 rule). Zero payment required.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wide">B. Single Deposit Pass ($1.99 one-time)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pay-as-you-go pass granting full bundle export rights for one specific repository migration with no recurring charges. Includes complete AST parity output, full secret redaction, and permanent Sovereign Vault invoice receipt.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-cyan-400 text-xs uppercase tracking-wide">C. Pro Developer Subscription ($5.99/month)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Individual license unlocking unlimited repository migrations, personal CLI Token access, automated sync tooling, and priority format transpiler updates. Cancel anytime directly in 1 click from your Customer Portal.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-purple-400 text-xs uppercase tracking-wide">D. Team & Agency Pass ($19.99/month)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Organizational license including 5 developer seats, GitHub Actions & GitLab CI/CD auto-migration hooks, multi-seat invoice reconciliation, and countersigned SOC-2 / GDPR Data Processing Agreements (DPA).
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">4.</span> Ephemeral In-RAM Architecture & Zero Retention
            </h2>
            <p>
              PromptShift operates strictly as an <strong>ephemeral, stateless transformation bridge</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400 pl-2">
              <li>Your uploaded files, agent directives, rules, and prompts are processed exclusively in volatile memory (RAM).</li>
              <li>We operate zero server hard drives, zero S3/GCS storage buckets for client code, and zero cloud databases.</li>
              <li>Customer data is shredded instantly from volatile memory once the converted bundle is streamed to your client browser.</li>
              <li>PromptShift will <strong>NEVER</strong> use your prompts or codebase to train AI models.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">5.</span> Intellectual Property & Customer Ownership
            </h2>
            <p>
              <strong>You retain 100% full, unrestricted ownership</strong> of all source prompts, documentation, configuration files,
              and transpiled output files. PromptShift claims zero copyright, ownership, or licensing rights over your generated bundles.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">6.</span> Refund Policy
            </h2>
            <p>
              Because PromptShift provides instant, irrevocable digital access to converted code bundles and source ZIP archives,
              orders are generally non-refundable once the file bundle has been generated and downloaded.
              However, if you encounter an AST syntax parsing failure that our engineering team cannot resolve within 48 hours,
              contact <a href="mailto:support@promptshift.dev" className="text-cyan-400 hover:underline">support@promptshift.dev</a> for
              a full refund processed via Polar.sh.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">7.</span> Contact & Legal Notice
            </h2>
            <p>
              For legal inquiries, DPA countersignatures, or license compliance queries:
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 font-mono">
              <p>Email: <a href="mailto:legal@promptshift.dev" className="text-cyan-400">legal@promptshift.dev</a></p>
              <p>Support: <a href="mailto:support@promptshift.dev" className="text-cyan-400">support@promptshift.dev</a></p>
              <p>Merchant of Record: Polar.sh (Polar Technologies Inc.)</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex items-center justify-between text-xs text-slate-500">
          <span>PromptShift.dev • Sovereign AI Agent Workspace</span>
          <Link href="/" className="text-cyan-400 hover:underline">
            Return to Converter
          </Link>
        </div>
      </div>
    </div>
  );
}
