import { h } from 'preact';

// ** import utils
import { cn } from '@/lib/utils';

// ** import store
import { useAIStore } from '@/store/use-ai-store';

interface AIRunButtonProps {
  onRun: () => void;
}

const AIRunButton = ({ onRun }: AIRunButtonProps) => {
  const { isRunning, progress, aiMode, selectedAIImageNodeIds, selectedAILayerNodeIds } = useAIStore();

  const selectedIds = aiMode === 'images' ? selectedAIImageNodeIds : selectedAILayerNodeIds;
  const count = selectedIds.length;
  const disabled = isRunning || count === 0;

  const label = isRunning
    ? `Renaming ${progress.done}/${progress.total}…`
    : count > 0
    ? `Rename ${count} node${count !== 1 ? 's' : ''}`
    : 'Select nodes to rename';

  return (
    <button
      onClick={disabled ? undefined : onRun}
      disabled={disabled}
      class={cn(
        'w-full rounded px-3 py-2 text-xs font-semibold transition-colors',
        'bg-brand-bg text-white',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:opacity-90 active:opacity-80 cursor-pointer'
      )}
    >
      {label}
    </button>
  );
};

export default AIRunButton;
