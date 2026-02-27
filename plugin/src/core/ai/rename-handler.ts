// ** import figma utils
import { emit } from '@create-figma-plugin/utilities';

// ** import core
import { classifyNode } from '@/core/ai/svg-detector';
import { buildRenameGroupsFromNodes } from '@/core/ai/section-grouper';
import { exportNodeForAI } from '@/core/ai/export-for-ai';

// ** import types
import { AIRenameGroup, AISettings } from '@/types/ai';
import {
  AIBatchReadyHandler,
  AIRenameProgressHandler,
  AIRenameCompleteHandler,
  AIRenameErrorHandler,
} from '@/types/events';

/**
 * Throttled async runner — processes tasks with max `concurrency` at a time.
 * Used here to limit simultaneous exportAsync calls in the Figma sandbox.
 */
async function sequentialPool<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = [];
  const executing = new Set<Promise<void>>();

  for (const task of tasks) {
    const p = (async () => {
      const result = await task();
      results.push(result);
    })();
    executing.add(p);
    void p.finally(() => executing.delete(p));

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Flattens the selected node IDs into SceneNode references,
 * classifies each, and collects nodes that should be renamed.
 *
 * SVG composite nodes are kept as-is (not recursed).
 * Section nodes have their selected children processed recursively
 * only one level — we do not deep-traverse to avoid the SVG trap.
 */
async function collectTargetNodes(
  nodeIds: string[]
): Promise<Array<{ node: SceneNode; isSvg: boolean }>> {
  const targets: Array<{ node: SceneNode; isSvg: boolean }> = [];

  for (const id of nodeIds) {
    let node: SceneNode | null;
    try {
      node = (await figma.getNodeByIdAsync(id)) as SceneNode | null;
    } catch {
      continue;
    }
    if (!node) continue;

    const classification = classifyNode(node);

    if (classification === 'svg_leaf') {
      targets.push({ node, isSvg: true });
    } else {
      // raster_leaf or section — include the node itself as a rename target
      targets.push({ node, isSvg: false });
    }
  }

  return targets;
}

/**
 * Main orchestrator called from main.ts.
 *
 * Flow:
 *  1. Collect + classify nodes
 *  2. Group by parent (section-grouper)
 *  3. Export low-quality images if readImage=true (max 2 concurrent)
 *  4. Emit AI_BATCH_READY with fully built groups
 */
export async function handleAIRenameRequest(payload: {
  nodeIds: string[];
  readImage: boolean;
  settings: AISettings;
}): Promise<void> {
  const { nodeIds, readImage } = payload;

  if (nodeIds.length === 0) return;

  // Step 1: Collect and classify
  const targets = await collectTargetNodes(nodeIds);
  if (targets.length === 0) return;

  // Step 2: Build rename groups
  const rawGroups = buildRenameGroupsFromNodes(targets);

  // Step 3: Export images for AI if readImage is enabled
  // Max 2 concurrent exports to avoid blocking the Figma sandbox
  const groups: AIRenameGroup[] = new Array(rawGroups.length);

  const exportTasks = rawGroups.map((group, index) => async () => {
    let imageBase64: string | undefined;

    if (readImage && group.contextNodeId) {
      let contextNode: SceneNode | null = null;
      try {
        contextNode = (await figma.getNodeByIdAsync(group.contextNodeId)) as SceneNode | null;
      } catch {
        // ignore
      }

      if (contextNode) {
        const b64 = await exportNodeForAI(contextNode);
        if (b64) imageBase64 = b64;
      }
    }

    const finalGroup: AIRenameGroup = {
      groupId: group.groupId,
      contextText: group.contextText,
      targetNodes: group.targetNodes,
      ...(imageBase64 ? { imageBase64 } : {}),
    };

    groups[index] = finalGroup;
  });

  await sequentialPool(exportTasks, 2);

  // Step 4: Emit to UI side
  emit<AIBatchReadyHandler>('AI_BATCH_READY', groups);
}

/**
 * Applies a single rename result to the actual Figma node.
 * Emits progress event after each successful rename.
 */
export async function applyRename(nodeId: string, newName: string): Promise<void> {
  try {
    const node = (await figma.getNodeByIdAsync(nodeId)) as SceneNode | null;
    if (node) {
      node.name = newName;
      emit<AIRenameProgressHandler>('AI_RENAME_PROGRESS', {
        nodeId,
        newName,
        status: 'done',
      });
    } else {
      emit<AIRenameErrorHandler>('AI_RENAME_ERROR', {
        nodeId,
        error: 'Node not found',
      });
    }
  } catch (error) {
    emit<AIRenameErrorHandler>('AI_RENAME_ERROR', {
      nodeId,
      error: String(error),
    });
  }
}

/**
 * Called once all renames in a batch are complete.
 */
export function signalRenameComplete(): void {
  emit<AIRenameCompleteHandler>('AI_RENAME_COMPLETE');
}
