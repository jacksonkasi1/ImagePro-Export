import { create } from 'zustand';

// ** import types
import { UtilsState } from '@/types/utils';

// Define the transitionDuration constant
const transitionDuration = 300; // Duration in milliseconds

export const useUtilsStore = create<UtilsState>((set, get) => ({
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set(() => ({ isLoading })),

  searchQuery: '',
  setSearchQuery: (searchQuery: string) => set(() => ({ searchQuery })),

  currentPage: 'asset',
  setCurrentPage: (tabPage: 'asset' | 'upload' | 'ai') => set(() => ({ currentPage: tabPage })),

  isHistoryVisible: false,
  setIsHistoryVisible: (isHistoryVisible: boolean) => set(() => ({ isHistoryVisible })),

  isExpanded: false,
  setIsExpanded: (isExpanded: boolean) => set(() => ({ isExpanded })),

  // Toggle function to switch history visibility
  toggleHistory: () => {
    const { isHistoryVisible } = get();

    if (isHistoryVisible) {
      // Close the footer
      set(() => ({ isExpanded: false }));

      // Wait for the height transition to finish before unmounting
      setTimeout(() => {
        set(() => ({ isHistoryVisible: false }));
      }, transitionDuration);
    } else {
      // Switch to HistoryFooterBody and expand it
      set(() => ({
        isHistoryVisible: true,
        isExpanded: true,
      }));
    }
  },

  // Toggle function to toggle the expansion of FilesFooterBody
  toggleExpansion: () => {
    const { isExpanded, setIsExpanded, isHistoryVisible, setIsHistoryVisible } = get();
    if (isHistoryVisible) {
      setIsHistoryVisible(false);
    }
    setIsExpanded(!isExpanded);
  },
}));
