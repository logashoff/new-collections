module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    'src/app/services': '<rootDir>/src/app/services/index.ts',
    'src/app/utils': '<rootDir>/src/app/utils/index.ts',
    'src/mocks': '<rootDir>/src/mocks/index.ts',
  },
  setupFiles: ['<rootDir>/setupJestMocks.js'],
};
