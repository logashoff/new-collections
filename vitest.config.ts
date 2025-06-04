import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    environment: 'puppeteer',
    globalSetup: 'node_modules/vitest-environment-puppeteer/dist/global-init.js',
    include: ['./e2e/**/*.spec.ts'],
    typecheck: {
      tsconfig: './tsconfig.e2e.json',
    },
  },
});
