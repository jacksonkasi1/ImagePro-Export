import React, { useState } from 'react';

// ** import third-party
import { Image } from 'lucide-react';

// ** import ui components
import { Button } from '@/components/ui/button';

// ** import utilities
import { cn } from '@/lib/utils';

// ** import types
import { ExportOption } from '@/types/enums';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';
import { Typography } from './typography';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [activeOption, setActiveOption] = useState<ExportOption>(ExportOption.JPG);
  const { setExportOption } = useImageExportStore();

  const handleOptionClick = (option: ExportOption) => {
    setActiveOption(option);
    setExportOption(option);
  };

  return (
    <div className={cn('py-2', className)}>
      <Typography variant="large" className='mb-2'>Format</Typography>
      <div className="space-y-1 max-w-28">
        {Object.values(ExportOption).map((option) => (
          <Button
            key={option}
            variant={activeOption === option ? 'secondary' : 'ghost'}
            className="justify-start w-full"
            onClick={() => handleOptionClick(option)}
          >
            <Image className="w-4 h-4 mr-2" />
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};
