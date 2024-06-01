import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { arrayBufferToBase64, renameFile } from '@/helpers/file-opration';

export const handleExportComplete = async (event: MessageEvent) => {
  if (!event?.data?.pluginMessage) return;
  const { type, data } = event.data.pluginMessage;

  if (type === 'EXPORT_COMPLETE') {
    console.log('Export Complete Event Received:::');
    console.log({ data });
    console.log({ data_length: data.length });

    const zip = new JSZip();
    const fileNames = {};

    const base64Promises = data.map(async (image) => {
      const { nodeName, scale, imageData, exportOption, caseOption } = image;
      const base64Image = await arrayBufferToBase64(new Uint8Array(imageData));
      return { nodeName, scale, base64Image, exportOption, caseOption };
    });

    const base64Images = await Promise.all(base64Promises);

    base64Images.forEach((image, index) => {
      const { nodeName, scale, base64Image, exportOption, caseOption } = image;

      const scaleFolder = `${scale}x/`;
      if (!fileNames[scaleFolder]) {
        fileNames[scaleFolder] = new Set();
      }

      let fileName = renameFile(nodeName, scale, exportOption, caseOption, fileNames[scaleFolder].size);

      // Ensure the file name is unique
      while (fileNames[scaleFolder].has(fileName)) {
        fileName = renameFile(nodeName, scale, exportOption, caseOption, fileNames[scaleFolder].size + 1);
      }
      fileNames[scaleFolder].add(fileName);

      zip.folder(scaleFolder).file(fileName, base64Image.split(',')[1], { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    console.log('ZIP file generated 😃');
    saveAs(content, 'exported_images.zip');
  }
};