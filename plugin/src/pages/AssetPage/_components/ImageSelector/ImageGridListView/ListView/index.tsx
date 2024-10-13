import { Fragment, h } from 'preact';

// ** import child components
import NormalListView from './NormalListView';
import DragListView from './DragListView';

// ** import store
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import types
import { NodeData } from '@/types/node';
import { AssetsExportType, FormatOption } from '@/types/enums';

interface ImageListViewProps {
  allNodes: NodeData[];
  base64Images: { [key: string]: string };
  selectedNodeIds: string[];
  onToggleSelection: (id: string, currentChecked: boolean) => void;
}

const ImageListView = ({ allNodes, base64Images, selectedNodeIds, onToggleSelection }: ImageListViewProps) => {
  const { assetsExportType, formatOption } = useImageExportStore();

  const isDragView = assetsExportType === AssetsExportType.SINGLE && formatOption === FormatOption.PDF;

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
