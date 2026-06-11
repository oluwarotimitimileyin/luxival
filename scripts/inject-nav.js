const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join(__dirname, '..', '_site');

const CANONICAL_NAV_LINKS = `
    <li><a href="/">Home</a></li>
    <li><a href="/services">Digital Services</a></li>
    <li><a href="/tourism">Tourism &amp; Transport</a></li>
    <li><a href="/portfolio">Portfolio</a></li>
    <li><a href="/blog">Blog</a></li>
    <li><a href="/qa">QA &amp; Audit</a></li>
    <li><a href="/about">About</a></li>
    <li class="nav-search-item">
      <div class="site-search" id="siteSearch" role="search">
        <label for="siteSearchInput" class="sr-only">Search</label>
        <div class="site-search-controls">
          <input id="siteSearchInput" class="site-search-input" type="search" autocomplete="off" placeholder="Search services, pages, or keywords" data-i18n-placeholder="search.placeholder" aria-autocomplete="list" aria-controls="siteSearchResults" aria-expanded="false" aria-label="Website search">
          <button type="button" class="site-search-button" id="siteSearchButton" aria-label="Search site">Search</button>
        </div>
        <div id="siteSearchResults" class="site-search-dropdown" role="listbox" hidden></div>
      </div>
    </li>
    <li><a href="/contact" class="btn" style="padding:.5rem 1.4rem;font-size:.72rem">Get Started</a></li>`;

function buildNav(prefix) {
  const links = CANONICAL_NAV_LINKS;
  return `<nav id="mainNav">
  <a href="/" class="nav-brand">LUXIVAL</a>
  <ul class="nav-links" id="site-nav">${links}
  </ul>
  <button class="nav-burger" aria-label="Menu" aria-controls="site-nav" aria-expanded="false"><span></span><span></span><span></span></button>
</nav>`;
}

const SPA_NAV = `<div id="luxival-site-nav">
  <nav style="position:sticky;top:0;z-index:9999;display:flex;align-items:center;justify-content:space-between;padding:0.8rem 5%;background:rgba(10,11,15,.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(201,169,106,.1);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <a href="/" style="font-size:1rem;font-weight:600;letter-spacing:3px;color:#C9A96A;text-decoration:none;">LUXIVAL</a>
    <div style="display:flex;gap:1.5rem;align-items:center;">
      <a href="/portfolio" style="font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:#C9A96A;opacity:.6;text-decoration:none;">Portfolio</a>
      <a href="/services" style="font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:#E8EBF2;opacity:.6;text-decoration:none;">Services</a>
      <a href="/blog" style="font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:#E8EBF2;opacity:.6;text-decoration:none;">Blog</a>
      <a href="/about" style="font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:#E8EBF2;opacity:.6;text-decoration:none;">About</a>
      <a href="/contact" style="display:inline-block;background:#C9A96A;color:#0A0B0F;padding:.4rem 1.2rem;border-radius:2px;font-size:.72rem;letter-spacing:1px;text-transform:uppercase;text-decoration:none;font-weight:500;">Get Started</a>
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

function injectSearchScript(html) {
  if (html.includes('/js/site-search.js')) return html;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, '  <script src="/js/site-search.js?v=20260609-2" defer></script>\n</body>');
  }
  return html + '\n<script src="/js/site-search.js?v=20260609-2" defer></script>\n';
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

  result = injectSearchScript(result);

  fs.writeFileSync(file, result, 'utf8');
}

console.log(`inject-nav: ${updated} pages updated, ${spaInjected} SPA pages injected, ${skipped} skipped`);
