module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  moduleNameMapper: {
    'src/app/utils': '<rootDir>/src/app/utils/index.ts',
    'src/app/services': '<rootDir>/src/app/services/index.ts',
  },
  setupFiles: ['<rootDir>/setupJestMocks.js'],
};
