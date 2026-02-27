import { h, Fragment } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

// ** import utils
import { cn, truncateText } from '@/lib/utils';

// ** import store
import { useImageNodesStore } from '@/store/use-image-nodes-store';
import { useAIStore } from '@/store/use-ai-store';

// ** import types
import { NodeData } from '@/types/node';

// ** import components
import { Checkbox } from '@/components/ui/checkbox';
import AIStatusBadge from './AIStatusBadge';

/**
 * Creates and manages blob URLs for node thumbnails.
 * Tracks which node IDs are still being decoded so we can show skeletons.
 * Revokes all URLs on unmount / when the node list changes.
 */
function useThumbnailUrls(nodes: NodeData[]): {
  urlMap: Map<string, string>;
  loadingIds: Set<string>;
} {
  const [urlMap, setUrlMap] = useState<Map<string, string>>(new Map());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const prevUrlsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    // Nodes that have imageData need a blob URL
    const withImage = nodes.filter((n) => n.imageData);

    // Show skeleton for all nodes that have data but no URL yet
    setLoadingIds(new Set(withImage.map((n) => n.id)));

    const newMap = new Map<string, string>();

    for (const node of withImage) {
      const url = URL.createObjectURL(
        new Blob([node.imageData as unknown as Uint8Array<ArrayBuffer>], { type: 'image/png' })
      );
      newMap.set(node.id, url);
    }

    // Revoke previous URLs
    prevUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    prevUrlsRef.current = newMap;

    setUrlMap(newMap);
    // All blob URLs are synchronously created — clear skeletons immediately after
    setLoadingIds(new Set());

    return () => {
      newMap.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [nodes]);

  return { urlMap, loadingIds };
}

const AINodeList = () => {
  const { allNodes, selectedNodeIds, setSelectedNodeIds } = useImageNodesStore();
  const { renameStatuses, renamedNames } = useAIStore();

  const { urlMap: thumbnailUrls, loadingIds } = useThumbnailUrls(allNodes);

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
        <Checkbox value={allSelected} onValueChange={handleToggleAll} />
        <span class={cn('text-xs text-secondary-text', someSelected && 'text-primary-text')}>
          {selectedNodeIds.length > 0
            ? `${selectedNodeIds.length} of ${allNodes.length} selected`
            : `${allNodes.length} node${allNodes.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Node rows */}
      <div class="flex flex-col">
        {allNodes.map((node) => {
          const isSelected = selectedNodeIds.includes(node.id);
          const status = renameStatuses[node.id] ?? 'idle';
          const newName = renamedNames[node.id];
          const thumbnail = thumbnailUrls.get(node.id);
          const isLoadingThumb = loadingIds.has(node.id);

          return (
            <div
              key={node.id}
              class={cn(
                'flex items-center gap-2 px-3 py-1.5 border-b border-f-border last:border-b-0',
                'hover:bg-secondary-bg transition-colors'
              )}
            >
              <Checkbox value={isSelected} onValueChange={(v) => handleToggle(node.id, v)} />

              {/* Thumbnail or skeleton */}
              {isLoadingThumb ? (
                <div class="w-6 h-6 rounded shrink-0 bg-secondary-bg animate-pulse" />
              ) : thumbnail ? (
                <img
                  src={thumbnail}
                  alt={node.name}
                  class="w-6 h-6 rounded object-cover shrink-0 border border-f-border"
                />
              ) : (
                /* Node has no imageData — static placeholder */
                <div class="w-6 h-6 rounded shrink-0 bg-secondary-bg border border-f-border" />
              )}

              {/* Name */}
              <span class="flex-1 text-xs text-primary-text truncate" title={node.name}>
                {truncateText(node.name, 28)}
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
