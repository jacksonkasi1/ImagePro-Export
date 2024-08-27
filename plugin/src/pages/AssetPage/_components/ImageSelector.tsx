import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

// ** import figma ui components
import { Bold, Container, Text, VerticalSpace } from '@create-figma-plugin/ui';

// **  import custom ui component
import { Checkbox } from '@/components/ui/checkbox';

// ** import helpers
import { arrayBufferToBase64 } from '@/helpers/file-operation';

// ** import store
import { useImageNodesStore } from '@/store/use-image-nodes-store';

const ImageSelector = () => {
  const { allNodes, allNodesCount, selectedNodeIds, setSelectedNodeIds, setSelectedNodesCount } = useImageNodesStore();
  const [base64Images, setBase64Images] = useState<{ [key: string]: string }>({});

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
      {/* Select All Checkbox */}
      <VerticalSpace space="small" />
      <Checkbox value={selectedNodeIds.length === allNodes.length} onValueChange={handleSelectAll}>
        <Text>
          <Bold>
            Selected: {selectedNodeIds.length}/{allNodesCount} exportable assets
          </Bold>
        </Text>
      </Checkbox>
      <VerticalSpace space="small" />

      {/* Image Selection List */}
      <div>
        {allNodes.map((image, index) => (
          <div key={`${image.id}_${index}`} className="flex items-center gap-2 mb-2">
            {/* Image Preview */}
            <div
              className="overflow-hidden border rounded-md cursor-pointer"
              onClick={() => handleSelectImage(image.id, !selectedNodeIds.includes(image.id))}
            >
              {base64Images[image.id] ? (
                <img
                  src={base64Images[image.id]}
                  alt={`${image.name}`}
                  className="aspect-[16/9] min-w-28 w-[140px] max-w-[140px] h-auto object-contain rounded-sm"
                />
              ) : (
                <div className="aspect-[16/9] w-full min-w-28 max-w-[140px] h-auto object-cover rounded-sm bg-gray-200" />
              )}
            </div>

            {/* Image Name and Checkbox */}
            <div className="flex items-center flex-1">
              <Text class="truncate w-28">{image.name}</Text>
              <Checkbox
                value={selectedNodeIds.includes(image.id)}
                onValueChange={(checked) => handleSelectImage(image.id, checked)}
                className="ml-2"
              />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default ImageSelector;
