export const arrayBufferToBase64 = (buffer: Uint8Array, format?: string): Promise<string> => {
  format = format || 'png';
  const blob = new Blob([buffer], { type: `application/${format.toLowerCase()}` });
  const reader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject('Error converting buffer to base64');
      }
    };
    reader.readAsDataURL(blob);
  });
};

export const renameFile = (name: string, scale: number, format: string, caseOption: string, count: number): string => {
  const extension = format.toLowerCase();
  let fileName = `${name}__${count}__${scale}x.${extension}`;

  switch (caseOption) {
    case 'CAMEL_CASE':
      fileName = fileName.replace(/_/g, '');
      break;
    case 'SNAKE_CASE':
      fileName = fileName.replace(/-/g, '_');
      break;
    case 'KEBAB_CASE':
      fileName = fileName.replace(/_/g, '-');
      break;
    case 'PASCAL_CASE':
      fileName = fileName.replace(/_/g, '');
      fileName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      break;
  }

  return fileName;
};
