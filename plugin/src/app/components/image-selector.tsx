import React, { Fragment, useEffect, useState } from 'react';

// ** import ui components
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Checkbox } from "@/components/ui/checkbox"

// ** import components
import { Typography } from './typography';

// ** import lib
import { cn } from '@/lib/utils';

// ** import helpers
import { arrayBufferToBase64 } from '@/helpers/image';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';

interface ImageSelectorProps extends React.HTMLAttributes<HTMLDivElement> { }




const ImageSelector: React.FC<ImageSelectorProps> = ({ className }) => {
  const {
    allNodes,
    allNodesCount,
    selectedNodeIds,
    setSelectedNodeIds,
    setSelectedNodesCount,
  } = useImageExportStore();
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
    <Fragment>
      <div className={cn('py-2 flex items-center justify-between', className)}>
        <Typography variant="p" className="flex-1">
          Select images
        </Typography>
        <div className="flex items-center gap-2">
          <Typography variant="p">
            Selected: {selectedNodeIds.length}/{allNodesCount}
          </Typography>
          <Checkbox
            checked={selectedNodeIds.length === allNodes.length}
            onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
          />
        </div>
      </div>

      <ScrollArea className={cn('w-full h-full whitespace-nowrap', className)}>
        <div className="flex flex-col w-full py-2 space-y-4">
          {allNodes.map((image) => (
            <div key={image.id} className="flex flex-row items-center gap-4">
              <div className="flex flex-row items-center flex-1 gap-2">
                <div
                  className="overflow-hidden rounded-md cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectImage(image.id, !selectedNodeIds.includes(image.id));
                  }}
                >
                  {base64Images[image.id] ? (
                    <img
                      src={base64Images[image.id]}
                      alt={`${image.name}`}
                      className="aspect-[16/9] w-full min-w-28 max-w-[140px] h-auto object-cover rounded-sm"
                      width={140}
                      height={78}
                    />
                  ) : (
                    <div className="aspect-[16/9] w-full min-w-28 max-w-[140px] h-auto object-cover rounded-sm bg-gray-200" />
                  )}
                </div>
                <Typography variant="small" className="w-[70%] truncate">
                  {image.name}
                </Typography>
              </div>
              <Checkbox
                checked={selectedNodeIds.includes(image.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectImage(image.id, !selectedNodeIds.includes(image.id));
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