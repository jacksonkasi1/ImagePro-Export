import React, { useState, useEffect } from 'react';

// ** import icons
import { Percent } from 'lucide-react';

// ** import ui components
import { Input } from '@/components/ui/input';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';

// ** import types
import { ExportOption } from '@/types/enums';

interface PercentageInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PercentageInput: React.FC<PercentageInputProps> = ({ className, ...props }) => {
  const { exportOption, setQuality } = useImageExportStore();
  const [percentage, setPercentage] = useState<number>(80); // Default to 80%

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 0 && value <= 100) {
      setPercentage(value);
    }
  };

  useEffect(() => {
    setQuality(percentage / 100); // Convert percentage to quality (0-1)
    console.log({ percentage });
  }, [percentage, setQuality]);

  const isQualityOptionEnabled = [ExportOption.JPG, ExportOption.PNG, ExportOption.WEBP].includes(exportOption);

  return (
    <div className={`relative ${className}`} {...props}>
      <Input
        type="number"
        value={percentage}
        onChange={handleChange}
        min={0}
        max={100}
        placeholder="Enter percentage"
        className="!-mr-2"
        disabled={!isQualityOptionEnabled}
      />
      <Percent className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
    </div>
  );
};

export default PercentageInput;
