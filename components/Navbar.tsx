'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Cpu, Lock, Receipt, GitBranch, FileCheck, User, UserCheck, Terminal, LogOut, Sparkles } from 'lucide-react';
import { BenchmarkModal } from '@/components/BenchmarkModal';
import { PaymentModal } from '@/components/PaymentModal';
import { CustomerPortalModal } from '@/components/CustomerPortalModal';
import { GitHubActionModal } from '@/components/GitHubActionModal';
import { SecurityWhitepaperModal } from '@/components/SecurityWhitepaperModal';
import { CurrencySelector } from '@/components/CurrencySelector';
import { VipPromoBanner } from '@/components/VipPromoBanner';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { AuthManager } from '@/lib/auth/authManager';
import { ClientVault, UserPlanTier } from '@/lib/storage/clientVault';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';

export const Navbar: React.FC = () => {
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'single' | 'pro' | 'team'>('single');
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isGitHubActionOpen, setIsGitHubActionOpen] = useState(false);
  const [isSecurityWhitepaperOpen, setIsSecurityWhitepaperOpen] = useState(false);
  const [currency, setCurrency] = useState<SupportedCurrency>(() => typeof window !== 'undefined' ? CurrencyManager.getActiveCurrency() : 'USD');
  const [authUser, setAuthUser] = useState<{ email: string } | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [activePlan, setActivePlan] = useState<UserPlanTier>('free');
  const [hasInvoices, setHasInvoices] = useState(false);

  React.useEffect(() => {
    CurrencyManager.initFromIp().then((curr) => {
      setCurrency(curr);
    });
    setAuthUser(AuthManager.getCurrentUser());
    setActivePlan(ClientVault.getActivePlan());
    const cust = ClientVault.getCustomerInfo();
    if (cust?.email && !cust.email.endsWith('@promptshift.dev')) {
      setCustomerEmail(cust.email);
    }
    const checkInvoices = () => {
      setHasInvoices(ClientVault.getInvoices().length > 0);
    };
    checkInvoices();

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedCurrency>;
      if (customEvent.detail) setCurrency(customEvent.detail);
    };

    const authHandler = (e: Event) => {
      const custom = e as CustomEvent<{ email: string | null }>;
      if (custom.detail?.email) {
        setAuthUser({ email: custom.detail.email });
        setCustomerEmail(custom.detail.email);
      } else {
        setAuthUser(null);
        setCustomerEmail('');
      }
      checkInvoices();
    };

    const planHandler = (e: Event) => {
      const custom = e as CustomEvent<UserPlanTier>;
      if (custom.detail) setActivePlan(custom.detail);
      else setActivePlan(ClientVault.getActivePlan());
      checkInvoices();
    };

    window.addEventListener('promptshift_currency_changed', handler);
    window.addEventListener('promptshift_auth_changed', authHandler);
    window.addEventListener('promptshift_plan_changed', planHandler);
    window.addEventListener('promptshift_vault_purged', checkInvoices);

    return () => {
      window.removeEventListener('promptshift_currency_changed', handler);
      window.removeEventListener('promptshift_auth_changed', authHandler);
      window.removeEventListener('promptshift_plan_changed', planHandler);
      window.removeEventListener('promptshift_vault_purged', checkInvoices);
    };
  }, []);

  const isSessionActive = Boolean(authUser || (activePlan && activePlan !== 'free') || customerEmail || hasInvoices);

  const handleSignOut = () => {
    const user = AuthManager.getCurrentUser() || authUser;
    if (user?.email) {
      AuthManager.backupAccountVault(user.email, {
        invoices: ClientVault.getInvoices(),
        conversions: ClientVault.getConversions(),
        customerInfo: ClientVault.getCustomerInfo(),
        plan: ClientVault.getActivePlan(),
      });
    }
    AuthManager.signOut();
    ClientVault.clearSessionData();
    setAuthUser(null);
    setActivePlan('free');
    setCustomerEmail('');
    setHasInvoices(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('promptshift_auth_changed', { detail: { email: null } }));
      window.dispatchEvent(new CustomEvent('promptshift_plan_changed', { detail: 'free' }));
      window.dispatchEvent(new CustomEvent('promptshift_vault_purged'));
    }
  };

  return (
    <>
      <VipPromoBanner />
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-borderColor bg-darkBg/80 backdrop-blur-md sticky top-0 z-40">
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded-xl"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyanGlow/30 shadow-neonCyan transition-transform group-hover:scale-105">
            <img src="/assets/official_logo.jpg" alt="PromptShift Official Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-cyanGlow via-teal-300 to-emeraldGlow bg-clip-text text-transparent">
                PromptShift
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emeraldGlow/10 text-emeraldGlow border border-emeraldGlow/30">
                promptshift.dev
              </span>
            </div>
            <span className="text-[11px] text-textMuted tracking-wide">1-Click Universal AI Project Bridge</span>
          </div>
        </Link>

        {/* Center / Right Links */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setIsBenchmarkOpen(true)}
            aria-haspopup="dialog"
            aria-label="Open 98.5% Certified Parity Benchmark audit and proof"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none transition-all cursor-pointer shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>98.5% CERTIFIED PARITY</span>
          </button>

          {/* GitHub CI/CD Action Button */}
          <button
            onClick={() => setIsGitHubActionOpen(true)}
            aria-label="Open GitHub & GitLab CI/CD sync workflow template"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            <span>CI/CD Sync</span>
          </button>

          {/* Security & DPA Whitepaper Button */}
          <button
            onClick={() => setIsSecurityWhitepaperOpen(true)}
            aria-label="Open SOC-2 and GDPR Security Whitepaper"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security & DPA</span>
          </button>

          <a
            href="/#sandbox"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 hover:from-cyan-500/20 hover:to-emerald-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Demo</span>
          </a>

          <Link
            href="/discover"
            className="hidden md:inline-block text-xs font-bold text-textMuted hover:text-cyan-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            Guides
          </Link>

          <Link
            href="/cli"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>CLI</span>
          </Link>

          <Link
            href="/#pricing"
            className="hidden sm:inline-block text-xs font-bold text-textMuted hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            Pricing
          </Link>

          {/* Localized Currency Selector */}
          <CurrencySelector />

          {/* Customer Portal / Account Button - Positioned to the right of Currency with gap */}
          <div className="ml-2 sm:ml-3 flex items-center gap-2">
            {activePlan !== 'free' && (
              <span
                className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase border ${
                  activePlan === 'team'
                    ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                    : activePlan === 'pro'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : activePlan === 'vip'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                }`}
              >
                ★ {activePlan} active
              </span>
            )}
            <button
              onClick={() => setIsPortalOpen(true)}
              aria-label="Open Customer Portal: Past Downloads & PDF Invoices"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500/40 text-xs font-bold focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
            >
              {authUser ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="truncate max-w-[110px]">{authUser.email.split('@')[0]}</span>
                </>
              ) : customerEmail ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                  <span className="truncate max-w-[110px]">{customerEmail.split('@')[0]}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                  <span>Customer Portal</span>
                </>
              )}
            </button>

            {isSessionActive && (
              <button
                onClick={handleSignOut}
                aria-label="Sign out of account and reset session"
                title="Sign out / Disconnect"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Benchmark Transparency Modal */}
      <BenchmarkModal isOpen={isBenchmarkOpen} onClose={() => setIsBenchmarkOpen(false)} />

      {/* GitHub CI/CD Action Modal */}
      <GitHubActionModal isOpen={isGitHubActionOpen} onClose={() => setIsGitHubActionOpen(false)} />

      {/* Security Whitepaper Modal */}
      <SecurityWhitepaperModal isOpen={isSecurityWhitepaperOpen} onClose={() => setIsSecurityWhitepaperOpen(false)} />

      {/* Direct Pro / Team Subscription Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        projectName="PromptShift Universal Developer"
        initialPlan={paymentPlan}
        sourceChannel={typeof window !== 'undefined' ? AnalyticsTracker.resolveEffectiveChannel() : 'web'}
        onOpenPortal={() => setIsPortalOpen(true)}
      />

      {/* Client Portal Modal (History & Clean PDF Invoices) */}
      <CustomerPortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        onOpenPayment={(plan) => {
          setIsPortalOpen(false);
          setPaymentPlan(plan);
          setIsPaymentModalOpen(true);
        }}
      />
    </>
  );
};
