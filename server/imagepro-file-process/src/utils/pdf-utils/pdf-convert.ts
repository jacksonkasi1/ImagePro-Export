import { exec } from "child_process";

/**
 * Converts a PDF using Ghostscript.
 * @param {string} filePath - The path of the input PDF file.
 * @param {string} outputPath - The path where the output PDF file should be saved.
 * @param {string} conversionStrategy - The color conversion strategy (CMYK or Gray).
 * @param {string} processColorModel - The color model to apply (/DeviceCMYK or /DeviceGray).
 * @returns {Promise<void>} - Resolves when the conversion is complete.
 */
export const convertPdf = async (
  filePath: string,
  outputPath: string,
  conversionStrategy: string,
  processColorModel: string
): Promise<void> => {
  const gsCommand = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sColorConversionStrategy=${conversionStrategy} -dProcessColorModel=${processColorModel} -sOutputFile="${outputPath}" "${filePath}"`;

  return new Promise((resolve, reject) => {
    exec(gsCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ghostscript Error: ${stderr}`);
        return reject(new Error("Error converting PDF."));
      }
      resolve();
    });
  });
};

/**
 * Applies password protection to a PDF using Ghostscript.
 * @param {string} filePath - The path of the input PDF file.
 * @param {string} outputPath - The path where the output PDF file should be saved.
 * @param {string} password - The password to apply.
 * @returns {Promise<void>} - Resolves when the password is applied.
 */
export const applyEncryption = async (
  filePath: string,
  outputPath: string,
  password: string
): Promise<void> => {
  const gsCommand = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOwnerPassword=owner_pw -sUserPassword=${password} -dEncryptionR=3 -dKeyLength=128 -sOutputFile="${outputPath}" "${filePath}"`;

  return new Promise((resolve, reject) => {
    exec(gsCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ghostscript Error: ${stderr}`);
        return reject(new Error("Error applying password protection to PDF."));
      }
      resolve();
    });
  });
};
