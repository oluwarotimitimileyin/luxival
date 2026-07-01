const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8080';
const VIEWPORTS = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920];

const PAGES = [
  '/',
  '/services',
  '/tourism',
  '/contact',
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  for (const width of VIEWPORTS) {
    for (const pagePath of PAGES) {
      await page.setViewportSize({ width, height: 900 });
      const res = await page.goto(BASE + pagePath, { waitUntil: 'domcontentloaded' });
      if (res.status() !== 200) {
        console.log(`FAIL: ${pagePath} at ${width}px -> ${res.status()}`);
        continue;
      }

      await page.waitForTimeout(1000);

      const dir = path.join(__dirname, '..', 'tests', 'responsive', String(width));
      fs.mkdirSync(dir, { recursive: true });
      const safeName = pagePath.replace(/\//g, '-') || 'index';
      await page.screenshot({ path: path.join(dir, `${safeName}.png`), fullPage: true });

      const data = await page.evaluate(() => {
        function hasClippingAncestor(el) {
          let current = el.parentElement;
          while (current) {
            const style = getComputedStyle(current);
            if (style.overflow === 'hidden' || style.overflow === 'auto' || style.overflow === 'scroll') {
              return true;
            }
            current = current.parentElement;
          }
          return false;
        }

        const docOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const overflowingTrue = [];
        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth + 2) {
            const style = getComputedStyle(el);
            const isFixed = style.position === 'fixed';
            const isClipped = hasClippingAncestor(el);
            if (!isFixed && !isClipped) {
              overflowingTrue.push(
                el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ').slice(0,4).join('.') : '')
              );
            }
          }
        });
        return {
          docOverflow,
          overflowingCount: overflowingTrue.length,
          overflowingSample: overflowingTrue.slice(0, 8),
        };
      });

      const status = data.docOverflow > 0 ? 'FAIL' : (data.overflowingCount > 2 ? 'WARN' : 'PASS');
      console.log(`${status}: ${pagePath} at ${width}px | docOverflow=${data.docOverflow}px | overflowing=${data.overflowingCount} | sample=${JSON.stringify(data.overflowingSample)}`);
    }
  }

  await browser.close();
  console.log('\nDONE');
})();
