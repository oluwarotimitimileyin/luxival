// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'https://www.luxival.com';

test.describe('Broken Links Audit', () => {
  test('Crawl homepage and verify all internal links return 200', async ({ page, request }) => {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });

    const hrefs = await page.locator('a[href]').evaluateAll(els =>
      els.map(el => el.getAttribute('href')).filter(Boolean)
    );

    const internal = [...new Set(
      hrefs
        .filter(h => !h.startsWith('http') && !h.startsWith('mailto:') && !h.startsWith('tel:') && !h.startsWith('#') && !h.startsWith('javascript:'))
        .map(h => {
          if (h.startsWith('/')) return h;
          return '/' + h;
        })
    )];

    const broken = [];
    for (const link of internal) {
      try {
        const res = await request.get(BASE + link);
        if (res.status() >= 400) {
          broken.push({ link, status: res.status() });
        }
      } catch (e) {
        broken.push({ link, error: e.message });
      }
    }

    if (broken.length > 0) {
      console.log('Broken links from homepage:', JSON.stringify(broken, null, 2));
    }
    expect(broken, `Found ${broken.length} broken links from homepage`).toHaveLength(0);
  });

  test('Verify all core page internal links resolve', async ({ page, request }) => {
    const corePages = ['/', '/services', '/tourism', '/portfolio', '/qa', '/about', '/contact', '/booking'];
    const allBroken = [];

    for (const corePage of corePages) {
      await page.goto(BASE + corePage, { waitUntil: 'domcontentloaded' });

      const hrefs = await page.locator('a[href]').evaluateAll(els =>
        els.map(el => el.getAttribute('href')).filter(Boolean)
      );

      const internal = [...new Set(
        hrefs
          .filter(h => !h.startsWith('http') && !h.startsWith('mailto:') && !h.startsWith('tel:') && !h.startsWith('#') && !h.startsWith('javascript:'))
          .map(h => h.startsWith('/') ? h : '/' + h)
      )];

      for (const link of internal) {
        try {
          const res = await request.get(BASE + link);
          if (res.status() >= 400) {
            allBroken.push({ source: corePage, link, status: res.status() });
          }
        } catch (e) {
          allBroken.push({ source: corePage, link, error: e.message });
        }
      }
    }

    if (allBroken.length > 0) {
      console.log('Broken links across core pages:', JSON.stringify(allBroken, null, 2));
    }
    expect(allBroken, `Found ${allBroken.length} broken links across core pages`).toHaveLength(0);
  });

  test('Service pages all return 200', async ({ request }) => {
    const servicePages = [
      '/services/airport-transfer', '/services/ai-agents', '/services/city-to-city',
      '/services/electrical-design', '/services/hotel-sourcing', '/services/mechanical-design',
      '/services/private-pickup', '/services/private-rides', '/services/sewing-pattern',
      '/services/software-testing', '/services/tiktok-agency', '/services/web-design',
    ];

    const broken = [];
    for (const sp of servicePages) {
      const res = await request.get(BASE + sp);
      if (res.status() >= 400) {
        broken.push({ path: sp, status: res.status() });
      }
    }
    expect(broken, `Service pages returning errors: ${JSON.stringify(broken)}`).toHaveLength(0);
  });

  test('Blog pages return 200', async ({ request }) => {
    const blogPages = [
      '/blog/', '/blog/top-5-hidden-gems-helsinki/', '/blog/helsinki-airport-transfer-guide/',
      '/blog/finland-winter-trip-guide/', '/blog/helsinki-business-travel-destination/',
      '/blog/private-northern-lights-tour-finland/', '/blog/web-design-mistakes-conversion/',
    ];

    const broken = [];
    for (const bp of blogPages) {
      const res = await request.get(BASE + bp);
      if (res.status() >= 400) {
        broken.push({ path: bp, status: res.status() });
      }
    }
    expect(broken, `Blog pages returning errors: ${JSON.stringify(broken)}`).toHaveLength(0);
  });

  test('Critical assets return 200', async ({ request }) => {
    const assets = [
      '/css/styles.css', '/css/mobile-overrides.css',
      '/js/main.js', '/js/forms.js', '/js/fare-calculator.js',
      '/assets/images/finland/architecture/oodi-library.jpg',
      '/sitemap.xml', '/robots.txt',
    ];

    const broken = [];
    for (const asset of assets) {
      const res = await request.get(BASE + asset);
      if (res.status() >= 400) {
        broken.push({ path: asset, status: res.status() });
      }
    }
    expect(broken, `Broken assets: ${JSON.stringify(broken)}`).toHaveLength(0);
  });

  test('External social links are reachable', async ({ request }) => {
    const externals = [
      'https://instagram.com/luxival',
      'https://linkedin.com/company/luxival',
    ];

    for (const url of externals) {
      try {
        const res = await request.get(url, { timeout: 15000 });
        expect(res.status(), `${url} returned ${res.status()}`).toBeLessThan(500);
      } catch (e) {
        console.log(`Warning: ${url} unreachable: ${e.message}`);
      }
    }
  });
});
