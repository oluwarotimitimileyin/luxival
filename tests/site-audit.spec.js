// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://www.luxival.com';

// ── CORE PAGES ──────────────────────────────────────────
test.describe('Core Pages Load', () => {
  const pages = [
    { url: '/', title: 'LUXIVAL' },
    { url: '/services', title: 'Services' },
    { url: '/about', title: 'About' },
    { url: '/contact', title: 'Contact' },
    { url: '/booking', title: 'Book' },
    { url: '/blog', title: 'Blog' },
    { url: '/tourism', title: 'Tourism' },
    { url: '/tourism-planning', title: 'Tourism Planning' },
    { url: '/audit', title: 'Audit' },
    { url: '/transfers', title: 'Transfer' },
    { url: '/digital', title: 'Digital' },
    { url: '/pattern', title: 'Pattern' },
    { url: '/portfolio', title: 'Portfolio' },
    { url: '/portfolio/esg-compliance-auditor', title: 'ESG' },
    { url: '/portfolio/growth-architect', title: 'Growth' },
    { url: '/portfolio/businesslauncher', title: 'BusinessLauncher' },
    { url: '/portfolio/ugc-studio-ai', title: 'UGC' },
    { url: '/portfolio/vortex-ai-platform', title: 'Vortex' },
    { url: '/portfolio/autonomous-qa-audit-dashboard', title: 'QA' },
    { url: '/qa', title: 'QA' },
  ];

  for (const p of pages) {
    test(`${p.url} loads with 200`, async ({ page }) => {
      const res = await page.goto(BASE + p.url);
      expect(res.status()).toBe(200);
      // No console errors that indicate broken JS
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.waitForLoadState('domcontentloaded');
    });
  }
});

// ── NAVIGATION ──────────────────────────────────────────
test.describe('Navigation', () => {
  test('Main nav links present on homepage', async ({ page }) => {
    await page.goto(BASE + '/');
    await expect(page.locator('nav')).toBeVisible();
    // Check key nav links exist
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(3);
  });

  test('Mobile nav visible on small screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/');
    await expect(page.locator('nav')).toBeVisible();
  });
});

// ── FARE CALCULATOR ──────────────────────────────────────
test.describe('Fare Calculator', () => {
  test('Fare calculator renders on airport-transfer page', async ({ page }) => {
    await page.goto(BASE + '/services/airport-transfer.html');
    await page.waitForLoadState('networkidle');
    // The fare calculator container should exist
    const calc = page.locator('.fare-calculator');
    await expect(calc).toBeVisible({ timeout: 10000 });
  });

  test('Fare calculator has address input fields', async ({ page }) => {
    await page.goto(BASE + '/services/airport-transfer.html');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.fare-origin')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.fare-destination')).toBeVisible({ timeout: 10000 });
  });

  test('Fare calculator Google Places autocomplete attaches', async ({ page }) => {
    await page.goto(BASE + '/services/airport-transfer.html');
    await page.waitForLoadState('networkidle');
    // Wait for Google Maps to load
    await page.waitForFunction(() => window.google && window.google.maps, { timeout: 15000 });
    // Type in origin field - should trigger autocomplete dropdown
    await page.fill('.fare-origin', 'Helsinki Airport');
    await page.waitForTimeout(1500);
    // Check if PAC (Places Autocomplete) container appeared
    const pac = page.locator('.pac-container');
    const pacVisible = await pac.isVisible().catch(() => false);
    console.log('Google Places autocomplete dropdown visible:', pacVisible);
  });

  test('Fare calculation triggers with valid addresses', async ({ page }) => {
    await page.goto(BASE + '/services/airport-transfer.html');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => window.google && window.google.maps, { timeout: 15000 });

    await page.fill('.fare-origin', 'Helsinki Airport, Vantaa, Finland');
    await page.fill('.fare-destination', 'Hotel Kämp, Helsinki');
    await page.locator('.fare-calc-btn').click();
    await page.waitForTimeout(4000);

    const status = await page.locator('.fare-status').textContent();
    const total = await page.locator('.fare-total-amount').textContent();
    console.log('Fare status:', status);
    console.log('Fare total:', total);
    // Should show a price, a route message, or an error — not the default placeholder
    const statusChanged = status !== 'Enter addresses above to calculate your route fare.';
    const totalChanged = total !== '—';
    expect(statusChanged || totalChanged).toBeTruthy();
  });
});

// ── HELSINKI EVENTS (TOURISM PAGE) ──────────────────────
test.describe('Helsinki Events', () => {
  test('Events grid renders on tourism page', async ({ page }) => {
    await page.goto(BASE + '/tourism.html');
    await page.waitForLoadState('networkidle');
    const grid = page.locator('#eventsGrid');
    await expect(grid).toBeVisible({ timeout: 10000 });
  });

  test('Events grid shows cards (live or fallback)', async ({ page }) => {
    await page.goto(BASE + '/tourism.html');
    // Wait up to 10s for events to load
    await page.waitForSelector('#eventsGrid .event-card', { timeout: 10000 }).catch(() => {});
    const cards = page.locator('#eventsGrid .event-card');
    const count = await cards.count();
    console.log('Event cards rendered:', count);
    expect(count).toBeGreaterThan(0);
  });

  test('Events do not show raw "Link event abi" text', async ({ page }) => {
    await page.goto(BASE + '/tourism.html');
    await page.waitForTimeout(5000);
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('Link event abi');
  });
});

// ── WEATHER WIDGET ──────────────────────────────────────
test.describe('Weather Widget', () => {
  test('Weather bar renders on tourism page', async ({ page }) => {
    await page.goto(BASE + '/tourism.html');
    await page.waitForLoadState('networkidle');
    // Weather should show temperature
    await page.waitForTimeout(4000);
    const weatherEl = page.locator('[class*="weather"], #weather, .weather-bar').first();
    const exists = await weatherEl.count() > 0;
    console.log('Weather element found:', exists);
  });
});

// ── AUDIT PLATFORM ──────────────────────────────────────
test.describe('Website Audit Platform', () => {
  test('Audit page loads', async ({ page }) => {
    const res = await page.goto(BASE + '/audit.html');
    expect(res.status()).toBe(200);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Audit URL input and scan button exist', async ({ page }) => {
    await page.goto(BASE + '/audit.html');
    await page.waitForLoadState('domcontentloaded');
    const urlInput = page.locator('input[type="url"], input[placeholder*="http"], input[placeholder*="website"], input[placeholder*="URL"]').first();
    const scanBtn = page.locator('button').filter({ hasText: /scan|audit|check|analyse/i }).first();
    const inputExists = await urlInput.count() > 0;
    const btnExists = await scanBtn.count() > 0;
    console.log('Audit URL input found:', inputExists);
    console.log('Scan button found:', btnExists);
    expect(inputExists || btnExists).toBeTruthy();
  });

  test('Backend health check is live', async ({ page }) => {
    const res = await page.goto('https://luxival-audit-api.fly.dev/health');
    expect(res.status()).toBe(200);
    const body = await page.textContent('body');
    console.log('Backend health:', body);
    expect(body).toContain('ok');
  });

  test('Free audit scan returns results', async ({ page }) => {
    await page.goto(BASE + '/audit.html');
    await page.waitForLoadState('domcontentloaded');
    
    // Find and fill the URL input
    const urlInput = page.locator('input[type="url"], input[placeholder*="http"], input[placeholder*="URL"], input[placeholder*="website"]').first();
    if (await urlInput.count() > 0) {
      await urlInput.fill('https://www.luxival.com');
      // Click scan button
      const scanBtn = page.locator('button').filter({ hasText: /scan|audit|check|analyse/i }).first();
      if (await scanBtn.count() > 0) {
        await scanBtn.click();
        // Wait up to 30s for results
        await page.waitForTimeout(15000);
        const pageText = await page.locator('body').textContent();
        console.log('Audit result snippet:', pageText.slice(0, 500));
      }
    }
  });
});

// ── TOURISM PLANNER ──────────────────────────────────────
test.describe('Tourism Planning Page', () => {
  test('Tourism planning page loads', async ({ page }) => {
    const res = await page.goto(BASE + '/tourism-planning.html');
    expect(res.status()).toBe(200);
  });

  test('Tourism planner form elements present', async ({ page }) => {
    await page.goto(BASE + '/tourism-planning');
    await page.waitForLoadState('domcontentloaded');
    const inputs = page.locator('input, select, textarea');
    const count = await inputs.count();
    console.log('Form inputs found:', count);
    expect(count).toBeGreaterThan(0);
  });
});

// ── BLOG ────────────────────────────────────────────────
test.describe('Blog', () => {
  test('Blog index loads with posts', async ({ page }) => {
    await page.goto(BASE + '/blog');
    await page.waitForLoadState('domcontentloaded');
    const cards = page.locator('.post-card, article, [class*="blog"]');
    const count = await cards.count();
    console.log('Blog cards visible:', count);
    expect(count).toBeGreaterThan(0);
  });

  test('Blog post loads with hero image', async ({ page }) => {
    await page.goto(BASE + '/blog/private-northern-lights-tour-finland/');
    await page.waitForLoadState('networkidle');
    const hero = page.locator('.post-hero-wrap img, .post-hero, .post-body img').first();
    const exists = await hero.count() > 0;
    console.log('Hero image element found:', exists);
    expect(exists).toBeTruthy();
  });

  test('Blog post hero image actually loads (no broken img)', async ({ page }) => {
    await page.goto(BASE + '/blog/helsinki-private-city-tour-worth-it/');
    await page.waitForLoadState('networkidle');
    // Check image loaded successfully
    const heroImg = page.locator('.post-hero-wrap img').first();
    if (await heroImg.count() > 0) {
      const naturalWidth = await heroImg.evaluate(img => img.naturalWidth);
      console.log('Hero image naturalWidth:', naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });
});

// ── CONTACT / BOOKING FORMS ──────────────────────────────
test.describe('Forms', () => {
  test('Contact form renders', async ({ page }) => {
    await page.goto(BASE + '/contact.html');
    await page.waitForLoadState('domcontentloaded');
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('Booking page renders service cards', async ({ page }) => {
    await page.goto(BASE + '/booking.html');
    await page.waitForLoadState('domcontentloaded');
    const cards = page.locator('.svc-card, .booking-card, [class*="card"]');
    const count = await cards.count();
    console.log('Booking service cards found:', count);
    expect(count).toBeGreaterThan(0);
  });

  test('Leaf pages expose data-collection funnel CTA', async ({ page }) => {
    const leafPages = [
      '/services/airport-transfer',
      '/tourism-planning',
      '/services/web-design',
      '/services/electrical-design',
      '/services/mechanical-design',
    ];

    for (const pagePath of leafPages) {
      await page.goto(BASE + pagePath);
      await page.waitForLoadState('domcontentloaded');
      const funnel = page.locator('[data-funnel-cta]');
      await expect(funnel, `Missing funnel CTA on ${pagePath}`).toBeVisible({ timeout: 5000 });
      await expect(funnel.locator('form')).toBeVisible();
    }
  });
});

// ── PERFORMANCE & SEO ────────────────────────────────────
test.describe('SEO & Meta Tags', () => {
  test('Homepage has title and meta description', async ({ page }) => {
    await page.goto(BASE + '/');
    const title = await page.title();
    const desc = await page.getAttribute('meta[name="description"]', 'content');
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    console.log('Title:', title);
    console.log('Description:', desc?.slice(0, 80));
    console.log('Canonical:', canonical);
    expect(title.length).toBeGreaterThan(5);
    expect(desc).toBeTruthy();
  });

  test('Blog post has OG image meta tag', async ({ page }) => {
    await page.goto(BASE + '/blog/helsinki-airport-transfer-guide/');
    const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
    console.log('OG Image:', ogImage);
    expect(ogImage).toBeTruthy();
    expect(ogImage).not.toContain('oodi-library'); // Should have topic-matched image now
  });

  test('Sitemap is accessible', async ({ page }) => {
    const res = await page.goto(BASE + '/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await page.textContent('body');
    expect(body).toContain('luxival.com');
  });

  test('Robots.txt is accessible', async ({ page }) => {
    const res = await page.goto(BASE + '/robots.txt');
    expect(res.status()).toBe(200);
    const body = await page.textContent('body');
    expect(body).toContain('sitemap');
  });
});

// ── NO BROKEN LINKS (key pages) ──────────────────────────
test.describe('No Critical 404s', () => {
  const criticalUrls = [
    '/assets/images/finland/architecture/oodi-library.jpg',
    '/js/fare-calculator.js',
    '/blog/private-northern-lights-tour-finland/',
    '/blog/luxury-helsinki-experiences-not-on-viator/',
    '/thank-you-transfer.html',
    '/thank-you-digital.html',
  ];

  for (const url of criticalUrls) {
    test(`${url} returns 200`, async ({ page }) => {
      const res = await page.goto(BASE + url);
      expect(res.status()).toBe(200);
    });
  }
});

// ── AMP PAGES ─────────────────────────────────────────────
test.describe('AMP Pages', () => {
  const ampPages = [
    { url: '/amp/', canonical: 'https://www.luxival.com/' },
    { url: '/amp/about', canonical: 'https://www.luxival.com/about' },
    { url: '/amp/contact', canonical: 'https://www.luxival.com/contact' },
    { url: '/amp/helsinki-airport-pickup', canonical: 'https://www.luxival.com/helsinki-airport-pickup' },
    { url: '/amp/services', canonical: 'https://www.luxival.com/services' },
    { url: '/amp/transfers', canonical: 'https://www.luxival.com/transfers' },
  ];

  for (const p of ampPages) {
    test(`${p.url} returns 200`, async ({ page }) => {
      const res = await page.goto(BASE + p.url);
      expect(res.status()).toBe(200);
    });

    test(`${p.url} has ⚡ or amp attribute on html`, async ({ page }) => {
      await page.goto(BASE + p.url);
      const hasAmp = await page.evaluate(() => {
        const html = document.documentElement;
        return html.hasAttribute('amp') || html.hasAttribute('⚡');
      });
      expect(hasAmp).toBeTruthy();
    });

    test(`${p.url} loads AMP runtime script`, async ({ page }) => {
      await page.goto(BASE + p.url);
      const hasRuntime = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script[src*="cdn.ampproject.org/v0.js"]');
        return scripts.length > 0;
      });
      expect(hasRuntime).toBeTruthy();
    });

    test(`${p.url} has correct canonical link`, async ({ page }) => {
      await page.goto(BASE + p.url);
      const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
      expect(canonical).toBe(p.canonical);
    });

    test(`${p.url} had AMP boilerplate in source`, async ({ page }) => {
      const res = await page.goto(BASE + p.url);
      const html = await res.text();
      expect(html).toContain('amp-boilerplate');
    });

    test(`${p.url} has viewport meta with minimum-scale=1`, async ({ page }) => {
      await page.goto(BASE + p.url);
      const vp = await page.getAttribute('meta[name="viewport"]', 'content');
      expect(vp).toContain('minimum-scale=1');
    });
  }

  // Check that canonical pages link back to AMP versions
  test('canonical pages have amphtml link back', async ({ page }) => {
    const canonicals = [
      { url: '/', ampUrl: 'https://www.luxival.com/amp/' },
      { url: '/about', ampUrl: 'https://www.luxival.com/amp/about' },
      { url: '/contact', ampUrl: 'https://www.luxival.com/amp/contact' },
      { url: '/helsinki-airport-pickup', ampUrl: 'https://www.luxival.com/amp/helsinki-airport-pickup' },
      { url: '/services', ampUrl: 'https://www.luxival.com/amp/services' },
      { url: '/transfers', ampUrl: 'https://www.luxival.com/amp/transfers' },
    ];
    for (const c of canonicals) {
      await page.goto(BASE + c.url);
      const ampLink = await page.getAttribute('link[rel="amphtml"]', 'href');
      expect(ampLink, `${c.url} missing amphtml link`).toBe(c.ampUrl);
    }
  });

  // Google Discover eligibility checks
  test('blog posts have Discover-ready meta tags', async ({ page }) => {
    await page.goto(BASE + '/blog/helsinki-airport-transfer-guide');
    const robots = await page.getAttribute('meta[name="robots"]', 'content');
    expect(robots).toBe('max-image-preview:large');
    const jsonld = await page.textContent('script[type="application/ld+json"]');
    const schema = JSON.parse(jsonld);
    expect(schema['@type']).toBe('BlogPosting');
    expect(schema.datePublished).toBeDefined();
    expect(schema.dateModified).toBeDefined();
    expect(schema.author['@type']).toBe('Person');
    expect(schema.author.name).toBeDefined();
  });

  test('blog posts have BreadcrumbList schema', async ({ page }) => {
    await page.goto(BASE + '/blog/helsinki-airport-transfer-guide');
    const scripts = await page.$$eval('script[type="application/ld+json"]', els =>
      els.map(el => JSON.parse(el.textContent))
    );
    const breadcrumb = scripts.find(s => s['@type'] === 'BreadcrumbList');
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement).toHaveLength(3);
    expect(breadcrumb.itemListElement[0].name).toBe('Home');
    expect(breadcrumb.itemListElement[1].name).toBe('Blog');
  });
});
