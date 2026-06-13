import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // CI: 4 workers; pre-push: 2 workers to avoid OOM on dev machines; dev: uncapped
  workers: process.env.CI ? 4 : process.env.PREPUSH ? 2 : undefined,
  reporter: 'html',
  globalSetup: './tests/global-setup.js',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    // Route browser HTTPS traffic through the blocking proxy started in
    // global-setup.js — this ensures ad CDN hosts fail fast rather than
    // hanging 30s and blocking the page load event.
    proxy: {
      server: 'http://localhost:18080',
      bypass: 'localhost,127.0.0.1',
    },
  },
  webServer: {
    // Node server with clean URL support (run 'npm run build' first if needed)
    command: 'node server.js',
    url: 'http://localhost:8080',
    // Reuse an already-running dev server unless CI or pre-push hook (both own the lifecycle)
    reuseExistingServer: !process.env.CI && !process.env.PREPUSH,
  },
});
