# AIRE — AI Rename Engine: Plan

## Feature Goal

Add an **AI** tab to the ImagePro Figma plugin that intelligently renames selected design nodes
using AI. The AI reads structural context (and optionally a low-quality screenshot) of each node
and suggests a meaningful asset name, then applies it directly in Figma — in real-time, node by node.

---

## Tab Naming

The new tab is labeled **AI** (internally `'ai'` as the page key, consistent with existing store types).

---

## UX Layout (from design spec 3.4)

```
┌──────────────────────────────────────────┐
│  Asset  │  Upload  │  AI              ⚙  │  ← gear icon opens settings panel
├──────────────────────────────────────────┤
│  ☐ Select All   3/12 nodes              │
├──────────────────────────────────────────┤
│  ☐ [thumb] hero-banner      ✅ renamed   │
│  ☐ [thumb] icon/star        ⏳ pending   │
│  ☐ [thumb] vector-path      ✅ renamed   │
│  ☐ [thumb] Frame 42         ❌ error     │
├──────────────────────────────────────────┤
│  [  Read image for better naming  ☐  ]  │
│  ──────────────────────────────────────  │
│              [ Run AI Rename ]           │
└──────────────────────────────────────────┘
```

- Node statuses update **in real-time** as each rename completes — no batch wait.
- Settings gear opens a panel with: model selector, API key input, custom system prompt textarea.
- "Read image" toggle controls whether a low-quality screenshot is sent to AI alongside text context.

---

## Architecture

### Data Flow

```
User clicks Run
  → UI emits AI_RENAME_REQUEST {nodeIds, readImage, settings}
  → main.ts: classifyNode() each selected node
  → main.ts: groupNodesByParent() into RenameGroups
  → main.ts: exportAsync() low-quality JPG per group (sequential, max 2 concurrent)
  → main.ts emits AI_BATCH_READY {groups[]}
  → UI: POST /api/ai/rename-batch {groups[], settings}
  → Server: promisePool(aiCalls, concurrency=5)
  → Server: GeminiAdapter → structured JSON response
  → Server: stream results back as they complete (NDJSON chunks)
  → UI: for each result → emit AI_APPLY_RENAME {nodeId, newName}
  → main.ts: node.name = newName → emit AI_RENAME_PROGRESS {nodeId, status:'done'}
  → UI: update status badge for that node in real-time
  → when all done → emit AI_RENAME_COMPLETE
```

### No-Hang Guarantee

The plugin must never feel frozen:
- Figma `exportAsync` calls are throttled to max 2 concurrent (sandbox constraint).
- AI API calls are capped at 5 concurrent (network I/O bound).
- Progress events are emitted **per node** so the UI is always updating.
- The Run button shows a live counter: "Renaming 3/12…".
- Errors per node are shown inline — one node failing never blocks the rest.

---

## Algorithm 1: SVG Detection — `classifyNode()`

**Purpose**: Determine if a node is a vector/SVG composite before traversal, to avoid pointlessly
recursing deep into shapes that will only ever produce the same SVG image.

**Problem**: A FRAME containing 50 nested VECTOR path children is still just an icon. Traversing
all 50 children wastes time and produces 50 separate rename calls when one would suffice.

**Solution**: Walk children; if ALL descendants are vector primitives → treat the whole node as
a single SVG leaf. Export the parent node once as an image.

```
VECTOR_PRIMITIVES = {VECTOR, BOOLEAN_OPERATION, LINE, ELLIPSE, POLYGON, STAR, RECTANGLE}

classifyNode(node):
  if node.type in VECTOR_PRIMITIVES → return 'svg_leaf'
  if node has children:
    if ALL children recursively are vector primitives → return 'svg_leaf'  (composite SVG)
    else → return 'section'
  return 'raster_leaf'
```

**Outcome**:
- `svg_leaf` → export the node itself as a low-quality JPG → send to AI with hint "this is a vector icon"
- `raster_leaf` → export as low-quality JPG → send to AI
- `section` → recurse one level, group children by parent for bundling

---

## Algorithm 2: Section Grouper — `groupNodesByParent()`

**Purpose**: Preserve layout context when sending to AI. An isolated node out of context loses
semantic meaning. A node within its siblings (e.g. a card in a grid) tells AI much more.

**Problem**: Sending the full Figma page to AI = huge payload, slow, noisy. Sending one node
at a time = loses surrounding context. Need a middle ground.

**Solution**: Group selected nodes by their direct `parentId`. If ≤ 4 siblings are selected from
the same parent, export the **parent** as a single image (captures layout context). If > 4,
export each individually.

```
groupNodesByParent(selectedNodes):
  map = {}
  for each node in selectedNodes:
    pid = node.parent.id ?? 'root'
    map[pid].push(node)

  for each [parentId, siblings] in map:
    if siblings.length <= 4:
      contextNodeId = parentId  ← export parent for visual context
    else:
      contextNodeId = each sibling individually

  → return RenameGroup[]
```

**Context Text** (when readImage=false): Serialize a lightweight 2-level JSON of the node tree.
Include `TEXT` node `.characters` because text content is the richest semantic signal.
Never send more than 2 levels deep. No binary data. Only: id, name, type, dimensions, text chars.

---

## Algorithm 3: Promise Pool — `promisePool(tasks, concurrency)`

**Purpose**: Run up to N async tasks concurrently, no more. Ensures the plugin stays responsive
and doesn't blast the AI API with 50 simultaneous requests.

```
promisePool(tasks, concurrency=5):
  executing = Set()
  for each task:
    p = task().then(result → executing.delete(p))
    executing.add(p)
    if executing.size >= concurrency:
      await Promise.race(executing)  ← wait for one slot to free
  await Promise.all(executing)       ← drain remaining
```

- Export phase (main.ts, Figma sandbox): `concurrency = 2`
- AI call phase (server): `concurrency = 5`

---

## Algorithm 4: Model Adapter Factory

**Purpose**: Decouple the rename logic from any specific AI provider. Adding OpenAI or Anthropic
in the future = add one adapter file, register in factory. Zero other changes.

```
IModelAdapter:
  rename(groups, systemPrompt, concurrency) → Promise<AIRenameResult[]>

GeminiAdapter implements IModelAdapter
OpenAIAdapter implements IModelAdapter   (stub for now)
AnthropicAdapter implements IModelAdapter (stub for now)

ModelAdapterFactory.create(provider, apiKey, model) → IModelAdapter
```

---

## Low-Quality Image Export Spec

For AI vision mode (`readImage = true`):
- Export format: `JPG`
- Scale: `0.5x` (half resolution — readable by vision models, small payload)
- If exported image > 150KB: reduce scale to `0.25x`
- Max longest dimension capped at 800px
- Purpose: AI needs to identify what the asset IS, not print-quality detail

---

## Default System Prompt

```
You are a professional UI asset naming assistant for Figma.
Given a JSON description of a design node (and optionally a screenshot),
suggest a concise, descriptive asset name in the specified naming convention.

Rules:
- Name should reflect the visual PURPOSE of the element, not its Figma layer name
- Use what you see: if it's a hero banner with a CTA, name it "hero-get-started"
- If it's an icon/vector: describe the shape — "icon-arrow-right", "icon-user-profile"
- Maximum 4 words, no generic names like "frame-1" or "rectangle-5"
- Apply naming convention: {{caseOption}}
- Respond ONLY with a valid JSON array: [{"nodeId":"...","suggestedName":"..."}]
```

User can override this from the settings panel. Stored in Figma `clientStorage`.

---

## Default AI Models

- **Fast (default)**: `gemini-2.5-flash-preview-04-17`
- **Quality**: `gemini-2.5-pro-preview-03-25`

Reference: https://ai.google.dev/gemini-api/docs/models

---

## Server Route

```
POST /api/ai/rename-batch
Body: {
  groups: AIRenameGroup[],
  settings: { modelProvider, model, apiKey, systemPrompt, caseOption }
}
Response: AIRenameResult[]
  (streamed as NDJSON: one JSON line per result as each completes)
```

---

## New Files

### Plugin (`plugin/src/`)

| File | Purpose |
|------|---------|
| `types/ai.ts` | All AI-feature type definitions |
| `store/use-ai-store.ts` | Zustand store for AI settings + rename statuses |
| `pages/AIPage/index.tsx` | AI tab page root |
| `pages/AIPage/_components/AINodeList.tsx` | Node list with real-time status badges |
| `pages/AIPage/_components/AISettingsPanel.tsx` | Model, prompt, API key settings |
| `pages/AIPage/_components/AIStatusBadge.tsx` | Per-node status indicator |
| `pages/AIPage/_components/AIRunButton.tsx` | Action button with live counter |
| `core/ai/svg-detector.ts` | `classifyNode()` algorithm |
| `core/ai/section-grouper.ts` | `groupNodesByParent()` algorithm |
| `core/ai/export-for-ai.ts` | Low-quality export + context serializer |
| `core/ai/rename-handler.ts` | main.ts-side orchestrator |
| `helpers/ai/promise-pool.ts` | Concurrency utility (used by server too) |

### Server (`server/imagepro-file-process/src/`)

| File | Purpose |
|------|---------|
| `routes/ai/index.ts` | Route registration |
| `routes/ai/rename-batch.ts` | POST handler |
| `routes/ai/adapters/index.ts` | IModelAdapter interface + factory |
| `routes/ai/adapters/gemini.ts` | GeminiAdapter (live) |
| `routes/ai/adapters/openai.ts` | OpenAIAdapter (stub) |
| `routes/ai/adapters/anthropic.ts` | AnthropicAdapter (stub) |

### Modified Files

| File | Change |
|------|--------|
| `components/tab-switch/index.tsx` | Add AI option to SegmentedControl |
| `pages/index.tsx` | Register AIPage |
| `types/events.ts` | Add AI event handler types |
| `main.ts` | Wire AI event handlers |
| `hooks/useStorageManager.ts` | Register aiStore for persistence |
| `server/src/routes/index.ts` | Register /api/ai routes |

---

## Coding Standards

Follow existing patterns exactly:
- Import comment headers: `// ** import types`, `// ** import core packages`, etc.
- Preact (`h`, `Fragment`) not React
- Zustand with `create<State>()`
- `emit/on` from `@create-figma-plugin/utilities` for plugin messaging
- Tailwind classes for styling (no inline styles except transitions)
- Component structure: `ComponentName/index.tsx` with `_components/` subfolder
- All types in `types/` directory, not inline
