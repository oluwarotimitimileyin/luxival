# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site-audit.spec.js >> Blog >> Blog post loads with hero image
- Location: tests/site-audit.spec.js:222:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - link "LUXIVAL" [ref=e3] [cursor=pointer]:
      - /url: /index.html
    - list [ref=e4]:
      - listitem [ref=e5]:
        - link "Travel" [ref=e6] [cursor=pointer]:
          - /url: /tourism.html
      - listitem [ref=e7]:
        - link "Design" [ref=e8] [cursor=pointer]:
          - /url: /design-services.html
      - listitem [ref=e9]:
        - link "Portfolio" [ref=e10] [cursor=pointer]:
          - /url: /portfolio.html
      - listitem [ref=e11]:
        - link "QA" [ref=e12] [cursor=pointer]:
          - /url: /qa.html
      - listitem [ref=e13]:
        - link "Platform" [ref=e14] [cursor=pointer]:
          - /url: /platform.html
      - listitem [ref=e15]:
        - link "Blog" [ref=e16] [cursor=pointer]:
          - /url: /blog/index.html
      - listitem [ref=e17]:
        - link "About" [ref=e18] [cursor=pointer]:
          - /url: /about.html
      - listitem [ref=e19]:
        - link "Book a consultation" [ref=e20] [cursor=pointer]:
          - /url: /booking.html
  - main [ref=e21]:
    - generic [ref=e22]:
      - 'heading "Private Northern Lights Tour Finland: Everything People Ask" [level=1] [ref=e23]'
      - paragraph [ref=e24]: The Northern Lights in Finland are one of those bucket-list moments that actually live up to the hype. But the difference between a mediocre group tour and a life-changing experience? It almost always comes down to how you get there. Here's everything people ask before booking.
      - separator [ref=e25]
      - heading "Where is the best place to see the Northern Lights in Finland?" [level=2] [ref=e26]
      - paragraph [ref=e27]:
        - strong [ref=e28]: Lapland is the gold standard.
        - text: "Specifically:"
      - list [ref=e29]:
        - listitem [ref=e30]:
          - strong [ref=e31]: Saariselkä
          - text: — dark skies, minimal light pollution, high aurora probability
        - listitem [ref=e32]:
          - strong [ref=e33]: Rovaniemi
          - text: — more accessible, still excellent
        - listitem [ref=e34]:
          - strong [ref=e35]: Kilpisjärvi
          - text: — near the Norwegian border, statistically one of the best spots in all of Scandinavia
        - listitem [ref=e36]:
          - strong [ref=e37]: Inari
          - text: — remote, genuinely wild, worth the extra travel
      - paragraph [ref=e38]:
        - text: "But here's the thing most tour operators won't tell you: even"
        - strong [ref=e39]: southern Finland
        - text: occasionally gets strong aurora displays during high solar activity. If you're already in Helsinki, a night drive north can sometimes reward you more than a pre-booked Lapland package.
      - separator [ref=e40]
      - heading "Is a private Northern Lights tour better than a group tour?" [level=2] [ref=e41]
      - paragraph [ref=e42]:
        - strong [ref=e43]: Yes — and here's the honest reason why.
      - paragraph [ref=e44]: Group aurora tours run on fixed schedules. They leave at set times, return at set times, and follow a set route. If the lights appear three hours later at a different location, you've already been dropped back at your hotel.
      - paragraph [ref=e45]: A private tour adapts in real time. Your driver monitors aurora forecasts (we use Space Weather Live and the Finnish Meteorological Institute) and moves you to the best position based on cloud cover, light pollution, and solar activity.
      - paragraph [ref=e46]: "Private also means:"
      - list [ref=e47]:
        - listitem [ref=e48]: No waiting for 20 other people to get ready
        - listitem [ref=e49]: Your own pace — stop and photograph as long as you want
        - listitem [ref=e50]: Heated vehicle waiting when you need to warm up
        - listitem [ref=e51]: Privacy for couples, honeymoons, or special occasions
      - separator [ref=e52]
      - heading "How much does a private Northern Lights tour cost in Finland?" [level=2] [ref=e53]
      - paragraph [ref=e54]: "Prices vary significantly based on location and duration:"
      - list [ref=e55]:
        - listitem [ref=e56]:
          - strong [ref=e57]: Helsinki-based overnight drive to Lapland
          - text: ": €400–€700 per vehicle"
        - listitem [ref=e58]:
          - strong [ref=e59]: Rovaniemi-based evening chase
          - text: ": €150–€350 per vehicle"
        - listitem [ref=e60]:
          - strong [ref=e61]: Multi-night Lapland aurora package with private driver
          - text: ": €1,200–€2,500"
      - paragraph [ref=e62]: Group tours run €60–€150 per person but offer none of the flexibility described above.
      - paragraph [ref=e63]:
        - text: At Luxival, we offer
        - strong [ref=e64]: private aurora chauffeur experiences
        - text: starting from Helsinki — contact us for a custom quote based on your travel dates and group size.
      - separator [ref=e65]
      - heading "What month is best for the Northern Lights in Finland?" [level=2] [ref=e66]
      - paragraph [ref=e67]:
        - text: The aurora season runs
        - strong [ref=e68]: late August to early April
        - text: ". Peak visibility:"
      - list [ref=e69]:
        - listitem [ref=e70]:
          - strong [ref=e71]: September–October
          - text: ": Dark nights return, weather often clear"
        - listitem [ref=e72]:
          - strong [ref=e73]: December–January
          - text: ": Longest nights, but more cloud cover"
        - listitem [ref=e74]:
          - strong [ref=e75]: February–March
          - text: ": Sweet spot — cold and clear, snow on the ground for photos"
      - paragraph [ref=e76]: The Finnish Meteorological Institute publishes real-time geomagnetic activity forecasts. On nights with a KP index of 3 or above, Southern Finland can see displays. KP 5+ means even Helsinki city outskirts.
      - separator [ref=e77]
      - heading "Can you see the Northern Lights in Helsinki?" [level=2] [ref=e78]
      - paragraph [ref=e79]:
        - strong [ref=e80]: Yes — but it requires the right conditions and the right location.
      - paragraph [ref=e81]: "Don't try from the city centre. Light pollution kills it. Instead:"
      - list [ref=e82]:
        - listitem [ref=e83]: Drive 40–60 minutes north of Helsinki to areas with no ambient light
        - listitem [ref=e84]: Pick a night with KP index 4+
        - listitem [ref=e85]: Go between 10pm and 2am
      - paragraph [ref=e86]: We've done Helsinki-based aurora chases for clients who couldn't travel to Lapland and it has genuinely delivered. It's not guaranteed — nothing in aurora chasing is — but with a private driver and real-time monitoring, your odds improve dramatically.
      - separator [ref=e87]
      - heading "Do I need to book a Northern Lights tour in advance?" [level=2] [ref=e88]
      - paragraph [ref=e89]:
        - strong [ref=e90]: Yes — especially in peak season (Dec–Feb).
      - paragraph [ref=e91]: Good private guides in Lapland book out months ahead. If you're planning a November–February trip, book 2–3 months early minimum.
      - paragraph [ref=e92]: For Helsinki-based aurora chases, we can often arrange at 24–48 hours notice depending on forecast conditions.
      - separator [ref=e93]
      - heading "What should I wear for a Northern Lights tour in Finland?" [level=2] [ref=e94]
      - paragraph [ref=e95]: "Even in a heated vehicle, you'll want to step out for photos. Dress for -10°C to -25°C in Lapland in winter:"
      - list [ref=e96]:
        - listitem [ref=e97]: Thermal base layer (wool, not cotton)
        - listitem [ref=e98]: Mid-layer fleece
        - listitem [ref=e99]: Outer shell windproof jacket
        - listitem [ref=e100]: Waterproof snow trousers
        - listitem [ref=e101]: Proper winter boots (not fashion boots — your feet will freeze)
        - listitem [ref=e102]: Wool hat, gloves, neck gaiter
        - listitem [ref=e103]: Hand warmers (these are non-negotiable)
      - paragraph [ref=e104]: Most Lapland tour operators also provide snowsuits if needed.
      - separator [ref=e105]
      - heading "What camera settings work for aurora photography?" [level=2] [ref=e106]
      - paragraph [ref=e107]: "Your phone will work in good conditions but for serious shots:"
      - list [ref=e108]:
        - listitem [ref=e109]:
          - strong [ref=e110]: ISO
          - text: ": 1600–3200"
        - listitem [ref=e111]:
          - strong [ref=e112]: Aperture
          - text: ": f/2.8 or wider"
        - listitem [ref=e113]:
          - strong [ref=e114]: Shutter speed
          - text: ": 3–8 seconds (faster for active displays)"
        - listitem [ref=e115]:
          - strong [ref=e116]: Focus
          - text: ": manual infinity focus"
        - listitem [ref=e117]:
          - strong [ref=e118]: Tripod
          - text: ": essential"
      - paragraph [ref=e119]: Modern iPhones and Pixels actually capture aurora reasonably well in Night Mode with a steady surface.
      - separator [ref=e120]
      - heading "Ready to Plan Your Aurora Experience?" [level=2] [ref=e121]
      - paragraph [ref=e122]: Whether you're looking for a private chauffeur from Helsinki north, or a full Lapland aurora package, Luxival can arrange it around your schedule.
      - paragraph [ref=e123]:
        - strong [ref=e124]:
          - link "Contact us for a custom Northern Lights quote →" [ref=e125] [cursor=pointer]:
            - /url: /contact.html
      - paragraph [ref=e126]:
        - text: Or explore our full
        - link "Finland Tourism Planning service" [ref=e127] [cursor=pointer]:
          - /url: /tourism-planning.html
        - text: for a complete itinerary built around your dates.
  - contentinfo [ref=e128]:
    - generic [ref=e129]:
      - generic [ref=e130]: Luxival © 2026 · Journal · Helsinki
      - generic [ref=e131]:
        - link "Home" [ref=e132] [cursor=pointer]:
          - /url: /index.html
        - link "Travel" [ref=e133] [cursor=pointer]:
          - /url: /tourism.html
        - link "Design" [ref=e134] [cursor=pointer]:
          - /url: /design-services.html
        - link "Portfolio" [ref=e135] [cursor=pointer]:
          - /url: /portfolio.html
        - link "Platform" [ref=e136] [cursor=pointer]:
          - /url: /platform.html
        - link "QA" [ref=e137] [cursor=pointer]:
          - /url: /qa.html
        - link "Contact" [ref=e138] [cursor=pointer]:
          - /url: /contact.html
        - link "Privacy" [ref=e139] [cursor=pointer]:
          - /url: /privacy.html
        - link "Terms" [ref=e140] [cursor=pointer]:
          - /url: /terms.html
```

# Test source

```ts
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
> 228 |     expect(exists).toBeTruthy();
      |                    ^ Error: expect(received).toBeTruthy()
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
  257 |     await expect(form).toBeVisible();
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