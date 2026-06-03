// @ts-check
const { test, devices } = require('@playwright/test');

const iPhone = devices['iPhone 14'];

const pages = [
  { name: 'home', url: '/' },
  { name: 'about', url: '/about' },
  { name: 'contact', url: '/contact' },
  { name: 'digital', url: '/digital' },
  { name: 'portfolio', url: '/portfolio' },
  { name: 'qa', url: '/qa' },
];

for (const p of pages) {
  test(`mobile screenshot - ${p.name}`, async ({ browser }) => {
    const context = await browser.newContext({ ...iPhone });
    const page = await context.newPage();
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `mobile-audit/${p.name}.png`,
      fullPage: true,
    });
    await context.close();
  });
}
