// ** import types
import { AIRenameGroup } from '@/types/ai';

/**
 * Grouping siblings into one AI request can blur node-specific context
 * (e.g. avatar + banner getting the same nearby text). Keep this disabled
 * so each selected node gets its own semantic context and image crop.
 */
const ENABLE_SIBLING_BUNDLING = false;

/** How many levels deep to serialize the node's own children. */
const MAX_CONTEXT_DEPTH = 2;

/** Max levels to inspect while walking ancestors. */
const MAX_ANCESTOR_WALK = 12;

/** Max text snippets sent to AI for nearby semantic context. */
const MAX_NEARBY_TEXT_ITEMS = 8;

interface ScoredTextItem {
  text: string;
  score: number;
}

/**
 * isGenericName
 *
 * Returns true if a node name looks auto-generated / meaningless
 * (e.g. "Frame 23", "Group 5", "Rectangle", "Ellipse 3").
 * Used to decide whether to walk further up the tree for better context.
 */
function isGenericName(name: string): boolean {
  const trimmed = name.trim();
  return (
    /^(frame|group|rectangle|ellipse|polygon|vector|component|instance|section|layer|image|img)\s*\d*$/i.test(trimmed) ||
    /^auto\s*layout(?:\s*(horizontal|vertical))?$/i.test(trimmed)
  );
}

function toSceneNode(node: BaseNode | null): SceneNode | null {
  if (!node) return null;
  if (node.type === 'DOCUMENT' || node.type === 'PAGE') return null;
  return node as SceneNode;
}

function hasChildren(node: BaseNode | SceneNode): node is SceneNode & ChildrenMixin {
  return 'children' in node;
}

function isSemanticWrapper(node: SceneNode): boolean {
  if (!hasChildren(node)) return false;
  if (node.type === 'SECTION' || node.type === 'COMPONENT_SET') return false;

  const trimmedName = node.name.trim();
  const genericOrEmpty = trimmedName.length === 0 || isGenericName(trimmedName);
  if (!genericOrEmpty) return false;

  return node.children.length === 1;
}



function collectTextCandidates(
  node: SceneNode,
  maxCharsEach = 100,
  maxItems = 20
): Array<{ text: string; fontSize: number; directText: boolean }> {
  const results: Array<{ text: string; fontSize: number; directText: boolean }> = [];
  const seen = new Set<string>();

  function walk(n: SceneNode, depth: number) {
    if (results.length >= maxItems) return;

    if (n.type === 'TEXT' && 'characters' in n) {
      const chars = (n as TextNode).characters
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxCharsEach);
      const normalized = chars.toLowerCase();
      if (chars && !seen.has(normalized)) {
        seen.add(normalized);
        results.push({
          text: chars,
          fontSize: typeof (n as TextNode).fontSize === "number" ? (n as TextNode).fontSize as number : 14,
          directText: depth === 0,
        });
      }
    }

    if (hasChildren(n)) {
      for (const child of n.children) {
        walk(child as SceneNode, depth + 1);
      }
    }
  }

  walk(node, 0);
  return results;
}

function normalizeTextToken(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function scoreNearbyText(
  sourceLevel: number,
  text: string,
  fontSize: number,
  directText: boolean,
  duplicateCount: number
): number {
  let score = 40;

  score -= sourceLevel * 7;
  if (sourceLevel === 0) score += 8;
  if (fontSize > 14) {
    score += Math.min(40, Math.round((fontSize - 14) * 1.5));
  }
  if (directText) score += 10;

  const len = text.length;
  if (len >= 4 && len <= 64) score += 5;
  else score -= 3;

  if (duplicateCount > 1) {
    score -= (duplicateCount - 1) * 8;
  }

  return Math.max(1, score);
}

function compressSemanticAncestors(node: SceneNode): SceneNode[] {
  const ancestors: SceneNode[] = [];

  let cursor = toSceneNode(node.parent as BaseNode | null);
  let walked = 0;

  while (cursor && walked < MAX_ANCESTOR_WALK) {
    walked += 1;
    if (!isSemanticWrapper(cursor)) {
      ancestors.push(cursor);
    }
    cursor = toSceneNode(cursor.parent as BaseNode | null);
  }

  return ancestors;
}

function getSiblingNodes(node: SceneNode): SceneNode[] {
  const parent = toSceneNode(node.parent as BaseNode | null);
  if (!parent || !hasChildren(parent)) return [];
  return parent.children
    .filter((child) => (child as SceneNode).id !== node.id)
    .map((child) => child as SceneNode);
}

function gatherScoredNearbyText(node: SceneNode, ancestors: SceneNode[]): ScoredTextItem[] {
  const rawCandidates: Array<{
    text: string;
    fontSize: number;
    directText: boolean;
    sourceLevel: number;
  }> = [];

  const levelNodes: SceneNode[] = [node, ...ancestors];

  levelNodes.forEach((levelNode, levelIndex) => {
    const siblings = getSiblingNodes(levelNode);
    siblings.forEach((sibling) => {
      const candidates = collectTextCandidates(sibling);
      candidates.forEach((candidate) => {
        rawCandidates.push({
          text: candidate.text,
          fontSize: candidate.fontSize,
          directText: candidate.directText,
          sourceLevel: levelIndex,
        });
      });
    });
  });

  const frequency = new Map<string, number>();
  rawCandidates.forEach((candidate) => {
    const key = normalizeTextToken(candidate.text);
    frequency.set(key, (frequency.get(key) ?? 0) + 1);
  });

  const bestByText = new Map<string, ScoredTextItem>();
  rawCandidates.forEach((candidate) => {
    const key = normalizeTextToken(candidate.text);
    const duplicateCount = frequency.get(key) ?? 1;
    const score = scoreNearbyText(
      candidate.sourceLevel,
      candidate.text,
      candidate.fontSize,
      candidate.directText,
      duplicateCount
    );

    const existing = bestByText.get(key);
    if (!existing || score > existing.score) {
      bestByText.set(key, { text: candidate.text, score });
    }
  });

  return Array.from(bestByText.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_NEARBY_TEXT_ITEMS);
}

function inferClusterRole(node: SceneNode): 'card' | 'list-item' | 'grid-item' | undefined {
  const parent = toSceneNode(node.parent as BaseNode | null);
  if (!parent || !hasChildren(parent)) return undefined;

  const sameTypeCount = parent.children.filter((child) => (child as SceneNode).type === node.type).length;
  if (sameTypeCount < 3) return undefined;

  if ('layoutMode' in parent) {
    if (parent.layoutMode === 'VERTICAL') return 'list-item';
    if (parent.layoutMode === 'HORIZONTAL') return 'card';
  }

  return 'grid-item';
}

function inferRoleHint(node: SceneNode, clusterRole?: string): string {
  const width = Math.max(0, Math.round((node as unknown as { width?: number }).width ?? 0));
  const height = Math.max(0, Math.round((node as unknown as { height?: number }).height ?? 0));
  const aspectRatio = width > 0 && height > 0 ? width / height : 1;

  const parent = toSceneNode(node.parent as BaseNode | null);
  const parentWidth = Math.max(0, Math.round((parent as unknown as { width?: number })?.width ?? 0));
  const parentHeight = Math.max(0, Math.round((parent as unknown as { height?: number })?.height ?? 0));

  const widthRatio = parentWidth > 0 ? width / parentWidth : 0;
  const heightRatio = parentHeight > 0 ? height / parentHeight : 0;

  if (clusterRole === 'card' && aspectRatio >= 1.2) return 'card-cover';
  if (aspectRatio >= 2.6) return 'banner';
  if (aspectRatio >= 1.45) return 'cover';
  const isAbsoluteHero = width >= 400 && height >= 150;
  const isRelativeHero = widthRatio >= 0.85 && heightRatio >= 0.3;
  if (isAbsoluteHero || isRelativeHero) return 'hero';

  const isSquareIsh = aspectRatio >= 0.8 && aspectRatio <= 1.25;
  const isSmall = Math.max(width, height) <= 160;
  if (isSquareIsh && isSmall) return 'avatar';
  if (clusterRole === 'list-item' || clusterRole === 'grid-item') return 'thumbnail';

  return 'image';
}

function buildSectionHierarchy(ancestors: SceneNode[]): string[] {
  const meaningful = ancestors
    .filter((ancestor) => ancestor.name && !isGenericName(ancestor.name))
    .map((ancestor) => ancestor.name.trim());

  return meaningful.reverse().slice(0, 4);
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

function resolveContextNodeForExport(node: SceneNode, ancestors: SceneNode[]): SceneNode {
  return ancestors[0] ?? node;
}

function buildRichContext(
  node: SceneNode,
  ancestors: SceneNode[],
  scoredNearbyText: ScoredTextItem[]
): object {
  const sectionHierarchy = buildSectionHierarchy(ancestors);
  const clusterRole = inferClusterRole(node);
  const roleHint = inferRoleHint(node, clusterRole);

  const width = Math.max(0, Math.round((node as unknown as { width?: number }).width ?? 0));
  const height = Math.max(0, Math.round((node as unknown as { height?: number }).height ?? 0));
  const aspectRatio = width > 0 && height > 0 ? Number((width / height).toFixed(2)) : 1;

  const ctx: Record<string, unknown> = {
    targetNode: serializeNodeContext(node),
    roleHint,
    aspectRatio,
  };

  if (sectionHierarchy.length > 0) {
    ctx.sectionHierarchy = sectionHierarchy;
    ctx.parentContext = sectionHierarchy[sectionHierarchy.length - 1];
    ctx.sectionContext = sectionHierarchy[0];
  }

  if (clusterRole) {
    ctx.clusterRole = clusterRole;
  }

  if (scoredNearbyText.length > 0) {
    ctx.scoredNearbyText = scoredNearbyText;
    // Backward compatibility for existing prompts/parser.
    ctx.nearbyTextContent = scoredNearbyText.map((item) => item.text);
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
 *   - Prefer one node per group for consistent node-level naming quality.
 *   - Optional sibling bundling is disabled by default.
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
      ENABLE_SIBLING_BUNDLING &&
      siblings.length > 1 &&
      siblings.length <= 4 &&
      parentId !== 'root';

    if (useParentAsContext) {
      const referenceNode = siblings[0];
      const ancestors = compressSemanticAncestors(referenceNode);
      const scoredNearbyText = gatherScoredNearbyText(referenceNode, ancestors);
      const exportContextNode = resolveContextNodeForExport(referenceNode, ancestors);

      const parentSceneNode = toSceneNode(referenceNode.parent as BaseNode | null);
      const contextObj: Record<string, unknown> = {
        targetGroup: serializeNodeContext(parentSceneNode ?? referenceNode),
      };

      const sectionHierarchy = buildSectionHierarchy(ancestors);
      if (sectionHierarchy.length > 0) contextObj.sectionHierarchy = sectionHierarchy;
      if (scoredNearbyText.length > 0) {
        contextObj.scoredNearbyText = scoredNearbyText;
        contextObj.nearbyTextContent = scoredNearbyText.map((item) => item.text);
      }

      groups.push({
        groupId: `group_${groupIdx++}`,
        contextNodeId: exportContextNode.id,
        contextText: JSON.stringify(contextObj),
        targetNodes: siblings.map((node: SceneNode) => ({
          nodeId: node.id,
          currentName: node.name,
          nodeType: node.type,
          isSvg: svgMap.get(node.id) ?? false,
        })),
      });
    } else {
      // Each node is alone — use enriched, depth-agnostic semantic context
      for (const node of siblings) {
        const ancestors = compressSemanticAncestors(node);
        const scoredNearbyText = gatherScoredNearbyText(node, ancestors);
        const contextObj = buildRichContext(node, ancestors, scoredNearbyText);
        const exportContextNode = resolveContextNodeForExport(node, ancestors);

        groups.push({
          groupId: `group_${groupIdx++}`,
          contextNodeId: exportContextNode.id,
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
