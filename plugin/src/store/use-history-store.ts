// ** import sync store
import { createSyncedStore } from '@/storage/create-synced-store';

// ** import types
import { HistoryItem } from '@/types/utils';

interface HistoryState {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id'>) => void;
  removeHistoryItem: (cid: string) => void;
  clearHistory: () => void;
  getHistoryItem: (cid: string) => HistoryItem | undefined;
}

export const useHistoryStore = createSyncedStore<HistoryState>('historyStore', (set, get) => ({
  history: [],

  addHistoryItem: (item) => {
    const newId = get().history.length > 0 ? get().history[get().history.length - 1].id + 1 : 1;
    set({ history: [...get().history, { ...item, id: newId }] });
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
