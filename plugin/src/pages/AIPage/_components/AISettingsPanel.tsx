import { h } from 'preact';
import { useCallback } from 'preact/hooks';

// ** import utils
import { cn } from '@/lib/utils';

// ** import store
import { useAIStore } from '@/store/use-ai-store';

// ** import types
import { AIModelProvider } from '@/types/ai';
import { CaseOption } from '@/types/enums';

// ** import components
import { Checkbox } from '@/components/ui/checkbox';

const MODEL_OPTIONS: Record<AIModelProvider, { label: string; models: string[] }> = {
  gemini: {
    label: 'Gemini',
    models: ['gemini-2.5-flash-preview-04-17', 'gemini-2.5-pro-preview-03-25'],
  },
  openai: {
    label: 'OpenAI (coming soon)',
    models: ['gpt-4o'],
  },
  anthropic: {
    label: 'Anthropic (coming soon)',
    models: ['claude-3-5-sonnet-20241022'],
  },
};

const CASE_OPTIONS: { value: CaseOption; label: string }[] = [
  { value: CaseOption.KEBAB_CASE, label: 'kebab-case' },
  { value: CaseOption.SNAKE_CASE, label: 'snake_case' },
  { value: CaseOption.CAMEL_CASE, label: 'camelCase' },
  { value: CaseOption.PASCAL_CASE, label: 'PascalCase' },
];

const labelClass = 'text-xs text-secondary-text font-medium mb-1 block';
const inputClass =
  'w-full text-xs bg-primary-bg border border-f-border rounded px-2 py-1.5 text-primary-text focus:outline-none focus:border-brand-bg';
const selectClass =
  'w-full text-xs bg-primary-bg border border-f-border rounded px-2 py-1.5 text-primary-text focus:outline-none focus:border-brand-bg';

const AISettingsPanel = () => {
  const { settings, setSettings } = useAIStore();

  const handleProviderChange = useCallback(
    (e: Event) => {
      const provider = (e.target as HTMLSelectElement).value as AIModelProvider;
      const defaultModel = MODEL_OPTIONS[provider].models[0];
      setSettings({ modelProvider: provider, model: defaultModel });
    },
    [setSettings]
  );

  const handleModelChange = useCallback(
    (e: Event) => {
      setSettings({ model: (e.target as HTMLSelectElement).value });
    },
    [setSettings]
  );

  const handleApiKeyChange = useCallback(
    (e: Event) => {
      setSettings({ apiKey: (e.target as HTMLInputElement).value });
    },
    [setSettings]
  );

  const handleCaseChange = useCallback(
    (e: Event) => {
      setSettings({ caseOption: (e.target as HTMLSelectElement).value as CaseOption });
    },
    [setSettings]
  );

  const handleSystemPromptChange = useCallback(
    (e: Event) => {
      setSettings({ systemPrompt: (e.target as HTMLTextAreaElement).value });
    },
    [setSettings]
  );

  const handleReadImageChange = useCallback(
    (checked: boolean) => {
      setSettings({ readImage: checked });
    },
    [setSettings]
  );

  return (
    <div class="flex flex-col gap-3 px-3 py-3 border-t border-f-border bg-secondary-bg">
      <p class="text-xs font-semibold text-primary-text">AI Settings</p>

      {/* Provider */}
      <div>
        <label class={labelClass}>Provider</label>
        <select
          class={selectClass}
          value={settings.modelProvider}
          onChange={handleProviderChange}
        >
          {(Object.keys(MODEL_OPTIONS) as AIModelProvider[]).map((p) => (
            <option key={p} value={p} disabled={p !== 'gemini'}>
              {MODEL_OPTIONS[p].label}
            </option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div>
        <label class={labelClass}>Model</label>
        <select class={selectClass} value={settings.model} onChange={handleModelChange}>
          {MODEL_OPTIONS[settings.modelProvider].models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div>
        <label class={labelClass}>API Key</label>
        <input
          type="password"
          class={inputClass}
          value={settings.apiKey}
          onInput={handleApiKeyChange}
          placeholder="Paste your API key…"
          autocomplete="off"
        />
      </div>

      {/* Case */}
      <div>
        <label class={labelClass}>Naming Convention</label>
        <select class={selectClass} value={settings.caseOption} onChange={handleCaseChange}>
          {CASE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Read Image toggle */}
      <div class="flex items-center gap-2">
        <Checkbox value={settings.readImage} onValueChange={handleReadImageChange} />
        <span class="text-xs text-primary-text">Send screenshot to AI (slower, more accurate)</span>
      </div>

      {/* System Prompt */}
      <div>
        <label class={labelClass}>System Prompt</label>
        <textarea
          class={cn(inputClass, 'h-24 resize-none leading-relaxed')}
          value={settings.systemPrompt}
          onInput={handleSystemPromptChange}
        />
      </div>
    </div>
  );
};

export default AISettingsPanel;
