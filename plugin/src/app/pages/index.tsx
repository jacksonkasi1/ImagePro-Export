import React, { useEffect } from 'react';

// ** import theme provider
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';

// ** import components
import { Sidebar } from '@/components/sidebar';
import { ScaleBar } from '@/components/scale-bar';

// ** import ui
import { Separator } from '@/components/ui/separator';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';

// ** import types
import { NodeData } from '@/types/node';


function Page() {
  const { setAllNodes, setSelectedNodes, setAllNodesCount, setSelectedNodesCount } = useImageExportStore();

  const handleMessage = (event: MessageEvent) => {
    let { type, data } = event.data.pluginMessage;
    if (type === 'FETCH_IMAGE_NODES') {
      data = data as NodeData[];
      setAllNodes(data);
      setSelectedNodes(data);
      setAllNodesCount(data.length);
      setSelectedNodesCount(data.length);
    }
  };

  useEffect(() => {
    // Listen for IMAGE nodes data
    window.addEventListener('message', handleMessage);

    // Cleanup function
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    // Leave this 'system' as default to adopt the system theme automatically.
    <ThemeProvider defaultTheme="system">
      <div className="flex h-screen gap-4">
        <div className='flex justify-start'>
          <div className='flex flex-col px-3 space-y-4'>
            <Sidebar />
            <ModeToggle />
          </div>
          <Separator orientation='vertical' />
          <div className='flex flex-col px-3'>
            <ScaleBar />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default Page;
