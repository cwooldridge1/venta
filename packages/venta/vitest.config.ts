import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul' // or 'v8'
    },
    // browser: {
    //   enabled: true,
    //   name: 'chrome', // browser name is required
    // },
  },
});
