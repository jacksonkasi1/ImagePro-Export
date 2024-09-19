import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

// ** import figma utils & ui
import { on } from '@create-figma-plugin/utilities';
import { render } from '@create-figma-plugin/ui';

// ** import pages & style
import Root from '@/pages';
import '!./styles/output.css';

// ** import types
import { ExportCompleteHandler, FetchImageNodesHandler } from '@/types/events';

// ** import store
import { useUtilsStore } from '@/store/use-utils-store';
import { useImageNodesStore } from '@/store/use-image-nodes-store';
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import helpers
import { handleExportComplete } from '@/helpers/handle-export-complete';

function Plugin() {
  const { setIsLoading } = useUtilsStore();
  const { quality, exportMode, pdfFormatOption, pdfPassword } = useImageExportStore();

  const { setAllNodes, setAllNodesCount, setSelectedNodeIds, setSelectedNodesCount } = useImageNodesStore();

  // Create refs for quality, pdfFormatOption, and pdfPassword
  const qualityRef = useRef(quality);
  const pdfFormatOptionRef = useRef(pdfFormatOption);
  const pdfPasswordRef = useRef(pdfPassword);

  // Sync refs with the latest state values
  useEffect(() => {
    qualityRef.current = quality;
  }, [quality]);

  useEffect(() => {
    pdfFormatOptionRef.current = pdfFormatOption;
  }, [pdfFormatOption]);

  useEffect(() => {
    pdfPasswordRef.current = pdfPassword;
  }, [pdfPassword]);

  useEffect(() => {
    on<FetchImageNodesHandler>('FETCH_IMAGE_NODES', (image_nodes) => {
      setAllNodes(image_nodes);
      setAllNodesCount(image_nodes.length);
      setSelectedNodeIds([]);
      setSelectedNodesCount(0);
    });

    on<ExportCompleteHandler>('EXPORT_COMPLETE', (data) => {
      handleExportComplete({
        data,
        setIsLoading,
        quality: qualityRef.current, // Use ref for quality
        exportMode,
        pdfFormatOption: pdfFormatOptionRef.current, // Use ref for pdfFormatOption
        password: pdfPasswordRef.current, // Use ref for pdfPassword
      });
    });
  }, []);

  return <Root />;
}

export default render(Plugin);
