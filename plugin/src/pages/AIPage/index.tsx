import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';

// ** import figma utils
import { emit, on } from '@create-figma-plugin/utilities';

// ** import utils
import notify from '@/lib/notify';

// ** import store
import { useAIStore } from '@/store/use-ai-store';
import { useImageNodesStore } from '@/store/use-image-nodes-store';

// ** import types
import { AIRenameGroup, AIRenameResult } from '@/types/ai';
import {
  AIRenameRequestHandler,
  AIBatchReadyHandler,
  AIApplyRenameHandler,
  AIRenameProgressHandler,
  AIRenameCompleteHandler,
  AIRenameErrorHandler,
} from '@/types/events';

// ** import components
import { IconButton } from '@/components/ui/icon-button';
import AINodeList from './_components/AINodeList';
import AISettingsPanel from './_components/AISettingsPanel';
import AIRunButton from './_components/AIRunButton';

// Server base URL — configurable via build-time env variable (VITE_SERVER_URL)
const SERVER_URL =
  (typeof process !== 'undefined' && (process.env as Record<string, string>)['VITE_SERVER_URL']) ||
  'http://localhost:3000';

const AIPage = () => {
  const {
    settings,
    setSettings,
    isRunning,
    isSettingsOpen,
    setIsSettingsOpen,
    setIsRunning,
    setProgress,
    setRenameStatus,
    resetStatuses,
  } = useAIStore();

  const { selectedNodeIds } = useImageNodesStore();

  // Track pending-rename count to detect when all are done on the UI side
  const pendingRef = useRef(0);

  // ── finalize must be defined before useEffect so it is stable in scope ────
  const finalize = useCallback(() => {
    setIsRunning(false);
    notify.success('AI rename complete');
  }, [setIsRunning]);

  // ── Register plugin event listeners ───────────────────────────────────────
  useEffect(() => {
    /**
     * Fired from main.ts after nodes are classified, grouped and (optionally)
     * images exported. We now call the server.
     */
    const unsubBatchReady = on<AIBatchReadyHandler>('AI_BATCH_READY', async (groups: AIRenameGroup[]) => {
      // Count total target nodes across all groups
      const total = groups.reduce((acc, g) => acc + g.targetNodes.length, 0);
      setProgress({ done: 0, total });

      // Mark all as pending
      groups.forEach((g) => g.targetNodes.forEach((t) => setRenameStatus(t.nodeId, 'pending')));

      try {
        const response = await fetch(`${SERVER_URL}/api/ai/rename-batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groups, settings }),
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error((errBody as any)?.error ?? `HTTP ${response.status}`);
        }

        const data: { renames: AIRenameResult[] } = await response.json();
        const renames = data.renames ?? [];

        // Apply prefix / suffix from settings (use current store state to avoid stale closure)
        const { settings: s } = useAIStore.getState();
        const prefix = s.prefix ?? 'img_';
        const suffix = s.suffix ?? '';
        const prefixedRenames: AIRenameResult[] = renames.map((r) => ({
          nodeId: r.nodeId,
          suggestedName: `${prefix}${r.suggestedName}${suffix}`,
        }));

        // Track how many apply-renames we're sending so we know when done
        pendingRef.current = prefixedRenames.length;
        if (pendingRef.current === 0) {
          finalize();
          return;
        }

        // Dispatch each rename to main.ts (which writes to Figma)
        prefixedRenames.forEach((r) => {
          emit<AIApplyRenameHandler>('AI_APPLY_RENAME', r);
        });
      } catch (err: any) {
        notify.error(`AI rename failed: ${err?.message ?? String(err)}`);
        // Mark all pending as error
        groups.forEach((g) =>
          g.targetNodes.forEach((t) => setRenameStatus(t.nodeId, 'error'))
        );
        setIsRunning(false);
      }
    });

    /**
     * Fired from main.ts after each individual node rename is written to Figma.
     */
    const unsubProgress = on<AIRenameProgressHandler>(
      'AI_RENAME_PROGRESS',
      ({ nodeId, newName }) => {
        setRenameStatus(nodeId, 'done', newName);

        const { progress } = useAIStore.getState();
        setProgress({ done: progress.done + 1, total: progress.total });

        pendingRef.current -= 1;
        if (pendingRef.current <= 0) finalize();
      }
    );

    /**
     * Fired from main.ts for any node that failed to rename in Figma.
     */
    const unsubError = on<AIRenameErrorHandler>('AI_RENAME_ERROR', ({ nodeId }) => {
      setRenameStatus(nodeId, 'error');
      pendingRef.current -= 1;
      if (pendingRef.current <= 0) finalize();
    });

    /**
     * Fired from main.ts once the entire batch is applied.
     */
    const unsubComplete = on<AIRenameCompleteHandler>('AI_RENAME_COMPLETE', () => {
      setIsRunning(false);
    });

    return () => {
      unsubBatchReady();
      unsubProgress();
      unsubError();
      unsubComplete();
    };
  }, [settings, finalize, setIsRunning, setProgress, setRenameStatus]);

  // ── Run handler ────────────────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    if (isRunning || selectedNodeIds.length === 0) return;
    if (!settings.apiKey) {
      notify.error('Please enter an API key in settings.');
      return;
    }

    resetStatuses();
    setIsRunning(true);
    pendingRef.current = 0;

    emit<AIRenameRequestHandler>('AI_RENAME_REQUEST', {
      nodeIds: selectedNodeIds,
      readImage: settings.readImage,
      settings,
    });
  }, [isRunning, selectedNodeIds, settings, resetStatuses, setIsRunning]);

  return (
    <div class="flex flex-col h-full">
      {/* Header bar */}
      <div class="shrink-0 flex items-center justify-between px-3 py-2 border-b border-f-border">
        <span class="text-xs font-semibold text-primary-text">AI Rename</span>
        <IconButton
          variant="hover"
          animate
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          title="Settings"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-secondary-text"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </IconButton>
      </div>

      {/* Settings panel (collapsible) */}
      {isSettingsOpen && <div class="shrink-0"><AISettingsPanel /></div>}

      {/* Node list — scrollable middle */}
      <div class="flex-1 overflow-y-auto">
        <AINodeList />
      </div>

      {/* Footer: prefix/suffix + run button — always visible */}
      <div class="shrink-0 border-t border-f-border px-3 pt-2 pb-2 flex flex-col gap-2">
        {/* Prefix / Suffix row */}
        <div class="flex gap-2">
          <div class="flex-1 flex flex-col gap-0.5">
            <label class="text-[10px] text-secondary-text">Prefix <span class="opacity-50">(optional)</span></label>
            <input
              type="text"
              value={settings.prefix}
              onInput={(e) => setSettings({ prefix: (e.target as HTMLInputElement).value })}
              placeholder="img_"
              class="w-full text-xs bg-primary-bg border border-f-border rounded px-2 py-1 text-primary-text focus:outline-none focus:border-brand-bg placeholder-secondary-text"
            />
          </div>
          <div class="flex-1 flex flex-col gap-0.5">
            <label class="text-[10px] text-secondary-text">Suffix <span class="opacity-50">(optional)</span></label>
            <input
              type="text"
              value={settings.suffix}
              onInput={(e) => setSettings({ suffix: (e.target as HTMLInputElement).value })}
              placeholder="e.g. _v2"
              class="w-full text-xs bg-primary-bg border border-f-border rounded px-2 py-1 text-primary-text focus:outline-none focus:border-brand-bg placeholder-secondary-text"
            />
          </div>
        </div>

        {/* Run button */}
        <AIRunButton onRun={handleRun} />
      </div>
    </div>
  );
};

export default AIPage;
