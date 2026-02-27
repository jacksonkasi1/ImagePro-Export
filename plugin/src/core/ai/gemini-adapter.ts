// ** import types
import type { AIRenameGroup, AIRenameResult } from '@/types/ai';

// ** import core packages
import { promisePool } from './promise-pool';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function sanitizePromptText(text: string, maxLength: number): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function buildCompactContext(ctx: any): Record<string, unknown> {
  const nearbyText = Array.isArray(ctx?.scoredNearbyText)
    ? ctx.scoredNearbyText
        .map((item: any) => {
          if (!item || typeof item !== 'object' || typeof item.text !== 'string') return null;
          return {
            text: sanitizePromptText(item.text, 90),
            score: typeof item.score === 'number' ? item.score : 0,
          };
        })
        .filter(Boolean)
        .slice(0, 5)
    : [];

  const sectionHierarchy = Array.isArray(ctx?.sectionHierarchy)
    ? ctx.sectionHierarchy.filter((item: unknown) => typeof item === 'string').slice(0, 4)
    : [];

  return {
    targetNode: {
      type: ctx?.targetNode?.type,
      name: ctx?.targetNode?.name,
      dimensions: ctx?.targetNode?.dimensions,
    },
    roleHint: ctx?.roleHint,
    clusterRole: ctx?.clusterRole,
    aspectRatio: ctx?.aspectRatio,
    sectionHierarchy,
    nearbyText,
  };
}

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
  private static modelCache = new Map<string, { at: number; models: string[] }>();

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
    const resolvedModel = await this.resolveModelId(this.model);

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

    const url = `${GEMINI_BASE_URL}/${resolvedModel}:generateContent?key=${this.apiKey}`;

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 256,
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
      const contextSignals = this.extractContextSignals(group.contextText);
      return group.targetNodes.map((node) => ({
        nodeId: node.nodeId,
        suggestedName: this.postProcessSuggestedName({
          suggestedName: node.currentName,
          currentName: node.currentName,
          caseOption,
          contextSignals,
        }),
      }));
    }
  }

  private async resolveModelId(requested: string): Promise<string> {
    const requestedClean = requested.trim();
    if (!requestedClean) return 'gemini-2.5-flash';

    const available = await this.listModels();
    if (available.length === 0) return requestedClean;

    if (available.includes(requestedClean)) return requestedClean;

    const aliasPrefixes = [requestedClean];
    if (requestedClean === 'gemini-3-flash') {
      aliasPrefixes.push('gemini-3-flash-preview');
    }
    if (requestedClean === 'gemini-3.1-pro') {
      aliasPrefixes.push('gemini-3.1-pro-preview');
    }

    for (const prefix of aliasPrefixes) {
      const candidates = available.filter((m) => m.startsWith(prefix));
      if (candidates.length > 0) {
        // Pick lexicographically latest preview suffix if multiple exist.
        return candidates.sort().at(-1) ?? requestedClean;
      }
    }

    const familyCandidates = available.filter((m) => m.startsWith(requestedClean.split('-').slice(0, 3).join('-')));
    if (familyCandidates.length > 0) {
      return familyCandidates.sort().at(-1) ?? requestedClean;
    }

    return requestedClean;
  }

  private async listModels(): Promise<string[]> {
    const cacheKey = this.apiKey;
    const cached = GeminiAdapter.modelCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.at < 5 * 60 * 1000) {
      return cached.models;
    }

    try {
      const url = `${GEMINI_BASE_URL}?key=${this.apiKey}`;
      const response = await fetch(url);
      if (!response.ok) return cached?.models ?? [];

      const data = await response.json() as {
        models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
      };

      const models = (data.models ?? [])
        .filter((m) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
        .map((m) => (m.name ?? '').replace(/^models\//, ''))
        .filter((m) => m.startsWith('gemini-'));

      GeminiAdapter.modelCache.set(cacheKey, { at: now, models });
      return models;
    } catch {
      return cached?.models ?? [];
    }
  }

  private buildUserPrompt(group: AIRenameGroup, caseOption: string): string {
    const nodeList = group.targetNodes
      .map(
        (n) =>
          `- nodeId: "${n.nodeId}", currentName: "${n.currentName}", type: "${n.nodeType}"${n.isSvg ? ', isSvg: true' : ''}`
      )
      .join('\n');

    let contextHint = '';
    let compactContext = group.contextText;
    try {
      const ctx = JSON.parse(group.contextText);
      const sectionHierarchy = Array.isArray(ctx?.sectionHierarchy)
        ? ctx.sectionHierarchy.filter((item: unknown) => typeof item === 'string')
        : [];

      const scoredNearbyText = Array.isArray(ctx?.scoredNearbyText)
        ? ctx.scoredNearbyText
            .map((item: unknown) => {
              if (!item || typeof item !== 'object') return null;
              const maybeText = (item as { text?: unknown }).text;
              if (typeof maybeText !== 'string') return null;
              return sanitizePromptText(maybeText, 90);
            })
            .filter((item: string | null): item is string => Boolean(item))
        : [];

      const nearbyTextContent = Array.isArray(ctx?.nearbyTextContent)
        ? ctx.nearbyTextContent
            .filter((item: unknown) => typeof item === 'string')
            .map((item: string) => sanitizePromptText(item, 90))
        : [];

      const roleHint = typeof ctx?.roleHint === 'string' ? ctx.roleHint : '';
      const clusterRole = typeof ctx?.clusterRole === 'string' ? ctx.clusterRole : '';

      const lines: string[] = [];
      if (sectionHierarchy.length > 0) {
        lines.push(`Section hierarchy (outer -> inner): ${sectionHierarchy.slice(0, 4).join(' > ')}`);
      }

      const rankedText = scoredNearbyText.length > 0 ? scoredNearbyText : nearbyTextContent;
      if (rankedText.length > 0) {
        lines.push(`Nearby text (highest priority for naming): ${rankedText.slice(0, 5).join(' | ')}`);
      }

      lines.push('Policy: prefer surrounding semantic text over currentName.');

      if (roleHint) {
        lines.push(`Visual role hint: ${roleHint}`);
      }

      if (clusterRole) {
        lines.push(`Layout pattern hint: ${clusterRole}`);
      }

      if (lines.length > 0) {
        contextHint = `\n${lines.join('\n')}`;
      }

      compactContext = JSON.stringify(buildCompactContext(ctx));
    } catch {
      // ignore parse errors
    }

    return `Naming convention: ${caseOption}
${contextHint}
Nodes to rename:
${nodeList}

Compact context (surrounding design structure):
${compactContext}

${group.imageBase64 ? 'A screenshot of this design element is attached for visual context.' : ''}

Respond with ONLY a JSON array, no markdown, no explanation:
[{"nodeId":"...","suggestedName":"..."}]`;
  }

  private parseResponse(text: string, group: AIRenameGroup, caseOption: string): AIRenameResult[] {
    const fallbackMap = new Map(group.targetNodes.map((n) => [n.nodeId, n.currentName]));
    const contextSignals = this.extractContextSignals(group.contextText);

    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) {
      console.warn(`[GeminiAdapter] No JSON array in response for group ${group.groupId}`);
      return group.targetNodes.map((n) => ({
        nodeId: n.nodeId,
        suggestedName: this.postProcessSuggestedName({
          suggestedName: n.currentName,
          currentName: n.currentName,
          caseOption,
          contextSignals,
        }),
      }));
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
        suggestedName: this.postProcessSuggestedName({
          suggestedName: fallbackMap.get(n.nodeId) ?? n.currentName,
          currentName: n.currentName,
          caseOption,
          contextSignals,
        }),
      }));
    } catch (err) {
      console.error(`[GeminiAdapter] Failed to parse JSON for group ${group.groupId}:`, err);
      return group.targetNodes.map((n) => ({
        nodeId: n.nodeId,
        suggestedName: this.postProcessSuggestedName({
          suggestedName: n.currentName,
          currentName: n.currentName,
          caseOption,
          contextSignals,
        }),
      }));
    }
  }

  private extractContextSignals(contextText: string): {
    roleHint: string;
    nearbyTexts: string[];
    sectionHierarchy: string[];
  } {
    try {
      const ctx = JSON.parse(contextText) as {
        roleHint?: unknown;
        scoredNearbyText?: Array<{ text?: unknown }>;
        nearbyTextContent?: unknown;
      };

      const roleHint = typeof ctx.roleHint === 'string' ? ctx.roleHint.toLowerCase() : '';

      const scored = Array.isArray(ctx.scoredNearbyText)
        ? ctx.scoredNearbyText
            .map((item) => (typeof item?.text === 'string' ? sanitizePromptText(item.text, 90) : ''))
            .filter((item) => item.length > 0)
        : [];

      const nearby = Array.isArray(ctx.nearbyTextContent)
        ? ctx.nearbyTextContent
            .filter((item): item is string => typeof item === 'string' && item.length > 0)
            .map((item: string) => sanitizePromptText(item, 90))
        : [];

      const nearbyTexts = Array.from(new Set([...scored, ...nearby]));
      const sectionHierarchy = Array.isArray((ctx as any).sectionHierarchy)
        ? (ctx as any).sectionHierarchy.filter((item: unknown) => typeof item === 'string')
        : [];
      return { roleHint, nearbyTexts, sectionHierarchy };
    } catch {
      return { roleHint: '', nearbyTexts: [], sectionHierarchy: [] };
    }
  }

  private postProcessSuggestedName(params: {
    suggestedName: string;
    currentName: string;
    caseOption: string;
    contextSignals: { roleHint: string; nearbyTexts: string[]; sectionHierarchy: string[] };
  }): string {
    const { suggestedName, currentName, caseOption, contextSignals } = params;
    const normalizedSuggested = applyCaseOption(suggestedName, caseOption);
    const normalizedCurrent = applyCaseOption(currentName, caseOption);
    const role = inferRoleToken(contextSignals.roleHint, currentName);
    const personName = extractLikelyPersonName(contextSignals.nearbyTexts);
    const suggestedTokens = tokenize(normalizedSuggested);
    const currentTokens = tokenize(normalizedCurrent);

    // Role-aware correction for people avatars/authors:
    // if nearby context contains a proper person name, enforce it in final name.
    const looksAvatarLike =
      role === 'avatar' ||
      role === 'author' ||
      suggestedTokens.includes('avatar') ||
      suggestedTokens.includes('author') ||
      currentTokens.includes('avatar') ||
      currentTokens.includes('author');

    if (looksAvatarLike && personName) {
      const personTokens = tokenize(personName);
      const hasPersonInSuggestion = includesAnyToken(normalizedSuggested, personTokens);
      if (!hasPersonInSuggestion) {
        const roleToken = role === 'author' ? 'author' : 'avatar';
        const sectionPrefix = contextSignals.sectionHierarchy.length > 0 
          ? contextSignals.sectionHierarchy[contextSignals.sectionHierarchy.length - 1] + ' ' 
          : '';
        return applyCaseOption(`${sectionPrefix}${personName} ${roleToken}`, caseOption);
      }
    }

    const looksWeak =
      normalizedSuggested === normalizedCurrent ||
      isLikelyGenericSuggestion(normalizedSuggested);

    if (looksWeak) {
      const subject =
        (role === 'avatar' || role === 'author')
          ? personName ?? extractBestSubjectText(contextSignals.nearbyTexts)
          : extractBestSubjectText(contextSignals.nearbyTexts);

      if (subject && role) {
        return applyCaseOption(`${subject} ${role}`, caseOption);
      }
      if (subject) {
        return applyCaseOption(subject, caseOption);
      }
    }

    return normalizedSuggested;
  }
}

function includesAnyToken(value: string, tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  const hay = new Set(tokenize(value));
  return tokens.some((token) => hay.has(token));
}

function isLikelyGenericSuggestion(name: string): boolean {
  const words = tokenize(name);
  if (words.length === 0) return true;
  const genericSet = new Set([
    'img',
    'image',
    'frame',
    'group',
    'layer',
    'avatar',
    'author',
    'icon',
    'shape',
  ]);
  return words.every((word) => genericSet.has(word));
}

function extractBestSubjectText(texts: string[]): string | undefined {
  const candidates: string[] = [];

  texts.forEach((text) => {
    text
      .split(/\n+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => candidates.push(part));
  });

  for (const candidate of candidates) {
    const clean = candidate.replace(/\s+/g, ' ').trim();
    if (!clean) continue;
    if (/\b(min read|read more|view more|sep\b|jan\b|feb\b|mar\b|apr\b|may\b|jun\b|jul\b|aug\b|oct\b|nov\b|dec\b|\d{4})\b/i.test(clean)) {
      continue;
    }
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(clean)) {
      return clean;
    }
    if (clean.length >= 6 && clean.length <= 80) {
      return clean;
    }
  }

  return undefined;
}

function extractLikelyPersonName(texts: string[]): string | undefined {
  const candidates: string[] = [];

  texts.forEach((text) => {
    text
      .split(/\n+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => candidates.push(part));
  });

  for (const candidate of candidates) {
    const clean = candidate.replace(/\s+/g, ' ').trim();
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(clean)) {
      return clean;
    }
  }

  return undefined;
}

function inferRoleToken(roleHint: string, currentName: string): string | undefined {
  const roleWords = new Set([...tokenize(roleHint), ...tokenize(currentName)]);
  const preferredRoles = ['avatar', 'author', 'cover', 'banner', 'thumbnail', 'card', 'hero', 'image'];
  return preferredRoles.find((role) => roleWords.has(role));
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
