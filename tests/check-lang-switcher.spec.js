const { test, expect } = require('@playwright/test');

const LEGACY_SELECTOR = [
  'select#lang-select',
  '#lang-toggle',
  '.lang-select',
  '.lang-selector',
  '.language-selector',
  '.language-switcher',
  '.lang-switcher',
  '#gt-element',
  '#google_translate_element'
].join(', ');

async function assertSingleLanguageSelector(page) {
  await expect(page.locator('#nv-lang-toggle')).toHaveCount(1);
  await expect(page.locator('#nv-lang-dropdown')).toHaveCount(1);
  await expect(page.locator(LEGACY_SELECTOR)).toHaveCount(0);
  await expect(page.locator('#nv-menu-dropdown').locator(LEGACY_SELECTOR + ', [data-lang]')).toHaveCount(0);
  await expect(page.locator('footer').locator(LEGACY_SELECTOR + ', [data-lang], #nv-lang-toggle, #nv-lang-dropdown')).toHaveCount(0);

  const duplicateCount = await page.evaluate(() => {
    const extraSelectors = [
      '#lang-toggle',
      '#lang-select',
      '.lang-select',
      '.lang-selector',
      '.language-selector',
      '.language-switcher',
      '.lang-switcher',
      '#gt-element',
      '#google_translate_element'
    ];
    const legacy = document.querySelectorAll(extraSelectors.join(',')).length;
    const main = document.querySelectorAll('#nv-lang-toggle').length;
    const dropdown = document.querySelectorAll('#nv-lang-dropdown').length;
    return legacy + Math.max(0, main - 1) + Math.max(0, dropdown - 1);
  });
  expect(duplicateCount).toBe(0);
}

test('desktop shows only one language selector', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('https://luxival.com', { waitUntil: 'networkidle' });
  await assertSingleLanguageSelector(page);
});

test('iphone shows only one language selector and burger has none', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://luxival.com', { waitUntil: 'networkidle' });
  await assertSingleLanguageSelector(page);
  await page.click('#nv-menu-toggle');
  await expect(page.locator('#nv-menu-dropdown [data-lang], #nv-menu-dropdown #lang-toggle, #nv-menu-dropdown #lang-select')).toHaveCount(0);
});

test('android still shows only one language selector', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await page.goto('https://luxival.com', { waitUntil: 'networkidle' });
  await assertSingleLanguageSelector(page);
});

test('top nav globe still changes translation language', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('https://luxival.com', { waitUntil: 'networkidle' });

  await page.click('#nv-lang-toggle');
  await page.click('#nv-lang-dropdown [data-lang="fi"]');
  await expect.poll(async () => page.evaluate(() => document.documentElement.lang)).toBe('fi');
});
