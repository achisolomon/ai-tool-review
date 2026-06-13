import { defineConfig } from '@playwright/test';

const PORT = process.env.PORT || '8080';
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  webServer: {
    // Node server with clean URL support (run 'npm run build' first if needed)
    // PORT is forwarded so multiple worktrees can run on different ports simultaneously.
    command: `PORT=${PORT} node server.js`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
