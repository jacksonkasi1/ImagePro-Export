// index.tsx
import { Fragment, h } from 'preact';

// ** import components
import HoverScrollbar from '@/components/ui/hover-scrollbar';

// ** import child components
import NormalListView from './NormalListView';
import DragListView from './DragListView';

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import utils
import { cn } from '@/lib/utils';

// ** import types
import { NodeData } from '@/types/node';
import { AssetsExportType } from '@/types/enums';

interface ImageListViewProps {
  allNodes: NodeData[];
  base64Images: { [key: string]: string };
  selectedNodeIds: string[];
  onToggleSelection: (id: string, currentChecked: boolean) => void;
}

const ImageListView = ({ allNodes, base64Images, selectedNodeIds, onToggleSelection }: ImageListViewProps) => {
  const { assetsExportType } = useImageExportStore();

  const isDragView = assetsExportType === AssetsExportType.SINGLE;

  return (
    <Fragment>
      {isDragView ? (
        <DragListView
          allNodes={allNodes}
          base64Images={base64Images}
          selectedNodeIds={selectedNodeIds}
          onToggleSelection={onToggleSelection}
        />
      ) : (
        <NormalListView
          allNodes={allNodes}
          base64Images={base64Images}
          selectedNodeIds={selectedNodeIds}
          onToggleSelection={onToggleSelection}
        />
      )}
    </Fragment>
  );
};

export default ImageListView;
