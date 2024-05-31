import React, { useState } from 'react';

// ** import ui components
import { Button } from '@/components/ui/button';

// ** import components
import { Typography } from './typography';

// ** import lib
import { cn } from '@/lib/utils';

// ** import types
import { ExportScaleOption } from '@/types/enums';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';

interface ScaleBarProps extends React.HTMLAttributes<HTMLDivElement> {}

const ScaleBar: React.FC<ScaleBarProps> = ({ className, ...props }) => {
  const [activeScale, setActiveScale] = useState<ExportScaleOption>(ExportScaleOption.ONE_X);
  const { setExportScaleOption } = useImageExportStore();

  const handleScaleClick = (scale: ExportScaleOption) => {
    setActiveScale(scale);
    setExportScaleOption(scale);
  };

  return (
    <div className={cn('py-2', className)} {...props}>
      <Typography variant="p" className="mb-2">
        Scaling Options
      </Typography>
      <div className="flex space-x-2">
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
    </div>
  );
};

export default ScaleBar;