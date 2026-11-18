'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { PromoManager } from '@/lib/promo/promoManager';
import { ClientVault } from '@/lib/storage/clientVault';

/**
 * Renders an unobtrusive banner ONLY when an authenticated /bouboule administrator
 * explicitly enables local Admin Preview Mode in this browser tab.
 */
export const VipPromoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const syncState = () => {
      setIsVisible(PromoManager.isVipActive());
    };

    syncState();
    window.addEventListener('promptshift_vip_activated', syncState);
    window.addEventListener('promptshift_plan_changed', syncState);
    return () => {
      window.removeEventListener('promptshift_vip_activated', syncState);
      window.removeEventListener('promptshift_plan_changed', syncState);
    };
  }, []);

  if (!isVisible) return null;

  const handleExitPreview = () => {
    PromoManager.deactivateVip();
    ClientVault.clearSessionData();
    setIsVisible(false);
  };

  return (
    <aside
      aria-label="Admin Preview Mode"
      className="w-full bg-gradient-to-r from-emerald-950/90 via-slate-900 to-cyan-950/90 border-b border-emerald-500/40 px-4 py-2 text-white animate-fadeIn sticky top-0 z-50 shadow-lg backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>ADMIN SANDBOX PREVIEW</span>
          </div>

          <span className="font-semibold text-slate-200">
            Local Pro preview session active from Command Center (zero synthetic orders recorded).
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleExitPreview}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] border border-slate-700 cursor-pointer transition-colors"
          >
            Exit Preview
          </button>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            aria-label="Hide admin preview banner"
            className="p-1 rounded-lg text-textMuted hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
};
