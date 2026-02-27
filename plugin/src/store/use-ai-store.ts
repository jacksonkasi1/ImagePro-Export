import { create } from 'zustand';

// ** import figma-plugin utilities
import { emit, on } from '@create-figma-plugin/utilities';

// ** import types
import { AIState, AISettings, AIPersistedSettings, AIRenameStatus } from '@/types/ai';
import { CaseOption } from '@/types/enums';
import { GetDataHandler, ReceiveDataHandler, SetDataHandler } from '@/types/events';

const DEFAULT_SYSTEM_PROMPT = `You are a professional UI asset naming assistant for Figma.
Given a JSON description of a design node (and optionally a screenshot), suggest a concise, descriptive asset name in the specified naming convention.

Rules:
- Name should reflect the visual PURPOSE of the element, not its Figma layer name
- Use what you see: if it's a hero banner with a CTA, name it "hero-get-started"
- If it's an icon or vector shape, describe the shape: "icon-arrow-right", "icon-user-profile"
- Maximum 4 words, no generic names like "frame-1" or "rectangle-5"
- Apply the naming convention specified in the context
- Respond ONLY with a valid JSON array: [{"nodeId":"...","suggestedName":"..."}]
- Do not include any explanation, markdown, or code fences — raw JSON array only`;

const DEFAULT_SETTINGS: AISettings = {
  modelProvider: 'gemini',
  model: 'gemini-2.5-flash',
  apiKey: '',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  readImage: false,
  caseOption: CaseOption.KEBAB_CASE,
};

/** clientStorage key for non-sensitive settings (model, prompt, etc.) */
const SETTINGS_KEY = 'aiSettings';
/** clientStorage key for the API key — stored separately from other settings */
const API_KEY_KEY = 'aiApiKey';

export const useAIStore = create<AIState>((set, _get) => {
  // ── Persist non-sensitive settings on every change ────────────────────────
  const persistSettings = (settings: AISettings) => {
    const { apiKey, ...persisted }: { apiKey: string } & AIPersistedSettings = settings;
    emit<SetDataHandler>('SET_DATA', { handle: SETTINGS_KEY, data: persisted });
    emit<SetDataHandler>('SET_DATA', { handle: API_KEY_KEY, data: { apiKey } });
  };

  // ── Load persisted settings from clientStorage on init ────────────────────
  const handleReceiveData: ReceiveDataHandler['handler'] = ({ handle, data }: { handle: string; data: any }) => {
    if (!data) return;
    if (handle === SETTINGS_KEY) {
      set((state) => ({
        settings: { ...state.settings, ...(data as Partial<AIPersistedSettings>) },
      }));
    } else if (handle === API_KEY_KEY) {
      set((state) => ({
        settings: { ...state.settings, apiKey: (data as { apiKey: string }).apiKey ?? '' },
      }));
    }
  };

  on<ReceiveDataHandler>('RECEIVE_DATA', handleReceiveData);

  emit<GetDataHandler>('GET_DATA', { handle: SETTINGS_KEY });
  emit<GetDataHandler>('GET_DATA', { handle: API_KEY_KEY });

  return {
    settings: { ...DEFAULT_SETTINGS },
    setSettings: (partial: Partial<AISettings>) =>
      set((state) => {
        const next = { ...state.settings, ...partial };
        persistSettings(next);
        return { settings: next };
      }),

    renameStatuses: {},
    renamedNames: {},
    setRenameStatus: (nodeId: string, status: AIRenameStatus, newName?: string) =>
      set((state) => ({
        renameStatuses: { ...state.renameStatuses, [nodeId]: status },
        renamedNames: newName ? { ...state.renamedNames, [nodeId]: newName } : state.renamedNames,
      })),
    resetStatuses: () => set({ renameStatuses: {}, renamedNames: {}, progress: { done: 0, total: 0 } }),

    isRunning: false,
    setIsRunning: (running: boolean) => set({ isRunning: running }),

    isSettingsOpen: false,
    setIsSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),

    progress: { done: 0, total: 0 },
    setProgress: (progress: { done: number; total: number }) => set({ progress }),
  };
});
