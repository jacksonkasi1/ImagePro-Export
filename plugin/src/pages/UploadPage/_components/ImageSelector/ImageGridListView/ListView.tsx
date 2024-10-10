import { h } from 'preact';

// ** import figma ui components
import { Text } from '@create-figma-plugin/ui';

// ** import custom ui components
import { Checkbox } from '@/components/ui/checkbox';

// ** import utils
import { cn, truncateText } from '@/lib/utils';

// ** import types
import { NodeData } from '@/types/node';

interface NormalListViewProps {
  allNodes: NodeData[];
  base64Images: { [key: string]: string };
  selectedNodeIds: string[];
  onToggleSelection: (id: string, currentChecked: boolean) => void;
}

const NormalListView = ({ allNodes, base64Images, selectedNodeIds, onToggleSelection }: NormalListViewProps) => {
  const handleToggleSelection = (id: string, isSelected: boolean) => {
    const newSelected = !isSelected; // Toggle the current state
    onToggleSelection(id, newSelected);
  };

  return (
    <div className={'flex flex-col gap-2 '}>
      {allNodes.map((image, index) => {
        const isSelected = selectedNodeIds.includes(image.id);

        return (
          <div
            key={`${image.id}_${index}`}
            className={cn(
              'relative rounded-lg flex items-center cursor-pointer px-2',
              isSelected ? 'bg-selected-bg' : 'bg-secondary-bg'
            )}
            onClick={() => handleToggleSelection(image.id, isSelected)}
          >
            <div className="flex items-center w-full gap-2 cursor-pointer">
              {/* Checkbox */}
              <Checkbox
                value={isSelected}
                onValueChange={() => handleToggleSelection(image.id, isSelected)}
                className="self-center"
              />
              {/* Image Preview */}
              <div className="flex items-center justify-center w-16 h-16 overflow-hidden cursor-pointer">
                {base64Images[image.id] ? (
                  <img src={base64Images[image.id]} alt={`${image.name}`} className="object-contain w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              {/* Image Details */}
              <div className="flex flex-row items-center justify-between w-full gap-2 cursor-pointer">
                <div className="flex flex-col cursor-pointer">
                  <Text className={cn('truncate w-full font-medium cursor-pointer')}>
                    {truncateText(image.name, 17)}
                  </Text>
                  <div className="flex flex-row items-center justify-between w-full gap-1">
                    <Text className="cursor-pointer text-secondary-text">{truncateText(image.type, 10)}</Text>
                    <Text className="cursor-pointer text-secondary-text">
                      {Math.round(image.dimensions.width)}x{Math.round(image.dimensions.height)}px
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NormalListView;
