// ** import types
import { AIRenameGroup, AINodeContextChild } from '@/types/ai';

/**
 * MAX_SIBLINGS_FOR_PARENT_CONTEXT
 *
 * If ≤ this many siblings are selected from the same parent, export the
 * PARENT as context image (preserves layout signal). If more, export each
 * node individually — the parent image would be too noisy.
 */
const MAX_SIBLINGS_FOR_PARENT_CONTEXT = 4;

/**
 * MAX_CONTEXT_DEPTH
 *
 * How many levels deep to serialize the node tree into context text.
 * Deeper = more tokens but diminishing returns for rename quality.
 */
const MAX_CONTEXT_DEPTH = 2;

/**
 * Serializes a node into a lightweight JSON string for the AI.
 * Includes: id, name, type, dimensions, and TEXT.characters (richest semantic signal).
 * Capped at MAX_CONTEXT_DEPTH levels deep.
 */
export function serializeNodeContext(node: SceneNode, depth = 0): object {
  const base: Record<string, unknown> = {
    nodeId: node.id,
    name: node.name,
    type: node.type,
    dimensions: {
      width: Math.round((node as any).width ?? 0),
      height: Math.round((node as any).height ?? 0),
    },
  };

  // TEXT nodes carry the richest rename signal
  if (node.type === 'TEXT' && 'characters' in node) {
    const chars = (node as TextNode).characters;
    if (chars) base.characters = chars.slice(0, 120); // cap length
  }

  // Recurse into children up to MAX_CONTEXT_DEPTH
  if (depth < MAX_CONTEXT_DEPTH && 'children' in node) {
    const children = (node as ChildrenMixin).children;
    if (children.length > 0) {
      base.children = children
        .slice(0, 12) // cap child count to avoid bloated payloads
        .map((child) => serializeNodeContext(child as SceneNode, depth + 1));
    }
  }

  return base;
}

/**
 * Groups selected nodes by their direct parent ID.
 *
 * Returns a Map<parentId, SceneNode[]>.
 */
function groupByParent(nodes: SceneNode[]): Map<string, SceneNode[]> {
  const map = new Map<string, SceneNode[]>();
  for (const node of nodes) {
    const pid = node.parent?.id ?? 'root';
    if (!map.has(pid)) map.set(pid, []);
    map.get(pid)!.push(node);
  }
  return map;
}

/**
 * Builds AIRenameGroups from a flat list of selected nodes.
 *
 * Strategy:
 *   - Nodes sharing a parent: if ≤ MAX_SIBLINGS_FOR_PARENT_CONTEXT,
 *     use the parent as context anchor (export parent image).
 *   - Otherwise: each node is its own group.
 *
 * The `contextNodeId` is the ID of the node that should be exported as
 * the context image. The `targetNodes` list contains the actual nodes
 * to rename.
 *
 * Image export is handled separately by export-for-ai.ts in main.ts context.
 */
export function buildRenameGroupsFromNodes(
  nodes: Array<{
    node: SceneNode;
    isSvg: boolean;
  }>
): Array<Omit<AIRenameGroup, 'imageBase64'> & { contextNodeId: string }> {
  const groups: Array<Omit<AIRenameGroup, 'imageBase64'> & { contextNodeId: string }> = [];

  // Group nodes by parent
  const byParent = groupByParent(nodes.map((n) => n.node));
  const svgMap = new Map(nodes.map((n) => [n.node.id, n.isSvg]));

  let groupIdx = 0;
  for (const [parentId, siblings] of Array.from(byParent.entries())) {
    const useParentAsContext =
      siblings.length > 1 &&
      siblings.length <= MAX_SIBLINGS_FOR_PARENT_CONTEXT &&
      parentId !== 'root';

    const contextNodeId = useParentAsContext ? parentId : '';

    // When using parent context, bundle all siblings into one group
    if (useParentAsContext) {
      const targetNodes = siblings.map((node: SceneNode) => ({
        nodeId: node.id,
        currentName: node.name,
        nodeType: node.type,
        isSvg: svgMap.get(node.id) ?? false,
      }));

      // Serialize context: use parent node if available
      const parentNode = siblings[0].parent as SceneNode | null;
      const contextObj = parentNode ? serializeNodeContext(parentNode) : { nodes: targetNodes };

      groups.push({
        groupId: `group_${groupIdx++}`,
        contextNodeId,
        contextText: JSON.stringify(contextObj),
        targetNodes,
      });
    } else {
      // Each node gets its own group
      for (const node of siblings) {
        groups.push({
          groupId: `group_${groupIdx++}`,
          contextNodeId: node.id,
          contextText: JSON.stringify(serializeNodeContext(node)),
          targetNodes: [
            {
              nodeId: node.id,
              currentName: node.name,
              nodeType: node.type,
              isSvg: svgMap.get(node.id) ?? false,
            },
          ],
        });
      }
    }
  }

  return groups;
}
