import { GoogleGenAI } from '@google/genai';

// ** import utils
import { promisePool } from '../../../utils/promise-pool';

// ** import types
import { IModelAdapter, AIRenameGroup, AIRenameResult } from './types';

/**
 * GeminiAdapter
 *
 * Sends rename groups to Gemini using the @google/genai SDK.
 * Each group is one API call (text context + optional base64 image).
 * Results are processed through promisePool for max concurrency control.
 */
export class GeminiAdapter implements IModelAdapter {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.ai = new GoogleGenAI({ apiKey });
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

    // Flatten all group results into a single array
    return groupResults.flat();
  }

  private async renameGroup(
    group: AIRenameGroup,
    systemPrompt: string,
    caseOption: string
  ): Promise<AIRenameResult[]> {
    const userPrompt = this.buildUserPrompt(group, caseOption);

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
      { text: userPrompt },
    ];

    // Attach low-quality image if present
    if (group.imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: group.imageBase64,
        },
      });
    }

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2, // Low temp for consistent, deterministic names
          maxOutputTokens: 512,
        },
      });

      const text = response.text ?? '';
      return this.parseResponse(text, group);
    } catch (error) {
      console.error(`[GeminiAdapter] Error for group ${group.groupId}:`, error);
      // Return fallback: keep original names
      return group.targetNodes.map((node) => ({
        nodeId: node.nodeId,
        suggestedName: node.currentName,
      }));
    }
  }

  private buildUserPrompt(group: AIRenameGroup, caseOption: string): string {
    const nodeList = group.targetNodes
      .map((n) => `- nodeId: "${n.nodeId}", currentName: "${n.currentName}", type: "${n.nodeType}"${n.isSvg ? ', isSvg: true' : ''}`)
      .join('\n');

    return `Naming convention: ${caseOption}

Nodes to rename:
${nodeList}

Context (surrounding design structure):
${group.contextText}

${group.imageBase64 ? 'A screenshot of this design element is attached for visual context.' : ''}

Respond with ONLY a JSON array, no markdown, no explanation:
[{"nodeId":"...","suggestedName":"..."}]`;
  }

  private parseResponse(text: string, group: AIRenameGroup): AIRenameResult[] {
    // Build a fallback map so every node always gets a result
    const fallbackMap = new Map(
      group.targetNodes.map((n) => [n.nodeId, n.currentName])
    );

    // Strip markdown fences if model adds them despite instructions
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    // Find the first JSON array in the response
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) {
      console.warn(`[GeminiAdapter] Could not find JSON array in response for group ${group.groupId}`);
      return group.targetNodes.map((n) => ({ nodeId: n.nodeId, suggestedName: n.currentName }));
    }

    try {
      const parsed = JSON.parse(match[0]) as Array<{ nodeId: string; suggestedName: string }>;

      // Merge valid AI results into fallback map
      const validNodeIds = new Set(group.targetNodes.map((n) => n.nodeId));
      for (const r of parsed) {
        if (
          r.nodeId &&
          r.suggestedName &&
          typeof r.nodeId === 'string' &&
          typeof r.suggestedName === 'string' &&
          validNodeIds.has(r.nodeId)
        ) {
          fallbackMap.set(r.nodeId, sanitizeName(r.suggestedName));
        }
      }

      // Return a result for every target node (fallback = original name)
      return group.targetNodes.map((n) => ({
        nodeId: n.nodeId,
        suggestedName: fallbackMap.get(n.nodeId) ?? n.currentName,
      }));
    } catch (err) {
      console.error(`[GeminiAdapter] Failed to parse JSON response for group ${group.groupId}:`, err);
      return group.targetNodes.map((n) => ({ nodeId: n.nodeId, suggestedName: n.currentName }));
    }
  }
}

/**
 * Sanitizes an AI-suggested name:
 * - Remove characters that are unsafe in Figma node names
 * - Trim whitespace
 * - Cap at 80 characters
 */
function sanitizeName(name: string): string {
  return name
    .replace(/[^\w\s\-\.\/]/g, '') // keep word chars, spaces, hyphens, dots, slashes
    .trim()
    .slice(0, 80);
}
