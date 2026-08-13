import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  Object.assign(process.env, env);

  return {
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
  };
});
