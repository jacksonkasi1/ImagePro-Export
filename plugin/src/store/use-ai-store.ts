import { create } from 'zustand';

// ** import types
import { AIState, AISettings, AIRenameStatus } from '@/types/ai';
import { CaseOption } from '@/types/enums';

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
  model: 'gemini-2.5-flash-preview-04-17',
  apiKey: '',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  readImage: false,
  caseOption: CaseOption.KEBAB_CASE,
};

export const useAIStore = create<AIState>((set) => ({
  settings: { ...DEFAULT_SETTINGS },
  setSettings: (partial: Partial<AISettings>) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),

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
}));
