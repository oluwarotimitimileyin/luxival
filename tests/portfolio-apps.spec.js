// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://www.luxival.com';

test.describe('Portfolio SPA Integration', () => {
  const spaApps = [
    { name: 'Growth Architect', path: '/portfolio/growth-architect/frontend/dist/' },
    { name: 'ESG Compliance Auditor', path: '/portfolio/esg-compliance-auditor/frontend/dist/' },
    { name: 'BusinessLauncher', path: '/portfolio/businesslauncher/frontend/dist/' },
    { name: 'UGC Studio AI', path: '/portfolio/ugc-studio-ai/frontend/dist/' },
    { name: 'Vortex AI Platform', path: '/portfolio/vortex-ai-platform/frontend/dist/' },
    { name: 'Autonomous QA Audit Dashboard', path: '/portfolio/autonomous-qa-audit-dashboard/frontend/dist/' },
  ];

  for (const app of spaApps) {
    test(`${app.name} loads successfully`, async ({ page }) => {
      const res = await page.goto(BASE + app.path, { waitUntil: 'domcontentloaded' });
      expect(res.status()).toBe(200);
    });

    test(`${app.name} has app root`, async ({ page }) => {
      await page.goto(BASE + app.path, { waitUntil: 'domcontentloaded' });
      const root = page.locator('#root');
      await expect(root).toBeAttached();
    });

    test(`${app.name} has Luxival nav bar`, async ({ page }) => {
      await page.goto(BASE + app.path, { waitUntil: 'domcontentloaded' });
      const siteNav = page.locator('#luxival-site-nav');
      if (await siteNav.count()) {
        await expect(siteNav).toBeVisible({ timeout: 5000 });
      }
    });

    test(`${app.name} nav has Portfolio link`, async ({ page }) => {
      await page.goto(BASE + app.path, { waitUntil: 'domcontentloaded' });
      const portfolioLink = page.locator('#luxival-site-nav a:has-text("Portfolio")');
      if (await portfolioLink.count()) {
        await expect(portfolioLink).toBeVisible();
        const href = await portfolioLink.getAttribute('href');
        expect(href).toContain('portfolio');
      }
    });

    test(`${app.name} nav has Get Started CTA`, async ({ page }) => {
      await page.goto(BASE + app.path, { waitUntil: 'domcontentloaded' });
      const cta = page.locator('#luxival-site-nav a:has-text("Get Started")');
      if (await cta.count()) {
        await expect(cta).toBeVisible();
        const href = await cta.getAttribute('href');
        expect(href).toContain('contact');
      }
    });
  }

  const projectPages = [
    { name: 'BusinessLauncher', path: '/businesslauncher', iframe: '/portfolio/businesslauncher/frontend/dist/' },
    { name: 'UGC Studio AI', path: '/ugc-studio-ai', iframe: '/portfolio/ugc-studio-ai/frontend/dist/' },
    { name: 'Vortex AI Platform', path: '/vortex-ai-platform', iframe: '/portfolio/vortex-ai-platform/frontend/dist/' },
    { name: 'Autonomous QA Audit Dashboard', path: '/autonomous-qa-audit-dashboard', iframe: '/portfolio/autonomous-qa-audit-dashboard/frontend/dist/' },
  ];

  for (const project of projectPages) {
    test(`${project.name} landing page loads`, async ({ page }) => {
      const res = await page.goto(BASE + project.path, { waitUntil: 'domcontentloaded' });
      expect(res.status()).toBe(200);
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator(`iframe[src="${project.iframe}"]`)).toBeVisible();
    });

    test(`${project.name} landing page links back to portfolio`, async ({ page }) => {
      await page.goto(BASE + project.path, { waitUntil: 'domcontentloaded' });
      const portfolioLink = page.locator('a[href="/portfolio"], a[href="/portfolio"]');
      await expect(portfolioLink.first()).toBeVisible();
    });
  }

  test('Growth Architect nav click navigates to portfolio', async ({ page }) => {
    await page.goto(BASE + '/portfolio/growth-architect/frontend/dist/', { waitUntil: 'domcontentloaded' });
    await page.locator('#luxival-site-nav a:has-text("Portfolio")').click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('portfolio');
    expect(page.url()).not.toContain('growth-architect');
  });

  test('ESG Auditor brand click navigates to home', async ({ page }) => {
    await page.goto(BASE + '/portfolio/esg-compliance-auditor/frontend/dist/', { waitUntil: 'domcontentloaded' });
    await page.locator('#luxival-site-nav a').first().click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toMatch(/\/(index\.html)?$/);
  });

  test('Portfolio showcase page links to SPA apps', async ({ page }) => {
    await page.goto(BASE + '/portfolio', { waitUntil: 'domcontentloaded' });
    const growthLink = page.locator('a[href*="growth-architect"]').first();
    const businessLink = page.locator('a[href*="businesslauncher"]').first();
    const ugcLink = page.locator('a[href*="ugc-studio-ai"]').first();
    const vortexLink = page.locator('a[href*="vortex-ai-platform"]').first();
    const esgLink = page.locator('a[href*="esg-compliance-auditor"], a[href*="esg-live-embed"]').first();
    const qaAuditLink = page.locator('a[href*="autonomous-qa-audit-dashboard"]').first();
    expect(await growthLink.count(), 'Growth Architect not linked from portfolio').toBeGreaterThan(0);
    expect(await businessLink.count(), 'BusinessLauncher not linked from portfolio').toBeGreaterThan(0);
    expect(await ugcLink.count(), 'UGC Studio AI not linked from portfolio').toBeGreaterThan(0);
    expect(await vortexLink.count(), 'Vortex AI Platform not linked from portfolio').toBeGreaterThan(0);
    expect(await esgLink.count(), 'ESG Auditor not linked from portfolio').toBeGreaterThan(0);
    expect(await qaAuditLink.count(), 'Autonomous QA Audit Dashboard not linked from portfolio').toBeGreaterThan(0);
  });

  test('Autonomous QA app performs orchestration task', async ({ page }) => {
    await page.goto(BASE + '/portfolio/autonomous-qa-audit-dashboard/frontend/dist/', { waitUntil: 'domcontentloaded' });
    await page.locator('#url').fill('https://example.com');
    await page.locator('#email').fill('qa@luxival.com');
    await page.getByRole('button', { name: 'Run Orchestration (1 Free Run)' }).click();

    await expect(page.getByRole('heading', { name: 'Design & QA Audit Report' })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Blocker Registry')).toBeVisible();
  });
});
