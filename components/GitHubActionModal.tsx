'use client';

import React, { useState } from 'react';
import { X, GitBranch, Copy, Check, Download, Terminal, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface GitHubActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubActionModal: React.FC<GitHubActionModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const yamlContent = `name: PromptShift Multi-Agent Universal Parity Sync

on:
  push:
    branches: [ main, master, develop ]
    paths:
      - 'CLAUDE.md'
      - 'GEMINI.md'
      - '.cursorrules'
      - '.cursor/rules/**'
      - '.agents/**'

permissions:
  contents: write

jobs:
  sync-prompts:
    runs-on: ubuntu-latest
    name: Continuous Multi-Agent AST Transpile
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run PromptShift Universal Transpiler
        env:
          PROMPTSHIFT_LICENSE_KEY: \${{ secrets.PROMPTSHIFT_KEY }}
        run: |
          npx --yes promptshift --to=claude --key="\${PROMPTSHIFT_LICENSE_KEY}"
          npx --yes promptshift --to=cursor --key="\${PROMPTSHIFT_LICENSE_KEY}"
          npx --yes promptshift --check --json --key="\${PROMPTSHIFT_LICENSE_KEY}"

      - name: Commit Synchronized Multi-Agent Directives
        run: |
          git config --global user.name "PromptShift Bot"
          git config --global user.email "bot@promptshift.dev"
          git add -A
          if ! git diff-index --quiet HEAD; then
            git commit -m "chore(ai): auto-sync multi-agent parity across Claude, Cursor & Gemini [skip ci]"
            git push
          else
            echo "All AI agent directives already in 100% parity."
          fi
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promptshift-sync.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-action-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="w-full max-w-3xl bg-cardBg border border-borderColor rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <GitBranch className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="github-action-title" className="text-xl font-black text-white tracking-tight">
                  GitHub & GitLab CI/CD Continuous Sync
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  STARTUP & ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-textMuted mt-0.5">
                Keep Claude, Cursor, and Gemini prompts in permanent 100% parity on every Git commit.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close GitHub Action modal"
            className="p-2 text-textMuted hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Value Callout for Teams */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-borderColor flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 text-white font-bold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Eliminate Prompt Drift Across Engineering Teams</span>
          </div>
          <p className="text-textMuted leading-relaxed">
            When developer A updates an instruction in <code>CLAUDE.md</code> and developer B uses Cursor, their rules
            diverge. This GitHub Action automatically transpiles the changes on push and commits updated <code>.cursorrules</code>,
            <code>GEMINI.md</code>, and tool specs with <strong>zero manual intervention</strong>.
          </p>
        </div>

        {/* Code Snippet Box */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-300 font-bold">.github/workflows/promptshift-sync.yml</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied YAML!' : 'Copy Workflow'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-semibold text-cyan-400 border border-cyan-500/30 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save File</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-borderColor text-xs font-mono text-emerald-300/90 leading-relaxed overflow-x-auto max-h-72">
            <code>{yamlContent}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-textMuted border-t border-borderColor pt-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Runs in your isolated GitHub runner • 0 code exfiltration</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
