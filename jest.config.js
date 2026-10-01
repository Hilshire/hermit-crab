/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@const$': '<rootDir>/const.ts',
    '^@components$': '<rootDir>/components',
    '^@hooks$': '<rootDir>/hooks',
    '^@utils$': '<rootDir>/utils',
    '^@server/(.*)$': '<rootDir>/server/$1',
    '^@entity$': '<rootDir>/server/entity',
    '^@middleware$': '<rootDir>/middleware',
    '^@styles$': '<rootDir>/styles',
    '^@hocs$': '<rootDir>/hocs',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testMatch: ['<rootDir>/**/*.test.ts'],
};
