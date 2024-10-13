import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

// ** import figma utils & ui
import { on } from '@create-figma-plugin/utilities';
import { render } from '@create-figma-plugin/ui';

// ** import pages & style
import Root from '@/pages';
import '!./styles/output.css';

// ** import hooks
import { useStorageManager } from '@/hooks/useStorageManager';

// ** import store
import { useUtilsStore } from '@/store/use-utils-store';
import { useImageNodesStore } from '@/store/use-image-nodes-store';
import { useImageExportStore } from '@/store/use-image-export-store';

// ** import helpers
import { handleExportComplete } from '@/helpers/export-files';

// ** import types
import { NodeData } from '@/types/node';
import { ImageData } from '@/types/utils';
import { AssetsExportType, PdfFormatOption } from '@/types/enums';
import { ExportCompleteHandler, FetchImageNodesHandler } from '@/types/events';

function Plugin() {
  useStorageManager(); // Initialize storage synchronization

  const { setIsLoading, currentPage } = useUtilsStore();
  const { quality, exportMode, pdfFormatOption, pdfPassword, assetsExportType } = useImageExportStore();

  const { setAllNodes, setAllNodesCount, setSelectedNodeIds, setSelectedNodesCount } = useImageNodesStore();

  // Create a single ref object for all export settings
  const exportSettingsRef = useRef<{
    quality: number;
    pdfFormatOption?: PdfFormatOption;
    password?: string;
    assetsExportType: AssetsExportType;
    enableUpload: boolean;
  }>({
    quality,
    pdfFormatOption,
    password: pdfPassword,
    assetsExportType,
    enableUpload: currentPage === 'upload',
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
    exportSettingsRef.current.enableUpload = currentPage === 'upload';
  }, [currentPage]);

  useEffect(() => {
    on<FetchImageNodesHandler>('FETCH_IMAGE_NODES', (image_nodes: NodeData[]) => {
      setAllNodes(image_nodes);
      setAllNodesCount(image_nodes.length);
      setSelectedNodeIds([]);
      setSelectedNodesCount(0);
    });

    on<ExportCompleteHandler>('EXPORT_COMPLETE', (data: ImageData[]) => {
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
