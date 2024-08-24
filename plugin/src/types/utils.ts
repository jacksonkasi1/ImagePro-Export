export interface UtilsState {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export interface ImageData {
  nodeName: string;
  scale: number;
  imageData: number[];
  exportOption: string;
  caseOption: string;
}
