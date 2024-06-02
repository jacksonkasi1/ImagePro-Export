// ** import third party
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ** import helpers
import { arrayBufferToBase64, renameFile } from '@/helpers/file-operation';

export const handleExportComplete = async (event: MessageEvent, setIsLoading: (isLoading: boolean) => void) => {
  if (!event?.data?.pluginMessage) return;
  const {  data } = event.data.pluginMessage;

  try {
      const zip = new JSZip();
      const fileNames = {};

      const base64Promises = data.map(async (image) => {
        const { nodeName, scale, imageData, exportOption, caseOption } = image;
        const base64Image = await arrayBufferToBase64(new Uint8Array(imageData), exportOption);
        return { nodeName, scale, base64Image, exportOption, caseOption };
      });

      const base64Images = await Promise.all(base64Promises);

      base64Images.forEach((image) => {
        const { nodeName, scale, base64Image, exportOption, caseOption } = image;

        const scaleFolder = `${scale}x/`;
        if (!fileNames[scaleFolder]) {
          fileNames[scaleFolder] = new Set();
        }

        let fileName = renameFile(nodeName, scale, exportOption, caseOption, fileNames[scaleFolder].size);

        while (fileNames[scaleFolder].has(fileName)) {
          fileName = renameFile(nodeName, scale, exportOption, caseOption, fileNames[scaleFolder].size + 1);
        }
        fileNames[scaleFolder].add(fileName);

        zip.folder(scaleFolder).file(fileName, base64Image.split(',')[1], { base64: true });
      });

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'exported_images.zip');
  } catch (error) {
    console.error(error);
    setIsLoading(false);
  } finally {
    setIsLoading(false);
  }
};
