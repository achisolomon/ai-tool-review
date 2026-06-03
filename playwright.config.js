import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  webServer: {
    // Node server with clean URL support (run 'npm run build' first if needed)
    command: 'node server.js',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
});
