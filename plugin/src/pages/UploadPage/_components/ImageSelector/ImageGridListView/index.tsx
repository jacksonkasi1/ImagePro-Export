import { Fragment, h } from 'preact';

// ** import custom ui components
import HoverScrollbar from '@/components/ui/hover-scrollbar';

// ** import child components
import ListView from './ListView';
import DragListView from './DragListView';

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import utils
import { cn } from '@/lib/utils';

// ** import types
import { NodeData } from '@/types/node';
import { AssetsExportType, FormatOption } from '@/types/enums';

interface ImageGridListViewProps {
  allNodes: NodeData[];
  base64Images: { [key: string]: string };
  selectedNodeIds: string[];
  onSelectImage: (id: string, checked: boolean) => void;
}

const ImageGridListView = ({ allNodes, base64Images, selectedNodeIds, onSelectImage }: ImageGridListViewProps) => {
  const { assetsExportType, formatOption } = useImageExportStore();

  const isDragView = assetsExportType === AssetsExportType.SINGLE && formatOption === FormatOption.PDF;

  // Unified handler for toggling selection
  const handleToggleSelection = (id: string, currentChecked: boolean) => {
    onSelectImage(id, currentChecked);
  };

  return (
    <HoverScrollbar className="overflow-visible h-80" thumbClassName="-mr-2">
      <div className={cn('gap-2 h-full mr-2')}>
        <Fragment>
          {isDragView ? (
            <DragListView
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
        </Fragment>
      </div>
    </HoverScrollbar>
  );
};

export default ImageGridListView;
