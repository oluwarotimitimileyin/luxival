// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 2,
  workers: 3,
  reporter: [['list'], ['json', { outputFile: 'tests/results.json' }], ['html', { outputFolder: 'test-results/html-report', open: 'never' }]],
  use: {
    baseURL: 'https://luxival.com',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
