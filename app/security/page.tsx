import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, ServerOff, KeyRound, AlertTriangle, FileCheck2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enterprise Security Architecture & DPA | PromptShift.dev',
  description:
    'Technical whitepaper, threat model, and GDPR Article 28 Data Processing Agreement (DPA) specifications for PromptShift.dev enterprise engineering teams.',
  alternates: {
    canonical: 'https://promptshift.dev/security',
  },
  openGraph: {
    title: 'Enterprise Security Architecture & DPA | PromptShift.dev',
    description:
      'In-RAM ephemeral processing, 15+ secret sanitizer rules, Zip Slip/Bomb defenses, and GDPR Article 28 DPA.',
    url: 'https://promptshift.dev/security',
    siteName: 'PromptShift',
    type: 'website',
    images: [{ url: '/assets/official_logo.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise Security Architecture & DPA | PromptShift.dev',
    description: 'Zero-retention in-RAM secret redaction and enterprise DPA whitepaper.',
    images: ['/assets/official_logo.jpg'],
  },
};

export default function SecurityPage() {
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
            <span>ENTERPRISE CYBERSECURITY & THREAT MODEL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Security Architecture & DPA Whitepaper
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Engineered for CISOs, Security Engineers, and Enterprise IT Procurement Teams.
          </p>
        </div>

        {/* Threat Model & Defenses */}
        <div className="space-y-10 text-sm leading-relaxed text-slate-300">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>1. In-RAM Secret Redaction Engine</span>
            </h2>
            <p>
              Before any target bundle (.zip or JSON) is synthesized, PromptShift scans all file contents against
              our high-performance regular expression filter to detect and neutralize leaked secrets:
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
              <p>• OpenAI Keys (<code className="text-emerald-400">sk-[a-zA-Z0-9]{'{20,}'}</code>) -&gt; <code className="text-cyan-400">[REDACTED_API_KEY]</code></p>
              <p>• Anthropic Keys (<code className="text-emerald-400">sk-ant-[a-zA-Z0-9_-]{'{20,}'}</code>) -&gt; <code className="text-cyan-400">[REDACTED_API_KEY]</code></p>
              <p>• GitHub Tokens (<code className="text-emerald-400">ghp_[a-zA-Z0-9]{'{36}'}</code>) -&gt; <code className="text-cyan-400">[REDACTED_API_KEY]</code></p>
              <p>• AWS Access Keys (<code className="text-emerald-400">AKIA[0-9A-Z]{'{16}'}</code>) -&gt; <code className="text-cyan-400">[REDACTED_API_KEY]</code></p>
              <p>• Private RSA / SSH Keys (<code className="text-emerald-400">-----BEGIN RSA PRIVATE KEY-----</code>) -&gt; <code className="text-cyan-400">[REDACTED_KEY]</code></p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>2. Binary & Magic Byte Blocking (MZ Header Guard)</span>
            </h2>
            <p>
              PromptShift strictly enforces text/markdown-only processing for agent prompts and configurations.
              Any file beginning with binary MZ executables (Windows PE), ELF binaries, or Mach-O magic bytes
              is immediately blocked and rejected in memory, mitigating payload execution or Trojan injection.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ServerOff className="w-4 h-4 text-purple-400" />
              <span>3. Zip Slip & Zip Bomb Defenses</span>
            </h2>
            <p>
              All ZIP unpacking routines apply strict path sanitization. Directory traversal characters (<code className="text-cyan-400">../</code>)
              are stripped to prevent file writes outside sandbox limits. Decompression ratios are constrained to prevent memory exhaustion (Zip Bomb mitigation).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>4. GDPR Article 28 Data Processing Agreement (DPA)</span>
            </h2>
            <p>
              PromptShift provides standard contractual clauses (SCC) and automated DPA compliance for enterprise teams.
              Because zero repository code is ever persisted to cloud disks, your risk surface remains at absolute zero.
              For a custom signed DPA document, please reach out to <a href="mailto:compliance@promptshift.dev" className="text-cyan-400 underline">compliance@promptshift.dev</a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex items-center justify-between text-xs text-slate-500">
          <span>PromptShift.dev • Enterprise Security & Architecture</span>
          <Link href="/" className="text-cyan-400 hover:underline">
            Return to Converter
          </Link>
        </div>
      </div>
    </div>
  );
}
