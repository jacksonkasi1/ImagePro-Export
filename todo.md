# AIRE — AI Rename Engine: TODO

## Phase 1 — UI Skeleton

- [ ] Add `ai` option to `TabSwitch` SegmentedControl (`components/tab-switch/index.tsx`)
- [ ] Register `AIPage` in `pages/index.tsx`
- [ ] Create `types/ai.ts` (AISettings, AIRenameGroup, AIRenameResult, AIModelProvider, AINodeClassification)
- [ ] Create `store/use-ai-store.ts` (settings, renameStatuses, isRunning)
- [ ] Create `pages/AIPage/index.tsx` (page root, reuses allNodes from useImageNodesStore)
- [ ] Create `pages/AIPage/_components/AIStatusBadge.tsx` (idle/pending/done/error states)
- [ ] Create `pages/AIPage/_components/AINodeList.tsx` (node list with checkbox + badge + thumbnail)
- [ ] Create `pages/AIPage/_components/AISettingsPanel.tsx` (model picker, API key, prompt textarea)
- [ ] Create `pages/AIPage/_components/AIRunButton.tsx` (Run button + live counter "Renaming 3/12...")

## Phase 2 — Figma Side Logic

- [ ] Create `core/ai/svg-detector.ts` (classifyNode, isVectorSubtree, VECTOR_PRIMITIVE_TYPES set)
- [ ] Create `core/ai/section-grouper.ts` (groupNodesByParent, buildRenameGroups)
- [ ] Create `core/ai/export-for-ai.ts` (low-quality 0.5x JPG export, context text serializer)
- [ ] Create `core/ai/rename-handler.ts` (orchestrates all three above, called by main.ts handler)
- [ ] Add AI event types to `types/events.ts`:
  - AIRenameRequestHandler
  - AIBatchReadyHandler
  - AIApplyRenameHandler
  - AIRenameProgressHandler
  - AIRenameCompleteHandler
- [ ] Wire handlers in `main.ts`:
  - `on('AI_RENAME_REQUEST')` → calls rename-handler → emits AI_BATCH_READY
  - `on('AI_APPLY_RENAME')` → node.name = newName → emits AI_RENAME_PROGRESS

## Phase 3 — Server Side

- [ ] Create `server/src/routes/ai/adapters/index.ts` (IModelAdapter interface + ModelAdapterFactory)
- [ ] Create `server/src/routes/ai/adapters/gemini.ts` (GeminiAdapter using @google/genai)
  - Default fast model: `gemini-2.5-flash-preview-04-17`
  - Default quality model: `gemini-2.5-pro-preview-03-25`
- [ ] Create `server/src/routes/ai/adapters/openai.ts` (OpenAIAdapter stub)
- [ ] Create `server/src/routes/ai/adapters/anthropic.ts` (AnthropicAdapter stub)
- [ ] Create `server/src/routes/ai/rename-batch.ts` (POST handler, promisePool concurrency=5)
- [ ] Create `server/src/routes/ai/index.ts` (route file, exports router)
- [ ] Add promise-pool utility to `server/src/utils/promise-pool.ts`
- [ ] Register `/api/ai` routes in `server/src/routes/index.ts`
- [ ] Install `@google/genai` in server package.json

## Phase 4 — Integration & Polish

- [ ] Wire full flow: UI Run button → AI_RENAME_REQUEST → main.ts → AI_BATCH_READY → server POST
- [ ] Wire response: server response → AI_APPLY_RENAME (per node) → AI_RENAME_PROGRESS → badge update
- [ ] AI_RENAME_COMPLETE → reset isRunning, show final success notification
- [ ] Add AI store persistence via `useStorageManager` (settings only, not statuses)
- [ ] Error handling: per-node errors show 'error' badge, never block sibling renames
- [ ] Validate API key before running (show inline error if missing)
- [ ] Handle empty selection edge case (notify and return early)

## Status Legend

- [ ] = Not started
- [~] = In progress
- [x] = Done
