import { Fragment, h } from 'preact';

// ** import figma ui components
import { Columns, Text } from '@create-figma-plugin/ui';

// ** import custom ui components
import { Checkbox } from '@/components/ui/checkbox';

// ** import types
import { NodeData } from '@/types/node';

// ** import utils
import { cn, truncateText } from '@/lib/utils';

// ** import custom ui component
import HoverScrollbar from '@/components/ui/hover-scrollbar';

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
    <HoverScrollbar className="overflow-visible h-80" thumbClassName='-mr-2'>
      <div className={cn('gap-2 h-full  mr-2', isGridView ? 'grid grid-cols-2' : 'flex flex-col')}>
        {allNodes.map((image, index) => (
          <div
            key={`${image.id}_${index}`}
            className={cn(
              'relative rounded-lg flex flex-col items-center cursor-pointer h-fit',
              isGridView ? 'p-2' : 'px-2',
              selectedNodeIds.includes(image.id) ? 'bg-selected-bg' : 'bg-secondary-bg'
            )}
            onClick={() => onSelectImage(image.id, !selectedNodeIds.includes(image.id))}
          >
            {isGridView ? (
              <Fragment>
                {/* Grid View */}
                {/* Checkbox */}
                <Checkbox
                  value={selectedNodeIds.includes(image.id)}
                  onValueChange={(checked, event) => {
                    event.stopPropagation(); // Prevent the click event from propagating to the parent div
                    onSelectImage(image.id, checked);
                  }}
                  className="absolute cursor-pointer top-3 left-3"
                />
                {/* Image Preview */}
                <div className={cn('overflow-hidden w-full h-20 max-h-20 flex justify-center items-center cursor-pointer')}>
                  {base64Images[image.id] ? (
                    <img
                      src={base64Images[image.id]}
                      alt={`${image.name}`}
                      className={cn(
                        'object-contain rounded-sm w-full h-full' // Object contain to keep the image within bounds
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        'rounded-sm w-full h-full' // Fixed size placeholder
                      )}
                    />
                  )}
                </div>

                {/* Image Name, Dimensions, Type */}
                <div className={cn('flex flex-col gap-2 items-center mt-2')}>
                  <Columns space="medium">
                    <div className="flex flex-col gap-1">
                      <Text className={cn('truncate w-fit font-medium')}>{truncateText(image.name, 6)}</Text>
                      <Text className="text-secondary-text">{image.type}</Text>
                    </div>
                    <Text className="text-secondary-text">
                      {Math.round(image.dimensions.width)}x{Math.round(image.dimensions.height)}px
                    </Text>
                  </Columns>
                </div>
              </Fragment>
            ) : (
              <Fragment>
                {/* List View */}
                <div className="flex items-center w-full gap-2 cursor-pointer">
                  {/* Checkbox */}
                  <Checkbox
                    value={selectedNodeIds.includes(image.id)}
                    onValueChange={(checked, event) => {
                      event.stopPropagation(); // Prevent the click event from propagating to the parent div
                      onSelectImage(image.id, checked);
                    }}
                    className="self-center"
                  />
                  {/* Image Preview */}
                  <div className="flex items-center justify-center w-16 h-16 overflow-hidden cursor-pointer">
                    {base64Images[image.id] ? (
                      <img
                        src={base64Images[image.id]}
                        alt={`${image.name}`}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>

                  {/* Image Details */}
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    <div className="flex flex-col ">
                      <Text className={cn('truncate w-full font-medium')}>{truncateText(image.name, 17)}</Text>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Text className="text-secondary-text">{image.type}</Text>
                      <Text className="text-secondary-text">
                        {Math.round(image.dimensions.width)}x{Math.round(image.dimensions.height)}px
                      </Text>
                    </div>
                  </div>
                </div>
              </Fragment>
            )}
          </div>
        ))}
      </div>
    </HoverScrollbar>
  );
};

export default ImageGridListView;
