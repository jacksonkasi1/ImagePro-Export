import { create } from 'zustand';

// ** import figma-plugin utilities
import { emit, on } from '@create-figma-plugin/utilities';

// ** import types
import { AIState, AISettings, AIPersistedSettings, AIRenameStatus, AIMode, AINodeData } from '@/types/ai';
import { CaseOption } from '@/types/enums';
import { GetDataHandler, ReceiveDataHandler, SetDataHandler } from '@/types/events';

const DEFAULT_SYSTEM_PROMPT = `You are a professional UI asset naming assistant for Figma.
Given a JSON description of a design node and its surrounding context, suggest a concise, specific, descriptive asset name.

Rules:
- PRIORITY 0: If "sectionHierarchy" is present, use the OUTERMOST meaningful level as the section/category token.
  Example: sectionHierarchy ["Explore Our Blog", "blog-card"] + roleHint "cover" → "blog-card-cover"
  Example: sectionHierarchy ["Hero Section"] + roleHint "banner" → "hero-banner"
- PRIORITY 1: Use "scoredNearbyText" (or "nearbyTextContent" fallback) to extract subject-specific words.
  Example: nearbyTextContent ["Harish Goswami", "Sep 11, 2025"] + image node → "harish-goswami-avatar"
  Example: nearbyTextContent ["5 Common Paperwork Mistakes"] + image node → "paperwork-mistakes-banner"
  Example: nearbyTextContent ["VIEW MORE"] + button → "view-more-button"
- PRIORITY 2: Use "roleHint" and "clusterRole" for structure signal.
  Example: roleHint "card-cover" + clusterRole "card" + subject "paperwork" → "blog-card-paperwork-cover"
- PRIORITY 3: Use "parentContext" and "sectionContext" for extra category/section signal.
  Example: parentContext "article-card" + image → "article-card-thumbnail"
- PRIORITY 4: Use the node's own type and visual purpose.
  Example: RECTANGLE with image fill, no context → "image-placeholder"
- NEVER use generic names: "frame-1", "rectangle", "group-3", "image", "layer"
- NEVER include "img" or "image" in the suggested name — the prefix is handled separately
- Extract only the most meaningful 2-4 words from text content (skip dates, reading times)
- Prefer 1 section token + 1 role token + 1 subject token; avoid duplicate tokens
- Apply the naming convention specified
- Maximum 4 words in the final name
- Respond ONLY with a valid JSON array: [{"nodeId":"...","suggestedName":"..."}]
- Raw JSON only — no markdown, no explanation, no code fences`;

const DEFAULT_LAYER_SYSTEM_PROMPT = `You are a professional UI layer naming assistant for Figma.
Given a JSON description of a design node and its surrounding context, suggest a concise, specific, descriptive layer name.

Rules:
- PRIORITY 0: If "sectionHierarchy" is present, use the OUTERMOST meaningful level as the section/category token.
  Example: sectionHierarchy ["Pricing", "cards"] + frame → "pricing-card"
  Example: sectionHierarchy ["Hero Section"] + frame → "hero-section"
- PRIORITY 1: Use "scoredNearbyText" (or "nearbyTextContent" fallback) to make the name specific.
  Example: nearbyTextContent ["Sign Up", "Create your account"] + frame → "sign-up-section"
  Example: nearbyTextContent ["Pricing"] + frame → "pricing-section"
- PRIORITY 2: Use "roleHint" and "clusterRole" for structural signal.
- PRIORITY 3: Use "parentContext" and "sectionContext" for category/section signal.
  Example: parentContext "landing-page" + frame → "hero-section"
- PRIORITY 4: Use the node's own type and visual structure.
  Example: FRAME containing a nav → "navbar"
- NEVER use generic names: "frame-1", "group-3", "layer", "rectangle"
- Prefer names that include section + role when available, avoid duplicate words
- Apply the naming convention specified
- Maximum 4 words in the final name
- Respond ONLY with a valid JSON array: [{"nodeId":"...","suggestedName":"..."}]
- Raw JSON only — no markdown, no explanation, no code fences`;

const DEFAULT_SETTINGS: AISettings = {
  modelProvider: 'gemini',
  model: 'gemini-2.5-flash',
  apiKey: '',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  readImage: false,
  caseOption: CaseOption.KEBAB_CASE,
  prefix: 'img_',
  suffix: '',
};

const DEFAULT_LAYER_SETTINGS: AISettings = {
  modelProvider: 'gemini',
  model: 'gemini-2.5-flash',
  apiKey: '',
  systemPrompt: DEFAULT_LAYER_SYSTEM_PROMPT,
  readImage: false,
  caseOption: CaseOption.KEBAB_CASE,
  prefix: '',
  suffix: '',
};

/** clientStorage key for non-sensitive image-mode settings */
const SETTINGS_KEY = 'aiSettings';
/** clientStorage key for non-sensitive layer-mode settings */
const LAYER_SETTINGS_KEY = 'aiLayerSettings';
/** clientStorage key for the API key — stored separately, shared by both modes */
const API_KEY_KEY = 'aiApiKey';

const LEGACY_IMAGES_PROMPT_MARKER = 'Given a JSON description of a design node (and optionally a screenshot)';
const LEGACY_LAYERS_PROMPT_MARKER = 'Given a JSON description of a design node and its surrounding context';

function isLegacyImagePrompt(prompt: string): boolean {
  const normalized = prompt.trim();
  return (
    normalized.includes(LEGACY_IMAGES_PROMPT_MARKER) ||
    (normalized.includes('Name should reflect the visual PURPOSE of the element') &&
      !normalized.includes('sectionHierarchy'))
  );
}

function isLegacyLayerPrompt(prompt: string): boolean {
  const normalized = prompt.trim();
  return (
    normalized.includes(LEGACY_LAYERS_PROMPT_MARKER) &&
    !normalized.includes('PRIORITY 0')
  );
}

function normalizeLoadedImageSettings(data: Partial<AIPersistedSettings>): Partial<AIPersistedSettings> {
  if (typeof data.systemPrompt !== 'string') return data;
  if (!isLegacyImagePrompt(data.systemPrompt)) return data;
  return {
    ...data,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
  };
}

function normalizeLoadedLayerSettings(data: Partial<AIPersistedSettings>): Partial<AIPersistedSettings> {
  if (typeof data.systemPrompt !== 'string') return data;
  if (!isLegacyLayerPrompt(data.systemPrompt)) return data;
  return {
    ...data,
    systemPrompt: DEFAULT_LAYER_SYSTEM_PROMPT,
  };
}

export const useAIStore = create<AIState>((set, get) => {
  // ── Persist non-sensitive settings on every change ────────────────────────
  const persistSettings = (settings: AISettings) => {
    const { apiKey, ...persisted }: { apiKey: string } & AIPersistedSettings = settings;
    emit<SetDataHandler>('SET_DATA', { handle: SETTINGS_KEY, data: persisted });
    emit<SetDataHandler>('SET_DATA', { handle: API_KEY_KEY, data: { apiKey } });
  };

  const persistLayerSettings = (settings: AISettings) => {
    const { apiKey, ...persisted }: { apiKey: string } & AIPersistedSettings = settings;
    emit<SetDataHandler>('SET_DATA', { handle: LAYER_SETTINGS_KEY, data: persisted });
    // API key is shared — write it here too so whichever mode saves last wins
    emit<SetDataHandler>('SET_DATA', { handle: API_KEY_KEY, data: { apiKey } });
  };

  // ── Load persisted settings from clientStorage on init ────────────────────
  const handleReceiveData: ReceiveDataHandler['handler'] = ({ handle, data }: { handle: string; data: any }) => {
    if (!data) return;
    if (handle === SETTINGS_KEY) {
      const normalized = normalizeLoadedImageSettings(data as Partial<AIPersistedSettings>);
      set((state) => ({
        settings: { ...state.settings, ...normalized },
      }));

      if (normalized.systemPrompt === DEFAULT_SYSTEM_PROMPT) {
        emit<SetDataHandler>('SET_DATA', { handle: SETTINGS_KEY, data: normalized });
      }
    } else if (handle === LAYER_SETTINGS_KEY) {
      const normalized = normalizeLoadedLayerSettings(data as Partial<AIPersistedSettings>);
      set((state) => ({
        layerSettings: { ...state.layerSettings, ...normalized },
      }));

      if (normalized.systemPrompt === DEFAULT_LAYER_SYSTEM_PROMPT) {
        emit<SetDataHandler>('SET_DATA', { handle: LAYER_SETTINGS_KEY, data: normalized });
      }
    } else if (handle === API_KEY_KEY) {
      const apiKey = (data as { apiKey: string }).apiKey ?? '';
      set((state) => ({
        settings: { ...state.settings, apiKey },
        layerSettings: { ...state.layerSettings, apiKey },
      }));
    }
  };

  on<ReceiveDataHandler>('RECEIVE_DATA', handleReceiveData);

  emit<GetDataHandler>('GET_DATA', { handle: SETTINGS_KEY });
  emit<GetDataHandler>('GET_DATA', { handle: LAYER_SETTINGS_KEY });
  emit<GetDataHandler>('GET_DATA', { handle: API_KEY_KEY });

  return {
    // ── Mode ────────────────────────────────────────────────────────────────
    aiMode: 'images' as AIMode,
    setAIMode: (mode: AIMode) => set({ aiMode: mode }),

    // ── Images sub-tab nodes ─────────────────────────────────────────────────
    aiImageNodes: [],
    setAIImageNodes: (nodes: AINodeData[]) => set({ aiImageNodes: nodes }),
    selectedAIImageNodeIds: [],
    setSelectedAIImageNodeIds: (ids) =>
      set((state) => ({
        selectedAIImageNodeIds: typeof ids === 'function' ? ids(state.selectedAIImageNodeIds) : ids,
      })),

    // ── Layers sub-tab nodes ─────────────────────────────────────────────────
    aiLayerNodes: [],
    setAILayerNodes: (nodes: AINodeData[]) => set({ aiLayerNodes: nodes }),
    selectedAILayerNodeIds: [],
    setSelectedAILayerNodeIds: (ids) =>
      set((state) => ({
        selectedAILayerNodeIds: typeof ids === 'function' ? ids(state.selectedAILayerNodeIds) : ids,
      })),

    // ── Image mode settings ──────────────────────────────────────────────────
    settings: { ...DEFAULT_SETTINGS },
    setSettings: (partial: Partial<AISettings>) =>
      set((state) => {
        const next = { ...state.settings, ...partial };
        persistSettings(next);
        return { settings: next };
      }),

    // ── Layer mode settings ──────────────────────────────────────────────────
    layerSettings: { ...DEFAULT_LAYER_SETTINGS },
    setLayerSettings: (partial: Partial<AISettings>) =>
      set((state) => {
        const next = { ...state.layerSettings, ...partial };
        persistLayerSettings(next);
        return { layerSettings: next };
      }),

    // ── Rename status tracking ───────────────────────────────────────────────
    renameStatuses: {},
    renamedNames: {},
    setRenameStatus: (nodeId: string, status: AIRenameStatus, newName?: string) =>
      set((state) => ({
        renameStatuses: { ...state.renameStatuses, [nodeId]: status },
        renamedNames: newName ? { ...state.renamedNames, [nodeId]: newName } : state.renamedNames,
      })),
    resetStatuses: () => set({ renameStatuses: {}, renamedNames: {}, progress: { done: 0, total: 0 } }),

    // ── Running state / progress ─────────────────────────────────────────────
    isRunning: false,
    setIsRunning: (running: boolean) => set({ isRunning: running }),

    isSettingsOpen: false,
    setIsSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),

    progress: { done: 0, total: 0 },
    setProgress: (progress: { done: number; total: number }) => set({ progress }),

    // ── Legacy shims — always delegate to the active mode ───────────────────
    get aiNodes() { return get().aiMode === 'images' ? get().aiImageNodes : get().aiLayerNodes; },
    setAINodes: (nodes: AINodeData[]) => {
      const mode = get().aiMode;
      if (mode === 'images') set({ aiImageNodes: nodes });
      else set({ aiLayerNodes: nodes });
    },
    get selectedAINodeIds() {
      return get().aiMode === 'images' ? get().selectedAIImageNodeIds : get().selectedAILayerNodeIds;
    },
    setSelectedAINodeIds: (ids) => {
      const mode = get().aiMode;
      if (mode === 'images') {
        set((state) => ({
          selectedAIImageNodeIds: typeof ids === 'function' ? ids(state.selectedAIImageNodeIds) : ids,
        }));
      } else {
        set((state) => ({
          selectedAILayerNodeIds: typeof ids === 'function' ? ids(state.selectedAILayerNodeIds) : ids,
        }));
      }
    },
  };
});
