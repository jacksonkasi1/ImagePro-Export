import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';

// ** import figma utils
import { emit, on } from '@create-figma-plugin/utilities';

// ** import utils
import notify from '@/lib/notify';
import { cn } from '@/lib/utils';

// ** import store
import { useAIStore } from '@/store/use-ai-store';

// ** import types
import { AIMode, AIRenameGroup, AIRenameResult, AISettings } from '@/types/ai';
import {
  AIRenameRequestHandler,
  AIBatchReadyHandler,
  AIApplyRenameHandler,
  AIRenameProgressHandler,
  AIRenameCompleteHandler,
  AIRenameErrorHandler,
} from '@/types/events';

// ** import apis
import { GeminiAdapter } from '@/core/ai/gemini-adapter';

// ** import components
import { IconButton } from '@/components/ui/icon-button';
import AINodeList from './_components/AINodeList';
import AISettingsPanel from './_components/AISettingsPanel';
import AIRunButton from './_components/AIRunButton';

/**
 * Strips any leading img/image prefix variant from an AI-suggested name,
 * then prepends the user's prefix and appends the suffix exactly once.
 */
function applyPrefixSuffix(name: string, prefix: string, suffix: string): string {
  const leadingImgPattern = /^imag?e?[\-_ ]?/i;
  let stripped = name;
  while (leadingImgPattern.test(stripped)) {
    const next = stripped.replace(leadingImgPattern, '');
    if (next === stripped) break;
    stripped = next;
  }
  if (stripped.length === 0) stripped = name;
  return `${prefix}${stripped}${suffix}`;
}

const AIPage = () => {
  const {
    aiMode,
    setAIMode,
    settings,
    setSettings,
    layerSettings,
    setLayerSettings,
    isRunning,
    isSettingsOpen,
    setIsSettingsOpen,
    setIsRunning,
    setProgress,
    setRenameStatus,
    resetStatuses,
    selectedAIImageNodeIds,
    selectedAILayerNodeIds,
  } = useAIStore();

  // Active settings based on mode
  const activeSettings: AISettings = aiMode === 'images' ? settings : layerSettings;
  const setActiveSettings = aiMode === 'images' ? setSettings : setLayerSettings;
  const activeSelectedIds = aiMode === 'images' ? selectedAIImageNodeIds : selectedAILayerNodeIds;

  // Track pending-rename count to detect when all are done on the UI side
  const pendingRef = useRef(0);

  const finalize = useCallback(() => {
    setIsRunning(false);
    notify.success('AI rename complete');
  }, [setIsRunning]);

  // ── Register plugin event listeners ───────────────────────────────────────
  useEffect(() => {
    const unsubBatchReady = on<AIBatchReadyHandler>('AI_BATCH_READY', async (groups: AIRenameGroup[]) => {
      const total = groups.reduce((acc, g) => acc + g.targetNodes.length, 0);
      setProgress({ done: 0, total });
      groups.forEach((g) => g.targetNodes.forEach((t) => setRenameStatus(t.nodeId, 'pending')));

      // Snapshot settings for this run from the store (avoids stale closure)
      const { settings: imgS, layerSettings: layS, aiMode: mode } = useAIStore.getState();
      const runSettings = mode === 'images' ? imgS : layS;

      try {
        const adapter = new GeminiAdapter(runSettings.apiKey, runSettings.model);
        const renames: AIRenameResult[] = await adapter.rename(
          groups,
          runSettings.systemPrompt,
          runSettings.caseOption,
          5
        );

        const prefix = runSettings.prefix ?? (mode === 'images' ? 'img_' : '');
        const suffix = runSettings.suffix ?? '';
        const prefixedRenames: AIRenameResult[] = renames.map((r) => ({
          nodeId: r.nodeId,
          suggestedName: applyPrefixSuffix(r.suggestedName, prefix, suffix),
        }));

        pendingRef.current = prefixedRenames.length;
        if (pendingRef.current === 0) { finalize(); return; }

        prefixedRenames.forEach((r) => {
          emit<AIApplyRenameHandler>('AI_APPLY_RENAME', r);
        });
      } catch (err: any) {
        notify.error(`AI rename failed: ${err?.message ?? String(err)}`);
        groups.forEach((g) => g.targetNodes.forEach((t) => setRenameStatus(t.nodeId, 'error')));
        setIsRunning(false);
      }
    });

    const unsubProgress = on<AIRenameProgressHandler>('AI_RENAME_PROGRESS', ({ nodeId, newName }) => {
      setRenameStatus(nodeId, 'done', newName);
      const { progress } = useAIStore.getState();
      setProgress({ done: progress.done + 1, total: progress.total });
      pendingRef.current -= 1;
      if (pendingRef.current <= 0) finalize();
    });

    const unsubError = on<AIRenameErrorHandler>('AI_RENAME_ERROR', ({ nodeId }) => {
      setRenameStatus(nodeId, 'error');
      pendingRef.current -= 1;
      if (pendingRef.current <= 0) finalize();
    });

    const unsubComplete = on<AIRenameCompleteHandler>('AI_RENAME_COMPLETE', () => {
      setIsRunning(false);
    });

    return () => { unsubBatchReady(); unsubProgress(); unsubError(); unsubComplete(); };
  }, [finalize, setIsRunning, setProgress, setRenameStatus]);

  // ── Run handler ────────────────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    if (isRunning || activeSelectedIds.length === 0) return;
    if (!activeSettings.apiKey) {
      notify.error('Please enter an API key in settings.');
      return;
    }

    resetStatuses();
    setIsRunning(true);
    pendingRef.current = 0;

    emit<AIRenameRequestHandler>('AI_RENAME_REQUEST', {
      nodeIds: activeSelectedIds,
      readImage: activeSettings.readImage,
      settings: activeSettings,
    });
  }, [isRunning, activeSelectedIds, activeSettings, resetStatuses, setIsRunning]);

  return (
    <div class="flex flex-col h-full">
      {/* Header bar */}
      <div class="shrink-0 flex items-center justify-between px-3 py-2 border-b border-f-border">
        {/* Sub-tab switcher */}
        <div class="flex items-center gap-1 bg-secondary-bg rounded p-0.5">
          {(['images', 'layers'] as AIMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setAIMode(mode)}
              class={cn(
                'px-2.5 py-1 text-xs font-medium rounded transition-colors',
                aiMode === mode
                  ? 'bg-primary-bg text-primary-text shadow-sm'
                  : 'text-secondary-text hover:text-primary-text'
              )}
            >
              {mode === 'images' ? 'Images' : 'Layers'}
            </button>
          ))}
        </div>

        {/* Settings toggle */}
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
            {/* Sparkle / star icon */}
            <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" />
            <path d="M5 5 L5.5 7 L7.5 7.5 L5.5 8 L5 10 L4.5 8 L2.5 7.5 L4.5 7 Z" />
            <path d="M19 16 L19.5 18 L21.5 18.5 L19.5 19 L19 21 L18.5 19 L16.5 18.5 L18.5 18 Z" />
          </svg>
        </IconButton>
      </div>

      {/* Settings panel (collapsible) — shows active mode's settings */}
      {isSettingsOpen && (
        <div class="shrink-0">
          <AISettingsPanel
            settings={activeSettings}
            setSettings={setActiveSettings}
          />
        </div>
      )}

      {/* Node list — scrollable middle */}
      <div class="flex-1 overflow-y-auto">
        <AINodeList mode={aiMode} />
      </div>

      {/* Footer: prefix/suffix + run button */}
      <div class="shrink-0 border-t border-f-border px-3 pt-2 pb-2 flex flex-col gap-2">
        <div class="flex gap-2">
          <div class="flex-1 flex flex-col gap-0.5">
            <label class="text-[10px] text-secondary-text">
              Prefix <span class="opacity-50">(optional)</span>
            </label>
            <input
              type="text"
              value={activeSettings.prefix}
              onInput={(e) => setActiveSettings({ prefix: (e.target as HTMLInputElement).value })}
              placeholder={aiMode === 'images' ? 'img_' : 'e.g. comp_'}
              class="w-full text-xs bg-primary-bg border border-f-border rounded px-2 py-1 text-primary-text focus:outline-none focus:border-brand-bg placeholder-secondary-text"
            />
          </div>
          <div class="flex-1 flex flex-col gap-0.5">
            <label class="text-[10px] text-secondary-text">
              Suffix <span class="opacity-50">(optional)</span>
            </label>
            <input
              type="text"
              value={activeSettings.suffix}
              onInput={(e) => setActiveSettings({ suffix: (e.target as HTMLInputElement).value })}
              placeholder="e.g. _v2"
              class="w-full text-xs bg-primary-bg border border-f-border rounded px-2 py-1 text-primary-text focus:outline-none focus:border-brand-bg placeholder-secondary-text"
            />
          </div>
        </div>

        <AIRunButton onRun={handleRun} />
      </div>
    </div>
  );
};

export default AIPage;
