import { h, Fragment } from 'preact';

// ** import figma utils
import { emit } from '@create-figma-plugin/utilities';

// ** import utils
import { cn, truncateText } from '@/lib/utils';

// ** import store
import { useAIStore } from '@/store/use-ai-store';

// ** import types
import { AIMode, AINodeData } from '@/types/ai';
import { AIFocusNodeHandler } from '@/types/events';

// ** import components
import { Checkbox } from '@/components/ui/checkbox';
import AIStatusBadge from './AIStatusBadge';

/**
 * Returns a short human-readable label for a Figma node type string.
 */
function nodeTypeLabel(type: string): string {
  switch (type) {
    case 'FRAME':             return 'Frame';
    case 'GROUP':             return 'Group';
    case 'COMPONENT':         return 'Component';
    case 'INSTANCE':          return 'Instance';
    case 'SECTION':           return 'Section';
    case 'TEXT':              return 'Text';
    case 'RECTANGLE':         return 'Rect';
    case 'ELLIPSE':           return 'Ellipse';
    case 'POLYGON':           return 'Polygon';
    case 'VECTOR':            return 'Vector';
    case 'STAR':              return 'Star';
    case 'LINE':              return 'Line';
    case 'BOOLEAN_OPERATION': return 'Bool';
    case 'COMPONENT_SET':     return 'CompSet';
    default:                  return type.charAt(0) + type.slice(1).toLowerCase();
  }
}

interface AINodeListProps {
  mode: AIMode;
}

const AINodeList = ({ mode }: AINodeListProps) => {
  const {
    aiImageNodes,
    aiLayerNodes,
    selectedAIImageNodeIds,
    selectedAILayerNodeIds,
    setSelectedAIImageNodeIds,
    setSelectedAILayerNodeIds,
    renameStatuses,
    renamedNames,
  } = useAIStore();

  const nodes: AINodeData[]   = mode === 'images' ? aiImageNodes   : aiLayerNodes;
  const selectedIds: string[] = mode === 'images' ? selectedAIImageNodeIds : selectedAILayerNodeIds;
  const setSelectedIds        = mode === 'images' ? setSelectedAIImageNodeIds : setSelectedAILayerNodeIds;

  const handleToggle = (id: string, checked: boolean) => {
    setSelectedIds((prev: string[]) =>
      checked ? [...prev, id] : prev.filter((pid: string) => pid !== id)
    );
  };

  const handleRowClick = (id: string) => {
    emit<AIFocusNodeHandler>('AI_FOCUS_NODE', id);
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? nodes.map((n: AINodeData) => n.id) : []);
  };

  const allSelected  = nodes.length > 0 && selectedIds.length === nodes.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < nodes.length;

  const emptyMessage = mode === 'images'
    ? 'No image nodes found in selection.'
    : 'No layer nodes found in selection.';

  if (nodes.length === 0) {
    return (
      <div class="flex flex-col items-center justify-center py-8 text-secondary-text text-xs gap-2">
        <span>{emptyMessage}</span>
        <span>Select frames or components in Figma.</span>
      </div>
    );
  }

  return (
    <Fragment>
      {/* Select-all header */}
      <div class="flex items-center px-3 py-2 border-b border-f-border gap-2">
        <Checkbox value={allSelected} onValueChange={handleToggleAll} />
        <span class={cn('text-xs text-secondary-text', someSelected && 'text-primary-text')}>
          {selectedIds.length > 0
            ? `${selectedIds.length} of ${nodes.length} selected`
            : `${nodes.length} node${nodes.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Node rows */}
      <div class="flex flex-col">
        {nodes.map((node: AINodeData) => {
          const isSelected = selectedIds.includes(node.id);
          const status     = renameStatuses[node.id] ?? 'idle';
          const newName    = renamedNames[node.id];

          return (
            <div
              key={node.id}
              onClick={() => handleRowClick(node.id)}
              class={cn(
                'flex items-center gap-2 px-3 py-1.5 border-b border-f-border last:border-b-0',
                'hover:bg-secondary-bg transition-colors cursor-pointer'
              )}
            >
              {/* Stop row-click from firing when toggling the checkbox */}
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox value={isSelected} onValueChange={(v) => handleToggle(node.id, v)} />
              </div>

              {/* Node type badge */}
              <span class="shrink-0 text-[9px] font-medium px-1 py-0.5 rounded bg-secondary-bg text-secondary-text border border-f-border leading-none">
                {nodeTypeLabel(node.nodeType)}
              </span>

              {/* Name */}
              <span class="flex-1 text-xs text-primary-text truncate" title={node.name}>
                {truncateText(node.name, 24)}
              </span>

              {/* Status badge */}
              <AIStatusBadge status={status} newName={newName} />
            </div>
          );
        })}
      </div>
    </Fragment>
  );
};

export default AINodeList;
