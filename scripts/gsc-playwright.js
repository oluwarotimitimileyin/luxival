#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { chromium } = require('@playwright/test');

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function toNonNegativeInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseArgs(argv) {
  const args = {
    sitemapUrl: 'https://www.luxival.com/sitemap.xml',
    resourceId: 'sc-domain:luxival.com',
    startUrl: null,
    limit: 63,
    offset: 0,
    requestIndexing: true,
    headed: true,
    profileDir: path.join(process.cwd(), '.playwright-gsc-profile'),
    timeoutMs: 60000,
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--sitemap') args.sitemapUrl = argv[++i] || args.sitemapUrl;
    else if (token === '--resource-id') args.resourceId = argv[++i] || args.resourceId;
    else if (token === '--start-url') args.startUrl = argv[++i] || null;
    else if (token === '--limit') args.limit = Number(argv[++i] || args.limit);
    else if (token === '--offset') args.offset = Number(argv[++i] || args.offset);
    else if (token === '--no-request-indexing') args.requestIndexing = false;
    else if (token === '--request-indexing') args.requestIndexing = true;
    else if (token === '--headless') args.headed = false;
    else if (token === '--headed') args.headed = true;
    else if (token === '--profile-dir') args.profileDir = argv[++i] || args.profileDir;
    else if (token === '--timeout-ms') args.timeoutMs = Number(argv[++i] || args.timeoutMs);
    else if (token === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  args.limit = toPositiveInt(args.limit, 63);
  args.offset = toNonNegativeInt(args.offset, 0);
  args.timeoutMs = toPositiveInt(args.timeoutMs, 60000);
  return args;
}

function printHelp() {
  console.log('Luxival Search Console Playwright helper');
  console.log('Usage:');
  console.log('  node scripts/gsc-playwright.js [--sitemap <url>] [--limit <n>] [--offset <n>] [--request-indexing|--no-request-indexing]');
  console.log('  node scripts/gsc-playwright.js [--headed|--headless] [--profile-dir <dir>] [--timeout-ms <n>]');
  console.log('\nDefault behavior: inspect sitemap URLs, request indexing for URLs that are not indexed, and reuse a persistent browser profile.');
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const nextUrl = new URL(res.headers.location, url).toString();
        resolve(fetchText(nextUrl));
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch sitemap [${res.statusCode}] ${url}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function loadUrlsFromSitemap(sitemapUrl) {
  const xml = sitemapUrl.startsWith('http://') || sitemapUrl.startsWith('https://')
    ? await fetchText(sitemapUrl)
    : fs.readFileSync(path.resolve(sitemapUrl), 'utf8');

  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
}

async function openInspectionSearch(page) {
  const searchButton = page.getByRole('button', { name: /^Search$/i });
  await searchButton.click();
  const input = page.getByRole('combobox', { name: /Inspect any URL in/i });
  await input.waitFor({ state: 'visible', timeout: 15000 });
  return input;
}

function classifyInspection(bodyText) {
  const indexed = /URL is on Google/i.test(bodyText) || /Page is indexed/i.test(bodyText);
  const notIndexed = /URL is not on Google/i.test(bodyText) || /Page is not indexed/i.test(bodyText);

  if (indexed) return 'indexed';
  if (notIndexed) return 'not-indexed';
  return 'unknown';
}

async function inspectUrl(page, url, timeoutMs, requestIndexing) {
  const input = await openInspectionSearch(page);
  await input.fill(url);
  await input.press('Enter');

  await page.waitForFunction((targetUrl) => document.body.innerText.includes(targetUrl), url, { timeout: timeoutMs }).catch(() => {});

  const bodyText = await page.locator('body').innerText();
  const status = classifyInspection(bodyText);

  let requestResult = 'skipped';
  if (requestIndexing && status === 'not-indexed') {
    const requestButton = page.getByRole('button', { name: /Request indexing/i }).first();
    if (await requestButton.count()) {
      await requestButton.click();
      requestResult = 'started';

      await page.waitForTimeout(2000);
      await page.waitForFunction(() => document.body.innerText.includes('Request again') || document.body.innerText.includes('Testing if live URL can be indexed'), null, { timeout: timeoutMs }).catch(() => {});
    } else {
      requestResult = 'missing-request-button';
    }
  }

  const latestBodyText = await page.locator('body').innerText();
  const summaryMatch = latestBodyText.match(/Page is (?:not )?indexed[^\n]*/i);

  return {
    url,
    status,
    requestResult,
    summary: summaryMatch ? summaryMatch[0] : 'No summary found',
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const urls = await loadUrlsFromSitemap(args.sitemapUrl);
  const targets = urls.slice(args.offset, args.offset + args.limit);

  if (!targets.length) {
    console.error('No URLs selected from sitemap.');
    process.exit(1);
  }

  console.log(`Loaded ${urls.length} sitemap URLs.`);
  console.log(`Inspecting ${targets.length} URL(s) from offset ${args.offset}.`);
  console.log(`Request indexing: ${args.requestIndexing ? 'enabled' : 'disabled'}`);

  const context = await chromium.launchPersistentContext(args.profileDir, {
    headless: !args.headed,
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });

  const page = context.pages()[0] || await context.newPage();
  const startUrl = args.startUrl || `https://search.google.com/search-console?resource_id=${encodeURIComponent(args.resourceId)}`;
  await page.goto(startUrl, { waitUntil: 'domcontentloaded' });

  if (/accounts\.google\.com/i.test(page.url())) {
    console.log('Google login detected. Sign in in the opened browser, then rerun the command.');
    await context.close();
    process.exit(1);
  }

  const results = [];

  for (let i = 0; i < targets.length; i++) {
    const url = targets[i];
    console.log(`\n[${i + 1}/${targets.length}] Inspecting ${url}`);

    try {
      const result = await inspectUrl(page, url, args.timeoutMs, args.requestIndexing);
      results.push(result);

      console.log(`  status: ${result.status}`);
      if (result.requestResult !== 'skipped') {
        console.log(`  request: ${result.requestResult}`);
      }
      console.log(`  summary: ${result.summary}`);
    } catch (error) {
      results.push({ url, status: 'error', requestResult: 'not-attempted', error: error.message });
      console.log(`  error: ${error.message}`);
    }
  }

  const indexedCount = results.filter((item) => item.status === 'indexed').length;
  const notIndexedCount = results.filter((item) => item.status === 'not-indexed').length;
  const errorCount = results.filter((item) => item.status === 'error').length;

  console.log('\nDone.');
  console.log(`Indexed: ${indexedCount}`);
  console.log(`Not indexed: ${notIndexedCount}`);
  console.log(`Errors: ${errorCount}`);

  await context.close();
}

main().catch((error) => {
  console.error('Fatal:', error);
  process.exit(1);
});