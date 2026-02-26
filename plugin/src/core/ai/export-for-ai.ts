/**
 * export-for-ai.ts
 *
 * Handles low-quality image export for AI vision context.
 * Runs in the Figma plugin main.ts sandbox (has access to figma API).
 *
 * Strategy:
 *   - Export at 0.5x scale, JPG format
 *   - If the resulting byte count is over MAX_BYTES_THRESHOLD, fall back to 0.25x
 *   - Result is base64-encoded for JSON transport
 */

const SCALE_NORMAL = 0.5;
const SCALE_FALLBACK = 0.25;
const MAX_BYTES_THRESHOLD = 150_000; // 150 KB

/**
 * Exports a node as a low-quality JPG suitable for AI vision.
 * Returns base64 string (without the data:image/jpeg;base64, prefix).
 */
export async function exportNodeForAI(node: SceneNode): Promise<string> {
  let imageData: Uint8Array;

  try {
    imageData = await node.exportAsync({
      format: 'JPG',
      constraint: { type: 'SCALE', value: SCALE_NORMAL },
    });

    // If too large, re-export at lower scale
    if (imageData.byteLength > MAX_BYTES_THRESHOLD) {
      imageData = await node.exportAsync({
        format: 'JPG',
        constraint: { type: 'SCALE', value: SCALE_FALLBACK },
      });
    }
  } catch {
    // If export fails for this node (e.g. invisible, locked), return empty string
    return '';
  }

  return uint8ArrayToBase64(imageData);
}

/**
 * Converts Uint8Array to base64 string.
 * Uses the Figma sandbox-safe approach (no Buffer, no atob from DOM).
 */
function uint8ArrayToBase64(data: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const bytes = data;
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;

    result += chars[b0 >> 2];
    result += chars[((b0 & 3) << 4) | (b1 >> 4)];
    result += i + 1 < len ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    result += i + 2 < len ? chars[b2 & 63] : '=';
  }

  return result;
}
