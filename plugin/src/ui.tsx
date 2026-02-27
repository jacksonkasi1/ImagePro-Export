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
import { useAIStore } from '@/store/use-ai-store';

// ** import helpers
import { handleExportComplete } from '@/helpers/export-files';

// ** import types
import { NodeData } from '@/types/node';
import { AINodeData } from '@/types/ai';
import { ImageData } from '@/types/utils';
import { AssetsExportType, PdfFormatOption } from '@/types/enums';
import {
  ExportCompleteHandler,
  FetchAIImageNodesHandler,
  FetchAILayerNodesHandler,
  FetchImageNodesHandler,
} from '@/types/events';

function Plugin() {
  useStorageManager(); // Initialize storage synchronization

  const { setIsLoading, currentPage } = useUtilsStore();
  const { quality, exportMode, pdfFormatOption, pdfPassword, assetsExportType } = useImageExportStore();

  const { setAllNodes, setAllNodesCount, setSelectedNodeIds, setSelectedNodesCount } = useImageNodesStore();
  const { setAIImageNodes, setSelectedAIImageNodeIds, setAILayerNodes, setSelectedAILayerNodeIds } = useAIStore();

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
      // Don't reset AI tab's independent selection when on the AI page
      if (useUtilsStore.getState().currentPage !== 'ai') {
        setSelectedNodeIds([]);
        setSelectedNodesCount(0);
      }
    });

    // AI Images sub-tab: recursed IMAGE-fill nodes
    on<FetchAIImageNodesHandler>('FETCH_AI_IMAGE_NODES', (nodes: AINodeData[]) => {
      setAIImageNodes(nodes);
      setSelectedAIImageNodeIds([]);
    });

    // AI Layers sub-tab: top-level non-image nodes
    on<FetchAILayerNodesHandler>('FETCH_AI_LAYER_NODES', (nodes: AINodeData[]) => {
      setAILayerNodes(nodes);
      setSelectedAILayerNodeIds([]);
    });

    on<ExportCompleteHandler>('EXPORT_COMPLETE', (data: ImageData[]) => {
      handleExportComplete({
        data,
        setIsLoading,
        exportMode,
        exportSettings: exportSettingsRef.current,
      });
    });
  }, [
    setAllNodes, setAllNodesCount, setSelectedNodeIds, setSelectedNodesCount,
    setIsLoading, exportMode,
    setAIImageNodes, setSelectedAIImageNodeIds,
    setAILayerNodes, setSelectedAILayerNodeIds,
  ]);

  return <Root />;
}

export default render(Plugin);
