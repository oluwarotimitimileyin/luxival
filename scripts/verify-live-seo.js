#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = (process.env.LIVE_SEO_BASE_URL || process.env.SITE_URL || 'https://www.luxival.com').replace(/\/+$/, '');
const LIMIT = Number(process.env.LIVE_SEO_SITEMAP_LIMIT || 12);

const REQUIRED_PATHS = [
  '/',
  '/sitemap.xml',
  '/robots.txt',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon-48x48.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/site.webmanifest',
];

const REQUIRED_HOME_PATTERNS = [
  /<link\s+[^>]*href=["']\/favicon\.ico["'][^>]*>/i,
  /<link\s+[^>]*sizes=["']48x48["'][^>]*href=["']\/favicon-48x48\.png["'][^>]*>/i,
  /<link\s+[^>]*rel=["']apple-touch-icon["'][^>]*href=["']\/apple-touch-icon\.png["'][^>]*>/i,
  /<link\s+[^>]*rel=["']manifest["'][^>]*href=["']\/site\.webmanifest["'][^>]*>/i,
];

function request(url, method = 'GET', redirects = 0) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.request(url, { method, headers: { 'User-Agent': 'Luxival SEO verifier' } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
        res.resume();
        resolve(request(new URL(res.headers.location, url).toString(), method, redirects + 1));
        return;
      }

      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => resolve({ url, status: res.statusCode, headers: res.headers, body }));
    });

    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error(`Timed out: ${url}`)));
    req.end();
  });
}

function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
}

async function main() {
  const failures = [];

  for (const path of REQUIRED_PATHS) {
    const url = `${BASE_URL}${path}`;
    const response = await request(url);
    if (response.status !== 200) {
      failures.push(`${url} returned ${response.status}`);
    }
  }

  const home = await request(`${BASE_URL}/`);
  for (const pattern of REQUIRED_HOME_PATTERNS) {
    if (!pattern.test(home.body)) {
      failures.push(`Homepage is missing expected head tag: ${pattern}`);
    }
  }

  const sitemap = await request(`${BASE_URL}/sitemap.xml`);
  if (sitemap.status === 200) {
    const urls = parseSitemapUrls(sitemap.body).slice(0, LIMIT);
    for (const url of urls) {
      const response = await request(url);
      if (response.status !== 200) {
        failures.push(`Sitemap URL returned ${response.status}: ${url}`);
      }
    }
  }

  if (failures.length) {
    console.error('\nLive SEO verification failed:');
    failures.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }

  console.log(`Live SEO verification passed for ${BASE_URL}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
