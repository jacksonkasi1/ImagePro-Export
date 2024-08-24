export const getScaleValues = (option: string): number[] => {
  switch (option) {
    case '1x':
      return [1];
    case '1.5x':
      return [1.5];
    case '2x':
      return [2];
    case '3x':
      return [3];
    case '4x':
      return [4];
    case 'ALL':
      return [1, 1.5, 2, 3, 4];
    default:
      return [1];
  }
};
