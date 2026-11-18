import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, ServerOff, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & Zero Retention Guarantee | PromptShift.dev',
  description:
    'Sovereign privacy policy detailing PromptShift.dev zero-server-storage guarantee, GDPR Article 28 compliance, and local vault security.',
  alternates: {
    canonical: 'https://promptshift.dev/privacy',
  },
  openGraph: {
    title: 'Privacy Policy & Zero Retention Guarantee | PromptShift.dev',
    description:
      'PromptShift zero-server-storage guarantee, GDPR Article 28 compliance, and sovereign browser-local vault architecture.',
    url: 'https://promptshift.dev/privacy',
    siteName: 'PromptShift',
    type: 'website',
    images: [{ url: '/assets/official_logo.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy & Zero Retention Guarantee | PromptShift.dev',
    description: '100% In-RAM zero-retention architecture and GDPR Article 28 compliance.',
    images: ['/assets/official_logo.jpg'],
  },
};

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GDPR & ZERO SERVER STORAGE GUARANTEE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Privacy Policy & Sovereign Architecture
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Last updated: October 17, 2026 • Compliant with EU GDPR (Regulation 2016/679) & CCPA/CPRA.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-300">
          {/* Key Principles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <ServerOff className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">0 Server Logs</h3>
              <p className="text-xs text-slate-400">
                Your uploaded repository files and prompts are processed strictly in ephemeral RAM and never saved to any hard drive or cloud database.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <EyeOff className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">0 Model Training</h3>
              <p className="text-xs text-slate-400">
                Your proprietary business logic, prompts, and codebases are never sent to third-party LLMs or used to train any neural network.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <Lock className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">Sovereign Client Vault</h3>
              <p className="text-xs text-slate-400">
                Your past conversion history and invoice receipts exist exclusively in your browser&apos;s local storage sandbox on your personal device.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">1.</span> Data Processing Controller & Processor
            </h2>
            <p>
              Under the EU General Data Protection Regulation (GDPR Article 28):
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400 pl-2">
              <li><strong>You (The User / Enterprise Customer)</strong> are the Data Controller of your intellectual property and repository content.</li>
              <li><strong>PromptShift.dev</strong> acts purely as an ephemeral, automated data processor performing deterministic AST transpilation.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">2.</span> How Data Is Handled During Transpilation
            </h2>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <h4 className="font-bold text-white text-xs">Client-Side Pruning in Browser</h4>
                  <p className="text-xs text-slate-400">Heavy dependencies (.git, node_modules) are stripped inside your browser RAM prior to transmission.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className="font-bold text-white text-xs">In-RAM Transformation</h4>
                  <p className="text-xs text-slate-400">The serverless container parses the AST in volatile memory, sanitizes accidental API keys, and formats target schema.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <h4 className="font-bold text-white text-xs">Immediate Memory Shred</h4>
                  <p className="text-xs text-slate-400">The resulting ZIP stream is returned to your browser. The volatile buffer is immediately marked for garbage collection.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">3.</span> Cookies & Local Tracking
            </h2>
            <p>
              PromptShift operates with <strong>Zero Tracking Cookies</strong>.
            </p>
            <p className="text-xs text-slate-400">
              We do not use advertising tracking pixels, Facebook Pixel, Google AdSense, or cross-site tracking cookies.
              The only storage utilized is HTML5 LocalStorage on your own browser, used strictly to save your localized currency preference,
              your past conversion history, and your downloaded VAT invoices. You can purge this data at any moment in 1 click from your Customer Portal.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">4.</span> Payment & Billing Information (Polar.sh)
            </h2>
            <p>
              When you purchase a Single Pass, Pro Developer subscription, or Team license, your payment information
              (credit card number, expiration date, CVV, or billing address) is handled exclusively by our Merchant of Record,
              <strong>Polar.sh</strong>, in compliance with PCI-DSS Level 1 standards. PromptShift servers never see, collect, or store your payment card numbers.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">5.</span> Your Rights Under GDPR (Articles 15-22)
            </h2>
            <p>
              You hold the right to access, rectify, or request erasure of any personal metadata associated with your account.
              Because all project files are shredded from RAM immediately upon conversion, we possess 0 bytes of your source code to delete.
              For billing receipt erasure, contact our data protection officer:
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
              <p>Data Protection Officer: <a href="mailto:dpo@promptshift.dev" className="text-emerald-400">dpo@promptshift.dev</a></p>
              <p>Compliance Desk: <a href="mailto:compliance@promptshift.dev" className="text-emerald-400">compliance@promptshift.dev</a></p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex items-center justify-between text-xs text-slate-500">
          <span>PromptShift.dev • Zero Data Retention Architecture</span>
          <Link href="/" className="text-cyan-400 hover:underline">
            Return to Converter
          </Link>
        </div>
      </div>
    </div>
  );
}
