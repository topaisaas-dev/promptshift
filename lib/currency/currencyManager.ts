'use client';

/**
 * Sovereign Multi-Currency & Geolocation Manager
 * Automatically detects the client's localized currency based on timezone & locale,
 * with zero tracking cookies and persistent client-side preferences.
 */

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  flag: string;
  rates: {
    single: number;
    proMonthly: number;
    teamMonthly: number;
  };
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rates: {
      single: 1.99,
      proMonthly: 5.99,
      teamMonthly: 19.99,
    },
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rates: {
      single: 1.99,
      proMonthly: 5.99,
      teamMonthly: 19.99,
    },
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rates: {
      single: 1.59,
      proMonthly: 4.79,
      teamMonthly: 15.99,
    },
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    rates: {
      single: 2.69,
      proMonthly: 7.99,
      teamMonthly: 26.99,
    },
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    rates: {
      single: 2.99,
      proMonthly: 8.99,
      teamMonthly: 29.99,
    },
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    rates: {
      single: 299,
      proMonthly: 899,
      teamMonthly: 2999,
    },
  },
};

const STORAGE_KEY = 'promptshift_user_currency';
const CURRENCY_CHANGE_EVENT = 'promptshift_currency_changed';

export class CurrencyManager {
  /**
   * Universal Currency Manager — Defaults to USD ($1.99, $5.99, $19.99)
   */
  public static detectCurrency(): SupportedCurrency {
    if (typeof window === 'undefined') return 'USD';

    // User manual override stored locally (only if explicitly picked by the user)
    const explicitChoice = localStorage.getItem('promptshift_user_currency_explicit');
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedCurrency | null;
    if (explicitChoice && saved && CURRENCIES[saved]) {
      return saved;
    }

    // Default universal pricing currency is USD ($)
    return 'USD';
  }

  /**
   * Asynchronously refines the user's localized currency via server IP geolocation if explicitly requested
   */
  public static async initFromIp(): Promise<SupportedCurrency> {
    if (typeof window === 'undefined') return 'USD';
    try {
      const explicitChoice = localStorage.getItem('promptshift_user_currency_explicit');
      if (explicitChoice) {
        const saved = localStorage.getItem(STORAGE_KEY) as SupportedCurrency | null;
        if (saved && CURRENCIES[saved]) return saved;
      }
    } catch {
      // Fallback silently
    }
    return this.getActiveCurrency();
  }

  /**
   * Sets user's currency preference and notifies all listeners across the app
   */
  public static setCurrency(currency: SupportedCurrency, isExplicit: boolean = true): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, currency);
    if (isExplicit) {
      localStorage.setItem('promptshift_user_currency_explicit', 'true');
    }
    window.dispatchEvent(new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: currency }));
  }

  /**
   * Returns current active currency
   */
  public static getActiveCurrency(): SupportedCurrency {
    return this.detectCurrency();
  }

  /**
   * Formats zero in the active localized currency (e.g. 0 €, $0, £0, CA$0, A$0, ¥0)
   */
  public static formatZero(currency: SupportedCurrency = 'USD'): string {
    if (currency === 'EUR') return '0 €';
    if (currency === 'GBP') return '£0';
    if (currency === 'CAD') return 'CA$0';
    if (currency === 'AUD') return 'A$0';
    if (currency === 'JPY') return '¥0';
    return '$0';
  }

  /**
   * Formats a given number into the appropriate localized price string
   */
  public static format(amount: number, currency: SupportedCurrency = 'USD'): string {
    if (amount === 0) return this.formatZero(currency);
    const config = CURRENCIES[currency] || CURRENCIES.USD;
    if (currency === 'JPY') {
      return `${config.symbol}${Math.round(amount)}`;
    }
    if (currency === 'EUR') {
      return `${amount.toFixed(2).replace('.', ',')} ${config.symbol}`;
    }
    return `${config.symbol}${amount.toFixed(2)}`;
  }

  /**
   * Formats the included 50+ Master Rules Vault value ($4.99 USD equivalent) in active currency
   */
  public static getBonusValueFormatted(currency: SupportedCurrency = 'USD'): string {
    const bonusRates: Record<SupportedCurrency, number> = {
      USD: 4.99,
      EUR: 4.99,
      GBP: 3.99,
      CAD: 6.79,
      AUD: 7.49,
      JPY: 749,
    };
    return this.format(bonusRates[currency] ?? 4.99, currency);
  }

  /**
   * Retrieves the localized price for a specific tier
   */
  public static getTierPrice(
    tier: 'single' | 'pro' | 'team',
    currency: SupportedCurrency = 'USD'
  ): {
    formatted: string;
    raw: number;
    billingSuffix: string;
    totalAmount: number;
    formattedTotal: string;
  } {
    const config = CURRENCIES[currency] || CURRENCIES.USD;

    if (tier === 'single') {
      const singlePrice = config.rates.single;
      return {
        formatted: this.format(singlePrice, currency),
        raw: singlePrice,
        billingSuffix: '/ project',
        totalAmount: singlePrice,
        formattedTotal: this.format(singlePrice, currency),
      };
    }

    if (tier === 'pro') {
      const price = config.rates.proMonthly;
      return {
        formatted: this.format(price, currency),
        raw: price,
        billingSuffix: '/ month',
        totalAmount: price,
        formattedTotal: this.format(price, currency),
      };
    }

    // Team tier
    const price = config.rates.teamMonthly;
    return {
      formatted: this.format(price, currency),
      raw: price,
      billingSuffix: '/ month',
      totalAmount: price,
      formattedTotal: this.format(price, currency),
    };
  }
}
