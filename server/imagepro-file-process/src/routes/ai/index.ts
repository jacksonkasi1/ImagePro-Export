import { Router, Request, Response } from 'express';

// ** import adapters
import { ModelAdapterFactory } from './adapters';

// ** import types
import { AIRenameBatchRequest, AIRenameResult } from './adapters/types';

const router = Router();

/**
 * POST /api/ai/rename-batch
 *
 * Accepts an array of AIRenameGroups and AI settings.
 * Returns an array of AIRenameResults (one per target node).
 *
 * Runs up to 5 AI calls concurrently via the adapter's promise pool.
 * Each group may contain multiple target nodes (siblings bundled together).
 */
router.post('/rename-batch', async (req: Request, res: Response) => {
  const body = req.body as AIRenameBatchRequest;

  // Basic validation
  if (!body || !body.groups || !body.settings) {
    res.status(400).json({ error: 'Missing required fields: groups, settings' });
    return;
  }

  const { groups, settings } = body;

  if (!settings.apiKey) {
    res.status(400).json({ error: 'API key is required' });
    return;
  }

  if (!settings.modelProvider) {
    res.status(400).json({ error: 'modelProvider is required' });
    return;
  }

  if (!settings.model || !settings.model.trim()) {
    res.status(400).json({ error: 'model is required' });
    return;
  }

  if (!settings.systemPrompt || !settings.systemPrompt.trim()) {
    res.status(400).json({ error: 'systemPrompt is required' });
    return;
  }

  if (!Array.isArray(groups) || groups.length === 0) {
    res.status(400).json({ error: 'groups must be a non-empty array' });
    return;
  }

  try {
    const adapter = ModelAdapterFactory.create(
      settings.modelProvider,
      settings.apiKey,
      settings.model
    );

    const results: AIRenameResult[] = await adapter.rename(
      groups,
      settings.systemPrompt,
      settings.caseOption,
      5 // max concurrent AI calls
    );

    res.json({ renames: results });
  } catch (error: any) {
    console.error('[AI rename-batch] Error:', error);
    res.status(500).json({ error: 'AI rename failed' });
  }
});

export default router;
