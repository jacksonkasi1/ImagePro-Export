import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

// ** import figma ui components & icons
import { Bold, Container, IconList32, Text, VerticalSpace } from '@create-figma-plugin/ui';

// ** import custom ui components
import { Checkbox } from '@/components/ui/checkbox';

// ** import sub-components
import ImageGridListView from './ImageGridListView';

// ** import helpers
import { arrayBufferToBase64 } from '@/helpers/file-operation';

// ** import store
import { useImageNodesStore } from '@/store/use-image-nodes-store';

const ImageSelector = () => {
  const { allNodes, allNodesCount, selectedNodeIds, setSelectedNodeIds, setSelectedNodesCount, setSelectedNodesOrder } =
    useImageNodesStore();

  const [base64Images, setBase64Images] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBase64Images = async () => {
      const newBase64Images: { [key: string]: string } = {};
      for (const node of allNodes) {
        const base64String = await arrayBufferToBase64(node.imageData);
        newBase64Images[node.id] = base64String;
      }
      setBase64Images(newBase64Images);
    };

    void fetchBase64Images();
  }, [allNodes]);

  useEffect(() => {
    setSelectedNodesCount(selectedNodeIds.length);
  }, [selectedNodeIds, setSelectedNodesCount]);

  // Handle Select All Checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all nodes
      const allIds = allNodes.map((node) => node.id);
      setSelectedNodeIds(allIds);
      setSelectedNodesOrder(allIds); // Set order as per allNodes
    } else {
      // Deselect all nodes
      setSelectedNodeIds([]);
      setSelectedNodesOrder([]); // Clear the order
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

    setSelectedNodesOrder((prev: string[]) => {
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

        {/* View Icon - on invisible */}
        <IconList32 className="-m-1 opacity-0" />
      </div>
      <VerticalSpace space="small" />

      {/* Image Grid/List View */}
      <ImageGridListView
        allNodes={allNodes}
        base64Images={base64Images}
        selectedNodeIds={selectedNodeIds}
        onSelectImage={handleSelectImage}
      />
    </Container>
  );
};

export default ImageSelector;
