import React, { useEffect } from 'react';

// ** import ui
import { Button } from '@/components/ui/button';

// ** import components
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';

// ** import types
import { NodeData } from '@/types/node';
import TestPage from './TestPage';

function Page() {
  const { setAllNodes, setSelectedNodes, setAllNodesCount, setSelectedNodesCount } = useImageExportStore();

  const handleMessage = (event: MessageEvent) => {
    let { type, data } = event.data.pluginMessage;
    if (type === 'FETCH_IMAGE_NODES') {
      data = data as NodeData[];
      console.log({ length: data.length });
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
    // leave this 'system' as default, to adopt the system theme automatically
    <ThemeProvider defaultTheme="system">
      <div className="flex items-center justify-center h-screen gap-4">
        <ModeToggle />
        <TestPage />
      </div>
    </ThemeProvider>
  );
}

export default Page;
