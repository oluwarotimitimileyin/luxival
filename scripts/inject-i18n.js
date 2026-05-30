const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join(__dirname, '..', '_site');
const I18N_SCRIPT = '<script src="/js/i18n.js?v=20260530-6" defer></script>';

function walkDir(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      callback(fullPath);
    }
  }
}

if (!fs.existsSync(SITE_DIR)) {
  console.log('[inject-i18n] _site/ not found, skipping.');
  process.exit(0);
}

let updated = 0;
let skipped = 0;

walkDir(SITE_DIR, (filePath) => {
  const original = fs.readFileSync(filePath, 'utf8');
  if (original.includes('/js/i18n.js')) {
    skipped++;
    return;
  }

  const updatedHtml = original.includes('</body>')
    ? original.replace('</body>', `  ${I18N_SCRIPT}\n</body>`)
    : `${original}\n${I18N_SCRIPT}\n`;

  fs.writeFileSync(filePath, updatedHtml, 'utf8');
  updated++;
});

console.log(`[inject-i18n] ${updated} page(s) updated, ${skipped} already had i18n.`);
