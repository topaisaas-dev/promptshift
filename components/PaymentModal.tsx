'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Download,
  Lock,
  Sparkles,
  Zap,
  Receipt,
  Building2,
  Mail,
  Share2,
  UploadCloud,
} from 'lucide-react';
import { ClientVault, VaultInvoice } from '@/lib/storage/clientVault';
import { InvoiceGenerator } from '@/lib/invoices/invoiceGenerator';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import { MonetizationManager } from '@/lib/config/monetizationConfig';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  zipBase64?: string;
  initialPlan?: 'single' | 'pro' | 'team';
  initialIsPaid?: boolean;
  sourceChannel?: string;
  conversionPair?: string;
  onBeforeExternalRedirect?: (plan: 'single' | 'pro' | 'team') => void;
  onOpenPortal?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  projectName,
  zipBase64,
  initialPlan = 'single',
  initialIsPaid = false,
  sourceChannel = 'web',
  conversionPair,
  onBeforeExternalRedirect,
  onOpenPortal,
}) => {
  const isFreeBeta = MonetizationManager.isFreeBeta();
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'pro' | 'team'>(
    isFreeBeta ? 'pro' : initialPlan
  );
  const [currency, setCurrency] = useState<SupportedCurrency>(() =>
    typeof window !== 'undefined' ? CurrencyManager.getActiveCurrency() : 'USD'
  );
  const [isPaid, setIsPaid] = useState(initialIsPaid);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<VaultInvoice | null>(null);
  const [emailError, setEmailError] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(isFreeBeta ? 'pro' : initialPlan);
      const invoices = ClientVault.getInvoices();
      const recentInvoice = invoices.length > 0 ? invoices[0] : null;

      if (initialIsPaid) {
        setIsPaid(true);
        setLastInvoice(recentInvoice);
      } else {
        setIsPaid(false);
        setLastInvoice(null);
      }
      setCurrency(CurrencyManager.getActiveCurrency());
      setEmailError('');

      const savedCust = ClientVault.getCustomerInfo();
      if (
        savedCust.email &&
        !savedCust.email.endsWith('@promptshift.dev') &&
        savedCust.email.includes('@')
      ) {
        setCustomerEmail(savedCust.email);
      } else {
        setCustomerEmail('');
      }
    }
  }, [isOpen, initialPlan, initialIsPaid, isFreeBeta]);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedCurrency>;
      if (customEvent.detail) setCurrency(customEvent.detail);
    };
    window.addEventListener('promptshift_currency_changed', handler);
    return () => window.removeEventListener('promptshift_currency_changed', handler);
  }, []);

  if (!isOpen) return null;

  const tierPriceInfo = CurrencyManager.getTierPrice(selectedPlan, currency);
  const hasProject = Boolean(zipBase64 && zipBase64.trim().length > 0);
  const trimmedEmail = customerEmail.trim();
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail);
  const displayPrice = isFreeBeta ? CurrencyManager.formatZero(currency) : tierPriceInfo.formattedTotal;

  const handlePolarCheckout = async () => {
    // Email is OPTIONAL for 1-Click Express Polar Checkout (Apple Pay / Google Pay / Link).
    // Only validate if the developer typed something in the field.
    if (trimmedEmail.length > 0 && !isEmailValid) {
      setEmailError('Please enter a valid email address or leave blank for 1-Click Apple Pay / Google Pay.');
      return;
    }

    setIsProcessing(true);
    setEmailError('');

    try {
      if (trimmedEmail && isEmailValid) {
        const cust = ClientVault.getCustomerInfo();
        ClientVault.saveCustomerInfo({ ...cust, email: trimmedEmail });
      }

      if (onBeforeExternalRedirect) {
        onBeforeExternalRedirect(selectedPlan);
      }

      const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://promptshift.dev';
      const successUrl = `${appUrl}/?checkout=success&plan=${selectedPlan}&checkout_id={CHECKOUT_ID}`;
      const returnUrl = `${appUrl}/#sandbox`;

      const res = await fetch('/api/payments/polar/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          customerEmail: isEmailValid ? trimmedEmail : undefined,
          projectName: projectName || 'Universal 4-in-1 Suite',
          sourceChannel,
          conversionPair,
          successUrl,
          returnUrl,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Unable to initialize Polar checkout session.');
      }
    } catch (err: any) {
      console.error('Polar checkout launch error:', err);
      setEmailError(err.message || 'Unable to open Polar secure checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  const downloadBundle = () => {
    if (!zipBase64) return;
    const link = document.createElement('a');
    link.href = `data:application/zip;base64,${zipBase64}`;
    const safeName = (projectName || 'promptshift_universal_suite')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    link.download = `${safeName}_4in1_bundle.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="w-full max-w-lg max-h-[92vh] bg-cardBg border border-borderColor rounded-3xl p-6 sm:p-7 shadow-2xl relative flex flex-col justify-between gap-4 overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close payment modal"
          className="absolute top-5 right-5 text-textMuted hover:text-white p-1 rounded-lg focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col gap-1 text-center items-center flex-shrink-0">
          <div
            className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyanGlow/30 flex items-center justify-center text-cyanGlow mb-1 flex-shrink-0"
            aria-hidden="true"
          >
            {isPaid ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 id="payment-modal-title" className="text-xl font-bold text-white tracking-tight">
            {isPaid
              ? 'License Activated & Bundle Ready!'
              : selectedPlan === 'team'
              ? 'Unlock Team & Agency CI/CD Pass'
              : selectedPlan === 'pro'
              ? 'Unlock Pro Developer Unlimited Pass'
              : 'Unlock Universal 4-in-1 Suite ($1.99)'}
          </h2>
          <p className="text-xs text-textMuted max-w-sm text-center">
            {isPaid
              ? 'Your Polar.sh purchase is verified. Download your full 4-in-1 multi-IDE bundle below.'
              : selectedPlan === 'team'
              ? '5 developer seats, automated GitHub & GitLab CI/CD parity guard, SOC-2 DPA, and unlimited repos.'
              : selectedPlan === 'pro'
              ? 'Unlimited multi-file repositories, personal CLI & MCP license key, and full In-RAM secret shield.'
              : 'Instant one-time pass. Exports all your rules across Cursor, Claude Code, OpenAI & Gemini with zero subscription.'}
          </p>
        </div>

        {!isPaid ? (
          <div className="flex flex-col gap-4">
            {/* Plan Selector Tabs */}
            <div
              role="tablist"
              aria-label="Commercial plan options"
              className="grid grid-cols-3 p-1 rounded-2xl bg-slate-900 border border-borderColor gap-1 relative"
            >
              <button
                role="tab"
                aria-selected={selectedPlan === 'single'}
                onClick={() => setSelectedPlan('single')}
                className={`relative py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap text-center cursor-pointer ${
                  selectedPlan === 'single'
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-neonCyan font-extrabold'
                    : 'text-textMuted hover:text-white'
                }`}
              >
                Single ({CurrencyManager.getTierPrice('single', currency).formatted})
                <span className="absolute -top-2.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-400 text-black uppercase tracking-wider shadow-md z-10 pointer-events-none">
                  ★ 1-Time
                </span>
              </button>

              <button
                role="tab"
                aria-selected={selectedPlan === 'pro'}
                onClick={() => setSelectedPlan('pro')}
                className={`relative py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap text-center cursor-pointer ${
                  selectedPlan === 'pro'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/40 font-extrabold'
                    : 'text-textMuted hover:text-white'
                }`}
              >
                Pro ({CurrencyManager.getTierPrice('pro', currency).formatted}/mo)
              </button>

              <button
                role="tab"
                aria-selected={selectedPlan === 'team'}
                onClick={() => setSelectedPlan('team')}
                className={`relative py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap text-center cursor-pointer ${
                  selectedPlan === 'team'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg font-extrabold border border-purple-400/50'
                    : 'text-textMuted hover:text-white'
                }`}
              >
                Team ({CurrencyManager.getTierPrice('team', currency).formatted}/mo)
                <span className="absolute -top-2.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-purple-400 text-black uppercase tracking-wider shadow-md z-10 pointer-events-none">
                  CI/CD
                </span>
              </button>
            </div>

            {/* Selected Plan Summary Card */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-borderColor">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">
                    {selectedPlan === 'single'
                      ? 'Universal 4-in-1 Repo Pass'
                      : selectedPlan === 'pro'
                      ? 'Pro Developer Unlimited'
                      : 'Team & Agency CI/CD Pass'}
                  </span>
                  {selectedPlan === 'pro' && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                  {selectedPlan === 'team' && <Building2 className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <p className="text-[11px] text-textMuted mt-0.5 max-w-[270px]">
                  {selectedPlan === 'single'
                    ? `Unlocks "${projectName || 'your repository'}" for Cursor + Claude + OpenAI + Gemini. Instant auto-download on return.`
                    : selectedPlan === 'pro'
                    ? 'Unlimited multi-file exports • CLI & MCP License Key • Cancel anytime'
                    : '5 seats included • GitHub Actions auto-sync • SOC-2 DPA'}
                </p>
              </div>

              <div className="text-right flex-shrink-0 min-w-[90px]">
                <span className="text-2xl font-black text-emeraldGlow leading-none block">
                  {displayPrice}
                </span>
                <span className="text-[10px] text-textMuted block mt-1">
                  {selectedPlan === 'single' ? 'one-time pass' : `/ month (${currency})`}
                </span>
              </div>
            </div>

            {/* Primary 1-Click Express Checkout CTA */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handlePolarCheckout}
                disabled={isProcessing}
                aria-label={`Checkout ${displayPrice} with Polar`}
                className={`w-full h-[50px] rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-neonCyan hover:brightness-105 active:brightness-95 transition-all select-none cursor-pointer border border-cyan-300/40 ${
                  isProcessing ? 'opacity-80 cursor-wait' : ''
                }`}
              >
                <Zap className="w-4 h-4 flex-shrink-0 fill-current" />
                <span>
                  {isProcessing
                    ? 'Redirecting to Polar Express Checkout...'
                    : selectedPlan === 'single'
                    ? `1-Click Express Checkout (${displayPrice}) →`
                    : `Start Instant Subscription (${displayPrice}/mo) →`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-2.5 text-[10px] text-slate-300 font-medium">
                <span>🍎 Apple Pay</span>
                <span>•</span>
                <span>💳 Google Pay &amp; Link</span>
                <span>•</span>
                <span>🔒 Merchant of Record: Polar.sh</span>
              </div>
            </div>

            {/* Optional Email Pre-fill */}
            <div className="flex flex-col gap-1 text-left pt-1 border-t border-slate-800/80">
              <label
                htmlFor="dev-email-input"
                className="text-[11px] font-semibold text-slate-400 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Optional: Pre-fill email for VAT receipt &amp; CLI license key</span>
                </span>
              </label>
              <input
                id="dev-email-input"
                type="email"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePolarCheckout();
                }}
                placeholder="developer@company.com (optional — or pay directly via Apple/Google Pay)"
                className={`w-full px-3 py-2 rounded-xl bg-slate-900 border ${
                  emailError ? 'border-red-500' : 'border-borderColor'
                } text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono`}
              />
              {emailError && (
                <span className="text-[11px] text-red-400 pl-1 font-semibold">{emailError}</span>
              )}
            </div>
          </div>
        ) : (
          /* Payment Confirmed Celebration & Instant Download State */
          <div className="flex flex-col items-center justify-center gap-4 py-2 text-center">
            <div className="flex flex-col gap-2.5 w-full">
              {hasProject ? (
                <button
                  onClick={downloadBundle}
                  aria-label="Download your converted Universal 4-in-1 Suite ZIP archive"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-neonEmerald hover:brightness-105 active:brightness-95 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Unlocked 4-in-1 Suite (.zip)</span>
                </button>
              ) : (
                <div className="w-full p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>License Unlocked in Sovereign Browser Vault!</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Drop any multi-file repository into the Dropzone now — all files and the 4-in-1 Universal Suite are unlocked automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      const dropzoneEl = document.getElementById('dropzone');
                      if (dropzoneEl) dropzoneEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full mt-1 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Drop Your Repository Now →</span>
                  </button>
                </div>
              )}

              {lastInvoice && (
                <button
                  onClick={() => InvoiceGenerator.generatePdf(lastInvoice)}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-cyan-400" />
                  <span>Download Official PDF Receipt ({lastInvoice.invoiceNumber})</span>
                </button>
              )}

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  'Just synced my AI coding rules across Cursor, Claude Code & Windsurf in 2 seconds with @PromptShift (https://promptshift.dev)! 100% in-RAM, zero data retention & 98.5% AST parity. 🔥 #Cursor #ClaudeCode #DevTools'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Share Migration on X / Twitter</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <span>Return to Studio</span>
              </button>

              {onOpenPortal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPortal();
                  }}
                  className="text-xs text-cyan-300 hover:text-white underline pt-1 font-semibold cursor-pointer"
                >
                  Open Sovereign Vault &amp; CLI License Key
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-[11px] text-textMuted border-t border-borderColor pt-3 flex-shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span>100% In-RAM Execution • Zero Server Data Retention</span>
        </div>
      </div>
    </div>
  );
};
