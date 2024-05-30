import React from 'react';

// ** import icons
import { Download } from 'lucide-react';

// ** import ui components
import { Button } from './ui/button';

// ** import lib
import { cn } from '@/lib/utils';

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Footer: React.FC<FooterProps> = ({ className, ...props }) => {
  const handleExport = () => {};

  return (
    <div className={cn('flex w-full py-2', className)} {...props}>
      <div className="flex-1"></div>
      <Button className="justify-start w-fit" onClick={handleExport}>
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </div>
  );
};

export default Footer;
