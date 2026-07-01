// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:8080';
const VIEWPORTS = [
  320, 360, 375, 390, 414, 430,
  768, 1024, 1280, 1440, 1920
];

const PAGES = [
  '/',
  '/services',
  '/contact',
  '/tourism',
];

for (const width of VIEWPORTS) {
  test.describe(`Viewport ${width}px`, () => {
    for (const pagePath of PAGES) {
      test(`${pagePath} passes at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        const res = await page.goto(BASE + pagePath, { waitUntil: 'domcontentloaded' });
        expect(res.status()).toBe(200);

        await page.waitForTimeout(600);

        const dir = `tests/responsive/${width}`;
        await page.screenshot({ path: `${dir}/${pagePath.replace(/\//g, '-') || 'index'}.png`, fullPage: true });

        const issues = await page.evaluate(() => {
          const root = document.documentElement;
          const overflow = root.scrollWidth - root.clientWidth;

          const overflowing = [];
          document.querySelectorAll('*').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 1) {
              overflowing.push(
                el.tagName.toLowerCase() +
                  (el.className ? '.' + String(el.className).split(' ').join('.') : '')
              );
            }
          });

          return {
            horizontalOverflow: overflow > 0,
            overflowPx: overflow,
            overflowingCount: overflowing.length,
            overflowingSample: overflowing.slice(0, 6),
          };
        });

        expect(issues.horizontalOverflow, `Horizontal overflow ${issues.overflowPx}px at ${width}px on ${pagePath}`).toBeFalsy();
        expect(issues.overflowingCount, `${issues.overflowingCount} elements overflowing at ${width}px on ${pagePath}`).toBeLessThan(5);
      });
    }
  });
}
