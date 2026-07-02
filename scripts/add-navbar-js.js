#!/usr/bin/env node
/**
 * Second pass: add navbar.js to files that have an empty <nav id="mainNav">
 * but don't yet have the navbar.js script loaded.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_PATTERNS = ['/amp/', '/portfolio/', '/apps/', '/vault-ledger/'];

function shouldSkip(filePath) {
  const rel = path.relative(ROOT, filePath);
  return SKIP_PATTERNS.some(p => rel.includes(p));
}

/* audit.html has a unique nav structure - skip it */
const EXCLUDE = new Set(['audit.html']);

const TARGETS = [
  'about.html','autonomous-qa-audit-dashboard.html',
  'booking.html','businesslauncher.html','contact.html','digital.html',
  'esg-compliance-auditor.html','finland-winter-travel.html',
  'growth-architect-backend.html','growth-architect.html',
  'helsinki-airport-pickup.html','helsinki-design-district.html',
  'hub.html','index.html','luxury-lapland.html','pattern.html',
  'platform.html','portfolio.html','privacy.html','qa.html',
  'services.html','terms.html','thank-you-digital.html',
  'thank-you-transfer.html','tourism-planning.html','tourism.html',
  'transfers.html','trip-planner.html','ubuntu-google-cloud-vm.html',
  'ugc-studio-ai.html','user-data-deletion.html','vortex-ai-platform.html',
  'services/ai-agents.html','services/airport-transfer.html',
  'services/city-to-city.html','services/electrical-design.html',
  'services/hotel-sourcing.html','services/mechanical-design.html',
  'services/private-pickup.html','services/private-rides.html',
  'services/sewing-pattern.html','services/software-testing.html',
  'services/tiktok-agency.html','services/web-design.html',
];

let count = 0;
TARGETS.forEach(relPath => {
  if (EXCLUDE.has(relPath)) {
    console.log('SKIP:', relPath);
    return;
  }
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) return;
  if (shouldSkip(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const orig = content;

  // Skip if navbar.js already present
  if (content.includes('src="/js/navbar.js"') || content.includes("src='/js/navbar.js'")) return;

  // Add before </body>
  content = content.replace('</body>', '<script src="/js/navbar.js" defer></script>\n</body>');

  if (content === orig) return;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('ADDED navbar.js:', relPath);
  count++;
});

console.log(`\nDone. ${count} files updated.`);
