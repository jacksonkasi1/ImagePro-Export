export interface UtilsState {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
}
