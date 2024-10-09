import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

// ** import custom icons
import DeleteIcon from '@/assets/Icons/DeleteIcon';

// ** import figma ui components & icons
import { Bold, Container, IconList32, Text, VerticalSpace } from '@create-figma-plugin/ui';

// ** import custom ui components
import { Checkbox } from '@/components/ui/checkbox';

// ** import sub-components
import ImageGridListView from './ImageGridListView';

// ** import helpers
import { config } from '@/config';

// ** import store
import { useHistoryStore } from '@/store/use-history-store';

const ImageSelector = () => {
  const { history, removeHistoryItem } = useHistoryStore.getState();

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  const allNodesCount = history.length;

  // Handle Select All Checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all nodes
      const allIds = history.map((item) => item.cid);
      setSelectedNodeIds(allIds);
    } else {
      // Deselect all nodes
      setSelectedNodeIds([]);
    }
  };

  const handleSelectImage = (id: string, checked: boolean) => {
    setSelectedNodeIds((prev: string[]) => {
      if (checked) {
        return [...prev, id];
      } else {
        return prev.filter((imageId) => imageId !== id);
      }
    });
  };

  return (
    <Container space="small" style={{ height: '100%' }}>
      <VerticalSpace space="small" />

      <div className={'flex items-center justify-between'}>
        {/* Select All Checkbox */}
        <Checkbox value={selectedNodeIds.length === allNodesCount} onValueChange={handleSelectAll}>
          <Text>
            <Bold>
              Selected: {selectedNodeIds.length}/{allNodesCount} exportable assets
            </Bold>
          </Text>
        </Checkbox>

        {/* Delete Icon */}
        <button onClick={() => selectedNodeIds.forEach((cid) => removeHistoryItem(cid))}>
          <DeleteIcon className="-m-1" />
        </button>
      </div>
      <VerticalSpace space="small" />

      {/* Image Grid/List View */}
      <ImageGridListView history={history} selectedNodeIds={selectedNodeIds} onSelectImage={handleSelectImage} />
    </Container>
  );
};

export default ImageSelector;
