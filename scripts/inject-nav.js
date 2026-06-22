const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join(__dirname, '..', '_site');

const CANONICAL_NAV_LINKS = `
    <li><a href="/">Home</a></li>
    <li><a href="/tourism">Travel</a></li>
    <li><a href="/digital">Digital Services</a></li>
    <li><a href="/audit">Website Audit</a></li>
    <li><a href="/portfolio">Portfolio</a></li>
    <li><a href="/blog">Blog</a></li>
    <li><a href="/contact">Contact</a></li>
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
    <li><a href="/hub" class="btn" style="padding:.5rem 1.4rem;font-size:.72rem">Start Here</a></li>`;

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
      <a href="/digital" style="font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:#E8EBF2;opacity:.6;text-decoration:none;">Digital</a>
      <a href="/blog" style="font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:#E8EBF2;opacity:.6;text-decoration:none;">Blog</a>
      <a href="/audit" style="font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:#E8EBF2;opacity:.6;text-decoration:none;">Audit</a>
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

function injectFunnelScript(html) {
  if (html.includes('/js/funnel-ctas.js')) return html;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, '  <script src="/js/funnel-ctas.js?v=20260616-1" defer></script>\n</body>');
  }
  return html + '\n<script src="/js/funnel-ctas.js?v=20260616-1" defer></script>\n';
}

function removeUngatedSpeedInsights(html) {
  return html
    .replace(/\s*<!-- Vercel Speed Insights -->\s*/gi, '\n')
    .replace(/\s*<script>\s*window\.si\s*=\s*window\.si\s*\|\|\s*function\s*\(\)\s*\{\s*\(window\.siq\s*=\s*window\.siq\s*\|\|\s*\[\]\)\.push\(arguments\);?\s*\};?\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<script>\s*window\.si\s*=\s*window\.si\s*\|\|\s*function\s*\(\)\s*\{\s*\(window\.siq\s*=\s*window\.siq\s*\|\|\s*\[\]\)\.push\(arguments\)\s*\};?\s*<\/script>\s*/gi, '\n')
    .replace(/\s*<script[^>]+src=["']\/_vercel\/speed-insights\/script\.js["'][^>]*><\/script>\s*/gi, '\n');
}

function injectConsentScript(html) {
  if (html.includes('/js/consent-manager.js')) return html;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, '  <script src="/js/consent-manager.js?v=20260622-2" defer></script>\n</body>');
  }
  return html + '\n<script src="/js/consent-manager.js?v=20260622-2" defer></script>\n';
}

const FAVICON_LINKS = `<link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">`;

function injectHeadAssets(html) {
  let result = html;
  const hasFavicon = /<link[^>]*href=["']\/favicon\.ico["'][^>]*>/.test(html);
  if (!hasFavicon) {
    result = result.replace(/<\/head>/i, FAVICON_LINKS + '\n</head>');
  }
  if (!html.includes('/css/soft-ui.css')) {
    result = result.replace(/<\/head>/i, '<link rel="stylesheet" href="/css/soft-ui.css?v=20260622-1">\n</head>');
  }
  return result;
}

function injectChatWidget(html) {
  if (html.includes('/js/chat-widget.js')) return html;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, '  <script src="/js/chat-widget.js?v=20260623-1" defer></script>\n</body>');
  }
  return html + '\n<script src="/js/chat-widget.js?v=20260622-1" defer></script>\n';
}

let updated = 0;
let skipped = 0;
let spaInjected = 0;
let consentInjected = 0;
let chatInjected = 0;

const files = getHtmlFiles(SITE_DIR);

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let result = removeUngatedSpeedInsights(original);
  result = injectHeadAssets(result);
  const beforeConsent = result;
  result = injectConsentScript(result);
  if (result !== beforeConsent) consentInjected++;
  const beforeChat = result;
  result = injectChatWidget(result);
  if (result !== beforeChat) chatInjected++;

  let navChanged = false;
  if (isSpaDistFile(file)) {
    const beforeNav = result;
    result = injectSpaNav(result);
    navChanged = result !== beforeNav;
    if (navChanged) spaInjected++;
  } else if (/<nav[\s>]/.test(result)) {
    const prefix = getPrefix(file);
    const beforeNav = result;
    result = injectMainNav(result, prefix);
    navChanged = result !== beforeNav;
    if (navChanged) updated++;
  }

  if (navChanged) {
    result = injectSearchScript(result);
    result = injectFunnelScript(result);
  } else if (result === original) {
    skipped++;
  }

  if (result !== original) {
    fs.writeFileSync(file, result, 'utf8');
  }
}

console.log(`inject-nav: ${updated} pages updated, ${spaInjected} SPA pages injected, ${consentInjected} consent scripts, ${chatInjected} chat widgets, ${skipped} skipped`);
