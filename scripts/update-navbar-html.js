#!/usr/bin/env node
/**
 * Batch-update all HTML files to:
 * 1. Clear the old nav inner content (keep <nav id="mainNav"></nav>)
 * 2. Add <script src="/js/navbar.js" defer></script> after i18n.js
 *
 * Run: node scripts/update-navbar-html.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* Files to skip (AMP pages, admin with different nav, portfolio sub-pages) */
const SKIP_PATTERNS = [
  '/amp/',
  '/admin.html',
  '/portfolio/',
  '/apps/',
  '/vault-ledger/',
  'esg-live-embed.html',
];

function shouldSkip(filePath) {
  const rel = path.relative(ROOT, filePath);
  return SKIP_PATTERNS.some(p => rel.includes(p));
}

/* Files that have <nav id="mainNav"> */
const FILES = [
  'about.html', 'audit.html', 'autonomous-qa-audit-dashboard.html',
  'booking.html', 'businesslauncher.html', 'contact.html', 'digital.html',
  'esg-compliance-auditor.html', 'finland-winter-travel.html',
  'growth-architect-backend.html', 'growth-architect.html',
  'helsinki-airport-pickup.html', 'helsinki-design-district.html',
  'hub.html', 'index.html', 'luxury-lapland.html', 'pattern.html',
  'platform.html', 'portfolio.html', 'privacy.html', 'qa.html',
  'services.html', 'terms.html', 'thank-you-digital.html',
  'thank-you-transfer.html', 'tourism-planning.html', 'tourism.html',
  'transfers.html', 'trip-planner.html', 'ubuntu-google-cloud-vm.html',
  'ugc-studio-ai.html', 'user-data-deletion.html', 'vortex-ai-platform.html',
  'services/ai-agents.html', 'services/airport-transfer.html',
  'services/city-to-city.html', 'services/electrical-design.html',
  'services/hotel-sourcing.html', 'services/mechanical-design.html',
  'services/private-pickup.html', 'services/private-rides.html',
  'services/sewing-pattern.html', 'services/software-testing.html',
  'services/tiktok-agency.html', 'services/web-design.html',
];

let modifiedCount = 0;
let errorCount = 0;

FILES.forEach(relPath => {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.warn('SKIP (not found):', relPath);
    return;
  }
  if (shouldSkip(filePath)) {
    console.warn('SKIP (pattern):', relPath);
    return;
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.error('ERROR reading:', relPath, e.message);
    errorCount++;
    return;
  }

  const orig = content;

  /* --- Step 1: Clear nav inner content --- */
  /* Match: <nav id="mainNav">...</nav> and replace with <nav id="mainNav"></nav> */
  content = content.replace(
    /<nav\s+id="mainNav">[\s\S]*?<\/nav>/g,
    '<nav id="mainNav"></nav>'
  );

  /* --- Step 2: Add navbar.js script after i18n.js --- */
  /* Match the i18n.js script tag and insert navbar.js after it */
  content = content.replace(
    /(<script\s+src="\/js\/i18n\.js[^"]*"[^>]*><\/script>)/g,
    '$1\n<script src="/js/navbar.js" defer></script>'
  );

  if (content === orig) {
    console.log('NO CHANGE:', relPath);
    return;
  }

  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('UPDATED:', relPath);
    modifiedCount++;
  } catch (e) {
    console.error('ERROR writing:', relPath, e.message);
    errorCount++;
  }
});

console.log(`\nDone. ${modifiedCount} files updated, ${errorCount} errors.`);
