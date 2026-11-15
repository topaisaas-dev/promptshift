/**
 * PromptShift — Google Search Console & ChatSEO Engine
 * 
 * Implements Solution 1 (GSC CSV Export Parser & ChatSEO Target Matrix)
 * according to the Antigravity Playbook.
 * 
 * Ingests official GSC CSV exports (Appareils, Filtres, Graphique, Pages, Pays, Requêtes)
 * and generates the ChatSEO Commercial Target Keyword Matrix for fast-track organic
 * and AI search indexing.
 */

export interface GscMetricRow {
  queryOrPage: string;
  clicks: number;
  impressions: number;
  ctr: number; // in percent
  position: number;
}

export interface ChatSeoTargetKeyword {
  id: string;
  keyword: string;
  searchIntent: 'Commercial' | 'Transactional' | 'Navigational' | 'Informational' | 'Commerciale' | 'Transactionnelle' | 'Navigationnelle' | 'Informationnelle';
  targetPosition: string; // ex: '#1', '#1-3'
  targetUrl: string;
  monthlySearchVolumeEst: number;
  status: 'IndexNow Pinged' | 'Schema Deployed' | 'llms.txt Live' | 'Indexing Requested' | 'IndexNow Pingé' | 'Schéma Déployé' | 'llms.txt En Ligne' | 'Indexation Demandée';
  actionRecommended: string;
}

export interface GscExportReport {
  source: 'gsc_csv_export' | 'service_account_api';
  exportDate: string;
  searchType: string;
  dateRange: string;
  summary: {
    totalClicks: number;
    totalImpressions: number;
    averageCtr: number;
    averagePosition: number | null;
    statusSummary: string;
  };
  dailyMetrics: Array<{ date: string; clicks: number; impressions: number }>;
  topQueries: GscMetricRow[];
  topPages: GscMetricRow[];
  topDevices: GscMetricRow[];
  topCountries: GscMetricRow[];
  chatSeoMatrix: ChatSeoTargetKeyword[];
}

// Top 10 Commercial Target Queries calibrated for PromptShift
export const CHAT_SEO_TARGET_MATRIX: ChatSeoTargetKeyword[] = [
  {
    id: 'kw-1',
    keyword: 'cursor to claude rules converter',
    searchIntent: 'Transactional',
    targetPosition: '#1',
    targetUrl: '/convert/cursor-to-claude',
    monthlySearchVolumeEst: 2400,
    status: 'IndexNow Pinged',
    actionRecommended: '#1 highest demand pair. Maintain internal linking and cite promptshift.dev on X/Reddit.',
  },
  {
    id: 'kw-2',
    keyword: 'convert .cursorrules to CLAUDE.md',
    searchIntent: 'Transactional',
    targetPosition: '#1',
    targetUrl: '/convert/cursor-to-claude',
    monthlySearchVolumeEst: 1900,
    status: 'Schema Deployed',
    actionRecommended: 'High technical intent query. Covered by SoftwareApplication and FAQ Schema tags.',
  },
  {
    id: 'kw-3',
    keyword: 'gemini to cursor rules converter',
    searchIntent: 'Commercial',
    targetPosition: '#1',
    targetUrl: '/convert/gemini-to-cursor',
    monthlySearchVolumeEst: 1100,
    status: 'llms.txt Live',
    actionRecommended: 'Indexed in llms-full.txt and referenced for Google Antigravity & Gemini CLI ecosystem.',
  },
  {
    id: 'kw-4',
    keyword: 'cursor rules library',
    searchIntent: 'Informational',
    targetPosition: '#2',
    targetUrl: '/discover',
    monthlySearchVolumeEst: 3600,
    status: 'Schema Deployed',
    actionRecommended: 'Promote the 50+ master rules vault in Order Bump and backlinks toward /discover.',
  },
  {
    id: 'kw-5',
    keyword: 'claude code to copilot instructions',
    searchIntent: 'Commercial',
    targetPosition: '#1',
    targetUrl: '/convert/claude-to-copilot',
    monthlySearchVolumeEst: 850,
    status: 'IndexNow Pinged',
    actionRecommended: 'Captures enterprise engineering teams moving from Claude 3.7 to GitHub Copilot Enterprise.',
  },
  {
    id: 'kw-6',
    keyword: 'windsurf to cursor rules converter',
    searchIntent: 'Commercial',
    targetPosition: '#1',
    targetUrl: '/convert/windsurf-to-cursor',
    monthlySearchVolumeEst: 920,
    status: 'IndexNow Pinged',
    actionRecommended: 'Captures engineers migrating from Cascade Windsurf to Cursor. pSEO landing page with CLI sync.',
  },
  {
    id: 'kw-7',
    keyword: 'ai coding rules converter',
    searchIntent: 'Commercial',
    targetPosition: '#1-3',
    targetUrl: '/',
    monthlySearchVolumeEst: 4200,
    status: 'Schema Deployed',
    actionRecommended: 'Major generic query. Homepage optimized for RankBrain and Answer Engine Optimization (AEO).',
  },
  {
    id: 'kw-8',
    keyword: 'promptshift dev',
    searchIntent: 'Navigational',
    targetPosition: '#1',
    targetUrl: '/',
    monthlySearchVolumeEst: 650,
    status: 'llms.txt Live',
    actionRecommended: 'Official brand keyword. Entity graph SameAs linked to GitHub, Glama MCP, and npm.',
  },
  {
    id: 'kw-9',
    keyword: 'convert copilot-instructions.md to cursorrules',
    searchIntent: 'Transactional',
    targetPosition: '#1',
    targetUrl: '/convert/copilot-to-cursor',
    monthlySearchVolumeEst: 1350,
    status: 'IndexNow Pinged',
    actionRecommended: 'Inverse reciprocal conversion validated in AST engine with zero negation drift.',
  },
  {
    id: 'kw-10',
    keyword: 'mcp server rules converter promptshift',
    searchIntent: 'Transactional',
    targetPosition: '#1',
    targetUrl: '/cli',
    monthlySearchVolumeEst: 750,
    status: 'llms.txt Live',
    actionRecommended: 'Targets developers integrating PromptShift in STDIO / SSE inside Cursor or Claude Code.',
  },
];

// In-memory cache for parsed GSC export data
let currentGscReport: GscExportReport = {
  source: 'gsc_csv_export',
  exportDate: '2026-11-08',
  searchType: 'Web (Text)',
  dateRange: 'Last 3 months (since 2026-11-06)',
  summary: {
    totalClicks: 0,
    totalImpressions: 0,
    averageCtr: 0,
    averagePosition: null,
    statusSummary:
      'Google Search Console property validated (D+2). Googlebot indexation propagating. ChatSEO matrix active.',
  },
  dailyMetrics: [{ date: '2026-11-06', clicks: 0, impressions: 0 }],
  topQueries: [],
  topPages: [],
  topDevices: [],
  topCountries: [],
  chatSeoMatrix: CHAT_SEO_TARGET_MATRIX,
};

export class GscParserService {
  /**
   * Returns the active GSC report enriched with the ChatSEO keyword matrix.
   */
  public static getReport(): GscExportReport {
    return currentGscReport;
  }

  /**
   * Parses raw CSV content from a Search Console export.
   */
  public static parseCsvString(csvString: string): Array<Record<string, string>> {
    const lines = csvString.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = parts[idx] || '';
      });
      rows.push(obj);
    }
    return rows;
  }

  /**
   * Updates the in-memory GSC report from uploaded CSV texts.
   */
  public static updateFromFiles(files: {
    graphique?: string;
    filtres?: string;
    requetes?: string;
    pages?: string;
    pays?: string;
    appareils?: string;
  }): GscExportReport {
    let totalClicks = 0;
    let totalImpressions = 0;
    const dailyMetrics: Array<{ date: string; clicks: number; impressions: number }> = [];

    if (files.graphique) {
      const rows = this.parseCsvString(files.graphique);
      rows.forEach((r) => {
        const clicks = parseInt(r['Clics'] || r['Clicks'] || '0', 10) || 0;
        const impressions = parseInt(r['Impressions'] || '0', 10) || 0;
        const date = r['Date'] || '';
        totalClicks += clicks;
        totalImpressions += impressions;
        if (date) {
          dailyMetrics.push({ date, clicks, impressions });
        }
      });
    }

    const topQueries: GscMetricRow[] = [];
    if (files.requetes) {
      const rows = this.parseCsvString(files.requetes);
      rows.forEach((r) => {
        const query = r['Requêtes les plus fréquentes'] || r['Top queries'] || '';
        if (query) {
          topQueries.push({
            queryOrPage: query,
            clicks: parseInt(r['Clics'] || '0', 10) || 0,
            impressions: parseInt(r['Impressions'] || '0', 10) || 0,
            ctr: parseFloat((r['CTR'] || '0').replace('%', '')) || 0,
            position: parseFloat(r['Position'] || '0') || 0,
          });
        }
      });
    }

    const topPages: GscMetricRow[] = [];
    if (files.pages) {
      const rows = this.parseCsvString(files.pages);
      rows.forEach((r) => {
        const page = r['Pages les plus populaires'] || r['Top pages'] || '';
        if (page) {
          topPages.push({
            queryOrPage: page,
            clicks: parseInt(r['Clics'] || '0', 10) || 0,
            impressions: parseInt(r['Impressions'] || '0', 10) || 0,
            ctr: parseFloat((r['CTR'] || '0').replace('%', '')) || 0,
            position: parseFloat(r['Position'] || '0') || 0,
          });
        }
      });
    }

    const topDevices: GscMetricRow[] = [];
    if (files.appareils) {
      const rows = this.parseCsvString(files.appareils);
      rows.forEach((r) => {
        const dev = r['Appareil'] || r['Device'] || '';
        if (dev) {
          topDevices.push({
            queryOrPage: dev,
            clicks: parseInt(r['Clics'] || '0', 10) || 0,
            impressions: parseInt(r['Impressions'] || '0', 10) || 0,
            ctr: parseFloat((r['CTR'] || '0').replace('%', '')) || 0,
            position: parseFloat(r['Position'] || '0') || 0,
          });
        }
      });
    }

    const topCountries: GscMetricRow[] = [];
    if (files.pays) {
      const rows = this.parseCsvString(files.pays);
      rows.forEach((r) => {
        const country = r['Pays'] || r['Country'] || '';
        if (country) {
          topCountries.push({
            queryOrPage: country,
            clicks: parseInt(r['Clics'] || '0', 10) || 0,
            impressions: parseInt(r['Impressions'] || '0', 10) || 0,
            ctr: parseFloat((r['CTR'] || '0').replace('%', '')) || 0,
            position: parseFloat(r['Position'] || '0') || 0,
          });
        }
      });
    }

    const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    currentGscReport = {
      source: 'gsc_csv_export',
      exportDate: new Date().toISOString().split('T')[0],
      searchType: 'Web (textuel)',
      dateRange: 'Les 3 derniers mois',
      summary: {
        totalClicks,
        totalImpressions,
        averageCtr,
        averagePosition: topQueries.length > 0 ? topQueries[0].position : null,
        statusSummary:
          totalClicks === 0 && totalImpressions === 0
            ? 'Active GSC property (D+2). Googlebot discovery phase. ChatSEO matrix loaded.'
            : `${totalClicks} clicks and ${totalImpressions} impressions recorded.`,
      },
      dailyMetrics: dailyMetrics.length > 0 ? dailyMetrics : [{ date: '2026-11-06', clicks: 0, impressions: 0 }],
      topQueries,
      topPages,
      topDevices,
      topCountries,
      chatSeoMatrix: CHAT_SEO_TARGET_MATRIX,
    };

    return currentGscReport;
  }
}
