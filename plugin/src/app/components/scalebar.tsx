import React, { useState } from 'react';

// ** import ui components
import { Button } from '@/components/ui/button';

// ** import lib
import { cn } from '@/lib/utils';

// ** import types
import { ExportScaleOption } from '@/types/enums';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';

interface ScaleBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ScaleBar: React.FC<ScaleBarProps> = ({ className, ...props }) => {
  const [activeScale, setActiveScale] = useState<ExportScaleOption>(ExportScaleOption.ONE_X);
  const { setExportScaleOption } = useImageExportStore();

  const handleScaleClick = (scale: ExportScaleOption) => {
    setActiveScale(scale);
    setExportScaleOption(scale);
  };

  return (
    <div className={cn('flex space-x-2', className)} {...props}>
      {Object.values(ExportScaleOption).map((scale) => (
        <Button
          key={scale}
          variant={activeScale === scale ? 'secondary' : 'ghost'}
          className="w-16"
          size="sm"
          onClick={() => handleScaleClick(scale)}
        >
          {scale}
        </Button>
      ))}
    </div>
  );
};
