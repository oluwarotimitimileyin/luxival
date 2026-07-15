(function () {
  'use strict';

  var nav = document.getElementById('mainNav');
  if (!nav) return;
  if (nav.dataset.nvInitialized === 'true') return;
  nav.dataset.nvInitialized = 'true';

  var cfg = window.luxivalNavConfig || {};

  /* ---------- inject CSS ---------- */
  if (!document.getElementById('nv-styles')) {
    var s = document.createElement('style');
    s.id = 'nv-styles';
    s.textContent =
      '.nv-inner{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:1.2rem 2rem;width:100%}' +
      '.nav-brand{white-space:nowrap;min-width:0;overflow:hidden;text-overflow:ellipsis}' +
      '.nv-right{display:flex;align-items:center;gap:clamp(.4rem,1.5vw,1rem);min-width:0}' +
      '.nv-lang,.nv-menu{position:relative;display:flex;align-items:center}' +
      '.nv-lang .lang-trigger{display:flex;align-items:center;justify-content:center;gap:.42rem;padding:.45rem .7rem;background:rgba(201,169,106,.06)!important;border:1px solid rgba(201,169,106,.22);color:var(--gold);border-radius:999px;cursor:pointer;font-family:inherit;font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;transition:border-color .3s,box-shadow .3s;min-height:44px;min-width:44px}' +
      '.nv-lang .lang-trigger:hover{border-color:rgba(201,169,106,.46);box-shadow:0 0 22px rgba(201,169,106,.12)}' +
      '.nv-lang .lang-trigger svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.7;flex:0 0 auto}' +
      '.nv-dropdown{position:absolute;top:100%;right:0;margin-top:.4rem;min-width:130px;max-width:calc(100vw - 2rem);max-height:calc(100dvh - 5rem);overflow-y:auto;background:rgba(17,19,26,.97);border:1px solid rgba(201,169,106,.2);border-radius:8px;padding:.35rem 0;z-index:300;opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .2s ease,visibility .2s ease,transform .2s ease;box-shadow:0 18px 50px rgba(0,0,0,.4);-webkit-overflow-scrolling:touch}' +
      '.nv-dropdown.open{opacity:1;visibility:visible;transform:translateY(0)}' +
      '.nv-dropdown-item{display:flex;align-items:center;width:100%;min-height:44px;text-align:left;padding:.55rem .9rem;background:none;border:none;color:#E8EBF2;font-size:.78rem;cursor:pointer;transition:background .18s,color .18s;font-family:inherit;letter-spacing:.3px;text-decoration:none;white-space:nowrap}' +
      '.nv-dropdown-item:hover,.nv-dropdown-item:focus{background:rgba(201,169,106,.08);color:var(--gold);outline:none}' +
      '.nv-dropdown-item.active{color:var(--gold)}' +
      '.menu-dropdown{min-width:170px}' +
      '.menu-trigger{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:5px;background:none;border:none;cursor:pointer;padding:.5rem;border-radius:6px;transition:background .2s;min-height:44px;min-width:44px}' +
      '.menu-trigger:hover{background:rgba(201,169,106,.06)}' +
      '.menu-trigger span{display:block;width:20px;height:2px;background:var(--gold);border-radius:1px;transition:transform .3s ease,opacity .3s ease}' +
      '.menu-trigger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}' +
      '.menu-trigger.open span:nth-child(2){opacity:0}' +
      '.menu-trigger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}' +
      '@media(max-width:820px){.nv-inner{padding:1rem clamp(1rem,4vw,1.25rem)}.nav-brand{font-size:1rem;letter-spacing:2px}.nv-right{gap:.35rem}.nv-dropdown{position:fixed;top:calc(env(safe-area-inset-top,0px) + 62px);left:1rem;right:1rem;width:auto;margin-top:0;max-height:calc(100dvh - 5rem);overflow-y:auto}.menu-dropdown,.nv-lang .nv-dropdown{min-width:0}}' +
      '@media(max-width:480px){.nv-inner{padding:.9rem .75rem}.nv-dropdown{left:.5rem;right:.5rem}.menu-trigger span{width:18px}}' +
      '@media(prefers-reduced-motion:reduce){.nv-dropdown{transition:none!important}.menu-trigger span{transition:none!important}}';
    document.head.appendChild(s);
  }

  /* ---------- build HTML ---------- */
  var i18n = window.luxivalI18n || {};
  var t = function (k, fb) { return (i18n.t && i18n.t(k, fb)) || fb || k; };

  var SUPPORTED_LANGS = cfg.supportedLangs || ['en', 'fi', 'sv', 'de', 'fr', 'it', 'ru', 'no', 'da', 'ja', 'zh'];
  var langNames = cfg.langNames || { en: 'English', fi: 'Suomi', sv: 'Svenska', de: 'Deutsch', fr: 'Français', it: 'Italiano', ru: 'Русский', no: 'Norsk', da: 'Dansk', ja: '日本語', zh: '中文' };
  var menuItems = cfg.items || [
    { href: '/services', key: 'nav.services', label: 'Services' },
    { href: '/about', key: 'nav.about', label: 'About' },
    { href: '/portfolio', key: 'nav.portfolio', label: 'Portfolio' },
    { href: '/tourism', key: 'nav.tourism', label: 'Tourism' },
    { href: '/blog', key: 'nav.blog', label: 'Blog' },
    { href: '/contact', key: 'nav.contact', label: 'Contact' }
  ];
  var currentLang = (i18n.getLang && i18n.getLang()) || 'en';

  var langOptions = SUPPORTED_LANGS.map(function (l) {
    var cls = l === currentLang ? 'nv-dropdown-item active' : 'nv-dropdown-item';
    return '<button class="' + cls + '" data-lang="' + l + '" role="menuitem">' + (langNames[l] || l) + '</button>';
  }).join('');

  var menuLinks = menuItems.map(function (item) {
    return '<a href="' + item.href + '" class="nv-dropdown-item" role="menuitem" data-i18n="' + item.key + '">' + t(item.key, item.label) + '</a>';
  }).join('');

  var html =
    '<div class="nv-inner">' +
      '<a href="/" class="nav-brand">LUXIVAL</a>' +
      '<div class="nv-right">' +
        '<div class="nv-lang">' +
          '<button id="nv-lang-toggle" class="lang-trigger" aria-label="Change language" aria-expanded="false" aria-controls="nv-lang-dropdown">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.4 3.8 5.4 3.8 9S14.5 18.6 12 21"/><path d="M12 3c-2.5 2.4-3.8 5.4-3.8 9s1.3 6.6 3.8 9"/></svg>' +
          '</button>' +
          '<div id="nv-lang-dropdown" class="nv-dropdown" role="menu" aria-label="Select language">' + langOptions + '</div>' +
        '</div>' +
        '<div class="nv-menu">' +
          '<button id="nv-menu-toggle" class="menu-trigger" aria-label="Open menu" aria-expanded="false" aria-controls="nv-menu-dropdown">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
          '<div id="nv-menu-dropdown" class="nv-dropdown menu-dropdown" role="menu" aria-label="Navigation">' + menuLinks + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  nav.innerHTML = html;

  /* ---------- state ---------- */
  var langToggle = document.getElementById('nv-lang-toggle');
  var langDropdown = document.getElementById('nv-lang-dropdown');
  var menuToggle = document.getElementById('nv-menu-toggle');
  var menuDropdown = document.getElementById('nv-menu-dropdown');

  function closeAll() {
    langDropdown && closeDropdown(langDropdown, langToggle);
    menuDropdown && closeDropdown(menuDropdown, menuToggle);
  }

  function closeDropdown(dd, btn) {
    dd.classList.remove('open');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('open');
    }
  }

  function openDropdown(dd, btn) {
    dd.classList.add('open');
    if (btn) {
      btn.setAttribute('aria-expanded', 'true');
      btn.classList.add('open');
    }
  }

  function toggleDropdown(dd, btn, otherDD, otherBtn) {
    if (dd.classList.contains('open')) {
      closeDropdown(dd, btn);
    } else {
      closeDropdown(otherDD, otherBtn);
      openDropdown(dd, btn);
    }
  }

  /* ---------- lang toggle ---------- */
  if (langToggle && langDropdown) {
    langToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown(langDropdown, langToggle, menuDropdown, menuToggle);
    });

    langDropdown.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-lang]');
      if (!btn) return;
      var lang = btn.getAttribute('data-lang');
      if (i18n.setLang) {
        i18n.setLang(lang);
      } else {
        try { localStorage.setItem('luxival-lang', lang); } catch (err) {}
        document.documentElement.lang = lang;
      }
      closeDropdown(langDropdown, langToggle);
      closeDropdown(menuDropdown, menuToggle);
    });
  }

  /* ---------- menu toggle ---------- */
  if (menuToggle && menuDropdown) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown(menuDropdown, menuToggle, langDropdown, langToggle);
    });

    menuDropdown.addEventListener('click', function (e) {
      var link = e.target.closest('[role="menuitem"][href]');
      if (link) {
        closeAll();
      }
    });
  }

  /* ---------- close on outside click ---------- */
  document.addEventListener('click', function (e) {
    if (langDropdown && langDropdown.classList.contains('open') && !langToggle.contains(e.target) && !langDropdown.contains(e.target)) {
      closeDropdown(langDropdown, langToggle);
    }
    if (menuDropdown && menuDropdown.classList.contains('open') && !menuToggle.contains(e.target) && !menuDropdown.contains(e.target)) {
      closeDropdown(menuDropdown, menuToggle);
    }
  });

  /* ---------- close on Escape ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (langDropdown && langDropdown.classList.contains('open')) closeDropdown(langDropdown, langToggle);
      if (menuDropdown && menuDropdown.classList.contains('open')) {
        closeDropdown(menuDropdown, menuToggle);
      }
    }
  });

  /* ---------- language change listener ---------- */
  document.addEventListener('luxival:language-changed', function () {
    var newLang = i18n.getLang && i18n.getLang();
    if (!newLang) return;

    /* update active state in lang dropdown */
    if (langDropdown) {
      langDropdown.querySelectorAll('[data-lang]').forEach(function (el) {
        el.classList.toggle('active', el.getAttribute('data-lang') === newLang);
      });
    }

    /* update menu link text from translations */
    if (i18n.t) {
      menuDropdown && menuDropdown.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        var fb = el.textContent;
        el.textContent = i18n.t(key, fb);
      });
    }
  });

  /* ---------- keyboard nav within dropdowns ---------- */
  function trapTab(dd, btn, e) {
    if (e.key !== 'Tab') return;
    var items = dd.querySelectorAll('[role="menuitem"]');
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (langDropdown) {
    langDropdown.addEventListener('keydown', function (e) { trapTab(langDropdown, langToggle, e); });
  }
  if (menuDropdown) {
    menuDropdown.addEventListener('keydown', function (e) { trapTab(menuDropdown, menuToggle, e); });
  }

  /* ---------- contextual internal links ---------- */
  function injectInternalLinks() {
    var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    if (currentPath.indexOf('/services/') === 0) return;
    if (document.querySelector('[data-internal-links]')) return;

    var linkSets = {
      '/': {
        heading: 'Explore More on Luxival',
        intro: 'Jump directly to core pages and keep browsing through related services and guides.',
        links: [
          { href: '/web-design-helsinki', label: 'Web Design in Helsinki' },
          { href: '/seo-services-finland', label: 'SEO Services in Finland' },
          { href: '/website-audit-service', label: 'Website Audit Service' },
          { href: '/helsinki-airport-transfer', label: 'Helsinki Airport Transfer' },
          { href: '/private-city-to-city-transfer-finland', label: 'Private City-to-City Transfer Finland' },
          { href: '/tourism', label: 'Finland Tourism Planning' },
          { href: '/contact', label: 'Contact Luxival' }
        ]
      },
      '/services': {
        heading: 'Popular Service Paths',
        intro: 'Compare service categories and continue to the exact offer you need.',
        links: [
          { href: '/web-design-helsinki', label: 'Web Design in Helsinki' },
          { href: '/seo-services-finland', label: 'SEO Services in Finland' },
          { href: '/qa-testing-services-helsinki', label: 'QA Testing Services in Helsinki' },
          { href: '/ai-automation-small-businesses', label: 'AI Automation for Small Businesses' },
          { href: '/chatbot-development-businesses', label: 'Chatbot Development for Businesses' },
          { href: '/contact', label: 'Start a Project' }
        ]
      },
      '/tourism': {
        heading: 'Plan Your Finland Trip',
        intro: 'Continue with practical travel pages for airports, city experiences, and winter routes.',
        links: [
          { href: '/finland-travel-planning', label: 'Finland Travel Planning' },
          { href: '/helsinki-airport-transfer', label: 'Helsinki Airport Transfer' },
          { href: '/private-city-to-city-transfer-finland', label: 'Private City-to-City Transfer Finland' },
          { href: '/luxury-lapland', label: 'Luxury Lapland Experiences' },
          { href: '/helsinki-design-district', label: 'Helsinki Design District Guide' },
          { href: '/tourism-planning', label: 'Trip Planning Service' },
          { href: '/contact', label: 'Request a Custom Itinerary' }
        ]
      },
      '/digital': {
        heading: 'Grow Your Digital Presence',
        intro: 'Move from strategy into implementation with service and proof pages.',
        links: [
          { href: '/web-design-helsinki', label: 'Web Design in Helsinki' },
          { href: '/seo-services-finland', label: 'SEO Services in Finland' },
          { href: '/qa-testing-services-helsinki', label: 'QA Testing Services in Helsinki' },
          { href: '/website-audit-service', label: 'Website Audit Service' },
          { href: '/ai-automation-small-businesses', label: 'AI Automation for Small Businesses' },
          { href: '/chatbot-development-businesses', label: 'Chatbot Development for Businesses' },
          { href: '/contact', label: 'Book a Discovery Call' }
        ]
      },
      '/transfers': {
        heading: 'Transfer Planning Shortcuts',
        intro: 'Browse route-specific pages before booking your private ride.',
        links: [
          { href: '/helsinki-airport-transfer', label: 'Helsinki Airport Transfer' },
          { href: '/private-city-to-city-transfer-finland', label: 'Private City-to-City Transfer Finland' },
          { href: '/services/airport-transfer', label: 'Airport Transfer Details' },
          { href: '/services/city-to-city', label: 'City-to-City Service Details' },
          { href: '/finland-travel-planning', label: 'Finland Travel Planning' },
          { href: '/contact', label: 'Ask for a Custom Route' }
        ]
      },
      '/qa': {
        heading: 'Website Audit Journey',
        intro: 'Move from diagnostics to implementation with these related pages.',
        links: [
          { href: '/audit', label: 'Audit Scanner' },
          { href: '/autonomous-qa-audit-dashboard', label: 'QA Dashboard' },
          { href: '/services/software-testing', label: 'Software Testing Service' },
          { href: '/growth-architect-backend', label: 'Backend Growth Architect' },
          { href: '/platform', label: 'Platform Overview' },
          { href: '/contact', label: 'Request a QA Plan' }
        ]
      }
    };

    var fallback = {
      heading: 'Continue Exploring',
      intro: 'Keep navigating through service, tourism, and planning pages.',
      links: [
        { href: '/services', label: 'Services' },
        { href: '/tourism', label: 'Tourism' },
        { href: '/digital', label: 'Digital' },
        { href: '/portfolio', label: 'Portfolio' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' }
      ]
    };

    var config = linkSets[currentPath] || fallback;
    if (!config.links || !config.links.length) return;

    if (!document.getElementById('nv-internal-links-style')) {
      var style = document.createElement('style');
      style.id = 'nv-internal-links-style';
      style.textContent =
        '.nv-internal-links{padding:3.2rem 0;border-top:1px solid rgba(201,169,106,.1);border-bottom:1px solid rgba(201,169,106,.1);background:rgba(201,169,106,.02)}' +
        '.nv-internal-links .container{max-width:1280px;margin:0 auto;padding:0 2rem}' +
        '.nv-internal-links h2{font-size:clamp(1.3rem,2.2vw,1.9rem);margin:0 0 .6rem;color:var(--text,#E8EBF2)}' +
        '.nv-internal-links p{margin:0 0 1.2rem;opacity:.72;max-width:780px}' +
        '.nv-internal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem}' +
        '.nv-internal-grid a{display:flex;align-items:center;min-height:52px;padding:.72rem .9rem;border:1px solid rgba(255,255,255,.09);border-radius:6px;background:rgba(17,19,26,.7);color:var(--text,#E8EBF2);text-decoration:none;transition:border-color .2s,transform .2s,background .2s}' +
        '.nv-internal-grid a:hover{border-color:rgba(201,169,106,.38);transform:translateY(-1px);background:rgba(201,169,106,.08)}' +
        '@media(max-width:900px){.nv-internal-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
        '@media(max-width:640px){.nv-internal-links{padding:2.4rem 0}.nv-internal-links .container{padding:0 1rem}.nv-internal-grid{grid-template-columns:1fr}}';
      document.head.appendChild(style);
    }

    var section = document.createElement('section');
    section.className = 'nv-internal-links';
    section.setAttribute('data-internal-links', '');
    section.innerHTML =
      '<div class="container">' +
        '<h2>' + config.heading + '</h2>' +
        '<p>' + config.intro + '</p>' +
        '<div class="nv-internal-grid">' +
          config.links.map(function (item) {
            return '<a href="' + item.href + '">' + item.label + '</a>';
          }).join('') +
        '</div>' +
      '</div>';

    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(section, footer);
      return;
    }

    var main = document.querySelector('main');
    if (main && main.parentNode) {
      main.parentNode.insertBefore(section, main.nextSibling);
    }
  }

  function applyMobileLitePerformance() {
    var isNarrow = window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var saveData = !!(conn && conn.saveData);
    var slowType = !!(conn && conn.effectiveType && /2g|slow-2g/i.test(conn.effectiveType));
    if (!isNarrow && !saveData && !slowType) return;

    if (!document.getElementById('nv-mobile-lite-style')) {
      var lite = document.createElement('style');
      lite.id = 'nv-mobile-lite-style';
      lite.textContent =
        'html,body{overflow-x:hidden !important}' +
        '.reveal,[data-tilt],.card,.hover-card,.svc,.proj,.social-video-card{transition:none !important;animation:none !important;transform:none !important}' +
        '.btn,a,button,input,select,textarea{min-height:44px}' +
        'p,li,a,button,input,select,textarea{font-size:16px}';
      document.head.appendChild(lite);
    }

    var imgs = document.querySelectorAll('img');
    imgs.forEach(function (img, idx) {
      if (!img.hasAttribute('loading') && idx > 0) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
      if (!img.hasAttribute('fetchpriority') && idx > 0) img.setAttribute('fetchpriority', 'low');
    });

    document.querySelectorAll('iframe').forEach(function (frame) {
      if (!frame.hasAttribute('loading')) frame.setAttribute('loading', 'lazy');
    });

    document.querySelectorAll('video').forEach(function (video) {
      video.pause();
      video.removeAttribute('autoplay');
      video.removeAttribute('loop');
      video.setAttribute('preload', 'none');
      var poster = video.getAttribute('poster') || video.getAttribute('data-mobile-poster');
      if (poster) {
        var image = document.createElement('img');
        image.src = poster;
        image.alt = video.getAttribute('aria-label') || video.getAttribute('title') || 'Video preview image';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.style.width = '100%';
        image.style.height = 'auto';
        image.style.display = 'block';
        video.parentNode && video.parentNode.insertBefore(image, video);
        video.style.display = 'none';
      }
    });
  }

  injectInternalLinks();
  applyMobileLitePerformance();
})();
