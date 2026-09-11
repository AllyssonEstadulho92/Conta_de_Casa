'use strict';

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line']] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    locale: 'pt-PT',
    timezoneId: 'Europe/Lisbon',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node scripts/prepare-pages.cjs && python3 -m http.server 4173 --directory dist',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } }
    },
    {
      name: 'chromium-mobile-390',
      use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, hasTouch: true }
    },
    {
      name: 'webkit-mobile-320',
      use: { browserName: 'webkit', viewport: { width: 320, height: 568 }, hasTouch: true }
    },
    {
      name: 'webkit-mobile-430',
      use: { browserName: 'webkit', viewport: { width: 430, height: 932 }, hasTouch: true }
    }
  ]
});
