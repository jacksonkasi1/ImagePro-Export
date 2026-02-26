// ** import types
import { AINodeClassification } from '@/types/ai';

/**
 * Vector primitives — nodes that are always atomic SVG shapes.
 * A subtree made entirely of these is a composite SVG icon and should
 * not be traversed further. Export the parent as a single image instead.
 */
const VECTOR_PRIMITIVE_TYPES = new Set([
  'VECTOR',
  'BOOLEAN_OPERATION',
  'LINE',
  'ELLIPSE',
  'POLYGON',
  'STAR',
  'RECTANGLE',
]);

/**
 * Recursively checks whether every descendant of a node is a vector primitive.
 * Used to detect "composite SVG" nodes (e.g. an icon built from multiple paths).
 *
 * Stops early as soon as a non-primitive child is found.
 */
export function isVectorSubtree(node: SceneNode): boolean {
  if (!('children' in node)) {
    return VECTOR_PRIMITIVE_TYPES.has(node.type);
  }
  const children = (node as ChildrenMixin).children;
  // Empty container is not a vector subtree
  if (children.length === 0) return false;
  return children.every((child) => isVectorSubtree(child as SceneNode));
}

/**
 * Classifies a node into one of three categories:
 *
 * - `svg_leaf`   — A VECTOR primitive OR a frame/group whose entire child subtree
 *                  is composed of vector primitives. Export as a single image.
 *                  Do NOT recurse into children.
 *
 * - `raster_leaf` — A leaf node that is not a vector primitive (e.g. IMAGE fill,
 *                   TEXT, MEDIA). Export as a single image.
 *
 * - `section`    — A FRAME, GROUP, COMPONENT etc. with mixed children that need
 *                  individual processing. Recurse into children.
 */
export function classifyNode(node: SceneNode): AINodeClassification {
  // Direct vector primitive
  if (VECTOR_PRIMITIVE_TYPES.has(node.type)) return 'svg_leaf';

  if ('children' in node) {
    const children = (node as ChildrenMixin).children;
    // Container node whose entire subtree is vector shapes → treat as one SVG icon
    if (children.length > 0 && isVectorSubtree(node as SceneNode)) return 'svg_leaf';
    // Mixed content → needs per-child processing
    return 'section';
  }

  // Leaf node (IMAGE fill rect, TEXT, etc.) that isn't a raw vector
  return 'raster_leaf';
}
