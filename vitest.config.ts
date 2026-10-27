import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      // Fail `npm run test:coverage` if covered code drops below the 80% target.
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
