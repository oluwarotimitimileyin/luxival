#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://www.luxival.com';
const SITE_DIR = path.join(process.cwd(), '_site');
const SITEMAP_PATH = path.join(process.cwd(), 'sitemap.xml');
const ROBOTS_PATH = path.join(process.cwd(), 'robots.txt');

const REQUIRED_ROOT_FILES = [
  'sitemap.xml',
  'robots.txt',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-48x48.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'site.webmanifest',
];

const REQUIRED_HEAD_PATTERNS = [
  { name: 'favicon.ico', pattern: /<link\s+[^>]*(?:rel=["']icon["'][^>]*href=["']\/favicon\.ico["']|href=["']\/favicon\.ico["'][^>]*rel=["']icon["'])[^>]*>/i },
  { name: 'favicon-32x32', pattern: /<link\s+[^>]*(?:sizes=["']32x32["'][^>]*href=["']\/favicon-32x32\.png["']|href=["']\/favicon-32x32\.png["'][^>]*sizes=["']32x32["'])[^>]*>/i },
  { name: 'favicon-48x48', pattern: /<link\s+[^>]*(?:sizes=["']48x48["'][^>]*href=["']\/favicon-48x48\.png["']|href=["']\/favicon-48x48\.png["'][^>]*sizes=["']48x48["'])[^>]*>/i },
  { name: 'apple-touch-icon', pattern: /<link\s+[^>]*(?:rel=["']apple-touch-icon["'][^>]*href=["']\/apple-touch-icon\.png["']|href=["']\/apple-touch-icon\.png["'][^>]*rel=["']apple-touch-icon["'])[^>]*>/i },
  { name: 'site.webmanifest', pattern: /<link\s+[^>]*(?:rel=["']manifest["'][^>]*href=["']\/site\.webmanifest["']|href=["']\/site\.webmanifest["'][^>]*rel=["']manifest["'])[^>]*>/i },
];

const SEO_OPPORTUNITY_PATHS = [
  '/luxury-lapland',
  '/finland-winter-travel',
  '/helsinki-airport-pickup',
  '/helsinki-design-district',
  '/ubuntu-google-cloud-vm',
];

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
}

function pathFromUrl(url) {
  const parsed = new URL(url);
  return parsed.pathname.replace(/\/$/, '') || '/';
}

function htmlPathForUrl(url) {
  const urlPath = pathFromUrl(url);
  if (urlPath === '/') return path.join(SITE_DIR, 'index.html');
  return path.join(SITE_DIR, urlPath.slice(1), 'index.html');
}

function expectedCanonicalForUrl(url) {
  const parsed = new URL(url);
  if (parsed.pathname === '/amp/' || parsed.pathname.startsWith('/amp/')) {
    const normalizedPath = parsed.pathname.replace(/^\/amp/, '') || '/';
    return `${parsed.origin}${normalizedPath}`;
  }

  return url;
}

function extract(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

function extractAttribute(tag, name) {
  const pattern = new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  const match = tag.match(pattern);
  return match ? match[2].trim() : '';
}

function extractMetaDescription(html) {
  const tag = html.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
  if (!tag) return '';
  return extractAttribute(tag[0], 'content');
}

function extractCanonical(html) {
  const tag = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i);
  if (!tag) return '';
  return extractAttribute(tag[0], 'href');
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

function warn(condition, message, warnings) {
  if (!condition) warnings.push(message);
}

function main() {
  const failures = [];
  const warnings = [];

  assert(fs.existsSync(SITE_DIR), 'Missing _site/. Run npm run build before npm run seo:check.', failures);
  assert(fs.existsSync(SITEMAP_PATH), 'Missing sitemap.xml.', failures);
  assert(fs.existsSync(ROBOTS_PATH), 'Missing robots.txt.', failures);

  if (failures.length) {
    printResults(failures, warnings);
    process.exit(1);
  }

  for (const file of REQUIRED_ROOT_FILES) {
    assert(fs.existsSync(path.join(SITE_DIR, file)), `Built site is missing /${file}.`, failures);
  }

  const sitemapXml = read(SITEMAP_PATH);
  const sitemapUrls = parseSitemapUrls(sitemapXml);
  const sitemapPaths = new Set(sitemapUrls.map(pathFromUrl));

  assert(sitemapUrls.length > 0, 'sitemap.xml has no <loc> URLs.', failures);
  assert(read(ROBOTS_PATH).includes(`${SITE_URL}/sitemap.xml`), 'robots.txt does not reference the canonical sitemap URL.', failures);

  for (const url of sitemapUrls) {
    const expectedPrefix = `${SITE_URL}/`;
    assert(url === SITE_URL || url.startsWith(expectedPrefix), `Sitemap URL is outside ${SITE_URL}: ${url}`, failures);

    const htmlPath = htmlPathForUrl(url);
    assert(fs.existsSync(htmlPath), `Sitemap URL has no built HTML page: ${url}`, failures);
    if (!fs.existsSync(htmlPath)) continue;

    const html = read(htmlPath);
    const title = extract(html, /<title>([\s\S]*?)<\/title>/i);
    const description = extractMetaDescription(html);
    const canonical = extractCanonical(html);

    assert(title.length >= 10, `${url} is missing a useful <title>.`, failures);
    assert(description.length >= 40, `${url} is missing a useful meta description.`, failures);
    assert(canonical === expectedCanonicalForUrl(url), `${url} canonical mismatch: "${canonical || 'missing'}".`, failures);
    assert(!/<link\s+rel=["']icon["']\s+href=["']data:image\/svg\+xml/i.test(html), `${url} still uses inline SVG favicon.`, failures);

    for (const required of REQUIRED_HEAD_PATTERNS) {
      assert(required.pattern.test(html), `${url} is missing ${required.name} link.`, failures);
    }
  }

  for (const opportunityPath of SEO_OPPORTUNITY_PATHS) {
    warn(sitemapPaths.has(opportunityPath), `SEO opportunity page not in sitemap yet: ${opportunityPath}`, warnings);
  }

  printResults(failures, warnings);
  process.exit(failures.length ? 1 : 0);
}

function printResults(failures, warnings) {
  if (failures.length) {
    console.error('\nSEO check failed:');
    failures.forEach((item) => console.error(`- ${item}`));
  } else {
    console.log('SEO check passed.');
  }

  if (warnings.length) {
    console.log('\nSEO opportunities:');
    warnings.forEach((item) => console.log(`- ${item}`));
  }
}

main();
