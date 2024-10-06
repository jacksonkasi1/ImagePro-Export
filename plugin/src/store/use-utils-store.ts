import { create } from 'zustand';

// ** import types
import { UtilsState } from '@/types/utils';

export const useUtilsStore = create<UtilsState>((set) => ({
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set(() => ({ isLoading })),

  searchQuery: '',
  setSearchQuery: (searchQuery: string) => set(() => ({ searchQuery })),

  currentPage: 'asset',
  setCurrentPage: (tabPage: string) => set(() => ({ currentPage: tabPage })),
}));
