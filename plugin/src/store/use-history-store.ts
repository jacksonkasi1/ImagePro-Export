import { createSyncedStore } from '@/storage/create-synced-store';

// ** import types
import { HistoryItem } from '@/types/utils';

interface HistoryState {
  history: HistoryItem[];
  addHistoryItem: (item: HistoryItem) => void;
  removeHistoryItem: (cid: string) => void;
  clearHistory: () => void;
  getHistoryItem: (cid: string) => HistoryItem | undefined;
}

export const useHistoryStore = createSyncedStore<HistoryState>('historyStore', (set, get) => ({
  history: [],

  addHistoryItem: (item: HistoryItem) => {
    set({ history: [...get().history, item] });
  },

  removeHistoryItem: (cid: string) => {
    set({ history: get().history.filter((item) => item.cid !== cid) });
  },

  clearHistory: () => {
    set({ history: [] });
  },

  getHistoryItem: (cid: string) => {
    return get().history.find((item) => item.cid === cid);
  },
}));
