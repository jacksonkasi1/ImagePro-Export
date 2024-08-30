import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

// ** import figma ui components & icons
import { Bold, Container, Text, VerticalSpace, IconGrid32, IconList32 } from '@create-figma-plugin/ui';

// ** import custom ui components
import { Checkbox } from '@/components/ui/checkbox';

// ** import sub-components
import ImageGridListView from './ImageGridListView';

// ** import helpers
import { arrayBufferToBase64 } from '@/helpers/file-operation';

// ** import store
import { useImageNodesStore } from '@/store/use-image-nodes-store';

// ** import utils
import { cn } from '@/lib/utils';

const ImageSelector = () => {
  const { allNodes, allNodesCount, selectedNodeIds, setSelectedNodeIds, setSelectedNodesCount } = useImageNodesStore();

  const [base64Images, setBase64Images] = useState<{ [key: string]: string }>({});
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid'); // State for toggling between grid and list views

  useEffect(() => {
    const fetchBase64Images = async () => {
      const newBase64Images: { [key: string]: string } = {};
      for (const node of allNodes) {
        const base64String = await arrayBufferToBase64(node.imageData);
        newBase64Images[node.id] = base64String;
      }
      setBase64Images(newBase64Images);
    };

    fetchBase64Images();
  }, [allNodes]);

  useEffect(() => {
    setSelectedNodesCount(selectedNodeIds.length);
  }, [selectedNodeIds, setSelectedNodesCount]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNodeIds(allNodes.map((image) => image.id));
    } else {
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
    <Container space="small">
      <VerticalSpace space="small" />

      <div className={'flex items-center justify-between'}>
        {/* Select All Checkbox */}
        <Checkbox value={selectedNodeIds.length === allNodes.length} onValueChange={handleSelectAll}>
          <Text>
            <Bold>
              Selected: {selectedNodeIds.length}/{allNodesCount} exportable assets
            </Bold>
          </Text>
        </Checkbox>
        {/* View Type Toggle Buttons */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setViewType('grid')}
            className={cn(
              'rounded-sm text-primary-text',
              viewType === 'grid' && 'bg-selected-bg'
            )}
          >
            <IconGrid32 className="-m-1" />
          </button>
          <button
            onClick={() => setViewType('list')}
            className={cn(
              'rounded-sm text-primary-text',
              viewType === 'list' && 'bg-selected-bg'
            )}
          >
            <IconList32 className="-m-1" />
          </button>
        </div>
      </div>
      <VerticalSpace space="small" />

      {/* Image Grid/List View */}
      <ImageGridListView
        allNodes={allNodes}
        base64Images={base64Images}
        selectedNodeIds={selectedNodeIds}
        onSelectImage={handleSelectImage}
        viewType={viewType}
      />
    </Container>
  );
};

export default ImageSelector;