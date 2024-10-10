// ** import config
import { config } from '@/config';

/**
 * Utility function to delete files by IDs from Pinata.
 *
 * @param {string[]} ids - The list of IDs to delete.
 * @returns {Promise<{ success: boolean, deletedIds: string[] }>} - The API response.
 */
export const deleteFiles = async (ids: string[]): Promise<{ success: boolean; deletedIds: string[] }> => {
  const response = await fetch(`${config.FILE_SERVER}/api/upload-opt/delete-files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete files.');
  }

  return await response.json();
};
