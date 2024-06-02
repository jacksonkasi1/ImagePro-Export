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
import { useUtilsStore } from '@/store/useUtilsStore';

// ** import types
import { NodeData } from '@/types/node';

// ** import hooks
import useResizable from '@/hooks/useResizable';

// ** import handlers
import { handleExportComplete } from '@/handlers/handleExportComplete';
import SearchInput from '@/components/search-input';

function Page() {
  useResizable({
    minWidth: 470,
    maxWidth: 1000,
    minHeight: 360,
    maxHeight: 1000
  });

  const { setAllNodes, setAllNodesCount, setSelectedNodeIds, setSelectedNodesCount } = useImageExportStore();
  const { setIsLoading } = useUtilsStore();

  const handleMessage = (event: MessageEvent) => {
    if (!event?.data?.pluginMessage) return;
    let { type, data } = event?.data?.pluginMessage;
    if (type === 'FETCH_IMAGE_NODES') {
      data = data as NodeData[];
      setAllNodes(data);
      setAllNodesCount(data.length);
      setSelectedNodeIds([]);
      setSelectedNodesCount(0);
    }
    if (type === 'EXPORT_COMPLETE') {
      handleExportComplete(event, setIsLoading);
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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
            <div className="flex items-center gap-3 px-3">
              <SearchInput className="flex-1" />
              <ScaleBar />
            </div>
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
