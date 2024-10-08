import { useEffect } from 'preact/hooks';

// ** import figma plugin utilities
import { on, emit } from '@create-figma-plugin/utilities';

// ** import third-party libraries
import { StoreApi } from 'zustand';

// ** import types
import { ReceiveDataHandler } from '@/types/events';

// ** import your stores that need synchronization
// import {  } from '@/store/';

interface SyncedStore {
  storageKey: string;
  storeApi: StoreApi<any>;
}

export const useStorageManager = () => {
  useEffect(() => {
    const stores: SyncedStore[] = [
      // { storageKey: 'utilsStore', storeApi: useUtilsStore },
      // Add other stores here with their corresponding storage keys
      // { storageKey: 'anotherStore', storeApi: useAnotherStore },
    ];

    // Handle RECEIVE_DATA events from the plugin code
    const handleReceiveData: ReceiveDataHandler['handler'] = ({ handle, data }) => {
      const store = stores.find((s) => s.storageKey === handle);
      if (store && data) {
        store.storeApi.setState(data);
      }
    };

    // Subscribe to RECEIVE_DATA events
    on<ReceiveDataHandler>('RECEIVE_DATA', handleReceiveData);

    // For each store, emit GET_DATA to request initial data from clientStorage
    stores.forEach((store) => {
      emit('GET_DATA', { handle: store.storageKey });
    });

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      // Unsubscribe from RECEIVE_DATA events if necessary
      // Currently, '@create-figma-plugin/utilities' does not provide an unsubscribe method
    };
  }, []);

  return null; // This hook doesn't need to return anything
};
