import { create } from 'zustand';

// ** import types
import { UtilsState } from '@/types/utils';

export const useUtilsStore = create<UtilsState>((set) => ({
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set(() => ({ isLoading })),

  searchQuery: '',
  setSearchQuery: (searchQuery: string) => set(() => ({ searchQuery })),

  currentPage: 'asset',
  setCurrentPage: (tabPage: 'asset' | 'upload' | 'ai') => set(() => ({ currentPage: tabPage })),

  isHistoryVisible: false,
  setIsHistoryVisible: (isHistoryVisible: boolean) => set(() => ({ isHistoryVisible })),
}));
