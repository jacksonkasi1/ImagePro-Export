import { Fragment, h } from 'preact';

// ** import figma ui components
import { Columns, Text } from '@create-figma-plugin/ui';

// ** import custom ui components
import { Checkbox } from '@/components/ui/checkbox';

// ** import types
import { NodeData } from '@/types/node';

// ** import utils
import { cn, truncateText } from '@/lib/utils';

interface GridViewProps {
  allNodes: NodeData[];
  base64Images: { [key: string]: string };
  selectedNodeIds: string[];
  onToggleSelection: (id: string, currentChecked: boolean) => void;
}

const GridView = ({ allNodes, base64Images, selectedNodeIds, onToggleSelection }: GridViewProps) => {
  return (
    <Fragment>
      {allNodes.map((image, index) => {
        const isSelected = selectedNodeIds.includes(image.id);

        return (
          <div
            key={`${image.id}_${index}`}
            className={cn(
              'relative rounded-lg flex flex-col items-center cursor-pointer h-fit p-2',
              isSelected ? 'bg-selected-bg' : 'bg-secondary-bg'
            )}
            onClick={() => onToggleSelection(image.id, isSelected)}
          >
            {/* Checkbox */}
            <Checkbox
              value={isSelected}
              onValueChange={() => onToggleSelection(image.id, isSelected)}
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
                  <Text className="text-secondary-text">{truncateText(image.type, 6)}</Text>
                </div>
                <Text className="text-secondary-text">
                  {Math.round(image.dimensions.width)}x{Math.round(image.dimensions.height)}px
                </Text>
              </Columns>
            </div>
          </div>
        );
      })}
    </Fragment>
  );
};

export default GridView;
