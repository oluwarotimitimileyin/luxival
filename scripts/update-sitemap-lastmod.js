#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://www.luxival.com';
const SITEMAP_PATH = path.join(process.cwd(), 'sitemap.xml');

function today() {
  return new Date().toISOString().slice(0, 10);
}

function sourcePathForUrl(url) {
  const parsed = new URL(url);
  const pathname = parsed.pathname.replace(/\/$/, '') || '/';

  if (pathname === '/') return 'index.html';
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.split('/').filter(Boolean).pop();
    return path.join('blog', 'posts', `${slug}.md`);
  }

  return `${pathname.slice(1)}.html`;
}

function getChangedFiles() {
  const { execSync } = require('child_process');
  const output = execSync('git diff --name-only HEAD', { encoding: 'utf8' });
  return new Set(output.split(/\r?\n/).filter(Boolean));
}

function main() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('Missing sitemap.xml');
    process.exit(1);
  }

  const changedFiles = getChangedFiles();
  if (!changedFiles.size) {
    console.log('No changed files detected; sitemap lastmod unchanged.');
    return;
  }

  const nextDate = process.env.SITEMAP_LASTMOD_DATE || today();
  const original = fs.readFileSync(SITEMAP_PATH, 'utf8');
  let updated = original;
  let count = 0;

  updated = updated.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
    const locMatch = block.match(/<loc>(.*?)<\/loc>/);
    if (!locMatch) return block;

    const sourcePath = sourcePathForUrl(locMatch[1]);
    if (!changedFiles.has(sourcePath)) return block;

    count += 1;
    if (/<lastmod>.*?<\/lastmod>/.test(block)) {
      return block.replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${nextDate}</lastmod>`);
    }
    return block.replace(/<\/loc>/, `</loc>\n    <lastmod>${nextDate}</lastmod>`);
  });

  if (updated !== original) {
    fs.writeFileSync(SITEMAP_PATH, updated, 'utf8');
  }

  console.log(`Updated sitemap lastmod for ${count} changed URL(s).`);
}

main();
