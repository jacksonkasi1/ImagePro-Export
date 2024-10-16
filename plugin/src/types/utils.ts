import { FormatOption } from './enums';

export interface UtilsState {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  currentPage: 'asset' | 'upload' | 'ai';
  setCurrentPage: (tabPage: 'asset' | 'upload' | 'ai') => void;

  isHistoryVisible: boolean;
  setIsHistoryVisible: (isHistoryVisible: boolean) => void;

  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;

  toggleHistory: () => void;
  toggleExpansion: () => void;
}

export interface ImageData {
  nodeName: string;
  scale: number;
  imageData: number[];
  formatOption: FormatOption;
  caseOption: string;
  dimensions: {
    width: number;
    height: number;
  };
  type: string;
}

export interface HistoryItem {
  id: number;
  name: string;
  type: string;
  cid: string;
  thumbnail_cid: string | null;
  file_id: string;
  thumbnail_id: string | null;
  dimensions: {
    width: number;
    height: number;
  };
  file_type: 'pdf' | 'image';
}

export interface FileData {
  fileName: string;
  fileBlob: Blob;
  base64Data?: string;
}
