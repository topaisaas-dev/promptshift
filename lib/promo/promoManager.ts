'use client';

/**
 * Sovereign Admin Preview & Discount Policy Manager
 * All commercial discount codes are validated strictly server-side on Polar.sh Checkout.
 * Zero hardcoded public bypass codes exist in client JavaScript.
 * Admin preview mode can only be toggled locally from the authenticated /bouboule console.
 */

export interface PromoValidationResult {
  valid: boolean;
  code: string;
  discountPercent: number;
  description: string;
  passType: 'vip_pro' | 'free_single';
}

const ADMIN_PREVIEW_KEY = 'promptshift_admin_preview';

export class PromoManager {
  /**
   * Public client-side promo validation is disabled (discount codes apply strictly on Polar.sh).
   */
  public static validate(inputCode: string): PromoValidationResult {
    const normalized = (inputCode || '').trim().toUpperCase();
    return {
      valid: false,
      code: normalized,
      discountPercent: 0,
      description: 'Apply official discount codes directly on Polar.sh checkout.',
      passType: 'free_single',
    };
  }

  /**
   * Activates local Admin Preview mode (invoked strictly by authenticated /bouboule cockpit).
   */
  public static activateAdminPreview(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(ADMIN_PREVIEW_KEY, 'true');
      localStorage.setItem('promptshift_active_plan', 'pro');

      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(
          new CustomEvent('promptshift_vip_activated', { detail: { code: 'ADMIN_PREVIEW' } })
        );
        window.dispatchEvent(
          new CustomEvent('promptshift_plan_changed', { detail: 'pro' })
        );
      }
    } catch (e) {
      console.warn('Failed to activate admin preview in browser storage:', e);
    }
  }

  /**
   * Backwards-compatible no-op for legacy callers (never unlocks public free access).
   */
  public static activateVip(_code: string): void {
    // Public promo bypass intentionally removed to prevent revenue leakage.
  }

  /**
   * Deactivates admin preview mode and resets client plan to free
   */
  public static deactivateVip(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(ADMIN_PREVIEW_KEY);
      localStorage.removeItem('promptshift_vip_status');
      localStorage.removeItem('promptshift_vip_code');
      localStorage.setItem('promptshift_active_plan', 'free');

      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(
          new CustomEvent('promptshift_plan_changed', { detail: 'free' })
        );
      }
    } catch (e) {
      console.warn('Failed to deactivate preview pass in browser storage:', e);
    }
  }

  /**
   * Checks if authenticated Admin Preview mode is active in this tab
   */
  public static isVipActive(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(ADMIN_PREVIEW_KEY) === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Returns active preview label if present
   */
  public static getVipCode(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(ADMIN_PREVIEW_KEY) === 'true' ? 'ADMIN_PREVIEW' : null;
    } catch {
      return null;
    }
  }

  /**
   * URL query promo bypass disabled (all discounts are handled server-side on Polar.sh).
   */
  public static checkUrlForPromo(): PromoValidationResult | null {
    return null;
  }
}
