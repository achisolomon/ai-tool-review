import { defineConfig } from '@playwright/test';

// PORT lets parallel git worktrees run their suites on distinct ports so they
// don't reuse each other's dev server (reuseExistingServer). Defaults to 8080.
const PORT = process.env.PORT || 8080;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  webServer: {
    // Node server with clean URL support (run 'npm run build' first if needed)
    command: 'node server.js',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
