// ** import adapters
import { GeminiAdapter } from './gemini';
import { OpenAIAdapter } from './openai';
import { AnthropicAdapter } from './anthropic';

// ** import types
import { IModelAdapter, AIModelProvider } from './types';

export { GeminiAdapter, OpenAIAdapter, AnthropicAdapter };
export type { IModelAdapter, AIModelProvider };
export * from './types';

/**
 * Factory that instantiates the correct model adapter based on provider.
 *
 * To add a new provider:
 *  1. Create a new adapter class implementing IModelAdapter
 *  2. Add a case here
 *  3. Register the provider type in AIModelProvider
 */
export class ModelAdapterFactory {
  static create(provider: AIModelProvider, apiKey: string, model: string): IModelAdapter {
    switch (provider) {
      case 'gemini':
        return new GeminiAdapter(apiKey, model);
      case 'openai':
        return new OpenAIAdapter(apiKey, model);
      case 'anthropic':
        return new AnthropicAdapter(apiKey, model);
      default:
        throw new Error(`Unknown model provider: ${provider}`);
    }
  }
}
