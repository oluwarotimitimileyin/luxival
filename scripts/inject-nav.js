const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join(__dirname, '..', '_site');

const CANONICAL_NAV_LINKS = `
    <li><a href="{{PREFIX}}index.html">Home</a></li>
    <li><a href="{{PREFIX}}services.html">Digital Services</a></li>
    <li><a href="{{PREFIX}}tourism.html">Tourism &amp; Transport</a></li>
    <li><a href="{{PREFIX}}portfolio.html">Portfolio</a></li>
    <li><a href="{{PREFIX}}qa.html">QA &amp; Audit</a></li>
    <li><a href="{{PREFIX}}about.html">About</a></li>
    <li><a href="{{PREFIX}}contact.html" class="btn" style="padding:.5rem 1.4rem;font-size:.72rem">Get Started</a></li>`;

function buildNav(prefix) {
  const links = CANONICAL_NAV_LINKS.replace(/\{\{PREFIX\}\}/g, prefix);
  return `<nav id="mainNav">
  <a href="${prefix}index.html" class="nav-brand">LUXIVAL</a>
  <ul class="nav-links" id="site-nav">${links}
  </ul>
  <button class="nav-burger" aria-label="Menu" aria-controls="site-nav" aria-expanded="false"><span></span><span></span><span></span></button>
</nav>`;
}

const SPA_NAV = `<div id="luxival-site-nav">
  <nav style="position:sticky;top:0;z-index:9999;display:flex;align-items:center;justify-content:space-between;padding:0.8rem 5%;background:rgba(10,11,15,.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(201,169,106,.1);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <a href="/index.html" style="font-size:1rem;font-weight:600;letter-spacing:3px;color:#C9A96A;text-decoration:none;">LUXIVAL</a>
    <div style="display:flex;gap:1.5rem;align-items:center;">
      <a href="/portfolio.html" style="font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:#C9A96A;opacity:.6;text-decoration:none;">Portfolio</a>
      <a href="/services.html" style="font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:#E8EBF2;opacity:.6;text-decoration:none;">Services</a>
      <a href="/about.html" style="font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:#E8EBF2;opacity:.6;text-decoration:none;">About</a>
      <a href="/contact.html" style="display:inline-block;background:#C9A96A;color:#0A0B0F;padding:.4rem 1.2rem;border-radius:2px;font-size:.72rem;letter-spacing:1px;text-transform:uppercase;text-decoration:none;font-weight:500;">Get Started</a>
    </div>
  </nav>
</div>`;

function getHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function getPrefix(filePath) {
  const rel = path.relative(SITE_DIR, filePath);
  const depth = rel.split(path.sep).length - 1;
  if (depth === 0) return '';
  if (rel.startsWith('blog')) return '/';
  return '../'.repeat(depth);
}

function isSpaDistFile(filePath) {
  const rel = path.relative(SITE_DIR, filePath);
  return rel.includes(path.join('portfolio')) && rel.includes(path.join('frontend', 'dist'));
}

function injectMainNav(html, prefix) {
  const navRegex = /<nav[^>]*id=["']mainNav["'][^>]*>[\s\S]*?<\/nav>/;
  const plainNavRegex = /<nav[^>]*>[\s\S]*?<\/nav>/;

  const canonical = buildNav(prefix);

  if (navRegex.test(html)) {
    return html.replace(navRegex, canonical);
  }
  if (plainNavRegex.test(html)) {
    return html.replace(plainNavRegex, canonical);
  }
  return html;
}

function injectSpaNav(html) {
  if (html.includes('luxival-site-nav')) return html;
  return html.replace(/<div id="root">/, SPA_NAV + '\n  <div id="root">');
}

let updated = 0;
let skipped = 0;
let spaInjected = 0;

const files = getHtmlFiles(SITE_DIR);

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let result;

  if (isSpaDistFile(file)) {
    result = injectSpaNav(original);
    if (result !== original) spaInjected++;
    else { skipped++; continue; }
  } else if (/<nav[\s>]/.test(original)) {
    const prefix = getPrefix(file);
    result = injectMainNav(original, prefix);
    if (result !== original) updated++;
    else { skipped++; continue; }
  } else {
    skipped++;
    continue;
  }

  fs.writeFileSync(file, result, 'utf8');
}

console.log(`inject-nav: ${updated} pages updated, ${spaInjected} SPA pages injected, ${skipped} skipped`);
