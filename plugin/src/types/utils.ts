import { FormatOption } from './enums';

export interface UtilsState {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  currentPage: 'asset' | 'upload' | 'ai';
  setCurrentPage: (tabPage: 'asset' | 'upload' | 'ai') => void;
}

export interface ImageData {
  nodeName: string;
  scale: number;
  imageData: number[];
  formatOption: FormatOption;
  caseOption: string;
}
