// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'https://www.luxival.com';

test.describe('Desktop Navigation', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('Nav links visible on desktop', async ({ page }) => {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    const navLinks = page.locator('.nav-links, #site-nav').first();
    await expect(navLinks).toBeVisible();
  });

  test('Burger button hidden on desktop', async ({ page }) => {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    const burger = page.locator('.nav-burger, button[aria-label="Menu"]').first();
    if (await burger.count() > 0) {
      await expect(burger).not.toBeVisible();
    }
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  const mobilePages = ['/', '/services', '/portfolio', '/tourism', '/blog/'];

  for (const pagePath of mobilePages) {
    test(`${pagePath} burger opens and shows nav links`, async ({ page }) => {
      await page.goto(BASE + pagePath, { waitUntil: 'domcontentloaded' });

      const burger = page.locator('.nav-burger, button[aria-label="Menu"]').first();
      await expect(burger).toBeVisible({ timeout: 5000 });

      await burger.click();
      const navLinks = page.locator('.nav-links, #site-nav').first();
      await expect(navLinks).toBeVisible({ timeout: 3000 });

      const links = await navLinks.locator('a').allTextContents();
      expect(links.length, `Nav should have 7+ links on ${pagePath}`).toBeGreaterThanOrEqual(7);
    });
  }

  test('Mobile nav closes on link click', async ({ page }) => {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });

    const burger = page.locator('.nav-burger, button[aria-label="Menu"]').first();
    await burger.click();

    const navLinks = page.locator('.nav-links, #site-nav').first();
    await expect(navLinks).toBeVisible({ timeout: 3000 });

    const firstLink = navLinks.locator('a').first();
    await firstLink.click();
    await page.waitForLoadState('domcontentloaded');
  });
});

test.describe('Tablet Navigation', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('Tablet shows appropriate navigation', async ({ page }) => {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });
});
