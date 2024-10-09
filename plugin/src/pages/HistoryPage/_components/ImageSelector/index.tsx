import { h } from 'preact';
import { useState } from 'preact/hooks';

// ** import custom icons
import DeleteIcon from '@/assets/Icons/DeleteIcon';

// ** import figma ui components & icons
import { Bold, Container, Text, VerticalSpace } from '@create-figma-plugin/ui';

// ** import custom ui components
import { Checkbox } from '@/components/ui/checkbox';

// ** import sub-components
import ImageGridListView from './ImageGridListView';

// ** import store
import { useHistoryStore } from '@/store/use-history-store';

// ** import utils
import { cn } from '@/lib/utils';

const ImageSelector = () => {
  const { history, removeHistoryItem } = useHistoryStore.getState();

  const [selectedNodeIds, setSelectedNodeIds] = useState<number[]>([]);

  const allNodesCount = history.length;

  // Handle Select All Checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all nodes
      const allIds = history.map((item) => item.id);
      setSelectedNodeIds(allIds);
    } else {
      // Deselect all nodes
      setSelectedNodeIds([]);
    }
  };

  const handleSelectImage = (id: number, checked: boolean) => {
    setSelectedNodeIds((prev: number[]) => {
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

      <div className="flex items-center justify-between">
        {/* Select All Checkbox */}
        <Checkbox value={selectedNodeIds.length === allNodesCount} onValueChange={handleSelectAll}>
          <Text>
            <Bold>
              Selected: {selectedNodeIds.length}/{allNodesCount} exportable assets
            </Bold>
          </Text>
        </Checkbox>

        {/* Delete Icon */}
        <button
          onClick={() => selectedNodeIds.forEach((id) => removeHistoryItem(id))}
          disabled={selectedNodeIds.length === 0}
          className={cn('-m-1', {
            'cursor-not-allowed opacity-50': selectedNodeIds.length === 0,
            'text-danger hover:text-danger-hover': selectedNodeIds.length > 0,
          })}
        >
          <DeleteIcon
            color={
              selectedNodeIds.length === 0
                ? 'var(--figma-color-text)'
                : 'var(--figma-color-bg-danger)'
            }
          />
        </button>
      </div>
      <VerticalSpace space="small" />

      {/* Image Grid/List View */}
      <ImageGridListView history={history} selectedNodeIds={selectedNodeIds} onSelectImage={handleSelectImage} />
    </Container>
  );
};

export default ImageSelector;
