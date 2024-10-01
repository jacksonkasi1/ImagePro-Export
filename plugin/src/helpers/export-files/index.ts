// ** import types
import { ImageData } from '@/types/utils';
import { ExportMode, PdfFormatOption, AssetsExportType } from '@/types/enums';

// ** import export handlers
import { handleSinglePdfExport } from './handle-single-pdf-export';
import { handleOtherExports } from './handle-other-exports';

interface ExportCompleteParams {
  data: ImageData[];
  setIsLoading: (isLoading: boolean) => void;
  exportMode: ExportMode;
  exportSettings: {
    quality: number;
    pdfFormatOption?: PdfFormatOption;
    password?: string;
    assetsExportType: AssetsExportType;
  };
}

export const handleExportComplete = async ({
  data,
  setIsLoading,
  exportMode,
  exportSettings,
}: ExportCompleteParams) => {
  const { assetsExportType } = exportSettings;

  if (!data || data.length === 0) {
    setIsLoading(false);
    return;
  }

  try {
    if (assetsExportType === AssetsExportType.SINGLE) {
      await handleSinglePdfExport({ data, exportMode, exportSettings });
    } else {
      await handleOtherExports({ data, exportMode, exportSettings });
    }
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    setIsLoading(false);
  }
};
