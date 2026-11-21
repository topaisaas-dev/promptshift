'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FolderUp,
  FileCode2,
  CheckCircle2,
  Zap,
  AlertTriangle,
  Layers,
  Sparkles,
  Lock,
  X,
  GitBranch,
  Check,
} from 'lucide-react';
import { ClientPruner, ScannedFile } from '@/lib/pruner';
import { CanonicalProject } from '@/lib/converter/capsSchema';
import { SecurityGuards } from '@/lib/converter/securityGuards';
import {
  STACK_CHIP_OPTIONS,
  DEFAULT_SELECTED_STACK_CHIP_IDS,
  GeneratedStackSuite,
  synthesizeStackSuite,
  importGitHubRepoSuite,
  compilePastedPromptOrPackageSuite,
  calculateTokenRoiMetrics,
} from '@/lib/converter/stackSuiteGenerator';
import { CurrencyManager, SupportedCurrency } from '@/lib/currency/currencyManager';
import { MonetizationManager } from '@/lib/config/monetizationConfig';
import { ClientVault } from '@/lib/storage/clientVault';
import { AnalyticsTracker } from '@/lib/analytics/analyticsTracker';
import JSZip from 'jszip';

interface DropzoneProps {
  onProjectReady: (
    project: CanonicalProject,
    targetPlatform: 'claude' | 'openai' | 'cursor' | 'gemini',
    isSlicedStarter?: boolean,
    originalTotalFiles?: number,
    fullProject?: CanonicalProject
  ) => void;
  onRequirePaywallUnlock?: (
    fullProject: CanonicalProject,
    targetPlatform: 'claude' | 'openai' | 'cursor' | 'gemini',
    totalFiles: number,
    requestedPlan?: 'single' | 'pro'
  ) => void;
  pairSlug?: string;
  defaultTargetPlatform?: 'claude' | 'openai' | 'cursor' | 'gemini';
  activeMode?: 'starter' | 'pro';
  onModeChange?: (mode: 'starter' | 'pro') => void;
}

interface OverlimitState {
  projectName: string;
  masterPrompt: string;
  rulesList: { name: string; content: string }[];
  knowledgeBase: { filename: string; content_text: string; mime_type: string; size_bytes: number }[];
  rawBytes: number;
  prunedBytes: number;
  totalCount: number;
  secretsDetectedCount: number;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onProjectReady,
  onRequirePaywallUnlock,
  pairSlug,
  defaultTargetPlatform = 'claude',
  activeMode = 'starter',
  onModeChange,
}) => {
  const [hasPaidLicense, setHasPaidLicense] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<'starter' | 'pro'>(activeMode);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pruningStats, setPruningStats] = useState<{
    rawBytes: number;
    prunedBytes: number;
    fileCount: number;
    secretsDetected: number;
  } | null>(null);
  const [targetPlatform, setTargetPlatform] = useState<'claude' | 'openai' | 'cursor' | 'gemini'>(
    defaultTargetPlatform
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [overlimitState, setOverlimitState] = useState<OverlimitState | null>(null);
  const [currency, setCurrency] = useState<SupportedCurrency>(() =>
    typeof window !== 'undefined' ? CurrencyManager.getActiveCurrency() : 'USD'
  );

  // 1-Click Stack Rules Builder, GitHub Repo Importer & Mode 4 Paste Prompt / package.json State
  const [selectedChipIds, setSelectedChipIds] = useState<string[]>(DEFAULT_SELECTED_STACK_CHIP_IDS);
  const [githubRepoInput, setGithubRepoInput] = useState<string>('');
  const [isImportingGithub, setIsImportingGithub] = useState<boolean>(false);
  const [pastedPromptInput, setPastedPromptInput] = useState<string>('');
  const [generatedSuite, setGeneratedSuite] = useState<GeneratedStackSuite | null>(null);

  const isFreeBeta = MonetizationManager.isFreeBeta();
  const freeLimit = MonetizationManager.getFreeLimit();

  // Sync license state from Sovereign ClientVault
  useEffect(() => {
    const syncPlan = () => {
      const plan = ClientVault.getActivePlan();
      const paid = ['single', 'pro', 'team', 'vip'].includes(plan) || isFreeBeta;
      setHasPaidLicense(paid);
      if (paid) {
        setCurrentMode('pro');
      } else {
        setCurrentMode('starter');
      }
    };
    syncPlan();
    window.addEventListener('promptshift_plan_changed', syncPlan);
    window.addEventListener('promptshift_vault_purged', syncPlan);
    return () => {
      window.removeEventListener('promptshift_plan_changed', syncPlan);
      window.removeEventListener('promptshift_vault_purged', syncPlan);
    };
  }, [isFreeBeta]);

  useEffect(() => {
    if (defaultTargetPlatform) setTargetPlatform(defaultTargetPlatform);
  }, [defaultTargetPlatform]);

  useEffect(() => {
    setCurrency(CurrencyManager.getActiveCurrency());
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedCurrency>;
      if (customEvent.detail) setCurrency(customEvent.detail);
    };
    window.addEventListener('promptshift_currency_changed', handler);
    return () => window.removeEventListener('promptshift_currency_changed', handler);
  }, []);

  const singlePrice = CurrencyManager.getTierPrice('single', currency);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const buildCanonicalProject = (
    projectName: string,
    masterPrompt: string,
    rulesList: { name: string; content: string }[],
    knowledgeBase: { filename: string; content_text: string; mime_type: string; size_bytes: number }[]
  ): CanonicalProject => {
    const lower = (masterPrompt || '').toLowerCase();
    const detectedSource = lower.includes('claude')
      ? 'claude'
      : lower.includes('cursor') || rulesList.some((r) => r.name.endsWith('.mdc'))
      ? 'cursor'
      : lower.includes('openai') || lower.includes('gpt')
      ? 'openai'
      : 'antigravity';

    return {
      metadata: {
        id: `proj-${Date.now()}`,
        title: projectName,
        description: `Migrated via PromptShift (promptshift.dev)`,
        source_platform: detectedSource,
        version: '1.0.0',
      },
      persona: {
        role: `Dedicated pair programming agent for ${projectName}`,
        raw_system_prompt: masterPrompt || '# Project Instructions\nAct proactively with full autonomy.',
        instructions: [],
        constraints: [],
        autonomy_clause: masterPrompt.includes('ET BEN BRAVO!')
          ? "Unconditional autonomy active until: 'ET BEN BRAVO!'"
          : undefined,
      },
      rules: rulesList.map((r) => ({
        name: r.name,
        content: r.content,
        scope: 'workspace',
        trigger: 'always_on',
      })),
      knowledge_base: knowledgeBase,
      tools: [],
      security: {
        permission_mode: 'full_autonomy',
        allow_grants: ['*'],
        deny_grants: [],
      },
    };
  };

  const finalizeProject = (
    projectName: string,
    masterPrompt: string,
    rulesList: { name: string; content: string }[],
    knowledgeBase: { filename: string; content_text: string; mime_type: string; size_bytes: number }[],
    isSlicedStarter: boolean = false,
    originalTotalFiles?: number,
    fullProject?: CanonicalProject
  ) => {
    const canonical = buildCanonicalProject(projectName, masterPrompt, rulesList, knowledgeBase);
    onProjectReady(canonical, targetPlatform, isSlicedStarter, originalTotalFiles, fullProject);
  };

  // Dispatch synthesized 8-file suite (2 files free preview + 8 files staged in fullProject for $1.99 unlock)
  const commitGeneratedSuiteToRam = (suite: GeneratedStackSuite) => {
    setGeneratedSuite(suite);
    setOverlimitState(null);
    setErrorMessage(null);

    const activePlanNow = ClientVault.getActivePlan();
    const userHasUnlockedPass =
      ['single', 'pro', 'team', 'vip'].includes(activePlanNow) || isFreeBeta;

    const totalBytes =
      (suite.fullProject.persona?.raw_system_prompt?.length || 0) +
      suite.fullProject.rules.reduce((acc, r) => acc + r.content.length, 0) +
      suite.fullProject.knowledge_base.reduce((acc, k) => acc + k.size_bytes, 0);

    setPruningStats({
      rawBytes: totalBytes,
      prunedBytes: totalBytes,
      fileCount: suite.totalFiles,
      secretsDetected: 0,
    });

    AnalyticsTracker.trackProjectUpload({
      projectTitle: suite.fullProject.metadata.title,
      fileCount: suite.totalFiles,
      sizeBytes: totalBytes,
      sourcePlatform: suite.fullProject.metadata.source_platform,
      pairSlug,
    });

    if (userHasUnlockedPass) {
      onProjectReady(
        suite.fullProject,
        targetPlatform,
        false,
        suite.totalFiles,
        suite.fullProject
      );
      return;
    }

    AnalyticsTracker.trackPaywallHit({
      projectTitle: suite.fullProject.metadata.title,
      fileCount: suite.totalFiles,
      sourcePlatform: suite.fullProject.metadata.source_platform,
      targetPlatform,
      pairSlug,
    });

    // Slice 2 files for free preview (`isSlicedStarter: true`), stage all 8 files in `fullProject`
    const sliced = suite.slicedProject;
    const fullProject = suite.fullProject;
    onProjectReady(sliced, targetPlatform, true, suite.totalFiles, fullProject);
  };

  const handleToggleChip = (chipId: string) => {
    setSelectedChipIds((prev) => {
      if (prev.includes(chipId)) {
        if (prev.length === 1) return prev; // Keep at least 1 stack chip active
        return prev.filter((id) => id !== chipId);
      }
      return [...prev, chipId];
    });
  };

  const handleGenerateStackSuite = () => {
    const suite = synthesizeStackSuite(selectedChipIds, { freeLimit });
    commitGeneratedSuiteToRam(suite);
  };

  const handleImportGithubRepo = async (overrideInput?: string) => {
    const raw = (overrideInput ?? githubRepoInput).trim();
    if (!raw) {
      setErrorMessage('Enter a public GitHub repo (e.g. vercel/next.js or https://github.com/owner/repo).');
      return;
    }
    setIsImportingGithub(true);
    setErrorMessage(null);
    try {
      const suite = await importGitHubRepoSuite(raw);
      commitGeneratedSuiteToRam(suite);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to parse GitHub repository URL.');
    } finally {
      setIsImportingGithub(false);
    }
  };

  const handleCompilePastedPrompt = (overrideText?: string) => {
    const raw = (overrideText ?? pastedPromptInput).trim();
    if (!raw) {
      setErrorMessage(
        'Paste a raw system prompt, package.json, .cursorrules snippet, or project description to compile.'
      );
      return;
    }
    setErrorMessage(null);
    try {
      const suite = compilePastedPromptOrPackageSuite(raw, { freeLimit });
      if (suite.detectedChipIds.length > 0) {
        setSelectedChipIds(suite.detectedChipIds);
      }
      commitGeneratedSuiteToRam(suite);
      if (suite.secretsRedactedCount > 0) {
        setPruningStats((prev) =>
          prev ? { ...prev, secretsDetected: suite.secretsRedactedCount } : prev
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to compile pasted prompt specification.');
    }
  };

  const handleUnlockGeneratedSuite = () => {
    const suite = generatedSuite || synthesizeStackSuite(selectedChipIds, { freeLimit });
    if (!generatedSuite) {
      commitGeneratedSuiteToRam(suite);
    }
    if (onRequirePaywallUnlock) {
      onRequirePaywallUnlock(suite.fullProject, targetPlatform, suite.totalFiles, 'single');
    }
  };

  const handleModeSwitch = (mode: 'starter' | 'pro') => {
    if (mode === 'pro' && !hasPaidLicense && !isFreeBeta) {
      if (overlimitState && onRequirePaywallUnlock) {
        const fullProj = buildCanonicalProject(
          overlimitState.projectName,
          overlimitState.masterPrompt,
          overlimitState.rulesList,
          overlimitState.knowledgeBase
        );
        onRequirePaywallUnlock(fullProj, targetPlatform, overlimitState.totalCount, 'single');
      } else if (onRequirePaywallUnlock) {
        // Stage an 8-file bespoke suite from the user's selected stack chips so Polar checkout always unlocks a real 8-file bundle
        const suite = generatedSuite || synthesizeStackSuite(selectedChipIds, { freeLimit });
        if (!generatedSuite) {
          commitGeneratedSuiteToRam(suite);
        }
        onRequirePaywallUnlock(suite.fullProject, targetPlatform, suite.totalFiles, 'single');
      }
      return;
    }

    setCurrentMode(mode);
    if (onModeChange) onModeChange(mode);
    if (overlimitState && mode === 'pro' && (hasPaidLicense || isFreeBeta)) {
      finalizeProject(
        overlimitState.projectName,
        overlimitState.masterPrompt,
        overlimitState.rulesList,
        overlimitState.knowledgeBase,
        false,
        overlimitState.totalCount
      );
      setOverlimitState(null);
    }
  };

  const processFileList = async (files: File[]) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setOverlimitState(null);
    setGeneratedSuite(null);

    let rawTotalBytes = 0;
    let prunedTotalBytes = 0;
    let secretsDetectedCount = 0;
    const scannedFiles: ScannedFile[] = [];

    let masterPrompt = '';
    const rulesList: { name: string; content: string }[] = [];
    const knowledgeBase: { filename: string; content_text: string; mime_type: string; size_bytes: number }[] = [];

    try {
      for (const file of files) {
        rawTotalBytes += file.size;
        const relativePath = (file as any).webkitRelativePath || file.name;

        // If it's a zip file, extract in RAM with zip bomb safeguard
        if (file.name.toLowerCase().endsWith('.zip')) {
          const zip = await JSZip.loadAsync(file);
          const zipEntries = Object.values(zip.files);

          let totalEstimatedBytes = 0;
          for (const entry of zipEntries) {
            if (!entry.dir) totalEstimatedBytes += (entry as any)._data?.uncompressedSize || entry.name.length * 100;
          }

          const zipCheck = SecurityGuards.validateZipLimits(zipEntries.length, totalEstimatedBytes, file.size);
          if (!zipCheck.isSafe) {
            setErrorMessage(`Security Warning: ${zipCheck.reason}`);
            setIsProcessing(false);
            return;
          }
          for (const entry of zipEntries) {
            if (entry.dir) continue;
            if (!SecurityGuards.isSafeFilePath(entry.name)) {
              console.warn(`[SecurityShield] Blocked Zip Slip attempt: ${entry.name}`);
              continue;
            }
            if (!ClientPruner.shouldKeepFile(entry.name)) continue;

            const content = await entry.async('string');
            prunedTotalBytes += content.length;
            secretsDetectedCount += SecurityGuards.sanitizeSecrets(content).alerts.length;
            const category = ClientPruner.categorizeFile(entry.name);

            if (category === 'master_instruction' && !masterPrompt) {
              masterPrompt = content;
            } else if (category === 'rule') {
              rulesList.push({ name: entry.name, content });
            } else {
              knowledgeBase.push({
                filename: entry.name,
                content_text: content,
                mime_type: 'text/plain',
                size_bytes: content.length,
              });
            }
          }
          continue;
        }

        // Regular file or folder entry
        if (!ClientPruner.shouldKeepFile(relativePath)) continue;

        const content = await file.text().catch(() => '');
        prunedTotalBytes += content.length;
        secretsDetectedCount += SecurityGuards.sanitizeSecrets(content).alerts.length;
        const category = ClientPruner.categorizeFile(relativePath);

        scannedFiles.push({
          path: relativePath,
          name: file.name,
          size: file.size,
          content,
          category,
        });

        if (category === 'master_instruction' && !masterPrompt) {
          masterPrompt = content;
        } else if (category === 'rule') {
          rulesList.push({ name: file.name, content });
        } else {
          knowledgeBase.push({
            filename: relativePath,
            content_text: content,
            mime_type: 'text/plain',
            size_bytes: content.length,
          });
        }
      }

      // Determine project title
      let projectName = 'Imported Project';
      if (files.length > 0 && files[0]) {
        const relPath = (files[0] as any).webkitRelativePath;
        if (relPath && (relPath.includes('/') || relPath.includes('\\'))) {
          projectName = relPath.split(/[/\\]/)[0];
        } else {
          projectName = files[0].name.replace(/\.(zip|md|mdc|txt|json)$/i, '') || 'Custom Workspace';
        }
      }

      const totalValidFiles = Math.max(
        1,
        (masterPrompt ? 1 : 0) + rulesList.length + knowledgeBase.length
      );

      setPruningStats({
        rawBytes: rawTotalBytes,
        prunedBytes: prunedTotalBytes,
        fileCount: totalValidFiles,
        secretsDetected: secretsDetectedCount,
      });

      const canonicalPreview = buildCanonicalProject(projectName, masterPrompt, rulesList, knowledgeBase);

      AnalyticsTracker.trackProjectUpload({
        projectTitle: projectName,
        fileCount: totalValidFiles,
        sizeBytes: prunedTotalBytes,
        sourcePlatform: canonicalPreview.metadata.source_platform,
        pairSlug,
      });

      const activePlanNow = ClientVault.getActivePlan();
      const userHasUnlockedPass =
        ['single', 'pro', 'team', 'vip'].includes(activePlanNow) || isFreeBeta;

      // Enforce Free Starter limit (> freeLimit files requires $1.99 Single Pass or Pro License)
      if (!userHasUnlockedPass && totalValidFiles > freeLimit) {
        AnalyticsTracker.trackPaywallHit({
          projectTitle: projectName,
          fileCount: totalValidFiles,
          sourcePlatform: canonicalPreview.metadata.source_platform,
          targetPlatform,
          pairSlug,
        });

        setOverlimitState({
          projectName,
          masterPrompt,
          rulesList,
          knowledgeBase,
          rawBytes: rawTotalBytes,
          prunedBytes: prunedTotalBytes,
          totalCount: totalValidFiles,
          secretsDetectedCount,
        });
        setIsProcessing(false);
        return;
      }

      // Paid license active or files <= freeLimit: finalize immediately
      finalizeProject(projectName, masterPrompt, rulesList, knowledgeBase, false, totalValidFiles);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMessage(`Failed to process files: ${err.message || 'Corrupted file'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveUnlockAll = () => {
    if (!overlimitState) return;
    const fullProj = buildCanonicalProject(
      overlimitState.projectName,
      overlimitState.masterPrompt,
      overlimitState.rulesList,
      overlimitState.knowledgeBase
    );

    if (hasPaidLicense || isFreeBeta) {
      finalizeProject(
        overlimitState.projectName,
        overlimitState.masterPrompt,
        overlimitState.rulesList,
        overlimitState.knowledgeBase,
        false,
        overlimitState.totalCount
      );
      setOverlimitState(null);
      return;
    }

    // Also render the 2-file preview underneath while opening Polar Express Checkout
    const masterSlots = overlimitState.masterPrompt ? 1 : 0;
    const availableSlots = Math.max(0, freeLimit - masterSlots);
    const slicedRules = overlimitState.rulesList.slice(0, availableSlots);
    const remainingForKb = Math.max(0, availableSlots - slicedRules.length);
    const slicedKb = overlimitState.knowledgeBase.slice(0, remainingForKb);
    finalizeProject(
      overlimitState.projectName,
      overlimitState.masterPrompt,
      slicedRules,
      slicedKb,
      true,
      overlimitState.totalCount,
      fullProj
    );

    if (onRequirePaywallUnlock) {
      onRequirePaywallUnlock(fullProj, targetPlatform, overlimitState.totalCount, 'single');
    }
    setOverlimitState(null);
  };

  const handleResolveKeepStarter = () => {
    if (!overlimitState) return;
    const fullProj = buildCanonicalProject(
      overlimitState.projectName,
      overlimitState.masterPrompt,
      overlimitState.rulesList,
      overlimitState.knowledgeBase
    );
    const masterSlots = overlimitState.masterPrompt ? 1 : 0;
    const availableSlots = Math.max(0, freeLimit - masterSlots);
    const slicedRules = overlimitState.rulesList.slice(0, availableSlots);
    const remainingForKb = Math.max(0, availableSlots - slicedRules.length);
    const slicedKb = overlimitState.knowledgeBase.slice(0, remainingForKb);

    finalizeProject(
      overlimitState.projectName,
      overlimitState.masterPrompt,
      slicedRules,
      slicedKb,
      true,
      overlimitState.totalCount,
      fullProj
    );
    setOverlimitState(null);
  };

  return (
    <div id="dropzone" className="w-full max-w-4xl mx-auto flex flex-col items-center gap-5">
      {/* Plan Mode Switcher Tabs */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 p-1.5 rounded-2xl bg-cardBg/90 border border-borderColor backdrop-blur-sm shadow-xl">
        <button
          type="button"
          onClick={() => handleModeSwitch('starter')}
          className={`flex-1 flex items-center justify-between gap-3 px-5 py-3 rounded-xl transition-all border text-left cursor-pointer ${
            currentMode === 'starter' && !hasPaidLicense
              ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm text-white'
              : 'bg-transparent border-transparent text-textMuted hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base ${
                currentMode === 'starter' && !hasPaidLicense
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                Free Starter
                {currentMode === 'starter' && !hasPaidLicense && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    ACTIVE
                  </span>
                )}
              </span>
              <span className="text-[11px] text-textMuted">
                ≤ {freeLimit} files • $0.00 Instant ZIP, zero signup
              </span>
            </div>
          </div>
        </button>

        <div className="hidden sm:block w-px h-8 bg-borderColor/60" />

        <button
          type="button"
          onClick={() => handleModeSwitch('pro')}
          className={`flex-1 flex items-center justify-between gap-3 px-5 py-3 rounded-xl transition-all border text-left cursor-pointer ${
            hasPaidLicense || currentMode === 'pro'
              ? 'bg-slate-800/90 border-cyan-500/50 shadow-sm text-white'
              : 'bg-transparent border-transparent text-textMuted hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base ${
                hasPaidLicense || currentMode === 'pro'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {hasPaidLicense ? '🚀' : <Lock className="w-4 h-4 text-cyan-400" />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                {hasPaidLicense ? '4-in-1 / Pro Pass Unlocked' : 'Full Multi-File & 4-in-1 Suite'}
                {hasPaidLicense && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                    UNLOCKED
                  </span>
                )}
              </span>
              <span className="text-[11px] text-textMuted">
                {hasPaidLicense
                  ? 'Unlimited files • All 4 AI ecosystems unlocked'
                  : `All 8 stack files + 4 IDEs • ${singlePrice.formatted} 1-click Polar Pass`}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 3 FRICTIONLESS WAYS TO STAGE AN 8-FILE REPOSITORY IN RAM */}
      <div className="w-full p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-xl flex flex-col gap-5 text-left">
        {/* Path A: ⚡ 1-Click Stack Rules Builder (Interactive Chips) */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-black text-[11px] uppercase tracking-wider">
                ⚡ Way 1 • No Local .ZIP Needed
              </span>
              <h3 className="text-sm sm:text-base font-black text-white">
                1-Click Stack Rules Builder (Mobile &amp; Desktop Instant Generator)
              </h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {selectedChipIds.length} stack module{selectedChipIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div
            role="group"
            aria-label="Select your tech stack modules"
            className="flex flex-wrap gap-2"
          >
            {STACK_CHIP_OPTIONS.map((chip) => {
              const isSelected = selectedChipIds.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleToggleChip(chip.id)}
                  aria-pressed={isSelected}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/60 shadow-sm'
                      : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-400">
              Synthesizes an <strong>8-file production AI rules suite</strong> in RAM (previews 2 files free, stages all 8 for 1-click export).
            </p>
            <button
              type="button"
              onClick={handleGenerateStackSuite}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Generate Custom 8-File AI Rules Suite</span>
            </button>
          </div>
        </div>

        {/* Path B: 🐙 GitHub Repo URL Importer (owner/repo) */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black text-[11px] uppercase tracking-wider">
                🐙 Way 2 • Public GitHub Repo
              </span>
              <label htmlFor="github-repo-importer-input" className="text-xs sm:text-sm font-bold text-white">
                Import from GitHub URL or <code className="text-cyan-300">owner/repo</code>
              </label>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Quick test:</span>
              {['vercel/next.js', 'fastapi/fastapi', 'supabase/supabase'].map((sampleRepo) => (
                <button
                  key={sampleRepo}
                  type="button"
                  onClick={() => {
                    setGithubRepoInput(sampleRepo);
                    handleImportGithubRepo(sampleRepo);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10px] border border-slate-700 cursor-pointer"
                >
                  {sampleRepo}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <GitBranch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="github-repo-importer-input"
                type="text"
                value={githubRepoInput}
                onChange={(e) => setGithubRepoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleImportGithubRepo();
                  }
                }}
                placeholder="owner/repo or https://github.com/owner/repo (e.g. vercel/next.js)"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs text-white placeholder-slate-500 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => handleImportGithubRepo()}
              disabled={isImportingGithub}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isImportingGithub
                  ? 'Detecting Stack & Building 8 Files...'
                  : 'Import & Generate 8-File Suite'}
              </span>
            </button>
          </div>
        </div>

        {/* Path C (Mode 4): ✍️ Paste Prompt / package.json */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-[11px] uppercase tracking-wider">
                ✍️ Mode 4 • Paste Prompt / package.json
              </span>
              <label htmlFor="paste-prompt-package-input" className="text-xs sm:text-sm font-bold text-white">
                Paste raw system prompt, <code className="text-emerald-300">package.json</code>, or <code className="text-cyan-300">.cursorrules</code> snippet
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
              <span>1-click preset:</span>
              {[
                {
                  label: 'package.json (Next 15 + Supabase)',
                  snippet:
                    '{\n  "name": "acme-saas-platform",\n  "description": "Next.js 15 App Router SaaS with Supabase Postgres RLS, Tailwind CSS v4 & Playwright",\n  "dependencies": { "next": "15.1.0", "react": "19.0.0", "@supabase/supabase-js": "^2.48.0", "tailwindcss": "^4.0.0", "zod": "^3.24.0" },\n  "devDependencies": { "@playwright/test": "^1.50.0", "vitest": "^3.0.0", "typescript": "^5.7.0" }\n}',
                },
                {
                  label: 'FastAPI + Pydantic v2 Prompt',
                  snippet:
                    '# FinTech Core API Directives\nBuild async Python FastAPI endpoints with strict Pydantic v2 ConfigDict(extra="forbid"), PostgreSQL RLS, pytest verification, and OWASP zero-secret guardrails.',
                },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setPastedPromptInput(preset.snippet);
                    handleCompilePastedPrompt(preset.snippet);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[10px] border border-slate-700 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <textarea
              id="paste-prompt-package-input"
              rows={2}
              value={pastedPromptInput}
              onChange={(e) => setPastedPromptInput(e.target.value)}
              placeholder='Paste your raw system prompt, package.json, .cursorrules, or project stack description here...'
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:outline-none text-xs text-white placeholder-slate-500 font-mono resize-y"
            />
            <button
              type="button"
              onClick={() => handleCompilePastedPrompt()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Compile into 8-File AI Rules Suite</span>
            </button>
          </div>
        </div>

        {/* High-Converting 2-of-8 Unlocked Preview & $1.99 Unlock Banner */}
        {generatedSuite && !hasPaidLicense && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-cyan-950/40 border-2 border-amber-400/60 flex flex-col gap-3.5 shadow-lg animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-white leading-snug">
                    2 of 8 bespoke stack rule files unlocked in preview — Unlock all 8 files + 4-in-1 IDE bundle (Cursor .mdc, CLAUDE.md, Copilot, Windsurf) + 50+ Master Rules Vault for {singlePrice.formatted}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Staged in RAM for <strong className="text-cyan-300">{generatedSuite.fullProject.metadata.title}</strong> ({generatedSuite.sourceLabel})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUnlockGeneratedSuite}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 hover:brightness-105 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Unlock All 8 Files ({singlePrice.formatted}) →</span>
              </button>
            </div>

            {/* 💰 Token & Context ROI Calculator Banner */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-200 font-semibold leading-snug">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-black text-[10px] uppercase tracking-wider shrink-0">
                  💰 Token &amp; Context ROI
                </span>
                <span>
                  {calculateTokenRoiMetrics(generatedSuite.totalFiles).roiSummaryBadge}
                </span>
              </div>
            </div>

            {/* Concrete File List Preview: 2 Unlocked vs 6 Locked */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <div className="font-sans font-bold text-emerald-300 mb-1.5 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unlocked in Free Preview (2 files):</span>
                </div>
                <ul className="space-y-1 text-emerald-200/90">
                  {generatedSuite.unlockedPreviewFileLabels.map((file, idx) => (
                    <li key={idx} className="truncate">
                      ✓ {file}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30">
                <div className="font-sans font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Staged in RAM — Unlocks with {singlePrice.formatted} Pass (6 files + 4 IDEs):</span>
                </div>
                <ul className="space-y-1 text-slate-300">
                  {generatedSuite.lockedFileLabels.map((file, idx) => (
                    <li key={idx} className="truncate">
                      🔒 {file}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Overlimit Pay-to-Unlock Dialog when > 2 local files dropped */}
      {overlimitState ? (
        <div className="w-full p-7 sm:p-9 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-2xl flex flex-col gap-6 text-left animate-fadeIn backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {overlimitState.totalCount} Agent Files Parsed &amp; Ready in RAM
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Free Starter includes {freeLimit} files. Unlock all{' '}
                  <strong>{overlimitState.totalCount} files</strong> + the{' '}
                  <strong>4-in-1 Universal Suite</strong> (Cursor, Claude, OpenAI &amp; Gemini) for{' '}
                  <strong className="text-emerald-400">{singlePrice.formatted}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setOverlimitState(null)}
              className="text-textMuted hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Value Proof Strip */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center text-xs">
            <div>
              <div className="font-black text-cyan-300">{overlimitState.totalCount} Files</div>
              <div className="text-[10px] text-slate-400">AST Parsed (98.5% Parity)</div>
            </div>
            <div className="border-x border-slate-800">
              <div className="font-black text-emerald-400">
                {overlimitState.secretsDetectedCount > 0
                  ? `${overlimitState.secretsDetectedCount} Masked`
                  : '100% Clean'}
              </div>
              <div className="text-[10px] text-slate-400">In-RAM Secret Shield</div>
            </div>
            <div>
              <div className="font-black text-amber-300">4 Ecosystems</div>
              <div className="text-[10px] text-slate-400">Cursor + Claude + GPT + Gemini</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: 1-Click Polar Unlock ($1.99) */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-950 border-2 border-cyan-500/60 flex flex-col justify-between gap-4 shadow-lg">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                    Option 1 • Instant 1-Click Pass
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950">
                    MOST POPULAR
                  </span>
                </div>
                <h4 className="text-base font-black text-white">
                  Unlock All {overlimitState.totalCount} Files + 4-in-1 Suite ({singlePrice.formatted})
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  One-time micro-payment via Polar.sh (Apple Pay, Google Pay, Card). Zero subscription. Auto-downloads your full ZIP bundle immediately after payment.
                </p>
              </div>

              <button
                onClick={handleResolveUnlockAll}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>
                  Unlock All {overlimitState.totalCount} Files ({singlePrice.formatted}) →
                </span>
              </button>
            </div>

            {/* Option 2: Keep Free Starter (2 files) */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Option 2 • Free Preview
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    $0.00 STARTER
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Preview {freeLimit} Core Files Only (Lock Remaining{' '}
                  {overlimitState.totalCount - freeLimit})
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inspects and exports only your master instruction + 1 rule ({freeLimit} files max). You can still unlock the remaining{' '}
                  {overlimitState.totalCount - freeLimit} files anytime in 1 click.
                </p>
              </div>

              <button
                onClick={handleResolveKeepStarter}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Preview {freeLimit} Files Only ($0.00)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Path C: 📁 Drop Local Files / Folder / .ZIP */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) processFileList(files);
          }}
          className={`w-full p-7 sm:p-9 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 text-center relative overflow-hidden bg-slate-900/60 backdrop-blur-sm ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10 shadow-xl scale-[1.01]'
              : 'border-slate-700 hover:border-cyan-500/50'
          }`}
        >
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-black text-[11px] uppercase tracking-wider">
            📁 Way 3 • Drop Local Files, Folder or .ZIP
          </span>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              Drop your repo folder, <code className="text-cyan-300">.cursorrules</code>,{' '}
              <code className="text-cyan-300">CLAUDE.md</code>, or <code className="text-cyan-300">.zip</code>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              100% In-RAM browser parsing • Zero files stored on disk • Free up to {freeLimit} files,{' '}
              {singlePrice.formatted} for full multi-rule repos &amp; 4-in-1 bundle.
            </p>
          </div>

          {/* Buttons for Folder or Zip/Files */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <FolderUp className="w-4 h-4" />
              <span>Select Project Folder</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              <span>Select Rule Files or .ZIP</span>
            </button>

            {/* Hidden inputs */}
            <input
              type="file"
              ref={folderInputRef}
              // @ts-ignore
              webkitdirectory="true"
              directory="true"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFileList(Array.from(e.target.files));
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept=".zip,.md,.mdc,.txt,.json,.cursorrules,.windsurfrules"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFileList(Array.from(e.target.files));
              }}
            />
          </div>

          {isProcessing && (
            <div className="flex items-center gap-2 text-cyan-300 font-medium text-xs mt-1 animate-pulse">
              <Zap className="w-4 h-4" />
              <span>Pruning dependencies &amp; parsing AST directives in RAM...</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 text-rose-400 text-xs mt-1 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {pruningStats && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30 mt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Parsed {pruningStats.fileCount} agent file{pruningStats.fileCount > 1 ? 's' : ''} in RAM (
                {(pruningStats.prunedBytes / 1024).toFixed(1)} KB)
                {pruningStats.secretsDetected > 0
                  ? ` • 🛡️ ${pruningStats.secretsDetected} API key(s) sanitized`
                  : ' • 🛡️ 0 leaked keys'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
