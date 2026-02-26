export type AIModelProvider = 'gemini' | 'openai' | 'anthropic';

export interface AIRenameTargetNode {
  nodeId: string;
  currentName: string;
  nodeType: string;
  isSvg: boolean;
}

export interface AIRenameGroup {
  groupId: string;
  contextText: string;
  imageBase64?: string;
  targetNodes: AIRenameTargetNode[];
}

export interface AIRenameResult {
  nodeId: string;
  suggestedName: string;
}

export interface AIRenameBatchRequest {
  groups: AIRenameGroup[];
  settings: {
    modelProvider: AIModelProvider;
    model: string;
    apiKey: string;
    systemPrompt: string;
    caseOption: string;
  };
}

export interface IModelAdapter {
  rename(
    groups: AIRenameGroup[],
    systemPrompt: string,
    caseOption: string,
    concurrency?: number
  ): Promise<AIRenameResult[]>;
}
