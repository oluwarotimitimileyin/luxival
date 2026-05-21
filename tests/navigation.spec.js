// @ts-check
const { test, expect } = require('@playwright/test');
const pages = require('./fixtures/pages.json');

const BASE = 'https://luxival.com';

test.describe('Navigation Consistency', () => {
  const allPages = [
    ...pages.corePages.map(p => p.path),
    ...pages.servicePages,
    ...pages.blogPages,
  ];

  for (const pagePath of allPages) {
    test(`${pagePath} has canonical nav with all required links`, async ({ page }) => {
      await page.goto(BASE + pagePath, { waitUntil: 'domcontentloaded' });
      const nav = page.locator('nav#mainNav, nav').first();
      await expect(nav).toBeVisible({ timeout: 10000 });

      const brand = nav.locator('.nav-brand, a[href*="index"]').first();
      await expect(brand).toBeVisible();
      const brandText = await brand.textContent();
      expect(brandText.trim()).toBe('LUXIVAL');

      for (const link of pages.canonicalNavLinks) {
        const navLink = nav.locator(`a:has-text("${link.text}")`).first();
        const exists = await navLink.count();
        expect(exists, `Missing nav link: "${link.text}" on ${pagePath}`).toBeGreaterThan(0);
        if (exists > 0) {
          const href = await navLink.getAttribute('href');
          expect(href, `Nav link "${link.text}" href mismatch on ${pagePath}`).toContain(link.hrefContains);
        }
      }
    });
  }

  test('No duplicate nav links on any page', async ({ page }) => {
    const samplePages = ['/', '/privacy', '/terms', '/transfers', '/portfolio'];
    for (const pagePath of samplePages) {
      await page.goto(BASE + pagePath, { waitUntil: 'domcontentloaded' });
      const navLinks = await page.locator('nav#mainNav ul a, nav ul a').allTextContents();
      const trimmed = navLinks.map(t => t.trim()).filter(Boolean);
      const unique = [...new Set(trimmed)];
      expect(trimmed.length, `Duplicate nav links on ${pagePath}`).toBe(unique.length);
    }
  });

  test('LUXIVAL brand always links to home', async ({ page }) => {
    const samplePages = ['/', '/services', '/portfolio', '/blog/'];
    for (const pagePath of samplePages) {
      await page.goto(BASE + pagePath, { waitUntil: 'domcontentloaded' });
      const brand = page.locator('.nav-brand').first();
      const href = await brand.getAttribute('href');
      expect(href, `Brand link broken on ${pagePath}`).toMatch(/index|^\/$|^\.?\/?$/);
    }
  });

  test('Every page can reach home in one click from nav', async ({ page }) => {
    const samplePages = ['/services', '/tourism', '/about', '/qa', '/portfolio'];
    for (const pagePath of samplePages) {
      await page.goto(BASE + pagePath, { waitUntil: 'domcontentloaded' });
      const homeLink = page.locator('nav a:has-text("Home"), nav .nav-brand').first();
      await homeLink.click();
      await page.waitForLoadState('domcontentloaded');
      const url = page.url();
      expect(url, `Could not reach home from ${pagePath}`).toMatch(/luxival\.com\/?$/);
    }
  });
});

test.describe('Nav Burger (Mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('Burger button visible on mobile', async ({ page }) => {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    const burger = page.locator('.nav-burger, button[aria-label="Menu"]').first();
    await expect(burger).toBeVisible({ timeout: 5000 });
  });

  test('Clicking burger opens mobile nav', async ({ page }) => {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    const burger = page.locator('.nav-burger, button[aria-label="Menu"]').first();
    await burger.click();
    const navLinks = page.locator('.nav-links, #site-nav').first();
    await expect(navLinks).toBeVisible({ timeout: 3000 });
  });

  test('Blog page has working mobile burger', async ({ page }) => {
    await page.goto(BASE + '/blog/', { waitUntil: 'domcontentloaded' });
    const burger = page.locator('.nav-burger, button[aria-label="Menu"]').first();
    await expect(burger).toBeVisible({ timeout: 5000 });
    await burger.click();
    const navLinks = page.locator('.nav-links, #site-nav').first();
    await expect(navLinks).toBeVisible({ timeout: 3000 });
  });
});
