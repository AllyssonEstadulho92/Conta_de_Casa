'use strict';

const { test, expect } = require('@playwright/test');

async function exposeAppShell(page) {
  await page.evaluate(() => {
    document.documentElement.classList.add('cdc-v75', 'app-active');
    const vault = document.getElementById('vaultScreen');
    if (vault) vault.hidden = true;
    const app = document.getElementById('app');
    if (app) app.hidden = false;
    const dashboard = document.getElementById('page-dashboard');
    if (dashboard) dashboard.classList.add('active');
  });
  await page.waitForTimeout(80);
}

function rectIsFinite(rect) {
  return rect && [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite);
}

test('v76 publica metadados e recursos PWA coerentes sem erro fatal de runtime', async ({ page, request }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/^(?:.+ · )?Conta de Casa$/);

  const metadata = await page.evaluate(() => Object.fromEntries([
    'app-version', 'app-build', 'app-build-id', 'app-build-date'
  ].map(name => [name, document.querySelector(`meta[name="${name}"]`)?.content || ''])));

  expect(metadata['app-version']).toBe('0.76.0');
  expect(metadata['app-build']).toBe('v76');
  expect(metadata['app-build-id']).toMatch(/^(?:[0-9a-f]{7}|local)$/);
  expect(Number.isNaN(Date.parse(metadata['app-build-date']))).toBeFalsy();

  const releaseResponse = await request.get('/release-manifest.json', { headers: { 'cache-control': 'no-cache' } });
  expect(releaseResponse.ok()).toBeTruthy();
  const release = await releaseResponse.json();
  expect(release.latestVersion).toBe('v76');
  expect(release.releases?.[0]?.version).toBe('v76');

  const swResponse = await request.get('/sw.js?v=76', { headers: { 'cache-control': 'no-cache' } });
  expect(swResponse.ok()).toBeTruthy();
  expect(await swResponse.text()).toContain('conta-de-casa-public-v76-release1');

  expect(pageErrors).toEqual([]);
});

test('shell não cria overflow horizontal e mantém controlos móveis dentro do viewport', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await exposeAppShell(page);

  const viewport = page.viewportSize();
  expect(viewport).toBeTruthy();

  const metrics = await page.evaluate(() => {
    const rect = selector => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const value = element.getBoundingClientRect();
      return { x: value.x, y: value.y, width: value.width, height: value.height, right: value.right, bottom: value.bottom };
    };
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      rootScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      topbar: rect('.topbar'),
      menu: rect('#mobileMenuBtn'),
      nav: rect('.mobile-nav'),
      dashboard: rect('#page-dashboard')
    };
  });

  expect(metrics.rootScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(rectIsFinite(metrics.topbar)).toBeTruthy();
  expect(rectIsFinite(metrics.dashboard)).toBeTruthy();

  if (viewport.width <= 820) {
    expect(rectIsFinite(metrics.menu)).toBeTruthy();
    expect(metrics.menu.width).toBeGreaterThanOrEqual(44);
    expect(metrics.menu.height).toBeGreaterThanOrEqual(44);
    expect(metrics.menu.x).toBeGreaterThanOrEqual(-1);
    expect(metrics.menu.right).toBeLessThanOrEqual(metrics.innerWidth + 1);
    expect(metrics.menu.y).toBeGreaterThanOrEqual(metrics.topbar.y - 1);

    expect(rectIsFinite(metrics.nav)).toBeTruthy();
    expect(metrics.nav.x).toBeGreaterThanOrEqual(-1);
    expect(metrics.nav.right).toBeLessThanOrEqual(metrics.innerWidth + 1);
    expect(metrics.nav.bottom).toBeLessThanOrEqual(metrics.innerHeight + 1);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(40);
    const afterScroll = await page.evaluate(() => {
      const nav = document.querySelector('.mobile-nav')?.getBoundingClientRect();
      const dashboard = document.querySelector('#page-dashboard');
      const lastContent = dashboard?.lastElementChild?.getBoundingClientRect();
      return nav && lastContent ? { navTop: nav.top, lastContentBottom: lastContent.bottom } : null;
    });
    expect(afterScroll).toBeTruthy();
    expect(afterScroll.lastContentBottom).toBeLessThanOrEqual(afterScroll.navTop + 1);
  }
});

test('controlo móvel canónico permanece único e acessível', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await exposeAppShell(page);

  const viewport = page.viewportSize();
  const buttons = page.locator('#mobileMenuBtn');
  await expect(buttons).toHaveCount(1);
  await expect(buttons).toHaveAttribute('aria-controls', 'mobileDrawer');
  await expect(buttons).toHaveAttribute('aria-expanded', /^(false|true)$/);

  if (viewport && viewport.width <= 820) {
    await expect(buttons).toBeVisible();
  }
});
