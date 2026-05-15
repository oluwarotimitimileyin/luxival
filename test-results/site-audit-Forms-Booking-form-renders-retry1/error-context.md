# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site-audit.spec.js >> Forms >> Booking form renders
- Location: tests/site-audit.spec.js:253:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('form').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('form').first()

```

```yaml
- navigation:
  - link "LUXIVAL":
    - /url: index.html
  - list:
    - listitem:
      - link "Travel":
        - /url: tourism.html
    - listitem:
      - link "Design":
        - /url: design-services.html
    - listitem:
      - link "Portfolio":
        - /url: portfolio.html
    - listitem:
      - link "QA":
        - /url: qa.html
    - listitem:
      - link "Platform":
        - /url: platform.html
    - listitem:
      - link "Blog":
        - /url: blog/index.html
    - listitem:
      - link "About":
        - /url: about.html
    - listitem:
      - link "Book a consultation":
        - /url: booking.html
- text: Booking · Luxival Helsinki
- heading "Book a consultation with Luxival." [level=1]
- paragraph: Choose a service below — each path is tailored to your specific need and connects you to the right team.
- text: Choose a service
- heading "Select your booking type" [level=2]
- link "🚗 Book a Ride Instant airport transfer or private city ride. Helsinki-Vantaa pickups, city routes, and custom transport — confirmed within one business day. Book transfer →":
  - /url: tourism.html#book-ride
  - text: 🚗
  - heading "Book a Ride" [level=3]
  - paragraph: Instant airport transfer or private city ride. Helsinki-Vantaa pickups, city routes, and custom transport — confirmed within one business day.
  - text: Book transfer →
- link "🗺️ Book Tourism Planning Custom day-by-day Finland itinerary built around your arrival and departure dates, with city, nature, and cultural highlights. Plan journey →":
  - /url: tourism-planning.html
  - text: 🗺️
  - heading "Book Tourism Planning" [level=3]
  - paragraph: Custom day-by-day Finland itinerary built around your arrival and departure dates, with city, nature, and cultural highlights.
  - text: Plan journey →
- link "🎨 Book Design Services Web design, SEO, 3D UX, AI agents, and full digital product development. Submit your project brief to get started. Start project →":
  - /url: design-services.html
  - text: 🎨
  - heading "Book Design Services" [level=3]
  - paragraph: Web design, SEO, 3D UX, AI agents, and full digital product development. Submit your project brief to get started.
  - text: Start project →
- link "🔍 Book QA Services Software testing, QA automation, and free website audit requests. Improve your product's reliability with expert QA. Request audit →":
  - /url: qa.html
  - text: 🔍
  - heading "Book QA Services" [level=3]
  - paragraph: Software testing, QA automation, and free website audit requests. Improve your product's reliability with expert QA.
  - text: Request audit →
- link "🏨 Find Accommodation Hotel and private house sourcing across Helsinki and Finland. We find premium stays that perfectly match your trip. Find a stay →":
  - /url: tourism.html#accommodation
  - text: 🏨
  - heading "Find Accommodation" [level=3]
  - paragraph: Hotel and private house sourcing across Helsinki and Finland. We find premium stays that perfectly match your trip.
  - text: Find a stay →
- text: Not sure where to start?
- heading "Speak to us directly" [level=2]
- paragraph: For a custom multi-service request or a general question, send us a message and we will route you to the right team within one business day.
- link "Send inquiry":
  - /url: contact.html
- link "WhatsApp us":
  - /url: https://wa.me/+358503518366
- contentinfo:
  - heading "Luxival" [level=3]
  - paragraph: Varikkokaarre 7A 01700 Vantaa, Finland
  - paragraph: support@luxival.com
  - paragraph: +358 50 351 8366
  - heading "Navigate" [level=3]
  - link "Home":
    - /url: index.html
  - link "Travel":
    - /url: tourism.html
  - link "Design":
    - /url: design-services.html
  - link "Portfolio":
    - /url: portfolio.html
  - link "Platform":
    - /url: platform.html
  - link "Blog":
    - /url: blog/index.html
  - link "About":
    - /url: about.html
  - link "QA":
    - /url: qa.html
  - heading "Legal" [level=3]
  - link "Privacy Policy":
    - /url: privacy.html
  - link "Terms of Service":
    - /url: terms.html
  - link "Contact":
    - /url: contact.html
  - text: Luxival © 2026 · Premium digital & transport experiences
```

# Test source

```ts
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
  202 |     await page.goto(BASE + '/tourism-planning.html');
  203 |     await page.waitForLoadState('domcontentloaded');
  204 |     const inputs = page.locator('input, select, textarea');
  205 |     const count = await inputs.count();
  206 |     console.log('Form inputs found:', count);
  207 |     expect(count).toBeGreaterThan(0);
  208 |   });
  209 | });
  210 | 
  211 | // ── BLOG ────────────────────────────────────────────────
  212 | test.describe('Blog', () => {
  213 |   test('Blog index loads with posts', async ({ page }) => {
  214 |     await page.goto(BASE + '/blog/index.html');
  215 |     await page.waitForLoadState('domcontentloaded');
  216 |     const cards = page.locator('.post-card, article, [class*="blog"]');
  217 |     const count = await cards.count();
  218 |     console.log('Blog cards visible:', count);
  219 |     expect(count).toBeGreaterThan(0);
  220 |   });
  221 | 
  222 |   test('Blog post loads with hero image', async ({ page }) => {
  223 |     await page.goto(BASE + '/blog/private-northern-lights-tour-finland/');
  224 |     await page.waitForLoadState('domcontentloaded');
  225 |     const hero = page.locator('.post-hero-wrap img, .post-hero');
  226 |     const exists = await hero.count() > 0;
  227 |     console.log('Hero image element found:', exists);
  228 |     expect(exists).toBeTruthy();
  229 |   });
  230 | 
  231 |   test('Blog post hero image actually loads (no broken img)', async ({ page }) => {
  232 |     await page.goto(BASE + '/blog/helsinki-private-city-tour-worth-it/');
  233 |     await page.waitForLoadState('networkidle');
  234 |     // Check image loaded successfully
  235 |     const heroImg = page.locator('.post-hero-wrap img').first();
  236 |     if (await heroImg.count() > 0) {
  237 |       const naturalWidth = await heroImg.evaluate(img => img.naturalWidth);
  238 |       console.log('Hero image naturalWidth:', naturalWidth);
  239 |       expect(naturalWidth).toBeGreaterThan(0);
  240 |     }
  241 |   });
  242 | });
  243 | 
  244 | // ── CONTACT / BOOKING FORMS ──────────────────────────────
  245 | test.describe('Forms', () => {
  246 |   test('Contact form renders', async ({ page }) => {
  247 |     await page.goto(BASE + '/contact.html');
  248 |     await page.waitForLoadState('domcontentloaded');
  249 |     const form = page.locator('form').first();
  250 |     await expect(form).toBeVisible();
  251 |   });
  252 | 
  253 |   test('Booking form renders', async ({ page }) => {
  254 |     await page.goto(BASE + '/booking.html');
  255 |     await page.waitForLoadState('domcontentloaded');
  256 |     const form = page.locator('form').first();
> 257 |     await expect(form).toBeVisible();
      |                        ^ Error: expect(locator).toBeVisible() failed
  258 |   });
  259 | });
  260 | 
  261 | // ── PERFORMANCE & SEO ────────────────────────────────────
  262 | test.describe('SEO & Meta Tags', () => {
  263 |   test('Homepage has title and meta description', async ({ page }) => {
  264 |     await page.goto(BASE + '/');
  265 |     const title = await page.title();
  266 |     const desc = await page.getAttribute('meta[name="description"]', 'content');
  267 |     const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
  268 |     console.log('Title:', title);
  269 |     console.log('Description:', desc?.slice(0, 80));
  270 |     console.log('Canonical:', canonical);
  271 |     expect(title.length).toBeGreaterThan(5);
  272 |     expect(desc).toBeTruthy();
  273 |   });
  274 | 
  275 |   test('Blog post has OG image meta tag', async ({ page }) => {
  276 |     await page.goto(BASE + '/blog/helsinki-airport-transfer-guide/');
  277 |     const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
  278 |     console.log('OG Image:', ogImage);
  279 |     expect(ogImage).toBeTruthy();
  280 |     expect(ogImage).not.toContain('oodi-library'); // Should have topic-matched image now
  281 |   });
  282 | 
  283 |   test('Sitemap is accessible', async ({ page }) => {
  284 |     const res = await page.goto(BASE + '/sitemap.xml');
  285 |     expect(res.status()).toBe(200);
  286 |     const body = await page.textContent('body');
  287 |     expect(body).toContain('luxival.com');
  288 |   });
  289 | 
  290 |   test('Robots.txt is accessible', async ({ page }) => {
  291 |     const res = await page.goto(BASE + '/robots.txt');
  292 |     expect(res.status()).toBe(200);
  293 |     const body = await page.textContent('body');
  294 |     expect(body).toContain('sitemap');
  295 |   });
  296 | });
  297 | 
  298 | // ── NO BROKEN LINKS (key pages) ──────────────────────────
  299 | test.describe('No Critical 404s', () => {
  300 |   const criticalUrls = [
  301 |     '/assets/images/finland/architecture/oodi-library.jpg',
  302 |     '/js/fare-calculator.js',
  303 |     '/blog/private-northern-lights-tour-finland/',
  304 |     '/blog/luxury-helsinki-experiences-not-on-viator/',
  305 |     '/thank-you-transfer.html',
  306 |     '/thank-you-digital.html',
  307 |   ];
  308 | 
  309 |   for (const url of criticalUrls) {
  310 |     test(`${url} returns 200`, async ({ page }) => {
  311 |       const res = await page.goto(BASE + url);
  312 |       expect(res.status()).toBe(200);
  313 |     });
  314 |   }
  315 | });
  316 | 
```