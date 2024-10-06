import { promises as fs } from "fs";

// ** import third-party lib
import { PinataSDK } from "pinata";

// ** import config
import { env } from "../config/env";

/**
 * Initializes Pinata SDK
 */
const pinata = new PinataSDK({
  pinataJwt: env.PINATA_JWT,
  pinataGateway: env.PINATA_GATEWAY,
});

/**
 * Uploads a file to Pinata
 * @param filePath Path to the file
 * @param fileName Name of the file
 * @returns Pinata upload response
 */
export const uploadFileToPinata = async (
  filePath: string,
  fileName: string,
) => {
  const fileBuffer = await fs.readFile(filePath);
  const stats = await fs.stat(filePath);

  const fileObject = {
    name: fileName,
    size: stats.size,
    type: "application/octet-stream",
    lastModified: stats.mtimeMs,
    arrayBuffer: async () => fileBuffer.buffer,
  };

  return await pinata.upload.file(fileObject);
};

/**
 * Deletes multiple files from Pinata
 * @param cids(cid) Array of Content Identifiers of the files
 */
export const deleteFilesFromPinata = async (cids: string[]) => {
  return await pinata.files.delete(cids);
};
