const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join(__dirname, '..', '_site');

const CANONICAL_CHROME_CSS = `<style id="luxival-shared-chrome">
#mainNav{position:fixed;top:0;left:0;right:0;z-index:200;background:rgba(10,11,15,.78);backdrop-filter:blur(20px);border-bottom:1px solid rgba(201,169,106,.08);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
#mainNav .nav-brand{font-size:1.2rem;font-weight:600;letter-spacing:3px;color:#C9A96A;text-decoration:none;white-space:nowrap}

/* ---- Neon Button ---- */
.neon-btn{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;padding:.55rem 1.6rem;font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;color:#C9A96A!important;text-decoration:none;border:none;border-radius:14px;background:rgba(201,169,106,.06)!important;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);transition:all .4s ease;cursor:pointer;min-height:40px;line-height:1;white-space:nowrap;box-shadow:0 0 0 1px rgba(201,169,106,.25),inset 0 1px 0 rgba(255,255,255,.04)}
.neon-btn::before{content:'';position:absolute;inset:-2.5px;border-radius:16px;background:conic-gradient(from var(--neon-angle,0deg),transparent 0deg,rgba(201,169,106,.05) 50deg,rgba(201,169,106,.35) 100deg,#C9A96A 140deg,rgba(255,255,255,.6) 170deg,#C9A96A 200deg,rgba(201,169,106,.35) 240deg,rgba(201,169,106,.05) 290deg,transparent 360deg);z-index:-2;animation:neonSpin 2.5s linear infinite;opacity:.65;transition:opacity .3s}
.neon-btn:hover::before{opacity:1}
.neon-btn::after{content:'';position:absolute;inset:2.5px;border-radius:12px;background:rgba(10,11,15,.93);z-index:-1;animation:neonPulse 3s ease-in-out infinite}
.neon-btn:hover{transform:translateY(-1px);box-shadow:0 0 0 1.5px rgba(201,169,106,.5),0 0 20px rgba(201,169,106,.2),0 0 40px rgba(201,169,106,.1),inset 0 1px 0 rgba(255,255,255,.06)}
@keyframes neonSpin{to{--neon-angle:360deg;transform:rotate(360deg)}}
@keyframes neonPulse{0%,100%{box-shadow:inset 0 0 6px rgba(201,169,106,.03)}50%{box-shadow:inset 0 0 14px rgba(201,169,106,.07)}}

.luxival-footer{background:#060608;color:#E8EBF2;padding:4.5rem 5% 2rem;border-top:1px solid rgba(201,169,106,.08);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.luxival-footer-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:3rem}
.luxival-footer h3{margin:0 0 .8rem;color:#C9A96A;font-size:1.05rem;font-weight:400;letter-spacing:1px}
.luxival-footer p{margin:.35rem 0;color:rgba(232,235,242,.62);font-size:.9rem;line-height:1.8}
.luxival-footer a{color:#C9A96A;text-decoration:none;opacity:.58;font-size:.75rem;letter-spacing:1.6px;text-transform:uppercase}
.luxival-footer a:hover{opacity:1}
.luxival-footer-links{display:flex;flex-direction:column;gap:.7rem}
.luxival-footer-social{display:flex;flex-wrap:wrap;gap:1rem;margin-top:1rem}
.luxival-footer-copy{max-width:1280px;margin:2.5rem auto 0;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.05);text-align:center;color:rgba(232,235,242,.36);font-size:.78rem;letter-spacing:1px}
.svc-icon{width:54px;height:54px;border-radius:14px;margin-bottom:1.2rem;display:grid;place-items:center;position:relative;background:linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 18px 44px rgba(0,0,0,.38);overflow:hidden}
.svc-icon::before{content:'';position:absolute;inset:-2px;border-radius:inherit;background:conic-gradient(from 0deg,transparent 0 58%,color-mix(in srgb,var(--card-accent,#C9A96A) 12%,transparent),var(--card-accent,#C9A96A),color-mix(in srgb,var(--card-accent,#C9A96A) 45%,white),color-mix(in srgb,var(--card-accent,#C9A96A) 12%,transparent),transparent 86%);animation:neonSpin 3.8s linear infinite}
.svc-icon::after{content:'';position:absolute;inset:2px;border-radius:12px;background:linear-gradient(145deg,#1a1c28,#0c0d14)}
.svc-icon svg{position:relative;z-index:1;width:27px;height:27px;fill:none;stroke:color-mix(in srgb,var(--card-accent,#C9A96A) 44%,white);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 8px var(--card-glow,rgba(201,169,106,.24)))}
@media(max-width:820px){#mainNav .nav-inner{gap:.8rem;padding:max(1rem,calc(env(safe-area-inset-top) + .75rem)) 1.25rem .9rem}#mainNav .nav-brand{font-size:1rem;letter-spacing:2px}#site-nav{gap:.6rem}.neon-btn{padding:.4rem .85rem;font-size:.7rem;min-height:34px;border-radius:12px}.neon-btn::before{border-radius:14px}.neon-btn::after{border-radius:10px}.lang-trigger{gap:.3rem;padding:.38rem .6rem}.luxival-footer-inner{grid-template-columns:1fr;gap:2rem}.luxival-footer{padding:3.5rem 1.25rem 1.5rem}}
</style>`;

const CANONICAL_FOOTER = `<footer class="luxival-footer">
  <div class="luxival-footer-inner">
    <div>
      <h3>Luxival</h3>
      <p>Varikkokaarre 7A<br>01700 Vantaa, Finland</p>
      <p>support@luxival.com<br>+358 50 351 8366</p>
      <div class="luxival-footer-social">
        <a href="https://www.instagram.com/luxivalfi/" target="_blank" rel="noopener">Instagram</a>
        <a href="https://www.linkedin.com/in/olakunleshopeju/recent-activity/all/" target="_blank" rel="noopener">LinkedIn</a>
        <a href="https://wa.me/+358503518366" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
    <div>
      <h3>Navigate</h3>
      <div class="luxival-footer-links">
        <a href="/">Home</a>
        <a href="/services">Services</a>
        <a href="/portfolio">Portfolio</a>
        <a href="/tourism">Tourism</a>
        <a href="/blog">Blog</a>
        <a href="/contact">Contact</a>
      </div>
    </div>
    <div>
      <h3>Legal</h3>
      <div class="luxival-footer-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/user-data-deletion">Data Deletion</a>
      </div>
    </div>
  </div>
  <div class="luxival-footer-copy">Luxival © 2026 · Digital, technical, tourism, and transport services</div>
</footer>`;

function buildNav(prefix) {
  return '<nav id="mainNav"></nav>';
}

const SPA_NAV = `<div id="luxival-site-nav">
  <nav style="position:sticky;top:0;z-index:9999;background:rgba(10,11,15,.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(201,169,106,.1);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><div class="nav-inner" style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0.8rem 2rem;width:100%">
    <a href="/" class="neon-btn" style="font-size:1rem;font-weight:600;letter-spacing:3px;padding:.4rem 1rem">LUXIVAL</a>
    <div style="display:flex;gap:.8rem;align-items:center;">
      <a href="/services" class="neon-btn" style="font-size:.72rem;padding:.4rem .9rem">Services</a>
      <a href="/portfolio" class="neon-btn" style="font-size:.72rem;padding:.4rem .9rem">Portfolio</a>
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

function injectCanonicalFooter(html) {
  const footerRegex = /<footer\b[^>]*>[\s\S]*?<\/footer>/i;
  if (footerRegex.test(html)) {
    return html.replace(footerRegex, CANONICAL_FOOTER);
  }
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, CANONICAL_FOOTER + '\n</body>');
  }
  return html + '\n' + CANONICAL_FOOTER + '\n';
}

function injectSpaNav(html) {
  if (html.includes('luxival-site-nav')) return html;
  return html.replace(/<div id="root">/, SPA_NAV + '\n  <div id="root">');
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
  let headLinks = '';
  if (!html.includes('/css/soft-ui.css')) {
    headLinks += '<link rel="stylesheet" href="/css/soft-ui.css?v=20260622-1">\n';
  }
  if (!html.includes('/css/neon.css')) {
    headLinks += '<link rel="stylesheet" href="/css/neon.css">\n';
  }
  if (headLinks) {
    result = result.replace(/<\/head>/i, headLinks + '</head>');
  }
  result = result.replace(/<style id=["']luxival-shared-chrome["'][\s\S]*?<\/style>\s*/i, '');
  result = result.replace(/<\/head>/i, CANONICAL_CHROME_CSS + '\n</head>');
  return result;
}

function injectI18nScript(html) {
  if (html.includes('/js/i18n.js')) return html;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, '  <script src="/js/i18n.js?v=20260625-1" defer></script>\n</body>');
  }
  return html + '\n<script src="/js/i18n.js?v=20260625-1" defer></script>\n';
}

function injectNavbarScript(html) {
  if (html.includes('/js/navbar.js')) return html;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, '  <script src="/js/navbar.js" defer></script>\n</body>');
  }
  return html + '\n<script src="/js/navbar.js" defer></script>\n';
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
  const rel = path.relative(SITE_DIR, file);
  if (rel.includes(path.sep + 'amp' + path.sep) || rel.startsWith('amp' + path.sep)) {
    skipped++;
    continue;
  }

  const original = fs.readFileSync(file, 'utf8');
  let result = removeUngatedSpeedInsights(original);
  result = injectHeadAssets(result);
  result = injectCanonicalFooter(result);
  result = injectI18nScript(result);
  result = injectNavbarScript(result);
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
    result = injectFunnelScript(result);
  } else if (result === original) {
    skipped++;
  }

  if (result !== original) {
    fs.writeFileSync(file, result, 'utf8');
  }
}

console.log(`inject-nav: ${updated} pages updated, ${spaInjected} SPA pages injected, ${consentInjected} consent scripts, ${chatInjected} chat widgets, ${skipped} skipped`);
