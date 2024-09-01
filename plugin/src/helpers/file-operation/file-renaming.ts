interface RenameFileParams {
  name: string;
  format: string;
  caseOption: string;
  count?: number; // Optional parameter
}

export const renameFile = ({ name, format, caseOption, count }: RenameFileParams): string => {
  let baseName = name.trim(); // Trim any leading or trailing spaces

  switch (caseOption) {
    case 'camelCase':
      // Remove spaces, and convert the following character to uppercase
      baseName = baseName
        .toLowerCase()
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
        .replace(/\s+/g, '');
      break;
    case 'snake_case':
      // Replace spaces or dashes with underscores
      baseName = baseName.toLowerCase().replace(/[\s-]+/g, '_');
      break;
    case 'kebab-case':
      // Replace spaces or underscores with dashes
      baseName = baseName.toLowerCase().replace(/[\s_]+/g, '-');
      break;
    case 'PascalCase':
      // Remove spaces and capitalize the first letter of each word
      baseName = baseName.replace(/(^\w|\s\w)/g, (letter) => letter.toUpperCase()).replace(/[\s_-]+/g, ''); // Remove spaces, underscores, and dashes
      break;
    default:
      break;
  }

  const extension = format.toLowerCase();
  return `${baseName}${count !== undefined ? `_${count}` : ''}.${extension}`;
};
