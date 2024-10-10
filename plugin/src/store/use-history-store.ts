// ** import sync store
import { createSyncedStore } from '@/storage/create-synced-store';

// ** import types
import { HistoryItem } from '@/types/utils';

interface HistoryState {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id'>) => void;
  removeHistoryItem: (id: number) => void;
  clearHistory: () => void;
  getHistoryItem: (id: number) => HistoryItem | undefined;
}

export const useHistoryStore = createSyncedStore<HistoryState>('historyStore', (set, get) => ({
  history: [],

  addHistoryItem: (item) => {
    const newId = get().history.length > 0 ? get().history[get().history.length - 1].id + 1 : 1;
    set({ history: [...get().history, { ...item, id: newId }] });
  },

  removeHistoryItem: (id: number) => {
    set({ history: get().history.filter((item) => item.id !== id) });
  },

  clearHistory: () => {
    set({ history: [] });
  },

  getHistoryItem: (id: number) => {
    return get().history.find((item) => item.id === id);
  },
}));
