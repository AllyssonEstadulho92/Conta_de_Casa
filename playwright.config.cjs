'use strict';

const {defineConfig,devices}=require('@playwright/test');

module.exports=defineConfig({
  testDir:'./tests/e2e',
  testMatch:/.*\.spec\.cjs$/,
  timeout:45000,
  expect:{timeout:7000},
  fullyParallel:false,
  forbidOnly:Boolean(process.env.CI),
  retries:process.env.CI?1:0,
  workers:process.env.CI?2:undefined,
  reporter:process.env.CI?[['line'],['html',{open:'never',outputFolder:'playwright-report'}]]:'line',
  use:{
    baseURL:'http://127.0.0.1:4173',
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
    video:'off'
  },
  projects:[
    {
      name:'chromium-desktop',
      use:{...devices['Desktop Chrome'],viewport:{width:1280,height:900}}
    },
    {
      name:'webkit-iphone',
      use:{...devices['iPhone 14']}
    }
  ],
  webServer:{
    command:'npm run build:pages && npm run serve:dist',
    url:'http://127.0.0.1:4173',
    reuseExistingServer:!process.env.CI,
    timeout:120000
  }
});
