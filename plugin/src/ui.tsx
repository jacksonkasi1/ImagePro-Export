import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

// ** import figma utils & ui
import { on } from '@create-figma-plugin/utilities';
import { render } from '@create-figma-plugin/ui';

// ** import pages & style
import Root from '@/pages';
import '!./styles/output.css';

// ** import store
import { useUtilsStore } from '@/store/use-utils-store';
import { useImageNodesStore } from '@/store/use-image-nodes-store';
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import helpers
import { handleExportComplete } from '@/helpers/handle-export-complete';

// ** import types
import { AssetsExportType, PdfFormatOption } from '@/types/enums';
import { ExportCompleteHandler, FetchImageNodesHandler } from '@/types/events';

function Plugin() {
  const { setIsLoading } = useUtilsStore();
  const { quality, exportMode, pdfFormatOption, pdfPassword, assetsExportType } = useImageExportStore();

  const { setAllNodes, setAllNodesCount, setSelectedNodeIds, setSelectedNodesCount } = useImageNodesStore();

  // Create a single ref object for all export settings
  const exportSettingsRef = useRef<{
    quality: number;
    pdfFormatOption?: PdfFormatOption;
    password?: string;
    assetsExportType: AssetsExportType;
  }>({
    quality,
    pdfFormatOption,
    password: pdfPassword,
    assetsExportType,
  });

  // Sync refs with the latest state values
  useEffect(() => {
    exportSettingsRef.current.quality = quality;
  }, [quality]);

  useEffect(() => {
    exportSettingsRef.current.pdfFormatOption = pdfFormatOption;
  }, [pdfFormatOption]);

  useEffect(() => {
    exportSettingsRef.current.password = pdfPassword;
  }, [pdfPassword]);

  useEffect(() => {
    exportSettingsRef.current.assetsExportType = assetsExportType;
  }, [assetsExportType]);

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
        exportMode,
        exportSettings: exportSettingsRef.current, // Pass the common ref object
      });
    });
  }, [setAllNodes, setAllNodesCount, setSelectedNodeIds, setSelectedNodesCount, setIsLoading, exportMode]);

  return <Root />;
}

export default render(Plugin);
