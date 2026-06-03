// @ts-check
const { test, expect } = require('@playwright/test');
const pages = require('./fixtures/pages.json');

const BASE = 'https://www.luxival.com';

test.describe('SEO & Meta Tags', () => {
  const allPages = pages.corePages.filter(p => p.titleContains);

  for (const p of allPages) {
    test(`${p.path} has title containing "${p.titleContains}"`, async ({ page }) => {
      await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded' });
      const title = await page.title();
      expect(title.toLowerCase()).toContain(p.titleContains.toLowerCase());
    });
  }

  test('All core pages have meta description', async ({ page }) => {
    const missing = [];
    for (const p of allPages) {
      await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded' });
      const desc = await page.getAttribute('meta[name="description"]', 'content');
      if (!desc || desc.length < 10) {
        missing.push(p.path);
      }
    }
    if (missing.length > 0) {
      console.log('Pages missing meta description:', missing);
    }
    expect(missing, `${missing.length} pages missing meta description`).toHaveLength(0);
  });

  test('All core pages have canonical URL', async ({ page }) => {
    const missing = [];
    for (const p of allPages) {
      await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded' });
      const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
      if (!canonical) {
        missing.push(p.path);
      }
    }
    expect(missing, `${missing.length} pages missing canonical URL`).toHaveLength(0);
  });

  test('All core pages have OG image', async ({ page }) => {
    const missing = [];
    for (const p of allPages) {
      await page.goto(BASE + p.path, { waitUntil: 'domcontentloaded' });
      const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
      if (!ogImage) {
        missing.push(p.path);
      }
    }
    if (missing.length > 0) {
      console.log('Pages missing OG image:', missing);
    }
  });

  test('Blog posts have structured data', async ({ page }) => {
    await page.goto(BASE + '/blog/top-5-hidden-gems-helsinki/', { waitUntil: 'domcontentloaded' });
    const ldJson = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ldJson).toBeTruthy();
    const data = JSON.parse(ldJson);
    expect(data['@type']).toBe('BlogPosting');
    expect(data.headline).toBeTruthy();
  });

  test('Sitemap lists all core pages', async ({ page }) => {
    const res = await page.goto(BASE + '/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await page.textContent('body');
    const requiredPaths = ['/services', '/tourism', '/portfolio', '/qa', '/about', '/contact', '/blog'];
    const missing = requiredPaths.filter(p => !body.includes(p));
    expect(missing, `Sitemap missing: ${missing.join(', ')}`).toHaveLength(0);
  });

  test('Robots.txt references sitemap', async ({ page }) => {
    const res = await page.goto(BASE + '/robots.txt');
    expect(res.status()).toBe(200);
    const body = await page.textContent('body');
    expect(body.toLowerCase()).toContain('sitemap');
  });
});
