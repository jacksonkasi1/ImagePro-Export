// ** import config
import { config } from '@/config';

/**
 * Utility function to delete files by CIDs from Pinata.
 *
 * @param {string[]} cids - The list of CIDs to delete.
 * @returns {Promise<{ success: boolean, deletedCids: string[] }>} - The API response.
 */
export const deleteFiles = async (cids: string[]): Promise<{ success: boolean; deletedCids: string[] }> => {
  const response = await fetch(`${config.FILE_SERVER}/api/upload-opt/delete-files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cids }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete files.');
  }

  return await response.json();
};
