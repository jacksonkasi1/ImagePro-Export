import * as React from 'react';

// ** import ui components
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';

// ** import types
import { ExportScaleOption } from '@/types/enums';

// ** import components
import { Typography } from './typography';

// ** import lib
import { cn } from '@/lib/utils';

interface ScaleBarProps extends React.HTMLAttributes<HTMLDivElement> {}

const ScaleBar: React.FC<ScaleBarProps> = ({ className, ...props }) => {
  const { exportScaleOption, setExportScaleOption } = useImageExportStore();

  return (
    <div className={cn('py-2', className)} {...props}>
      <Typography variant="p" className="mb-2">
        Scaling Options
      </Typography>
      <Select
        defaultValue={exportScaleOption}
        onValueChange={(value) => {
          console.log(value);
          setExportScaleOption(value as ExportScaleOption);
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Select scale" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Scale</SelectLabel>
            {Object.values(ExportScaleOption).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScaleBar;
