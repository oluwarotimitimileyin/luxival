# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site-audit.spec.js >> Core Pages Load >> /qa.html loads with 200
- Location: tests/site-audit.spec.js:26:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

# Page snapshot

```yaml
- main [ref=e3]:
  - paragraph [ref=e4]:
    - generic [ref=e5]:
      - strong [ref=e6]: "404"
      - text: ": NOT_FOUND"
    - generic [ref=e7]:
      - text: "Code:"
      - code [ref=e8]: "`NOT_FOUND`"
    - generic [ref=e9]:
      - text: "ID:"
      - code [ref=e10]: "`arn1::4lqd4-1778866032114-f562f97ecdee`"
  - link "Read our documentation to learn more about this error." [ref=e11] [cursor=pointer]:
    - /url: https://vercel.com/docs/errors/NOT_FOUND
    - generic [ref=e12]: Read our documentation to learn more about this error.
```

# Test source

```ts
  1   | // @ts-check
  2   | const { test, expect } = require('@playwright/test');
  3   | 
  4   | const BASE = 'https://luxival.com';
  5   | 
  6   | // ── CORE PAGES ──────────────────────────────────────────
  7   | test.describe('Core Pages Load', () => {
  8   |   const pages = [
  9   |     { url: '/', title: 'LUXIVAL' },
  10  |     { url: '/services.html', title: 'Services' },
  11  |     { url: '/about.html', title: 'About' },
  12  |     { url: '/contact.html', title: 'Contact' },
  13  |     { url: '/booking.html', title: 'Book' },
  14  |     { url: '/blog/index.html', title: 'Blog' },
  15  |     { url: '/tourism.html', title: 'Tourism' },
  16  |     { url: '/tourism-planning.html', title: 'Tourism Planning' },
  17  |     { url: '/audit.html', title: 'Audit' },
  18  |     { url: '/transfers.html', title: 'Transfer' },
  19  |     { url: '/digital.html', title: 'Digital' },
  20  |     { url: '/design-services.html', title: 'Design' },
  21  |     { url: '/portfolio.html', title: 'Portfolio' },
  22  |     { url: '/qa.html', title: 'QA' },
  23  |   ];
  24  | 
  25  |   for (const p of pages) {
  26  |     test(`${p.url} loads with 200`, async ({ page }) => {
  27  |       const res = await page.goto(BASE + p.url);
> 28  |       expect(res.status()).toBe(200);
      |                            ^ Error: expect(received).toBe(expected) // Object.is equality
  29  |       // No console errors that indicate broken JS
  30  |       const errors = [];
  31  |       page.on('pageerror', err => errors.push(err.message));
  32  |       await page.waitForLoadState('domcontentloaded');
  33  |     });
  34  |   }
  35  | });
  36  | 
  37  | // ── NAVIGATION ──────────────────────────────────────────
  38  | test.describe('Navigation', () => {
  39  |   test('Main nav links present on homepage', async ({ page }) => {
  40  |     await page.goto(BASE + '/');
  41  |     await expect(page.locator('nav')).toBeVisible();
  42  |     // Check key nav links exist
  43  |     const navLinks = page.locator('nav a');
  44  |     const count = await navLinks.count();
  45  |     expect(count).toBeGreaterThan(3);
  46  |   });
  47  | 
  48  |   test('Mobile nav visible on small screen', async ({ page }) => {
  49  |     await page.setViewportSize({ width: 375, height: 812 });
  50  |     await page.goto(BASE + '/');
  51  |     await expect(page.locator('nav')).toBeVisible();
  52  |   });
  53  | });
  54  | 
  55  | // ── FARE CALCULATOR ──────────────────────────────────────
  56  | test.describe('Fare Calculator', () => {
  57  |   test('Fare calculator renders on airport-transfer page', async ({ page }) => {
  58  |     await page.goto(BASE + '/services/airport-transfer.html');
  59  |     await page.waitForLoadState('networkidle');
  60  |     // The fare calculator container should exist
  61  |     const calc = page.locator('.fare-calculator');
  62  |     await expect(calc).toBeVisible({ timeout: 10000 });
  63  |   });
  64  | 
  65  |   test('Fare calculator has address input fields', async ({ page }) => {
  66  |     await page.goto(BASE + '/services/airport-transfer.html');
  67  |     await page.waitForLoadState('networkidle');
  68  |     await expect(page.locator('.fare-origin')).toBeVisible({ timeout: 10000 });
  69  |     await expect(page.locator('.fare-destination')).toBeVisible({ timeout: 10000 });
  70  |   });
  71  | 
  72  |   test('Fare calculator Google Places autocomplete attaches', async ({ page }) => {
  73  |     await page.goto(BASE + '/services/airport-transfer.html');
  74  |     await page.waitForLoadState('networkidle');
  75  |     // Wait for Google Maps to load
  76  |     await page.waitForFunction(() => window.google && window.google.maps, { timeout: 15000 });
  77  |     // Type in origin field - should trigger autocomplete dropdown
  78  |     await page.fill('.fare-origin', 'Helsinki Airport');
  79  |     await page.waitForTimeout(1500);
  80  |     // Check if PAC (Places Autocomplete) container appeared
  81  |     const pac = page.locator('.pac-container');
  82  |     const pacVisible = await pac.isVisible().catch(() => false);
  83  |     console.log('Google Places autocomplete dropdown visible:', pacVisible);
  84  |   });
  85  | 
  86  |   test('Fare calculation triggers with valid addresses', async ({ page }) => {
  87  |     await page.goto(BASE + '/services/airport-transfer.html');
  88  |     await page.waitForLoadState('networkidle');
  89  |     await page.waitForFunction(() => window.google && window.google.maps, { timeout: 15000 });
  90  |     
  91  |     await page.fill('.fare-origin', 'Helsinki Airport, Vantaa, Finland');
  92  |     await page.fill('.fare-destination', 'Hotel Kämp, Helsinki');
  93  |     await page.locator('.fare-destination').dispatchEvent('change');
  94  |     await page.waitForTimeout(2000);
  95  |     
  96  |     const status = await page.locator('.fare-status').textContent();
  97  |     const total = await page.locator('.fare-total-amount').textContent();
  98  |     console.log('Fare status:', status);
  99  |     console.log('Fare total:', total);
  100 |     // Should either show a price or an error message (not the default placeholder)
  101 |     expect(total).not.toBe('—');
  102 |   });
  103 | });
  104 | 
  105 | // ── HELSINKI EVENTS (TOURISM PAGE) ──────────────────────
  106 | test.describe('Helsinki Events', () => {
  107 |   test('Events grid renders on tourism page', async ({ page }) => {
  108 |     await page.goto(BASE + '/tourism.html');
  109 |     await page.waitForLoadState('networkidle');
  110 |     const grid = page.locator('#eventsGrid');
  111 |     await expect(grid).toBeVisible({ timeout: 10000 });
  112 |   });
  113 | 
  114 |   test('Events grid shows cards (live or fallback)', async ({ page }) => {
  115 |     await page.goto(BASE + '/tourism.html');
  116 |     // Wait up to 10s for events to load
  117 |     await page.waitForSelector('#eventsGrid .event-card', { timeout: 10000 }).catch(() => {});
  118 |     const cards = page.locator('#eventsGrid .event-card');
  119 |     const count = await cards.count();
  120 |     console.log('Event cards rendered:', count);
  121 |     expect(count).toBeGreaterThan(0);
  122 |   });
  123 | 
  124 |   test('Events do not show raw "Link event abi" text', async ({ page }) => {
  125 |     await page.goto(BASE + '/tourism.html');
  126 |     await page.waitForTimeout(5000);
  127 |     const bodyText = await page.locator('body').textContent();
  128 |     expect(bodyText).not.toContain('Link event abi');
```