import { h } from 'preact';

// ** import custom ui components
import HoverScrollbar from '@/components/ui/hover-scrollbar';

// ** import child components
import ListView from './ListView';

// ** import types
import { HistoryItem } from '@/types/utils';

interface ImageGridListViewProps {
  history: HistoryItem[];
  selectedNodeIds: number[];
  onSelectImage: (id: number, checked: boolean) => void;
}

const ImageGridListView = ({ history, selectedNodeIds, onSelectImage }: ImageGridListViewProps) => {
  // Unified handler for toggling selection
  const handleToggleSelection = (id: number, currentChecked: boolean) => {
    onSelectImage(id, currentChecked);
  };

  return (
    <HoverScrollbar className="overflow-visible" thumbClassName="-mr-2" style={{ height: '410px' }}>
      <div className="h-full gap-2 mr-2">
        <ListView history={history} selectedNodeIds={selectedNodeIds} onToggleSelection={handleToggleSelection} />
      </div>
    </HoverScrollbar>
  );
};

export default ImageGridListView;
