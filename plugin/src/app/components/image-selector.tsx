import React, { Fragment, useState, useEffect } from 'react';

// ** import ui components
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Checkbox } from "@/components/ui/checkbox"

// ** import components
import { Typography } from './typography';

// ** import lib
import { cn } from '@/lib/utils';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';

interface ImageSelectorProps extends React.HTMLAttributes<HTMLDivElement> { }

const ImageSelector: React.FC<ImageSelectorProps> = ({ className }) => {
  const { allNodes, allNodesCount, setSelectedNodeIds, setSelectedNodesCount } = useImageExportStore();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    setSelectedNodesCount(selectedImages.length);
    setSelectedNodeIds(selectedImages);
  }, [allNodes, selectedImages, setSelectedNodeIds, setSelectedNodesCount]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(allNodes.map(image => image.id));
    } else {
      setSelectedImages([]);
    }
  };

  const handleSelectImage = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedImages(prev => [...prev, id]);
    } else {
      setSelectedImages(prev => prev.filter(imageId => imageId !== id));
    }
  };

  const arrayBufferToBase64 = (buffer: Uint8Array): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  return (
    <Fragment>
      <div className={cn('py-2 flex items-center justify-between', className)}>
        <Typography variant="p" className="flex-1">
          Select images
        </Typography>
        <div className='flex items-center gap-2'>
          <Typography variant="p">
            Selected: {selectedImages.length}/{allNodesCount}
          </Typography>
          <Checkbox
            checked={selectedImages.length === allNodes.length}
            onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
          />
        </div>
      </div>

      <ScrollArea className={cn('w-full h-full whitespace-nowrap', className)}>
        <div className="flex flex-col w-full py-2 space-y-4">
          {allNodes.map((image) => (
            <div
              key={image.id}
              className="flex flex-row items-center gap-4"
            >
              <div className="flex flex-row items-center flex-1 gap-2">
                <div className="overflow-hidden rounded-md cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectImage(image.id, !selectedImages.includes(image.id));
                  }}
                >
                  <img
                    src={`data:image/png;base64,${arrayBufferToBase64(image.imageData)}`}
                    alt={`${image.name}`}
                    className="aspect-[16/9] w-full min-w-28 max-w-[140px] h-auto object-cover rounded-sm"
                    width={140}
                    height={78}
                  />
                </div>
                <Typography variant="small" className="w-[70%] truncate">
                  {image.name}
                </Typography>
              </div>
              <Checkbox
                checked={selectedImages.includes(image.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectImage(image.id, !selectedImages.includes(image.id));
                }}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </Fragment>
  );
};

export default ImageSelector;