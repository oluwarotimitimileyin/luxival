const { test, expect } = require('@playwright/test');

test('only one language selector exists on the live site', async ({ page }) => {
  await page.goto('https://luxival.com', { waitUntil: 'networkidle' });

  // Should have exactly one #lang-toggle button
  await expect(page.locator('#lang-toggle')).toHaveCount(1);

  // Should have zero old <select id="lang-select">
  await expect(page.locator('select#lang-select')).toHaveCount(0);

  // Should have zero Google Translate widget
  await expect(page.locator('#gt-element')).toHaveCount(0);

  // Should have zero skip-link / floating language elements
  await expect(page.locator('.skip-link, .lang-select')).toHaveCount(0);
});
