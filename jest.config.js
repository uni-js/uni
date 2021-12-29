/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageReporters: ['html'],
  coverageDirectory: '<rootDir>/test/coverage',
  testMatch: [
    "<rootDir>/packages/**/*.test.ts"
  ],
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/test/tsconfig.test.json'
    }
  }
};