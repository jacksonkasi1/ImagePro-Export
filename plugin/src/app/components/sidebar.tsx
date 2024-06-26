import React, { useState } from 'react';

// ** import third-party
import { Image } from 'lucide-react';

// ** import ui components
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// ** import utilities
import { cn } from '@/lib/utils';

// ** import types
import { ExportOption } from '@/types/enums';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [activeOption, setActiveOption] = useState<ExportOption>(ExportOption.JPG);
  const { setExportOption } = useImageExportStore();

  const handleOptionClick = (option: ExportOption) => {
    setActiveOption(option);
    setExportOption(option);
  };

  return (
    <div className={cn('py-2 flex flex-col gap-1.5', className)}>
      <Label>Format</Label>
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

export default Sidebar;
