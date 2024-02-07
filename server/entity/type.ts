export enum BlogType {
  COMMON = 1,
  ESSAY,
  NOTE,
  SHOWER_THOUGHTS,
}

export const blogTextMap = {
  [BlogType.COMMON]: '普通',
  [BlogType.ESSAY]: '杂感',
  [BlogType.NOTE]: 'Tips',
  [BlogType.SHOWER_THOUGHTS]: '浴中沉思',
};
