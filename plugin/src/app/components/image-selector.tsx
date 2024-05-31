import React, { Fragment, useState } from 'react';

// ** import ui components
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Checkbox } from "@/components/ui/checkbox"

// ** import components
import { Typography } from './typography';

// ** import lib
import { cn } from '@/lib/utils';

export interface Artwork {
  id: number;
  name: string;
  link: string;
}

export const imageList: Artwork[] = [
  {
    id: 1,
    name: 'Ornella Binni',
    link: 'https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 2,
    name: 'Tom Byrom',
    link: 'https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 3,
    name: 'Vladimir Malyavko',
    link: 'https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80',
  }
];

interface ImageSelectorProps extends React.HTMLAttributes<HTMLDivElement> { }

const ImageSelector: React.FC<ImageSelectorProps> = ({ className }) => {
  const [selectedImages, setSelectedImages] = useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(imageList.map(image => image.id));
    } else {
      setSelectedImages([]);
    }
  };

  const handleSelectImage = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedImages(prev => [...prev, id]);
    } else {
      setSelectedImages(prev => prev.filter(imageId => imageId !== id));
    }
  };

  return (
    <Fragment>
      <div className={cn('py-2 flex items-center justify-between', className)}>
        <Typography variant="p" className="flex-1">
          Select images
        </Typography>
        <div className='flex items-center gap-2'>
          <Typography variant="p">
            Selected: {selectedImages.length}/{imageList.length}
          </Typography>
          <Checkbox
            checked={selectedImages.length === imageList.length}
            onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
          />
        </div>
      </div>

      <ScrollArea className={cn('w-full h-full whitespace-nowrap', className)}>
        <div className="flex flex-col w-full py-2 space-y-4">
          {imageList.map((image) => (
            <div
              key={image.name}
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
                    src={image.link}
                    alt={`Photo by ${image.name}`}
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
