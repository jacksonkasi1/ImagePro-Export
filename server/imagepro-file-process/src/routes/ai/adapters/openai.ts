// ** import types
import { IModelAdapter, AIRenameGroup, AIRenameResult } from './types';

/**
 * OpenAIAdapter — Stub for future implementation.
 * Implement using the `openai` npm package when ready.
 */
export class OpenAIAdapter implements IModelAdapter {
  constructor(_apiKey: string, _model: string) {}

  async rename(
    groups: AIRenameGroup[],
    _systemPrompt: string,
    _caseOption: string,
    _concurrency = 5
  ): Promise<AIRenameResult[]> {
    // TODO: Implement using openai SDK
    // Return original names as fallback
    return groups.flatMap((group) =>
      group.targetNodes.map((node) => ({
        nodeId: node.nodeId,
        suggestedName: node.currentName,
      }))
    );
  }
}
