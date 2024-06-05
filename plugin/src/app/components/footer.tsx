import React from 'react';

// ** import icons
import { Download } from 'lucide-react';

// ** import ui components
import { Button } from './ui/button';

// ** import components
import CaseSelector from './case-selector';

// ** import lib
import { cn } from '@/lib/utils';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';
import { useImageNodesStore } from '@/store/useImageNodesStore';
import { useUtilsStore } from '@/store/useUtilsStore';

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Footer: React.FC<FooterProps> = ({ className, ...props }) => {
  const { selectedNodeIds } = useImageNodesStore();
  const { exportOption, exportScaleOption, caseOption } = useImageExportStore();
  const { isLoading, setIsLoading } = useUtilsStore();

  const handleExport = async () => {
    try {
      setIsLoading(true);
      parent.postMessage(
        {
          pluginMessage: {
            type: 'EXPORT_IMAGES',
            data: {
              selectedNodeIds,
              exportOption,
              exportScaleOption,
              caseOption,
            },
          },
        },
        '*'
      );
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex w-full py-2 gap-2', className)} {...props}>
      <div className="flex-1"></div>
      <CaseSelector />
      <Button className="justify-start w-fit" onClick={handleExport} isLoading={isLoading}>
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </div>
  );
};

export default Footer;
