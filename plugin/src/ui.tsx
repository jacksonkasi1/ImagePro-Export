import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

// ** import figma utils & ui
import { on } from '@create-figma-plugin/utilities';
import { render } from '@create-figma-plugin/ui';

// ** import pages & style
import '!./styles/output.css';
import Root from '@/pages';

// ** import types
import { ExportCompleteHandler, FetchImageNodesHandler } from '@/types/events';

// ** import store
import { useUtilsStore } from '@/store/use-utils-store';
import { useImageNodesStore } from '@/store/use-image-nodes-store';
import { useImageExportStore } from '@/store/use-image-export-store';
import { handleExportComplete } from './helpers/handle-export-complete';

function Plugin() {
  const { setIsLoading } = useUtilsStore();
  const { quality, exportMode } = useImageExportStore();
  const { setAllNodes, setAllNodesCount, setSelectedNodeIds, setSelectedNodesCount } = useImageNodesStore();

  const qualityRef = useRef(quality);

  useEffect(() => {
    qualityRef.current = quality; // Update ref whenever quality changes
  }, [quality]);

  useEffect(() => {
    on<FetchImageNodesHandler>('FETCH_IMAGE_NODES', (image_nodes) => {
      setAllNodes(image_nodes);
      setAllNodesCount(image_nodes.length);
      setSelectedNodeIds([]);
      setSelectedNodesCount(0);
    });
    on<ExportCompleteHandler>('EXPORT_COMPLETE', (data) => {
      handleExportComplete({ data, setIsLoading, quality: qualityRef.current, exportMode }); // Use ref here
    });
  }, []);

  return <Root />;
}

export default render(Plugin);
