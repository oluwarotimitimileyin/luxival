/**
 * Build-time script: replaces API key placeholders in _site/ output.
 * Run after `eleventy` build. Keys come from Vercel environment variables.
 */
const fs = require('fs');
const path = require('path');

const MAPS_KEY = process.env.GOOGLE_MAPS_PUBLIC_KEY || '';

if (!MAPS_KEY) {
  console.warn('[inject-env] WARNING: GOOGLE_MAPS_PUBLIC_KEY not set — fare calculator will not work.');
}

function walkDir(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, callback);
    else if (entry.isFile() && entry.name.endsWith('.html')) callback(full);
  }
}

const siteDir = path.join(__dirname, '..', '_site');
if (!fs.existsSync(siteDir)) {
  console.log('[inject-env] _site/ not found, skipping.');
  process.exit(0);
}

let replaced = 0;
walkDir(siteDir, (file) => {
  const original = fs.readFileSync(file, 'utf8');
  const updated = original.replaceAll('YOUR_GOOGLE_MAPS_PUBLIC_KEY', MAPS_KEY);
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    replaced++;
    console.log(`[inject-env] Injected key into: ${path.relative(siteDir, file)}`);
  }
});

console.log(`[inject-env] Done. ${replaced} file(s) updated.`);
