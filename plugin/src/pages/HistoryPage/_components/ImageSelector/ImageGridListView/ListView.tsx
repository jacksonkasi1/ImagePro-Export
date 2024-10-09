import { h } from 'preact';

// ** import figma ui components
import { Text } from '@create-figma-plugin/ui';

// ** import custom ui components
import { Checkbox } from '@/components/ui/checkbox';

// ** import utils
import { cn, truncateText } from '@/lib/utils';

// ** import types
import { HistoryItem } from '@/types/utils';

// ** import config
import { config } from '@/config';

interface NormalListViewProps {
  history: HistoryItem[];
  selectedNodeIds: number[];
  onToggleSelection: (id: number, currentChecked: boolean) => void;
}

const NormalListView = ({ history, selectedNodeIds, onToggleSelection }: NormalListViewProps) => {
  const handleToggleSelection = (id: number, isSelected: boolean) => {
    const newSelected = !isSelected; // Toggle the current state
    onToggleSelection(id, newSelected);
  };

  return (
    <div className={'flex flex-col gap-2 '}>
      {history.map((item, index) => {
        const isSelected = selectedNodeIds.includes(item.id);

        const thumbnail_img = item.thumbnail_cid
          ? `${config.PINATA_GATEWAY}/files/${item.thumbnail_cid}`
          : config.PDF_LOGO;

        return (
          <div
            key={`${item.id}_${index}`}
            className={cn(
              'relative rounded-lg flex items-center cursor-pointer px-2',
              isSelected ? 'bg-selected-bg' : 'bg-secondary-bg'
            )}
            onClick={() => handleToggleSelection(item.id, isSelected)}
          >
            <div className="flex items-center w-full gap-2 cursor-pointer">
              {/* Checkbox */}
              <Checkbox
                value={isSelected}
                onValueChange={() => handleToggleSelection(item.id, isSelected)}
                className="self-center"
              />
              {/* Image Preview */}
              <div className="flex items-center justify-center w-16 h-16 overflow-hidden cursor-pointer">
                <img src={thumbnail_img} alt={`${item.name}`} className="object-contain w-full h-full" />
              </div>

              {/* Image Details */}
              <div className="flex flex-row items-center justify-between w-full gap-2 cursor-pointer">
                <div className="flex flex-col cursor-pointer">
                  <Text className={cn('truncate w-full font-medium cursor-pointer')}>
                    {truncateText(item.name, 17)}
                  </Text>
                  <div className="flex flex-row items-center justify-between w-full gap-1">
                    <Text className="cursor-pointer text-secondary-text">{truncateText(item.type, 10)}</Text>
                    <Text className="cursor-pointer text-secondary-text">
                      {Math.round(item.dimensions.width)}x{Math.round(item.dimensions.height)}px
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
