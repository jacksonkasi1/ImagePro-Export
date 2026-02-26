// ** import types
import { IModelAdapter, AIRenameGroup, AIRenameResult } from './types';

/**
 * AnthropicAdapter — Stub for future implementation.
 * Implement using the `@anthropic-ai/sdk` npm package when ready.
 */
export class AnthropicAdapter implements IModelAdapter {
  constructor(_apiKey: string, _model: string) {}

  async rename(
    groups: AIRenameGroup[],
    _systemPrompt: string,
    _caseOption: string,
    _concurrency = 5
  ): Promise<AIRenameResult[]> {
    // TODO: Implement using @anthropic-ai/sdk
    // Return original names as fallback
    return groups.flatMap((group) =>
      group.targetNodes.map((node) => ({
        nodeId: node.nodeId,
        suggestedName: node.currentName,
      }))
    );
  }
}
