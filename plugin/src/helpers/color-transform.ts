// Helper function to convert RGB to CMYK
export function rgb2cmyk(r: number, g: number, b: number): [number, number, number, number] {
  const c = 1 - r / 255;
  const m = 1 - g / 255;
  const y = 1 - b / 255;
  const k = Math.min(c, m, y);

  return [(c - k) / (1 - k) || 0, (m - k) / (1 - k) || 0, (y - k) / (1 - k) || 0, k || 0];
}

// Replace URL.createObjectURL with FileReader to load the image properly in a sandboxed environment like Figma.

export async function processImageToCMYK(imageBlob: Blob): Promise<Blob> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;

        img.onload = () => {
          const originalCanvas = document.createElement('canvas');
          const cmykCanvas = document.createElement('canvas');
          const originalContext = originalCanvas.getContext('2d');
          const cmykContext = cmykCanvas.getContext('2d');

          if (!originalContext || !cmykContext) {
            reject('Canvas context is not available.');
            return;
          }

          originalCanvas.width = img.width;
          originalCanvas.height = img.height;
          cmykCanvas.width = img.width;
          cmykCanvas.height = img.height;
          originalContext.drawImage(img, 0, 0, img.width, img.height);

          const imageData = originalContext.getImageData(0, 0, img.width, img.height);
          const data = imageData.data;
          const newImageData = cmykContext.createImageData(imageData.width, imageData.height);
          const newData = newImageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i],
              g = data[i + 1],
              b = data[i + 2];
            const [cyan, magenta, yellow, key] = rgb2cmyk(r, g, b);
            const control = 0.85;
            newData[i] = 255 * (1 - cyan) * (control - key);
            newData[i + 1] = 255 * (1 - magenta) * (control - key);
            newData[i + 2] = 255 * (1 - yellow) * (control - key);
            newData[i + 3] = data[i + 3];
          }

          cmykContext.putImageData(newImageData, 0, 0);
          cmykCanvas.toBlob((blob) => (blob ? resolve(blob) : reject('Failed to create CMYK image.')), 'image/png');
        };

        img.onerror = () => reject(new Error('Failed to load the image.'));
      };
      reader.onerror = () => reject(new Error('Failed to read the Blob.'));
      reader.readAsDataURL(imageBlob);
    });
  } catch (error) {
    console.error('Error during CMYK conversion:', error);
    throw new Error('CMYK conversion failed');
  }
}
