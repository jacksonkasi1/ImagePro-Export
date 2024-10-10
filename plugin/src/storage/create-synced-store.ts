// ** import figma-plugin utilities
import { emit, on } from '@create-figma-plugin/utilities';

// ** import types
import { GetDataHandler, ReceiveDataHandler, SetDataHandler } from '@/types/events';

// ** import third-party libraries
import { create, StateCreator, StoreApi } from 'zustand';

export function createSyncedStore<T extends object>(
  storageKey: string,
  storeInitializer: StateCreator<T>
): StoreApi<T> {
  const useStore = create<T>((set, get, api) => {
    const initialState = storeInitializer(set, get, api);

    // Subscribe to store changes and save to clientStorage
    api.subscribe((state) => {
      // Remove functions from the state before storing
      const dataToStore = Object.fromEntries(
        Object.entries(state).filter(([key, value]) => typeof value !== 'function')
      );

      // Emit a SET_DATA event to the plugin code
      emit<SetDataHandler>('SET_DATA', { handle: storageKey, data: dataToStore });
    });

    return initialState;
  });

  // Sync with clientStorage when the store is initialized
  const syncWithClientStorage = () => {
    // Emit a GET_DATA event to the plugin code
    emit<GetDataHandler>('GET_DATA', { handle: storageKey });

    const onReceiveData = ({ data }: { data: any }) => {
      if (data) {
        useStore.setState(data);
      }
    };

    on<ReceiveDataHandler>('RECEIVE_DATA', onReceiveData);
  };

  // Call syncWithClientStorage immediately
  syncWithClientStorage();

  return useStore;
}
