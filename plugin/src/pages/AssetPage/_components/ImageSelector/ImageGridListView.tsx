import { h } from 'preact';
import { Checkbox } from '@/components/ui/checkbox'; // Import custom checkbox component
import { Text } from '@create-figma-plugin/ui'; // Import Figma UI component
import { NodeData } from '@/types/node'; // Import NodeData type

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

  return (
    <div className={isGridView ? 'grid grid-cols-2 gap-4' : 'flex flex-col'}>
      {allNodes.map((image, index) => (
        <div
          key={`${image.id}_${index}`}
          className={isGridView ? 'flex flex-col items-center' : 'flex items-center gap-2 mb-2'}
        >
          {/* Image Preview */}
          <div
            className="overflow-hidden border rounded-md cursor-pointer"
            onClick={() => onSelectImage(image.id, !selectedNodeIds.includes(image.id))}
          >
            {base64Images[image.id] ? (
              <img
                src={base64Images[image.id]}
                alt={`${image.name}`}
                className={`object-contain rounded-sm ${
                  isGridView ? 'w-full h-auto' : 'aspect-[16/9] min-w-28 w-[140px] max-w-[140px] h-auto'
                }`}
              />
            ) : (
              <div
                className={`bg-gray-200 rounded-sm ${
                  isGridView ? 'w-full h-auto' : 'aspect-[16/9] min-w-28 w-[140px] max-w-[140px] h-auto'
                }`}
              />
            )}
          </div>

          {/* Image Name and Checkbox */}
          <div className={isGridView ? 'flex flex-col items-center mt-2' : 'flex items-center flex-1'}>
            <Text class="truncate w-28">{image.name}</Text>
            <Checkbox
              value={selectedNodeIds.includes(image.id)}
              onValueChange={(checked) => onSelectImage(image.id, checked)}
              className="ml-2"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGridListView;
