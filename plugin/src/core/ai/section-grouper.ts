// ** import types
import { AIRenameGroup } from '@/types/ai';

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
 * How many levels deep to serialize the node's own children.
 */
const MAX_CONTEXT_DEPTH = 2;

/**
 * isGenericName
 *
 * Returns true if a node name looks auto-generated / meaningless
 * (e.g. "Frame 23", "Group 5", "Rectangle", "Ellipse 3").
 * Used to decide whether to walk further up the tree for better context.
 */
function isGenericName(name: string): boolean {
  return /^(frame|group|rectangle|ellipse|polygon|vector|component|instance|section|layer|image|img)\s*\d*$/i.test(
    name.trim()
  );
}

/**
 * Extracts all TEXT node characters from a subtree, deduplicated, capped.
 * Returns an array of unique non-empty strings.
 */
function extractTextContent(node: SceneNode, maxCharsEach = 80, maxItems = 6): string[] {
  const texts: string[] = [];
  const seen = new Set<string>();

  function walk(n: SceneNode) {
    if (texts.length >= maxItems) return;
    if (n.type === 'TEXT' && 'characters' in n) {
      const chars = (n as TextNode).characters.trim().slice(0, maxCharsEach);
      if (chars && !seen.has(chars)) {
        seen.add(chars);
        texts.push(chars);
      }
    }
    if ('children' in n) {
      for (const child of (n as ChildrenMixin).children) {
        walk(child as SceneNode);
      }
    }
  }

  walk(node);
  return texts;
}

/**
 * Serializes a node into a lightweight object for the AI.
 * Includes: name, type, dimensions, TEXT characters (if any), and children up to MAX_CONTEXT_DEPTH.
 */
export function serializeNodeContext(node: SceneNode, depth = 0): object {
  const base: Record<string, unknown> = {
    name: node.name,
    type: node.type,
    dimensions: {
      width: Math.round((node as any).width ?? 0),
      height: Math.round((node as any).height ?? 0),
    },
  };

  // TEXT nodes carry the richest rename signal
  if (node.type === 'TEXT' && 'characters' in node) {
    const chars = (node as TextNode).characters.trim();
    if (chars) base.characters = chars.slice(0, 120);
  }

  // Recurse into children up to MAX_CONTEXT_DEPTH
  if (depth < MAX_CONTEXT_DEPTH && 'children' in node) {
    const children = (node as ChildrenMixin).children;
    if (children.length > 0) {
      base.children = children
        .slice(0, 12)
        .map((child) => serializeNodeContext(child as SceneNode, depth + 1));
    }
  }

  return base;
}

/**
 * Builds rich context for a single isolated node (not bundled with siblings).
 *
 * Strategy — walk UP the tree to find meaningful context:
 *   1. Collect all TEXT characters from the parent's subtree (siblings + their children)
 *   2. Include the parent name (if not generic, else grandparent name)
 *   3. Include grandparent name for card/section category
 *   4. Serialize the node itself (its own children / fills)
 *
 * This ensures that an avatar image sitting next to a "Harish Goswami" TEXT node
 * will have that name available to the AI.
 */
function buildSingleNodeContext(node: SceneNode): object {
  const parent = node.parent as BaseNode | null;
  const grandparent = parent?.parent as BaseNode | null;

  // --- Collect sibling TEXT content from parent ---
  const siblingTexts: string[] = [];
  if (parent && 'children' in parent) {
    for (const sibling of (parent as ChildrenMixin).children) {
      if ((sibling as SceneNode).id === node.id) continue;
      const texts = extractTextContent(sibling as SceneNode);
      siblingTexts.push(...texts);
      if (siblingTexts.length >= 6) break;
    }
  }

  // --- Determine the best ancestor name ---
  // Walk up until we find a non-generic name (max 3 levels)
  let ancestorName: string | undefined;
  let cursor: BaseNode | null = parent;
  for (let i = 0; i < 3 && cursor; i++) {
    if (cursor.type === 'PAGE' || cursor.type === 'DOCUMENT') break;
    const sceneNode = cursor as SceneNode;
    if (sceneNode.name && !isGenericName(sceneNode.name)) {
      ancestorName = sceneNode.name;
      break;
    }
    cursor = cursor.parent as BaseNode | null;
  }

  // --- Build the context object ---
  const ctx: Record<string, unknown> = {
    targetNode: serializeNodeContext(node),
  };

  if (ancestorName) {
    ctx.parentContext = ancestorName;
  }

  // Grandparent name for extra category signal (e.g. "article-card", "author-section")
  if (grandparent && grandparent.type !== 'PAGE' && (grandparent as BaseNode).type !== 'DOCUMENT' && grandparent.name && !isGenericName(grandparent.name)) {
    ctx.sectionContext = grandparent.name;
  }

  if (siblingTexts.length > 0) {
    // These are the MOST IMPORTANT signals — nearby text content
    ctx.nearbyTextContent = siblingTexts;
  }

  return ctx;
}

/**
 * Groups selected nodes by their direct parent ID.
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
 *   - Nodes sharing a parent (≤ MAX_SIBLINGS_FOR_PARENT_CONTEXT):
 *     bundle into one group, use parent as context image, serialize full parent.
 *   - Single nodes: use buildSingleNodeContext() which walks up the tree
 *     to collect sibling TEXT content and ancestor names.
 */
export function buildRenameGroupsFromNodes(
  nodes: Array<{
    node: SceneNode;
    isSvg: boolean;
  }>
): Array<Omit<AIRenameGroup, 'imageBase64'> & { contextNodeId: string }> {
  const groups: Array<Omit<AIRenameGroup, 'imageBase64'> & { contextNodeId: string }> = [];

  const byParent = groupByParent(nodes.map((n) => n.node));
  const svgMap = new Map(nodes.map((n) => [n.node.id, n.isSvg]));

  let groupIdx = 0;
  for (const [parentId, siblings] of Array.from(byParent.entries())) {
    const useParentAsContext =
      siblings.length > 1 &&
      siblings.length <= MAX_SIBLINGS_FOR_PARENT_CONTEXT &&
      parentId !== 'root';

    if (useParentAsContext) {
      // Bundle siblings — serialize the parent node (includes all sibling children)
      const parentNode = siblings[0].parent as SceneNode | null;
      const contextObj = parentNode ? serializeNodeContext(parentNode) : {};

      groups.push({
        groupId: `group_${groupIdx++}`,
        contextNodeId: parentId,
        contextText: JSON.stringify(contextObj),
        targetNodes: siblings.map((node: SceneNode) => ({
          nodeId: node.id,
          currentName: node.name,
          nodeType: node.type,
          isSvg: svgMap.get(node.id) ?? false,
        })),
      });
    } else {
      // Each node is alone — use enriched context that includes sibling TEXT + ancestors
      for (const node of siblings) {
        const contextObj = buildSingleNodeContext(node);
        groups.push({
          groupId: `group_${groupIdx++}`,
          contextNodeId: node.id,
          contextText: JSON.stringify(contextObj),
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
