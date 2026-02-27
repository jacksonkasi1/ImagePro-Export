// ** import core packages
import { promisePool } from './promise-pool';

// ** import types
import type { AIRenameGroup, AIRenameResult } from '@/types/ai';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * GeminiAdapter
 *
 * Calls the Gemini REST API directly from the plugin UI (no server proxy needed).
 * Each group is one API call (text context + optional base64 image).
 * Results are processed through promisePool for max concurrency control.
 */
export class GeminiAdapter {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async rename(
    groups: AIRenameGroup[],
    systemPrompt: string,
    caseOption: string,
    concurrency = 5
  ): Promise<AIRenameResult[]> {
    const tasks = groups.map((group) => () => this.renameGroup(group, systemPrompt, caseOption));
    const groupResults = await promisePool(tasks, concurrency);
    return groupResults.flat();
  }

  private async renameGroup(
    group: AIRenameGroup,
    systemPrompt: string,
    caseOption: string
  ): Promise<AIRenameResult[]> {
    const userPrompt = this.buildUserPrompt(group, caseOption);

    type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };
    const parts: GeminiPart[] = [{ text: userPrompt }];

    if (group.imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: group.imageBase64,
        },
      });
    }

    const url = `${GEMINI_BASE_URL}/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const message = (errBody as any)?.error?.message ?? `HTTP ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return this.parseResponse(text, group, caseOption);
    } catch (error) {
      console.error(`[GeminiAdapter] Error for group ${group.groupId}:`, error);
      // Fallback: keep original names
      return group.targetNodes.map((node) => ({
        nodeId: node.nodeId,
        suggestedName: node.currentName,
      }));
    }
  }

  private buildUserPrompt(group: AIRenameGroup, caseOption: string): string {
    const nodeList = group.targetNodes
      .map(
        (n) =>
          `- nodeId: "${n.nodeId}", currentName: "${n.currentName}", type: "${n.nodeType}"${n.isSvg ? ', isSvg: true' : ''}`
      )
      .join('\n');

    // Try to surface nearbyTextContent prominently so the AI prioritises it
    let contextHint = '';
    try {
      const ctx = JSON.parse(group.contextText);
      if (Array.isArray(ctx?.nearbyTextContent) && ctx.nearbyTextContent.length > 0) {
        contextHint = `\nNearby text in the design (USE THIS for naming): ${ctx.nearbyTextContent.join(' | ')}`;
      }
    } catch {
      // ignore parse errors
    }

    return `Naming convention: ${caseOption}
${contextHint}
Nodes to rename:
${nodeList}

Full context (surrounding design structure):
${group.contextText}

${group.imageBase64 ? 'A screenshot of this design element is attached for visual context.' : ''}

Respond with ONLY a JSON array, no markdown, no explanation:
[{"nodeId":"...","suggestedName":"..."}]`;
  }

  private parseResponse(text: string, group: AIRenameGroup, caseOption: string): AIRenameResult[] {
    const fallbackMap = new Map(group.targetNodes.map((n) => [n.nodeId, n.currentName]));

    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) {
      console.warn(`[GeminiAdapter] No JSON array in response for group ${group.groupId}`);
      return group.targetNodes.map((n) => ({ nodeId: n.nodeId, suggestedName: n.currentName }));
    }

    try {
      const parsed = JSON.parse(match[0]) as Array<{ nodeId: string; suggestedName: string }>;
      const validNodeIds = new Set(group.targetNodes.map((n) => n.nodeId));

      for (const r of parsed) {
        if (
          r.nodeId &&
          r.suggestedName &&
          typeof r.nodeId === 'string' &&
          typeof r.suggestedName === 'string' &&
          validNodeIds.has(r.nodeId)
        ) {
          // Always enforce case conversion in code — never trust the AI to apply it
          fallbackMap.set(r.nodeId, applyCaseOption(r.suggestedName, caseOption));
        }
      }

      return group.targetNodes.map((n) => ({
        nodeId: n.nodeId,
        suggestedName: fallbackMap.get(n.nodeId) ?? n.currentName,
      }));
    } catch (err) {
      console.error(`[GeminiAdapter] Failed to parse JSON for group ${group.groupId}:`, err);
      return group.targetNodes.map((n) => ({ nodeId: n.nodeId, suggestedName: n.currentName }));
    }
  }
}

/**
 * Splits a raw AI-returned name into clean word tokens.
 * Handles: spaces, hyphens, underscores, camelCase/PascalCase boundaries,
 * leading digits, and strips any character that isn't a letter or digit.
 */
function tokenize(name: string): string[] {
  // Insert a space before uppercase letters that follow a lowercase letter (camelCase split)
  const spaced = name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  return spaced
    .split(/[\s\-_\/\.]+/)           // split on separators
    .map((t) => t.replace(/[^\w]/g, '').toLowerCase()) // strip non-word chars, lowercase
    .filter((t) => t.length > 0 && !/^\d+$/.test(t));  // drop empty tokens and pure-number tokens
}

/**
 * Converts a raw AI name to the requested naming convention in code.
 * Never trusts the AI to apply casing — always enforces it here.
 */
function applyCaseOption(name: string, caseOption: string): string {
  const words = tokenize(name);
  if (words.length === 0) return name.trim().slice(0, 80);

  switch (caseOption) {
    case 'kebab-case':
      return words.join('-').slice(0, 80);
    case 'snake_case':
      return words.join('_').slice(0, 80);
    case 'camelCase':
      return (
        words[0] + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
      ).slice(0, 80);
    case 'PascalCase':
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('').slice(0, 80);
    default:
      return words.join('-').slice(0, 80);
  }
}
