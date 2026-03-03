import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 10_000,
    watch: false,
    globalSetup: 'vitest.setup.js',
    include: ['./e2e/**/*.spec.ts'],
    typecheck: {
      tsconfig: './tsconfig.e2e.json',
    },
  },
});
