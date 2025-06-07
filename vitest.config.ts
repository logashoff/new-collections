import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 10_000,
    retry: 3,
    watch: false,
    environment: 'puppeteer',
    globalSetup: 'node_modules/vitest-environment-puppeteer/dist/global-init.js',
    include: ['./e2e/**/*.spec.ts'],
    typecheck: {
      tsconfig: './tsconfig.e2e.json',
    },
  },
});
