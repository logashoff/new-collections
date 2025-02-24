module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
    'src/app/services': '<rootDir>/src/app/services/index.ts',
    'src/app/utils': '<rootDir>/src/app/utils/index.ts',
    'src/mocks': '<rootDir>/src/mocks/index.ts',
  },
  transformIgnorePatterns: ['node_modules/(?!normalize-url)/'],
  setupFiles: ['<rootDir>/setupJestMocks.js'],
};
