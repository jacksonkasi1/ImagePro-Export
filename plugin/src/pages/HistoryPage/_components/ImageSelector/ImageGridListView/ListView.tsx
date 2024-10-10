import { h } from 'preact';
import { useState } from 'preact/hooks';

// ** import icons
import CopyIcon from '@/assets/Icons/CopyIcon';
import DownloadIcon from '@/assets/Icons/DownloadIcon';

// ** import figma ui components
import { Text } from '@create-figma-plugin/ui';

// ** import custom ui components
import { Checkbox } from '@/components/ui/checkbox';

// ** import utils
import { cn, truncateText } from '@/lib/utils';

// ** import helpers
import { downloadFile } from '@/helpers/file-operation';
import { copyToClipboard } from '@/helpers/other';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSelection = (id: number, isSelected: boolean) => {
    const newSelected = !isSelected; // Toggle the current state
    onToggleSelection(id, newSelected);
  };

  return (
    <div className={'flex flex-col gap-2'}>
      {/* Sort history by id in descending order */}
      {history
        .slice()
        .sort((a, b) => b.id - a.id)
        .map((item, index) => {
          const isSelected = selectedNodeIds.includes(item.id);

          const thumbnail_img = item.thumbnail_cid
            ? `${config.PINATA_GATEWAY}/files/${item.thumbnail_cid}`
            : config.PDF_LOGO;

          const file_url = item.cid ? `${config.PINATA_GATEWAY}/files/${item.cid}` : '';

          // Handle Download action
          const handleDownload = () => {
            downloadFile(file_url, item.name, setIsLoading);
          };

          // Handle Copy action
          const handleCopy = () => {
            const fileLink = `${config.PINATA_GATEWAY}/files/${item.cid}`;
            copyToClipboard(fileLink)
              .then(() => {
                console.log('Link copied to clipboard:', fileLink);
              })
              .catch((error) => {
                console.error('Failed to copy link:', error);
              });
          };

          return (
            <div
              key={`${item.id}_${index}`}
              className={cn(
                'relative rounded-lg flex justify-between items-center px-2',
                isSelected ? 'bg-selected-bg' : 'bg-secondary-bg'
              )}
            >
              <div
                className="flex items-center w-full gap-2 cursor-pointer"
                onClick={() => handleToggleSelection(item.id, isSelected)}
              >
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
                      <Text className="cursor-pointer text-secondary-text">{truncateText(item.type, 6)}</Text>
                      <Text className="cursor-pointer text-secondary-text">
                        {Math.round(item.dimensions.width)}x{Math.round(item.dimensions.height)}px
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
              {/* Copy & Download */}
              <div className="flex flex-row items-center justify-around w-full gap-2 cursor-pointer">
                {/* Copy */}
                <button onClick={handleCopy}>
                  <CopyIcon className='size-5'   />
                </button>

                {/* Download */}
                <button onClick={handleDownload} disabled={isLoading}>
                  <DownloadIcon className='size-5'  />
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default NormalListView;
