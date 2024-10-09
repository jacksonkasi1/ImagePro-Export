import { promises as fs } from "fs";
import { File } from "node:buffer";

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

  const file = new File([fileBuffer], fileName, {
    type: "application/octet-stream",
    lastModified: stats.mtimeMs,
  });

  return await pinata.upload.file(file).group(env.PINATA_PUBLIC_GROUP_ID);
};

/**
 * Deletes multiple files from Pinata
 * @param cids(cid) Array of Content Identifiers of the files
 */
export const deleteFilesFromPinata = async (cids: string[]) => {
  return await pinata.files.delete(cids);
};

/**
 * Generates a signed URL for a file in Pinata with an expiration time in days
 * @param cid Content Identifier of the file
 * @param days Number of days the signed URL should be valid for
 * @param gateway Optional custom gateway, defaults to the configured Pinata gateway
 * @returns Signed URL
 */
export const generateSignedURL = async (
  cid: string,
  days: number,
  gateway?: string,
) => {
  const expiresInSeconds = days * 24 * 60 * 60; // Convert days to seconds

  return await pinata.gateways.createSignedURL({
    cid,
    expires: expiresInSeconds,
    gateway: gateway || env.PINATA_GATEWAY, // Use provided gateway or default to configured one
  });
};

/**
 * Downloads a file from Pinata using CID
 * @param cid Content Identifier of the file
 * @returns Object containing file data and contentType
 */
export const downloadFileFromPinata = async (cid: string) => {
  try {
    const file = await pinata.gateways.get(cid);

    if (!file.data) {
      throw new Error("File not found.");
    }

    return file;
  } catch (error: any) {
    throw new Error(`Error downloading file: ${error?.message}`);
  }
};

/**
 * Creates multiple groups in Pinata
 * @param groups Array of objects containing group details (name and isPublic)
 * @returns Array of created group responses
 */
export const createBulkGroups = async (
  groups: { name: string; isPublic: boolean }[],
) => {
  try {
    const createdGroups = [];
    for (const group of groups) {
      const newGroup = await pinata.groups.create({
        name: group.name,
        isPublic: group.isPublic,
      });
      createdGroups.push(newGroup);
    }
    return createdGroups;
  } catch (error: any) {
    throw new Error(`Error creating groups: ${error?.message}`);
  }
};
