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
 * @param filePathOrBuffer Path to the file or Buffer containing the file data
 * @param fileName Name of the file
 * @param groupId Optional Pinata group ID to assign the file to
 * @param contentType Optional content type of the file
 * @returns Pinata upload response
 */
export const uploadFileToPinata = async (
  filePathOrBuffer: string | Buffer,
  fileName: string,
  groupId?: string,
  contentType?: string,
) => {
  let fileBuffer: Buffer;
  let lastModified = Date.now();

  if (typeof filePathOrBuffer === "string") {
    // It's a file path
    fileBuffer = await fs.readFile(filePathOrBuffer);
    const stats = await fs.stat(filePathOrBuffer);
    lastModified = stats.mtimeMs;
  } else if (filePathOrBuffer instanceof Buffer) {
    fileBuffer = filePathOrBuffer;
  } else {
    throw new Error(
      "Invalid input: filePathOrBuffer must be a string or Buffer",
    );
  }

  const file = new File([fileBuffer], fileName, {
    type: contentType || "application/octet-stream",
    lastModified,
  });

  const upload = pinata.upload.file(file);
  if (groupId) {
    return await upload.group(groupId);
  } else {
    return await upload;
  }
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

/**
 * Fetches an optimized image from Pinata using the provided CID.
 * @param cid Content Identifier of the image file
 * @param optimizeOptions Options for optimizing the image
 * @returns The optimized image data and its content type
 */
export const getOptimizedImageFromPinata = async (
  cid: string,
  optimizeOptions: {
    width?: number;
    height?: number;
    format?: "auto" | "webp";
    quality?: number;
    fit?: "scaleDown" | "contain" | "cover" | "crop" | "pad";
    gravity?: "auto" | "side" | string;
  },
) => {
  const response = await pinata.gateways
    .get(cid)
    .optimizeImage(optimizeOptions);

  // Convert data to Buffer
  let dataBuffer: Buffer;

  if (typeof response.data === "string") {
    dataBuffer = Buffer.from(response.data, "binary");
  } else if (response.data instanceof Blob) {
    dataBuffer = Buffer.from(await response.data.arrayBuffer());
  } else if (Buffer.isBuffer(response.data)) {
    dataBuffer = response.data;
  } else {
    throw new Error("Unsupported data type for optimized image");
  }

  return {
    data: dataBuffer,
    contentType: response.contentType,
  };
};
