import { h, Fragment } from 'preact';
import { useMemo } from 'preact/hooks';

// ** import utils
import { cn, truncateText } from '@/lib/utils';

// ** import store
import { useImageNodesStore } from '@/store/use-image-nodes-store';
import { useAIStore } from '@/store/use-ai-store';

// ** import components
import { Checkbox } from '@/components/ui/checkbox';
import AIStatusBadge from './AIStatusBadge';

const AINodeList = () => {
  const { allNodes, selectedNodeIds, setSelectedNodeIds } = useImageNodesStore();
  const { renameStatuses, renamedNames } = useAIStore();

  const handleToggle = (id: string, checked: boolean) => {
    setSelectedNodeIds((prev) =>
      checked ? [...prev, id] : prev.filter((pid) => pid !== id)
    );
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedNodeIds(checked ? allNodes.map((n) => n.id) : []);
  };

  const allSelected = allNodes.length > 0 && selectedNodeIds.length === allNodes.length;
  const someSelected = selectedNodeIds.length > 0 && selectedNodeIds.length < allNodes.length;

  const nodeItems = useMemo(
    () =>
      allNodes.map((node) => ({
        node,
        isSelected: selectedNodeIds.includes(node.id),
        status: renameStatuses[node.id] ?? 'idle',
        newName: renamedNames[node.id],
        thumbnail: node.imageData
          ? URL.createObjectURL(new Blob([node.imageData], { type: 'image/png' }))
          : null,
      })),
    [allNodes, selectedNodeIds, renameStatuses, renamedNames]
  );

  if (allNodes.length === 0) {
    return (
      <div class="flex flex-col items-center justify-center py-8 text-secondary-text text-xs gap-2">
        <span>No nodes found.</span>
        <span>Select frames or components in Figma.</span>
      </div>
    );
  }

  return (
    <Fragment>
      {/* Select-all header */}
      <div class="flex items-center px-3 py-2 border-b border-f-border gap-2">
        <Checkbox
          value={allSelected}
          onValueChange={handleToggleAll}
        />
        <span class={cn('text-xs text-secondary-text', someSelected && 'text-primary-text')}>
          {selectedNodeIds.length > 0
            ? `${selectedNodeIds.length} of ${allNodes.length} selected`
            : `${allNodes.length} node${allNodes.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Node rows */}
      <div class="flex flex-col overflow-y-auto max-h-[280px]">
        {nodeItems.map(({ node, isSelected, status, newName, thumbnail }) => (
          <div
            key={node.id}
            class={cn(
              'flex items-center gap-2 px-3 py-1.5 border-b border-f-border last:border-b-0',
              'hover:bg-secondary-bg transition-colors'
            )}
          >
            <Checkbox value={isSelected} onValueChange={(v) => handleToggle(node.id, v)} />

            {/* Thumbnail */}
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={node.name}
                class="w-6 h-6 rounded object-cover shrink-0 border border-f-border"
              />
            ) : (
              <div class="w-6 h-6 rounded shrink-0 bg-secondary-bg border border-f-border" />
            )}

            {/* Name */}
            <span class="flex-1 text-xs text-primary-text truncate" title={node.name}>
              {truncateText(node.name, 28)}
            </span>

            {/* Status badge */}
            <AIStatusBadge status={status} newName={newName} />
          </div>
        ))}
      </div>
    </Fragment>
  );
};

export default AINodeList;
