// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:8090';

const pages = [
  { name: 'web-design-uusimaa', url: '/web-design-uusimaa/', lang: 'fi', title: 'Verkkosivut yritykselle Helsingissä', h1: 'Verkkosivut yritykselle Helsingissä' },
  { name: 'web-design-belgium', url: '/web-design-belgium/', lang: 'nl', title: 'Webdesigner in België', h1: 'Webdesigner in België' },
  { name: 'web-design-uusimaa-zh', url: '/web-design-uusimaa-zh/', lang: 'zh', title: '乌西马地区网站设计师', h1: '乌西马地区网站设计师' },
];

for (const p of pages) {
  test.describe(`${p.name} page`, () => {
    test('loads with 200, correct lang, title, h1, and visible content', async ({ page }) => {
      const response = await page.goto(`${BASE}${p.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      expect(response.status()).toBe(200);

      // lang attribute
      const lang = await page.getAttribute('html', 'lang');
      expect(lang).toBe(p.lang);

      // title contains expected text
      await expect(page).toHaveTitle(new RegExp(p.title));

      // h1 present and visible
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      const h1Text = (await h1.textContent()) || '';
      expect(h1Text).toContain(p.h1);

      // main content visible (at least 2 H2s)
      const h2Count = await page.locator('h2').count();
      expect(h2Count).toBeGreaterThanOrEqual(2);

      // CTA button visible
      const cta = page.locator('a.btn').first();
      await expect(cta).toBeVisible();

      // no horizontal overflow on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test('has FAQ schema JSON-LD', async ({ page }) => {
      await page.goto(`${BASE}${p.url}`, { waitUntil: 'domcontentloaded' });
      const scripts = await page.$$eval('script[type="application/ld+json"]', els =>
        els.map(e => e.textContent || '')
      );
      const hasFAQ = scripts.some(s => s.includes('"FAQPage"'));
      expect(hasFAQ).toBe(true);
      const hasService = scripts.some(s => s.includes('"@type":"Service"'));
      expect(hasService).toBe(true);
    });
  });
}
