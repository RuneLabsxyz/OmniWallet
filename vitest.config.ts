import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.spec.ts'],
    exclude: ['.orch/**', '.othala/**', 'node_modules/**', 'dist/**'],
    testTimeout: 15000
  }
});
