# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site-audit.spec.js >> Fare Calculator >> Fare calculation triggers with valid addresses
- Location: tests/site-audit.spec.js:86:3

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not "—"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e3]:
    - link "LUXIVAL" [ref=e4]:
      - /url: ../index.html
    - list [ref=e5]:
      - listitem [ref=e6]:
        - link "Travel" [ref=e7]:
          - /url: ../tourism.html
      - listitem [ref=e8]:
        - link "Design" [ref=e9]:
          - /url: ../design-services.html
      - listitem [ref=e10]:
        - link "Portfolio" [ref=e11]:
          - /url: ../portfolio.html
      - listitem [ref=e12]:
        - link "QA" [ref=e13]:
          - /url: ../qa.html
      - listitem [ref=e14]:
        - link "Platform" [ref=e15]:
          - /url: ../platform.html
      - listitem [ref=e16]:
        - link "Blog" [ref=e17]:
          - /url: ../blog/index.html
      - listitem [ref=e18]:
        - link "About" [ref=e19]:
          - /url: ../about.html
      - listitem [ref=e20]:
        - link "Book a consultation" [ref=e21]:
          - /url: ../booking.html
  - generic [ref=e22]:
    - generic [ref=e23]: Transport · Helsinki-Vantaa
    - heading "Airport transfer excellence." [level=1] [ref=e24]:
      - text: Airport transfer
      - text: excellence.
    - paragraph [ref=e25]: Professional, no-wait pickups from Helsinki-Vantaa Airport (HEL) — with flight tracking, clean vehicles, and a guaranteed smoke-free journey from tarmac to destination.
    - generic [ref=e26]:
      - link "Book this service" [ref=e27]:
        - /url: ../tourism.html#book-ride
      - link "Estimate fare" [ref=e28]:
        - /url: ../tourism.html#pricing
  - generic [ref=e31]:
    - generic [ref=e32]:
      - generic [ref=e33]: The service
      - heading "What makes it premium" [level=2] [ref=e34]
      - paragraph [ref=e35]: We meet you at Arrivals — no app, no surge pricing, no guessing. Your driver monitors your flight in real time and adjusts for delays automatically. From the moment you land, your transfer is under control.
      - paragraph [ref=e36]: Every vehicle is clean, smoke-free, and maintained to a high standard. We do not rush you. No radio noise. No phone calls. Just a calm, direct drive to your destination.
      - paragraph [ref=e37]: This is not a taxi. It is a premium private service built for travellers who value reliability and discretion above all else.
    - generic [ref=e38]:
      - text: IMAGE · Airport Transfer
      - generic [ref=e39]: Premium vehicle at Helsinki-Vantaa HEL
  - generic [ref=e41]:
    - generic [ref=e42]: Service details
    - heading "Routes, vehicles & pricing" [level=2] [ref=e43]
    - generic [ref=e44]:
      - generic [ref=e45]:
        - generic [ref=e46]: Primary route
        - heading "HEL → Helsinki City" [level=3] [ref=e47]
        - paragraph [ref=e48]: Helsinki-Vantaa Airport to central Helsinki — approximately 19 km, 25–35 min depending on traffic.
      - generic [ref=e49]:
        - generic [ref=e50]: Extended routes
        - heading "Airport → Region" [level=3] [ref=e51]
        - paragraph [ref=e52]: Espoo, Vantaa, Lahti, Tampere, and other Finnish cities available on request. Price by distance.
      - generic [ref=e53]:
        - generic [ref=e54]: Vehicles
        - heading "Premium class" [level=3] [ref=e55]
        - paragraph [ref=e56]: Comfortable, smoke-free saloons and estates. Climate-controlled, clean, and suitable for business and leisure.
      - generic [ref=e57]:
        - generic [ref=e58]: Flight tracking
        - heading "Delay-adjusted" [level=3] [ref=e59]
        - paragraph [ref=e60]: Your driver monitors your flight status and adjusts pickup timing automatically — no extra charge for delays.
      - generic [ref=e61]:
        - generic [ref=e62]: Availability
        - heading "7 days a week" [level=3] [ref=e63]
        - paragraph [ref=e64]: Available every day including public holidays. Early morning and late night arrivals welcome.
      - generic [ref=e65]:
        - generic [ref=e66]: Luggage
        - heading "Ample capacity" [level=3] [ref=e67]
        - paragraph [ref=e68]: Standard and large luggage accommodated. Inform us of oversized or sporting equipment at booking.
  - generic [ref=e70]:
    - generic [ref=e71]: Current offerings
    - heading "Active services & pricing" [level=2] [ref=e72]
    - generic [ref=e73]:
      - generic [ref=e74]:
        - generic [ref=e75]:
          - generic [ref=e76]: HEL Airport → Central Helsinki
          - generic [ref=e77]: From €35
        - generic [ref=e78]:
          - generic [ref=e79]: HEL Airport → Espoo
          - generic [ref=e80]: From €42
        - generic [ref=e81]:
          - generic [ref=e82]: HEL Airport → Vantaa
          - generic [ref=e83]: From €28
        - generic [ref=e84]:
          - generic [ref=e85]: HEL Airport → Lahti
          - generic [ref=e86]: From €90
        - generic [ref=e87]:
          - generic [ref=e88]: Night / early morning surcharge
          - generic [ref=e89]: +€10
        - generic [ref=e90]:
          - generic [ref=e91]: Busy-hour surcharge (08:30–10:30, 15:30–18:30)
          - generic [ref=e92]: +15%
      - generic [ref=e93]:
        - paragraph [ref=e94]: Prices above are estimates based on distance and standard conditions. Your exact fare is confirmed at booking and does not change after confirmation.
        - paragraph [ref=e95]: Payment by bank transfer or card accepted. No cash required.
        - link "Calculate your fare" [ref=e96]:
          - /url: ../tourism.html#pricing
  - generic [ref=e97]:
    - generic [ref=e98]: Transparent pricing
    - heading "Calculate your fare" [level=2] [ref=e99]
    - paragraph [ref=e100]: Select the options that match your journey and get an instant exact price — no hidden fees, no surprises.
    - generic [ref=e102]:
      - heading "Estimate Your Fare" [level=3] [ref=e103]
      - paragraph [ref=e104]: "Enter pickup and drop-off, then select any applicable services:"
      - generic [ref=e105]:
        - generic [ref=e106]:
          - generic [ref=e107]: Pickup Address
          - textbox "Oops! Something went wrong." [disabled] [ref=e108]: Helsinki Airport, Vantaa, Finland
        - generic [ref=e109]:
          - generic [ref=e110]: Drop-off Address
          - textbox "Oops! Something went wrong." [disabled] [ref=e111]: Hotel Kämp, Helsinki
      - generic [ref=e112]:
        - generic [ref=e113] [cursor=pointer]:
          - checkbox "Airport Transfer +€10" [checked] [ref=e114]
          - generic [ref=e115]: Airport Transfer
          - generic [ref=e116]: +€10
        - generic [ref=e117] [cursor=pointer]:
          - checkbox "Extra Effort / Luggage +€10" [ref=e118]
          - generic [ref=e119]: Extra Effort / Luggage
          - generic [ref=e120]: +€10
        - generic [ref=e121] [cursor=pointer]:
          - checkbox "City Service +€10" [ref=e122]
          - generic [ref=e123]: City Service
          - generic [ref=e124]: +€10
        - generic [ref=e125] [cursor=pointer]:
          - checkbox "Private Cruise +€30" [ref=e126]
          - generic [ref=e127]: Private Cruise
          - generic [ref=e128]: +€30
        - generic [ref=e129] [cursor=pointer]:
          - checkbox "Night Service (22:00–06:00) +€10" [ref=e130]
          - generic [ref=e131]: Night Service (22:00–06:00)
          - generic [ref=e132]: +€10
      - generic [ref=e133]: Could not calculate route. Please check addresses.
      - generic [ref=e135]:
        - generic [ref=e136]: Estimated Total
        - generic [ref=e137]: —
      - paragraph [ref=e138]: "* €15 base + €3.50/km + selected services. Final fare confirmed at booking. Night service applies 22:00–06:00."
  - generic [ref=e140]:
    - generic [ref=e141]: Ready to book?
    - heading "Reserve your airport transfer." [level=2] [ref=e142]
    - paragraph [ref=e143]: Submit your request and we will confirm your booking with pricing within one business day.
    - generic [ref=e144]:
      - link "Book now" [ref=e145]:
        - /url: ../tourism.html#book-ride
      - link "Send inquiry" [ref=e146]:
        - /url: ../contact.html
  - contentinfo [ref=e147]:
    - generic [ref=e148]:
      - generic [ref=e149]:
        - generic [ref=e150]:
          - heading "Luxival" [level=3] [ref=e151]
          - paragraph [ref=e152]:
            - text: Varikkokaarre 7A
            - text: 01700 Vantaa, Finland
          - paragraph [ref=e153]: support@luxival.com
          - paragraph [ref=e154]: +358 50 351 8366
        - generic [ref=e155]:
          - heading "Navigate" [level=3] [ref=e156]
          - generic [ref=e157]:
            - link "Home" [ref=e158]:
              - /url: ../index.html
            - link "Travel" [ref=e159]:
              - /url: ../tourism.html
            - link "Design" [ref=e160]:
              - /url: ../design-services.html
            - link "Portfolio" [ref=e161]:
              - /url: ../portfolio.html
            - link "Platform" [ref=e162]:
              - /url: ../platform.html
            - link "About" [ref=e163]:
              - /url: ../about.html
            - link "QA" [ref=e164]:
              - /url: ../qa.html
        - generic [ref=e165]:
          - heading "Legal" [level=3] [ref=e166]
          - generic [ref=e167]:
            - link "Privacy Policy" [ref=e168]:
              - /url: ../privacy.html
            - link "Terms of Service" [ref=e169]:
              - /url: ../terms.html
            - link "Contact" [ref=e170]:
              - /url: ../contact.html
      - generic [ref=e171]: Luxival © 2026 · Premium digital & transport experiences
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
  28  |       expect(res.status()).toBe(200);
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
> 101 |     expect(total).not.toBe('—');
      |                       ^ Error: expect(received).not.toBe(expected) // Object.is equality
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
  129 |   });
  130 | });
  131 | 
  132 | // ── WEATHER WIDGET ──────────────────────────────────────
  133 | test.describe('Weather Widget', () => {
  134 |   test('Weather bar renders on tourism page', async ({ page }) => {
  135 |     await page.goto(BASE + '/tourism.html');
  136 |     await page.waitForLoadState('networkidle');
  137 |     // Weather should show temperature
  138 |     await page.waitForTimeout(4000);
  139 |     const weatherEl = page.locator('[class*="weather"], #weather, .weather-bar').first();
  140 |     const exists = await weatherEl.count() > 0;
  141 |     console.log('Weather element found:', exists);
  142 |   });
  143 | });
  144 | 
  145 | // ── AUDIT PLATFORM ──────────────────────────────────────
  146 | test.describe('Website Audit Platform', () => {
  147 |   test('Audit page loads', async ({ page }) => {
  148 |     const res = await page.goto(BASE + '/audit.html');
  149 |     expect(res.status()).toBe(200);
  150 |     await expect(page.locator('h1, h2').first()).toBeVisible();
  151 |   });
  152 | 
  153 |   test('Audit URL input and scan button exist', async ({ page }) => {
  154 |     await page.goto(BASE + '/audit.html');
  155 |     await page.waitForLoadState('domcontentloaded');
  156 |     const urlInput = page.locator('input[type="url"], input[placeholder*="http"], input[placeholder*="website"], input[placeholder*="URL"]').first();
  157 |     const scanBtn = page.locator('button').filter({ hasText: /scan|audit|check|analyse/i }).first();
  158 |     const inputExists = await urlInput.count() > 0;
  159 |     const btnExists = await scanBtn.count() > 0;
  160 |     console.log('Audit URL input found:', inputExists);
  161 |     console.log('Scan button found:', btnExists);
  162 |     expect(inputExists || btnExists).toBeTruthy();
  163 |   });
  164 | 
  165 |   test('Backend health check is live', async ({ page }) => {
  166 |     const res = await page.goto('https://luxival-audit-api.fly.dev/health');
  167 |     expect(res.status()).toBe(200);
  168 |     const body = await page.textContent('body');
  169 |     console.log('Backend health:', body);
  170 |     expect(body).toContain('ok');
  171 |   });
  172 | 
  173 |   test('Free audit scan returns results', async ({ page }) => {
  174 |     await page.goto(BASE + '/audit.html');
  175 |     await page.waitForLoadState('domcontentloaded');
  176 |     
  177 |     // Find and fill the URL input
  178 |     const urlInput = page.locator('input[type="url"], input[placeholder*="http"], input[placeholder*="URL"], input[placeholder*="website"]').first();
  179 |     if (await urlInput.count() > 0) {
  180 |       await urlInput.fill('https://luxival.com');
  181 |       // Click scan button
  182 |       const scanBtn = page.locator('button').filter({ hasText: /scan|audit|check|analyse/i }).first();
  183 |       if (await scanBtn.count() > 0) {
  184 |         await scanBtn.click();
  185 |         // Wait up to 30s for results
  186 |         await page.waitForTimeout(15000);
  187 |         const pageText = await page.locator('body').textContent();
  188 |         console.log('Audit result snippet:', pageText.slice(0, 500));
  189 |       }
  190 |     }
  191 |   });
  192 | });
  193 | 
  194 | // ── TOURISM PLANNER ──────────────────────────────────────
  195 | test.describe('Tourism Planning Page', () => {
  196 |   test('Tourism planning page loads', async ({ page }) => {
  197 |     const res = await page.goto(BASE + '/tourism-planning.html');
  198 |     expect(res.status()).toBe(200);
  199 |   });
  200 | 
  201 |   test('Tourism planner form elements present', async ({ page }) => {
```