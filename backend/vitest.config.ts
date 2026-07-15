import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',

    include: ['tests/**/*.test.ts'],

    globals: false,

    clearMocks: true,

    restoreMocks: true,

    mockReset: true,

    testTimeout: 10_000,

    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
    },
  },
});
