// index.tsx
import { h } from 'preact';
import HoverScrollbar from '@/components/ui/hover-scrollbar';
import { cn } from '@/lib/utils';

// ** Import child components
import GridView from './GridView';
import ListView from './ListView';

// ** Import types
import { NodeData } from '@/types/node';

interface ImageGridListViewProps {
  allNodes: NodeData[];
  base64Images: { [key: string]: string };
  selectedNodeIds: string[];
  onSelectImage: (id: string, checked: boolean) => void;
  viewType: 'grid' | 'list';
}

const ImageGridListView = ({
  allNodes,
  base64Images,
  selectedNodeIds,
  onSelectImage,
  viewType,
}: ImageGridListViewProps) => {
  const isGridView = viewType === 'grid';

  // Unified handler for toggling selection
  const handleToggleSelection = (id: string, currentChecked: boolean) => {
    onSelectImage(id, !currentChecked);
  };

  return (
    <HoverScrollbar className="overflow-visible h-80" thumbClassName="-mr-2">
      <div className={cn('gap-2 h-full mr-2', isGridView ? 'grid grid-cols-2 auto-rows-min' : 'flex flex-col')}>
        {isGridView ? (
          <GridView
            allNodes={allNodes}
            base64Images={base64Images}
            selectedNodeIds={selectedNodeIds}
            onToggleSelection={handleToggleSelection}
          />
        ) : (
          <ListView
            allNodes={allNodes}
            base64Images={base64Images}
            selectedNodeIds={selectedNodeIds}
            onToggleSelection={handleToggleSelection}
          />
        )}
      </div>
    </HoverScrollbar>
  );
};

export default ImageGridListView;
