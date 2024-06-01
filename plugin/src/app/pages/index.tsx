import React, { useEffect } from 'react';

// ** import theme provider
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';

// ** import components
import Sidebar from '@/components/sidebar';
import ScaleBar from '@/components/scale-bar';
import Footer from '@/components/footer';
import ImageSelector from '@/components/image-selector';

// ** import ui
import { Separator } from '@/components/ui/separator';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';

// ** import types
import { NodeData } from '@/types/node';

// ** import handlers
import { handleExportComplete } from '@/handlers/handleExportComplete';

function Page() {
  const { setAllNodes, setAllNodesCount, setSelectedNodeIds, setSelectedNodesCount } = useImageExportStore();

  const handleMessage = (event: MessageEvent) => {
    if(!event?.data?.pluginMessage) return;
    let { type, data } = event?.data?.pluginMessage;
    if (type === 'FETCH_IMAGE_NODES') {
      data = data as NodeData[];
      setAllNodes(data);
      setAllNodesCount(data.length);
      setSelectedNodeIds([]);
      setSelectedNodesCount(0);
    }
  };

  useEffect(() => {
    // Listen for IMAGE nodes data
    window.addEventListener('message', handleMessage);
    window.addEventListener('message', handleExportComplete);

    // Cleanup function
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('message', handleExportComplete);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="system">
      <div className="flex w-full h-screen gap-4">
        <div className="flex justify-start w-full">
          <div className="flex flex-col justify-between">
            <Sidebar className="px-3" />
            <div>
              <Separator orientation="horizontal" />
              <div className="flex items-center justify-between">
                <ModeToggle className="px-3 " />
                <div className="flex-1" />
              </div>
            </div>
          </div>
          <Separator orientation="vertical" />
          <div className="flex flex-col justify-between w-full">
            <ScaleBar className="px-3" />
            <ImageSelector className="px-3" />
            <div>
              <Separator orientation="horizontal" />
              <Footer className="px-3" />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default Page;
