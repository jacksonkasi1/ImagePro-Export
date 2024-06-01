export const arrayBufferToBase64 = (buffer: Uint8Array): Promise<string> => {
  const blob = new Blob([buffer]);
  const reader = new FileReader();
  return new Promise<string>((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};
