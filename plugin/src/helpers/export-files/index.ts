// ** import types
import { ImageData } from '@/types/utils';
import { ExportMode, PdfFormatOption, AssetsExportType } from '@/types/enums';

// ** import export handlers
import { handleSinglePdfExport } from './handle-single-pdf-export';
import { handleOtherExports } from './handle-other-exports';
import { handleUploadFiles } from './handle-upload-files';
import { handleUploadSinglePdf } from './handle-upload-single-pdf';

interface ExportCompleteParams {
  data: ImageData[];
  setIsLoading: (isLoading: boolean) => void;
  exportMode: ExportMode;
  exportSettings: {
    quality: number;
    pdfFormatOption?: PdfFormatOption;
    password?: string;
    assetsExportType: AssetsExportType;
    enableUpload: boolean;
  };
}

export const handleExportComplete = async ({
  data,
  setIsLoading,
  exportMode,
  exportSettings,
}: ExportCompleteParams) => {
  const { assetsExportType, enableUpload } = exportSettings;

  if (!data || data.length === 0) {
    setIsLoading(false);
    return;
  }

  try {
    if (enableUpload) {
      // If uploads are enabled, handle file uploads regardless of export type
      if (assetsExportType === AssetsExportType.SINGLE) {
        await handleUploadSinglePdf({ data, exportSettings });
      } else {
        await handleUploadFiles({ data, exportSettings });
      }
    } else if (assetsExportType === AssetsExportType.SINGLE) {
      // Handle single PDF export if upload is not enabled
      await handleSinglePdfExport({ data, exportMode, exportSettings });
    } else {
      // Handle all other export cases
      await handleOtherExports({ data, exportMode, exportSettings });
    }
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    setIsLoading(false);
  }
};
