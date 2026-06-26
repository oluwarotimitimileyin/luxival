// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://www.luxival.com';
const LANGUAGES = ['en', 'fi', 'sv', 'de', 'fr', 'it', 'ru', 'no', 'da', 'ja', 'zh'];

const CORE_PAGES = [
  '/', '/services', '/about', '/contact', '/booking', '/blog',
  '/tourism', '/tourism-planning', '/audit', '/transfers',
  '/digital', '/pattern', '/portfolio', '/qa',
];

// The language button is injected by js/i18n.js with id="lang-toggle"
const LANG_SELECTOR = '#lang-toggle';

// ── LANGUAGE SWITCHER ────────────────────────────────────
test.describe('Language Switcher', () => {
  for (const pagePath of ['/', '/about', '/contact', '/services', '/digital', '/tourism']) {
    test(`Language button is present on ${pagePath}`, async ({ page }) => {
      await page.goto(BASE + pagePath);
      await page.waitForLoadState('domcontentloaded');
      // The <button> is injected by js/i18n.js after page load
      const btn = page.locator(LANG_SELECTOR);
      await expect(btn).toBeVisible({ timeout: 10000 });
    });
  }
});

// ── I18N SCRIPT LOADED ───────────────────────────────────
test.describe('i18n Script Loaded', () => {
  for (const pagePath of CORE_PAGES) {
    test(`luxivalI18n available on ${pagePath}`, async ({ page }) => {
      await page.goto(BASE + pagePath);
      await page.waitForLoadState('domcontentloaded');
      const hasI18n = await page.evaluate(() => typeof window.luxivalI18n !== 'undefined');
      expect(hasI18n).toBeTruthy();
    });
  }
});

// ── LANGUAGE SWITCH CHANGES TEXT ─────────────────────────
test.describe('Language Switch Changes Text', () => {
  test('Clicking language button and selecting language changes text', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');

    const btn = page.locator('#lang-toggle');
    await expect(btn).toBeVisible({ timeout: 10000 });

    const bodyEn = await page.locator('body').textContent();

    // Click to open dropdown, then click Russian
    await btn.click();
    await page.waitForTimeout(200);
    const ruOption = page.locator('#lang-dropdown [data-lang="ru"]');
    await ruOption.click();
    await page.waitForTimeout(500);
    const bodyAfterClick = await page.locator('body').textContent();

    // Text should change after click
    const changed = bodyEn !== bodyAfterClick;
    console.log('Text changed after clicking language button:', changed);
    expect(changed).toBeTruthy();
  });
});

// ── NO MISSING KEYS AT RUNTIME ───────────────────────────
test.describe('No Missing Translation Keys', () => {
  for (const pagePath of CORE_PAGES) {
    test(`No raw fallback keys visible on ${pagePath}`, async ({ page }) => {
      await page.goto(BASE + pagePath);
      await page.waitForLoadState('domcontentloaded');
      // Wait for i18n system to be ready
      await page.waitForFunction(() => typeof window.luxivalI18n !== 'undefined', { timeout: 10000 });

      // Fallback keys would show --nav.home-- or similar on screen
      const bodyText = await page.locator('body').textContent();
      const rawKeysFound = bodyText.match(/--[\w.]+--/g);
      if (rawKeysFound && rawKeysFound.length > 0) {
        console.log(`Raw keys found on ${pagePath}:`, rawKeysFound.slice(0, 10));
      }
      expect(rawKeysFound).toBeNull();
    });
  }
});

// ── TRANSLATION INTEGRITY ────────────────────────────────
test.describe('Translation Integrity', () => {
  test('Data-i18n attributes exist on elements', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const count = await page.locator('[data-i18n]').count();
    console.log('Elements with data-i18n on homepage:', count);
    expect(count).toBeGreaterThan(10);
  });

  test('data-i18n elements have non-empty text after translation', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('domcontentloaded');
    const elements = page.locator('[data-i18n]');
    const count = await elements.count();
    let emptyCount = 0;
    const emptyKeys = [];
    for (let i = 0; i < Math.min(count, 30); i++) {
      const el = elements.nth(i);
      const text = await el.textContent();
      if (!text || text.trim() === '') {
        const key = await el.getAttribute('data-i18n') || 'unknown';
        emptyKeys.push(key);
        emptyCount++;
      }
    }
    console.log(`Empty translations (of ${Math.min(count, 30)} checked): ${emptyCount}`, emptyKeys);
    expect(emptyCount).toBe(0);
  });

  test('Cumulative: navigated to all core pages with no translation errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    for (const pagePath of CORE_PAGES) {
      await page.goto(BASE + pagePath);
      await page.waitForLoadState('domcontentloaded');
      const hasI18n = await page.evaluate(() => typeof window.luxivalI18n !== 'undefined');
      expect(hasI18n).toBeTruthy();
    }

    if (errors.length > 0) {
      console.log('Page errors across core pages:', errors);
    }
    expect(errors.length).toBe(0);
  });
});
