#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_INPUT = path.join(process.cwd(), 'source-data', 'sitemap-urls.json');
const DEFAULT_OUTPUT = path.join(process.cwd(), 'sitemap.xml');
const MAX_URLS = 50000;
const MAX_BYTES = 50 * 1024 * 1024;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value);
}

function normalizeEntries(rawEntries) {
  if (!Array.isArray(rawEntries)) {
    throw new Error('Sitemap input must be a JSON array.');
  }

  const seen = new Set();
  return rawEntries.map((entry, index) => {
    const item = typeof entry === 'string' ? { loc: entry } : entry;
    if (!item || typeof item !== 'object') {
      throw new Error(`Entry ${index + 1} must be a URL string or object.`);
    }

    const loc = item.loc || item.url;
    if (!loc) throw new Error(`Entry ${index + 1} is missing "loc".`);
    const parsed = new URL(loc);
    if (parsed.protocol !== 'https:') throw new Error(`Entry ${index + 1} must use https: ${loc}`);
    if (parsed.hash || parsed.search) throw new Error(`Entry ${index + 1} must be canonical without query/hash: ${loc}`);
    if (seen.has(loc)) throw new Error(`Duplicate sitemap URL: ${loc}`);
    seen.add(loc);

    if (!item.lastmod || !isIsoDate(item.lastmod)) {
      throw new Error(`Entry ${index + 1} needs ISO-8601 lastmod, for example 2026-06-15.`);
    }

    return {
      loc,
      lastmod: item.lastmod,
      changefreq: item.changefreq,
      priority: item.priority,
    };
  });
}

function buildSitemap(entries) {
  if (entries.length > MAX_URLS) {
    throw new Error(`Sitemap has ${entries.length} URLs; split it before exceeding ${MAX_URLS}.`);
  }

  const urls = entries.map((entry) => {
    const lines = [
      '  <url>',
      `    <loc>${escapeXml(entry.loc)}</loc>`,
      `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`,
    ];
    if (entry.changefreq) lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
    if (entry.priority) lines.push(`    <priority>${escapeXml(entry.priority)}</priority>`);
    lines.push('  </url>');
    return lines.join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  if (Buffer.byteLength(xml, 'utf8') > MAX_BYTES) {
    throw new Error(`Sitemap exceeds ${MAX_BYTES} bytes; split it into multiple sitemap files.`);
  }

  return xml;
}

function main() {
  const inputPath = path.resolve(process.argv[2] || DEFAULT_INPUT);
  const outputPath = path.resolve(process.argv[3] || DEFAULT_OUTPUT);
  const rawEntries = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const entries = normalizeEntries(rawEntries);
  const xml = buildSitemap(entries);

  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Wrote ${entries.length} URLs to ${path.relative(process.cwd(), outputPath) || outputPath}`);
}

main();

