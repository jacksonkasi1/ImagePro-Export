// ** import third party
import JSZip from "jszip";
import { saveAs } from "file-saver";

// ** import helpers
import {
  arrayBufferToBase64,
  compressImage,
  renameFile,
} from "@/helpers/file-operation";

// ** import types
import { ImageData } from "@/types/utils";

interface FileNames {
  [key: string]: Set<string>;
}

export const handleExportComplete = async (
  event: MessageEvent,
  setIsLoading: (isLoading: boolean) => void,
  exportSettings: { quality: number }
) => {
  if (!event?.data?.pluginMessage) return;
  const { data } = event.data.pluginMessage;

  try {
    const zip = new JSZip();
    const fileNames: FileNames = {};

    const base64Promises = data.map(async (image: ImageData) => {
      // Explicitly define image type
      const { nodeName, scale, imageData, exportOption, caseOption } = image;
      const blob = new Blob([new Uint8Array(imageData)], {
        type: `image/${exportOption.toLowerCase()}`,
      });

      let processedBlob = blob;

      if (
        ["JPG", "PNG", "WEBP"].includes(exportOption) &&
        exportSettings.quality < 1
      ) {
        processedBlob = await compressImage(
          blob,
          exportOption,
          exportSettings.quality
        );
      }

      const base64Image = await arrayBufferToBase64(
        new Uint8Array(await processedBlob.arrayBuffer()),
        exportOption
      );
      return { nodeName, scale, base64Image, exportOption, caseOption };
    });

    const base64Images = await Promise.all(base64Promises);

    base64Images.forEach((image) => {
      const { nodeName, scale, base64Image, exportOption, caseOption } = image;

      const scaleFolder = `${scale}x/`;
      if (!fileNames[scaleFolder]) {
        fileNames[scaleFolder] = new Set();
      }

      let fileName = renameFile(
        nodeName,
        scale,
        exportOption,
        caseOption,
        fileNames[scaleFolder].size
      );

      while (fileNames[scaleFolder].has(fileName)) {
        fileName = renameFile(
          nodeName,
          scale,
          exportOption,
          caseOption,
          fileNames[scaleFolder].size + 1
        );
      }
      fileNames[scaleFolder].add(fileName);

      // Ensure base64Image is not null or undefined before accessing it
      if (base64Image) {
        zip
          .folder(scaleFolder)
          ?.file(fileName, base64Image.split(",")[1], { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "exported_images.zip");
  } catch (error) {
    console.error(error);
    setIsLoading(false);
  } finally {
    setIsLoading(false);
  }
};
