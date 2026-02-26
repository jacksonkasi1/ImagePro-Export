import { h } from 'preact';

// ** import utils
import { cn } from '@/lib/utils';

// ** import store
import { useAIStore } from '@/store/use-ai-store';
import { useImageNodesStore } from '@/store/use-image-nodes-store';

interface AIRunButtonProps {
  onRun: () => void;
}

const AIRunButton = ({ onRun }: AIRunButtonProps) => {
  const { isRunning, progress } = useAIStore();
  const { selectedNodeIds } = useImageNodesStore();

  const hasSelection = selectedNodeIds.length > 0;
  const disabled = isRunning || !hasSelection;

  const label = isRunning
    ? `Renaming ${progress.done}/${progress.total}…`
    : hasSelection
    ? `Rename ${selectedNodeIds.length} node${selectedNodeIds.length !== 1 ? 's' : ''}`
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
