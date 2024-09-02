// ** import figma utils
import { emit } from '@create-figma-plugin/utilities';

const notify = {
  // Utility functions to emit notifications
  success: (message: string, timeout?: number) => {
    emit('NOTIFY', message, 'success', timeout);
  },
  warn: (message: string, timeout?: number) => {
    emit('NOTIFY', message, 'warn', timeout);
  },
  error: (message: string, timeout?: number) => {
    emit('NOTIFY', message, 'error', timeout);
  },
  loading: (message: string, timeout?: number) => {
    emit('NOTIFY', message, 'loading', timeout);
  },
};

export default notify;
