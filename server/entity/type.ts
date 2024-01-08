export enum BlogType {
  COMMON = 1,
  ESSAY,
  Note,
}

export const blogTextMap = {
  [BlogType.COMMON]: 'Common',
  [BlogType.ESSAY]: 'Essay',
  [BlogType.Note]: 'Note',
};
