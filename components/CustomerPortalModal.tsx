'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Receipt,
  Download,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Building,
  Terminal,
  Copy,
  Check,
  Sparkles,
  FileCheck2,
  Gift,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  User,
  Building2,
  GitBranch,
  Zap,
} from 'lucide-react';
import { ClientVault, VaultConversion, VaultInvoice, UserPlanTier } from '@/lib/storage/clientVault';
import { InvoiceGenerator } from '@/lib/invoices/invoiceGenerator';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { PromoManager } from '@/lib/promo/promoManager';
import { AuthManager } from '@/lib/auth/authManager';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import { MonetizationManager } from '@/lib/config/monetizationConfig';

interface CustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'history' | 'invoices' | 'plan';
  onOpenPayment?: (plan: 'single' | 'pro' | 'team') => void;
}

export const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'history',
  onOpenPayment,
}) => {
  const isFreeBeta = MonetizationManager.isFreeBeta();
  const [activeTab, setActiveTab] = useState<'history' | 'invoices' | 'plan'>(initialTab);
  const [activePlan, setActivePlan] = useState<UserPlanTier>('free');
  const [conversions, setConversions] = useState<VaultConversion[]>([]);
  const [invoices, setInvoices] = useState<VaultInvoice[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', company: '', email: '', vatId: '' });
  const [isCopiedToken, setIsCopiedToken] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isPurgedToast, setIsPurgedToast] = useState(false);
  const [currency, setCurrency] = useState<SupportedCurrency>(() => typeof window !== 'undefined' ? CurrencyManager.getActiveCurrency() : 'EUR');

  // Authentication states
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);

  const isAdmin = Boolean(
    typeof window !== 'undefined' &&
      sessionStorage.getItem('promptshift_admin_preview') === 'true'
  );

  const [authView, setAuthView] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authOtpCode, setAuthOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isGuestBypass, setIsGuestBypass] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const user = AuthManager.getCurrentUser();
      setCurrentUser(user);
      const currentPlan = ClientVault.getActivePlan();
      setActivePlan(currentPlan);
      setConversions(ClientVault.getConversions());
      setInvoices(ClientVault.getInvoices());
      const savedInfo = ClientVault.getCustomerInfo();
      setCustomerInfo({
        ...savedInfo,
        email: user?.email || savedInfo.email || '',
      });
      // If user has no registered password account, or already has an active plan or customer email,
      // allow instant sovereign vault access without showing login blocker
      const hasPlan = Boolean(currentPlan && currentPlan !== 'free');
      const hasEmail = Boolean(savedInfo.email && savedInfo.email.trim().length > 0);
      if (!user && (!AuthManager.hasRegisteredAccounts() || hasPlan || hasEmail)) {
        setIsGuestBypass(true);
      }
      CurrencyManager.initFromIp().then((curr) => {
        setCurrency(curr);
      });
      setAuthError('');
      setAuthSuccess('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handlePurge = () => {
      setConversions([]);
      setInvoices([]);
      setCustomerInfo({ name: '', company: '', email: '', vatId: '' });
      setActivePlan('free');
      setIsPurgedToast(true);
      setTimeout(() => setIsPurgedToast(false), 3000);
    };
    window.addEventListener('promptshift_vault_purged', handlePurge);
    return () => window.removeEventListener('promptshift_vault_purged', handlePurge);
  }, []);

  useEffect(() => {
    const handlePlan = (e: Event) => {
      const customEvent = e as CustomEvent<UserPlanTier>;
      if (customEvent.detail) setActivePlan(customEvent.detail);
      else setActivePlan(ClientVault.getActivePlan());
    };
    window.addEventListener('promptshift_plan_changed', handlePlan);
    return () => window.removeEventListener('promptshift_plan_changed', handlePlan);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedCurrency>;
      if (customEvent.detail) setCurrency(customEvent.detail);
    };
    window.addEventListener('promptshift_currency_changed', handler);
    return () => window.removeEventListener('promptshift_currency_changed', handler);
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const handleDownloadInvoice = (invoice: VaultInvoice) => {
    const updatedInvoice: VaultInvoice = {
      ...invoice,
      customerName: customerInfo.name || invoice.customerName,
      customerCompany: customerInfo.company || invoice.customerCompany,
      customerEmail: customerInfo.email || invoice.customerEmail,
    };
    InvoiceGenerator.generatePdf(updatedInvoice);
    AnalyticsTracker.trackInvoiceDownload(updatedInvoice.invoiceNumber, activePlan);
  };

  const handleReDownloadConversion = (conv: VaultConversion) => {
    if (!conv.zipBase64) {
      alert('This ephemeral bundle was shredded from RAM after session end. Upload the project to re-transpile in <80ms!');
      return;
    }
    const link = document.createElement('a');
    link.href = `data:application/zip;base64,${conv.zipBase64}`;
    link.download = `${conv.projectName}_${conv.targetPlatform}_bundle.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteConversion = (id: string) => {
    ClientVault.deleteConversion(id);
    setConversions(ClientVault.getConversions());
  };

  const handleDeleteInvoice = (id: string) => {
    ClientVault.deleteInvoice(id);
    setInvoices(ClientVault.getInvoices());
  };

  const handleClearAllInvoices = () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete all invoices from this local browser vault?')) {
      ClientVault.clearInvoices();
      setInvoices([]);
    }
  };

  const handleSaveCustomerInfo = (e: React.FormEvent) => {
    e.preventDefault();
    ClientVault.saveCustomerInfo(customerInfo);
    setIsEditingInfo(false);
  };

  const verifiedOrderKey = invoices.find(
    (inv) =>
      inv.orderId &&
      (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(inv.orderId) ||
        /^polar_[a-zA-Z0-9_]{8,}$/.test(inv.orderId) ||
        /^(PS-PRO-|PS-TEAM-|PSHIFT-|POLAR-)[A-Z0-9_-]{6,}$/i.test(inv.orderId))
  )?.orderId;

  const activeCliToken =
    verifiedOrderKey ||
    (activePlan === 'team'
      ? 'PS-TEAM-POLAR-KEY-REQUIRED'
      : activePlan === 'pro'
      ? 'PS-PRO-POLAR-KEY-REQUIRED'
      : '');

  const handleCopyToken = () => {
    if (!activeCliToken) return;
    navigator.clipboard.writeText(activeCliToken);
    setIsCopiedToken(true);
    AnalyticsTracker.trackCliTokenCopied(activePlan);
    setTimeout(() => setIsCopiedToken(false), 2000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmittingAuth(true);

    const res = await AuthManager.signIn(authEmail, authPassword);
    setIsSubmittingAuth(false);

    if (res.success) {
      const user = AuthManager.getCurrentUser();
      setCurrentUser(user);
      if (user?.email) {
        setCustomerInfo((prev) => ({ ...prev, email: user.email }));
        ClientVault.saveCustomerInfo({ ...customerInfo, email: user.email });
      }
      setAuthPassword('');
    } else {
      setAuthError(res.error || 'Authentication failed.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authPassword !== authConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsSubmittingAuth(true);
    const res = await AuthManager.signUp(authEmail, authPassword);
    setIsSubmittingAuth(false);

    if (res.success) {
      const user = AuthManager.getCurrentUser();
      setCurrentUser(user);
      if (user?.email) {
        setCustomerInfo((prev) => ({ ...prev, email: user.email }));
        ClientVault.saveCustomerInfo({ ...customerInfo, email: user.email });
      }
      setAuthPassword('');
      setAuthConfirmPassword('');
      setAuthSuccess('Local sovereign vault profile created.');
    } else {
      setAuthError(res.error || 'Registration failed.');
    }
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const res = AuthManager.requestPasswordReset(authEmail);
    if (res.success) {
      setAuthSuccess(
        'If a local vault profile exists for this email on this browser, reset instructions have been initiated. Note: PromptShift stores zero accounts on servers — you can also clear local browser vault data from Settings.'
      );
    } else {
      setAuthError(res.error || 'Failed to request reset.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authPassword !== authConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsSubmittingAuth(true);
    const res = await AuthManager.resetPassword(authEmail, authOtpCode, authPassword);
    setIsSubmittingAuth(false);

    if (res.success) {
      setAuthSuccess('Password successfully reset! Signing in...');
      setTimeout(async () => {
        await AuthManager.signIn(authEmail, authPassword);
        setCurrentUser(AuthManager.getCurrentUser());
        setAuthView('signin');
      }, 700);
    } else {
      setAuthError(res.error || 'Failed to reset password.');
    }
  };

  const isSessionActive = Boolean(
    currentUser ||
    (activePlan && activePlan !== 'free') ||
    (customerInfo.email && customerInfo.email.trim().length > 0) ||
    invoices.length > 0
  );

  const handleSignOut = () => {
    const user = AuthManager.getCurrentUser() || currentUser;
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
    setCurrentUser(null);
    setActivePlan('free');
    setCustomerInfo({ name: '', company: '', email: '', vatId: '' });
    setConversions([]);
    setInvoices([]);
    setIsGuestBypass(!AuthManager.hasRegisteredAccounts());
    setAuthView('signin');
    setAuthEmail('');
    setAuthPassword('');
    setAuthConfirmPassword('');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('promptshift_auth_changed', { detail: { email: null } }));
      window.dispatchEvent(new CustomEvent('promptshift_plan_changed', { detail: 'free' }));
      window.dispatchEvent(new CustomEvent('promptshift_vault_purged'));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-portal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="w-full max-w-4xl h-[700px] max-h-[92vh] bg-cardBg border border-borderColor rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between overflow-hidden">
        {/* Header - Fixed & Motionless */}
        <div className="flex items-start justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyanGlow/30 flex items-center justify-center text-cyanGlow flex-shrink-0">
              <History className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="customer-portal-title" className="text-xl font-black text-white tracking-tight">
                  Customer Portal & Sovereign Vault
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ZERO CLOUD LOGS
                </span>
              </div>
              <p className="text-xs text-textMuted mt-0.5 min-h-[18px]">
                {currentUser
                  ? `Signed in as ${currentUser.email} • Past project conversions & official PDF receipts.`
                  : customerInfo.email
                  ? `Active session: ${customerInfo.email} (${(activePlan || 'Free').toUpperCase()}) • Past conversions & official PDF receipts.`
                  : activePlan && activePlan !== 'free'
                  ? `Active session: ${(activePlan).toUpperCase()} plan • Past conversions & official PDF receipts.`
                  : 'Sovereign vault for your past AST conversions, official PDF receipts, and CLI tokens.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isSessionActive ? (
              <button
                onClick={handleSignOut}
                aria-label="Sign out of customer portal"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : isGuestBypass && AuthManager.hasRegisteredAccounts() ? (
              <button
                onClick={() => setIsGuestBypass(false)}
                aria-label="Exit guest mode and return to sign in"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-cyan-400 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In / Lock</span>
              </button>
            ) : null}
            <button
              onClick={onClose}
              aria-label="Close customer portal"
              className="p-2 text-textMuted hover:text-white rounded-xl hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* If user is not authenticated and hasn't chosen guest bypass */}
        {!currentUser && !isGuestBypass ? (
          <div className="flex-1 min-h-0 flex flex-col justify-center max-w-md mx-auto w-full py-4 overflow-y-auto pr-1">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900 border border-borderColor gap-1">
              <button
                type="button"
                onClick={() => {
                  setAuthView('signin');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  authView === 'signin'
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-textMuted hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthView('signup');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  authView === 'signup'
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold shadow-neonCyan'
                    : 'text-textMuted hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400 animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {authView === 'signin' && (
              <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-textMuted flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Account Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-borderColor text-xs text-white placeholder-textMuted focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-textMuted flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('forgot');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-borderColor text-xs text-white placeholder-textMuted focus:outline-none focus:border-cyan-400 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-textMuted hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-neonCyan hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-1 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmittingAuth ? 'Verifying Credentials...' : 'Sign In to Customer Portal'}</span>
                </button>
              </form>
            )}

            {/* CREATE ACCOUNT FORM */}
            {authView === 'signup' && (
              <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-textMuted flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Account Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-borderColor text-xs text-white placeholder-textMuted focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-textMuted flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Master Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 upper, 1 number, 1 symbol"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-borderColor text-xs text-white placeholder-textMuted focus:outline-none focus:border-cyan-400 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-textMuted hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Checklist */}
                  <div className="grid grid-cols-2 gap-1 mt-1 text-[10px] text-textMuted pl-1">
                    <span className={authPassword.length >= 8 ? 'text-emerald-400 font-semibold' : ''}>
                      ✓ 8+ characters
                    </span>
                    <span className={/[A-Z]/.test(authPassword) && /[a-z]/.test(authPassword) ? 'text-emerald-400 font-semibold' : ''}>
                      ✓ Upper & lowercase
                    </span>
                    <span className={/[0-9]/.test(authPassword) ? 'text-emerald-400 font-semibold' : ''}>
                      ✓ At least 1 number
                    </span>
                    <span className={/[^A-Za-z0-9]/.test(authPassword) ? 'text-emerald-400 font-semibold' : ''}>
                      ✓ Special character (!@#)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-textMuted flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-borderColor text-xs text-white placeholder-textMuted focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-neonCyan hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingAuth ? 'Encrypting & Creating...' : 'Create Secure Sovereign Account'}</span>
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authView === 'forgot' && (
              <div className="flex flex-col gap-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('signin');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="flex items-center gap-1.5 text-xs text-textMuted hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>

                <h3 className="text-sm font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-textMuted">
                  Enter your email address to generate a 6-digit recovery OTP code.
                </p>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-textMuted">Account Email</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-borderColor text-xs text-white placeholder-textMuted focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleRequestReset}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700"
                    >
                      Send Code
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-textMuted">6-Digit Recovery Code</label>
                  <input
                    type="text"
                    value={authOtpCode}
                    onChange={(e) => setAuthOtpCode(e.target.value)}
                    placeholder="e.g. 849201"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-borderColor text-xs text-white placeholder-textMuted focus:outline-none focus:border-cyan-400 transition-colors font-mono tracking-widest uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-textMuted">New Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="New password (8+ chars, 1 upper, 1 number, 1 special)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-borderColor text-xs text-white placeholder-textMuted focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-textMuted">Confirm New Password</label>
                  <input
                    type="password"
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-borderColor text-xs text-white placeholder-textMuted focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isSubmittingAuth}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-neonCyan hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-1 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password & Unlock</span>
                </button>
              </div>
            )}

            {/* Offline Sandbox Bypass */}
            <div className="text-center pt-2 border-t border-borderColor/60">
              <button
                type="button"
                onClick={() => setIsGuestBypass(true)}
                className="text-[11px] text-textMuted hover:text-cyan-400 underline transition-colors"
              >
                Or continue to private local sandbox as guest developer →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden my-2">
            {/* Tab Navigation - Fixed & Motionless */}
            <div className="flex items-center gap-2 border-b border-borderColor pb-3 flex-shrink-0" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'history'}
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                  activeTab === 'history'
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-textMuted hover:text-white hover:bg-slate-900'
                }`}
              >
                <History className="w-4 h-4 text-cyan-400" />
                <span>Download History ({conversions.length})</span>
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'invoices'}
                onClick={() => setActiveTab('invoices')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                  activeTab === 'invoices'
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-textMuted hover:text-white hover:bg-slate-900'
                }`}
              >
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Invoices & Receipts ({invoices.length})</span>
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'plan'}
                onClick={() => setActiveTab('plan')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                  activeTab === 'plan'
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-textMuted hover:text-white hover:bg-slate-900'
                }`}
              >
                {activePlan === 'team' ? (
                  <GitBranch className="w-4 h-4 text-purple-400" />
                ) : activePlan === 'vip' ? (
                  <Gift className="w-4 h-4 text-emerald-400" />
                ) : activePlan === 'pro' ? (
                  <Terminal className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Terminal className="w-4 h-4 text-purple-400" />
                )}
                <span>
                  {activePlan === 'team'
                    ? 'Team CI/CD & Token'
                    : activePlan === 'pro'
                    ? 'Pro Plan & Token'
                    : activePlan === 'vip'
                    ? 'VIP Pass & Token'
                    : 'Plan & CLI Token'}
                </span>
              </button>
            </div>

            {/* Sovereign Storage Transparency Disclosure - Fixed */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3 text-xs flex-shrink-0 my-3">
              <ShieldCheck className="w-5 h-5 text-cyanGlow flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-white flex items-center gap-2">
                  <span>Sovereign Local Vault Transparency Disclosure</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">HTML5 LocalStorage</span>
                </span>
                <p className="text-textMuted leading-relaxed text-[11px]">
                  <strong>Where is your data stored?</strong> Your conversion history, cached bundles, and receipts are stored
                  strictly within your browser&apos;s private local sandbox (HTML5 LocalStorage). PromptShift uses <strong>zero tracking cookies</strong> and
                  <strong> zero cloud database persistence</strong> for your code. If you clear your browser&apos;s site data or reset your local device cache,
                  all records are permanently erased.
                </p>
              </div>
            </div>

            {/* Immobile Tab Viewport: Identical Height & Layout Across History, Invoices, and Plan */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 focus:outline-none">
              {/* Tab 1: Download History */}
              {activeTab === 'history' && (
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-center justify-between text-xs text-textMuted">
                    <span>Past conversions securely stored in your local sandbox:</span>
                    <span className="text-[11px] text-cyan-400 font-mono">100% Client-Side Local Storage</span>
                  </div>

                  {conversions.length === 0 ? (
                    <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center p-8 text-center text-textMuted text-xs gap-3 bg-slate-900/40 rounded-2xl border border-borderColor">
                      <History className="w-10 h-10 opacity-30 text-cyan-400" />
                      <span className="text-sm font-semibold text-slate-300">No past conversions recorded in this browser yet.</span>
                      <span className="text-[11px] text-textMuted max-w-sm">When you transpile project directives, ephemeral bundles will appear here with 1-click re-download.</span>
                    </div>
                  ) : (
              <div className="divide-y divide-borderColor rounded-2xl border border-borderColor bg-slate-900/50 overflow-hidden">
                {conversions.map((conv) => (
                  <div key={conv.id} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-900/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{conv.projectName}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {conv.parityScore}% PARITY
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-textMuted mt-0.5">
                          <span className="uppercase font-mono">{conv.sourcePlatform} ➔ {conv.targetPlatform}</span>
                          <span>•</span>
                          <span>{conv.fileCount} files</span>
                          <span>•</span>
                          <span>{new Date(conv.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReDownloadConversion(conv)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Re-download ZIP</span>
                      </button>
                      <button
                        onClick={() => handleDeleteConversion(conv.id)}
                        aria-label="Remove from vault"
                        className="p-1.5 text-textMuted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Invoices & Receipts */}
        {activeTab === 'invoices' && (
          <div className="flex flex-col gap-6">
            {/* Customer Billing Info Card */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-borderColor flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Company & Billing Profile for Invoices
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingInfo(!isEditingInfo)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  {isEditingInfo ? 'Cancel' : 'Edit Billing Details'}
                </button>
              </div>

              {isEditingInfo ? (
                <form onSubmit={handleSaveCustomerInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div>
                    <label className="text-[11px] text-textMuted block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-borderColor text-xs text-white"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-textMuted block mb-1">Company / Studio</label>
                    <input
                      type="text"
                      value={customerInfo.company}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-borderColor text-xs text-white"
                      placeholder="e.g. AI Labs Inc."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-textMuted block mb-1">Billing Email</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-borderColor text-xs text-white"
                      placeholder="e.g. accounting@company.com"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-textMuted block mb-1">VAT / Tax Identification</label>
                    <input
                      type="text"
                      value={customerInfo.vatId}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, vatId: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-borderColor text-xs text-white"
                      placeholder="e.g. FR 89 123456789"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-bold"
                    >
                      Save Billing Profile
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-textMuted block">Name:</span>
                    <span className="text-white font-medium">{customerInfo.name || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-textMuted block">Company:</span>
                    <span className="text-white font-medium">{customerInfo.company || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-textMuted block">Email:</span>
                    <span className="text-white font-medium">{customerInfo.email || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-textMuted block">VAT ID:</span>
                    <span className="text-white font-medium">{customerInfo.vatId || 'Not specified'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Invoices List */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Official Receipts & Downloadable PDF Invoices
                </span>
                {invoices.length > 0 && (
                  <button
                    onClick={handleClearAllInvoices}
                    className="text-[11px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                    title="Remove all invoice receipts from local storage"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All Invoices</span>
                  </button>
                )}
              </div>

              {invoices.length === 0 ? (
                <div className="p-8 text-center text-textMuted text-xs flex flex-col items-center gap-2 bg-slate-900/40 rounded-2xl border border-borderColor">
                  <Receipt className="w-8 h-8 opacity-30 text-emerald-400" />
                  <span>
                    {isFreeBeta
                      ? 'Open Beta Access (100% Free) — No invoice is issued since no payment is required.'
                      : 'No official invoices or receipts recorded in this browser yet.'}
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-borderColor rounded-2xl border border-borderColor bg-slate-900/50 overflow-hidden">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-900/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{inv.invoiceNumber}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold">
                              PAID • {inv.paymentMethod}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-textMuted mt-0.5">
                            <span>{inv.planName}</span>
                            <span>•</span>
                            <span>Ref: {inv.orderId}</span>
                            <span>•</span>
                            <span>{new Date(inv.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white mr-1">
                          {inv.currency === 'EUR' ? '€' : inv.currency === 'GBP' ? '£' : inv.currency === 'JPY' ? '¥' : '$'}
                          {inv.amount} {inv.currency || 'USD'}
                        </span>
                        <button
                          onClick={() => handleDownloadInvoice(inv)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black text-xs font-extrabold shadow-neonCyan hover:scale-105 active:scale-95 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Clean PDF</span>
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv.id)}
                          aria-label={`Delete invoice ${inv.invoiceNumber} from vault`}
                          title="Remove invoice from vault"
                          className="p-2 text-textMuted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Plan & Pro CLI Token */}
        {activeTab === 'plan' && (
          <div className="flex flex-col gap-6">
            {ClientVault.isBetaPendingPaidUpgrade() && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-amber-300 block">Beta Period Concluded — Commercial Launch</span>
                    <span className="text-textMuted text-[11px]">Your Early Adopter Beta Pass has expired. Subscribe to maintain your unlimited benefits.</span>
                  </div>
                </div>
                {onOpenPayment && (
                  <button
                    onClick={() => onOpenPayment('pro')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex-shrink-0 cursor-pointer shadow-sm"
                  >
                    Activate Pro Subscription
                  </button>
                )}
              </div>
            )}
            {activePlan === 'vip' ? (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">VIP Developer Community Pass</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black uppercase tracking-wider">
                        Active • 100% FREE VIP
                      </span>
                    </div>
                    <p className="text-xs text-textMuted mt-0.5">
                      Session: <strong className="text-emerald-400 font-mono">{PromoManager.getVipCode() || 'ACTIVE'}</strong> • Linked to:{' '}
                      <span className="text-cyan-300 font-medium">{customerInfo.email || 'Sovereign Local Vault'}</span>
                    </p>
                    <p className="text-[11px] text-emerald-400/90 mt-1">
                      ✓ Unlimited migrations • Zero file size ceilings • Sovereign RAM Vault active
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-2xl font-black text-emeraldGlow">FREE</span>
                  <span className="text-[10px] text-textMuted">Lifetime Peer Access</span>
                </div>
              </div>
            ) : activePlan === 'team' ? (
              /* Highest Tier Active: Team & CI/CD Organization License */
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">Team & Agency License</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 text-black uppercase tracking-wider">
                        MAX TIER ACTIVE
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        5 SEATS INCLUDED
                      </span>
                    </div>
                    <p className="text-xs text-textMuted mt-0.5">
                      GitHub & GitLab CI/CD auto-sync, 5 team seats, SOC-2 DPA, and unlimited AST migrations.
                    </p>
                    <p className="text-[11px] text-purple-300/90 mt-1 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                      <span>CI/CD Workflow active: automated cross-platform parity on git push.</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div>
                    <span className="text-2xl font-black text-purple-300">
                      {CurrencyManager.getTierPrice('team', currency).formatted}
                    </span>
                    <span className="text-xs text-textMuted block">/ month</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    ✓ Highest Tier Unlocked
                  </span>
                </div>
              </div>
            ) : activePlan === 'pro' ? (
              /* Pro Developer Pass */
              <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 border border-cyanGlow/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyanGlow">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {ClientVault.isBetaEarlyAdopter()
                          ? 'Pro Developer Pass (Beta Member)'
                          : 'Pro Developer Pass (Active)'}
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-black">
                        {ClientVault.isBetaEarlyAdopter() && isFreeBeta
                          ? 'BETA • 100% FREE'
                          : 'UNLIMITED'}
                      </span>
                    </div>
                    <p className="text-xs text-textMuted mt-0.5">
                      {ClientVault.isBetaEarlyAdopter() && isFreeBeta
                        ? 'Full early adopter access: unlimited migrations (> 2 files), CLI Token, and RAM shields.'
                        : 'Unlimited AST migrations, CLI terminal sync, and zero file count ceilings.'}
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <div>
                    <span className="text-2xl font-black text-emeraldGlow">
                      {isFreeBeta && ClientVault.isBetaEarlyAdopter()
                        ? CurrencyManager.formatZero(currency)
                        : CurrencyManager.getTierPrice('pro', currency).formatted}
                    </span>
                    <span className="text-xs text-textMuted block">
                      {isFreeBeta && ClientVault.isBetaEarlyAdopter() ? 'Free during Beta' : '/ month'}
                    </span>
                  </div>
                  {onOpenPayment && !isFreeBeta && (
                    <button
                      onClick={() => onOpenPayment('team')}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Upgrade to Team ({CurrencyManager.getTierPrice('team', currency).formatted})
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Free Starter / Single Pass */
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-borderColor flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {activePlan === 'single' ? 'Pay-As-You-Go Pass (Active)' : 'Free Starter Tier'}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {activePlan === 'single' ? 'SINGLE PASS' : 'FREE'}
                      </span>
                    </div>
                    <p className="text-xs text-textMuted mt-0.5">
                      {activePlan === 'single'
                        ? 'Single project migration unlocked. Upgrade for unlimited daily migrations.'
                        : 'Free quick-transpiler active (up to 2 files per project).'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenPayment && (
                    <>
                      <button
                        onClick={() => onOpenPayment('pro')}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer"
                      >
                        Subscribe Pro ({CurrencyManager.getTierPrice('pro', currency).formatted})
                      </button>
                      <button
                        onClick={() => onOpenPayment('team')}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all cursor-pointer"
                      >
                        Team ({CurrencyManager.getTierPrice('team', currency).formatted})
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* CLI Token Access */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-borderColor flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Personal CLI Authentication Token
                </span>
              </div>
              <p className="text-xs text-textMuted">
                Use this sovereign token with the PromptShift CLI tool to port projects in terminal CI/CD:
              </p>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-borderColor font-mono text-xs text-slate-300">
                <span className="truncate flex-1">
                  {activeCliToken || 'Purchase a Single, Pro, or Team pass via Polar.sh to unlock your CLI license key'}
                </span>
                {activeCliToken && (
                  <button
                    onClick={handleCopyToken}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
                  >
                    {isCopiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedToken ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-textMuted">
                <code>
                  npx promptshift --to=claude --key={activeCliToken ? `${activeCliToken.slice(0, 14)}...` : '<YOUR_POLAR_ORDER_ID>'}
                </code>
              </div>
            </div>

            {/* Session & Device Disconnect */}
            {isSessionActive && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-borderColor flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Session & Device Disconnect
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out Device</span>
                  </button>
                </div>
                <p className="text-xs text-textMuted leading-relaxed">
                  Sign out of this browser session, clear customer credentials, and return this device to Free tier sandbox mode.
                </p>
              </div>
            )}
          </div>
        )}
            </div>
          </div>
        )}

        {/* Footer Guarantee & Purge Action - Motionless & Pinned */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-textMuted border-t border-borderColor pt-4 mt-auto flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sovereign Local Sandbox • 0 Cloud DBs • No Tracking Cookies</span>
          </div>

          <div className="flex items-center gap-3">
            {isPurgedToast && (
              <span className="text-xs text-emerald-400 font-bold animate-fadeIn">
                ✓ Local Vault wiped clean (0 items)
              </span>
            )}

            {/* Admin only Purge Vault action - Hidden from regular clients */}
            {isAdmin && (
              <button
                onClick={() => {
                  if (window.confirm("Admin Warning: Are you sure you want to purge the entire local vault?")) {
                    ClientVault.purgeVault();
                    setConversions([]);
                    setInvoices([]);
                    setCustomerInfo({ name: '', company: '', email: '', vatId: '' });
                    setIsPurgedToast(true);
                    setTimeout(() => setIsPurgedToast(false), 3500);
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-semibold transition-all cursor-pointer"
                title="Admin only action"
              >
                [Admin] Purge Vault
              </button>
            )}

            {!isSessionActive && isGuestBypass && AuthManager.hasRegisteredAccounts() ? (
              <button
                onClick={() => setIsGuestBypass(false)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                title="Lock sandbox and return to sign in"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In / Lock Vault</span>
              </button>
            ) : null}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Close Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
