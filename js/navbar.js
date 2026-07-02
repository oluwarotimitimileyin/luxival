(function () {
  'use strict';

  var nav = document.getElementById('mainNav');
  if (!nav) return;

  /* ---------- inject CSS ---------- */
  if (!document.getElementById('nv-styles')) {
    var s = document.createElement('style');
    s.id = 'nv-styles';
    s.textContent =
      '.nv-inner{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:1.2rem 2rem;width:100%}' +
      '.nav-brand{white-space:nowrap}' +
      '.nv-right{display:flex;align-items:center;gap:clamp(.4rem,1.5vw,1rem)}' +
      '.nv-lang,.nv-menu{position:relative;display:flex;align-items:center}' +
      '.nv-lang .lang-trigger{display:flex;align-items:center;gap:.42rem;padding:.45rem .7rem;background:rgba(201,169,106,.06)!important;border:1px solid rgba(201,169,106,.22);color:var(--gold);border-radius:999px;cursor:pointer;font-family:inherit;font-size:.78rem;letter-spacing:1.5px;text-transform:uppercase;transition:border-color .3s,box-shadow .3s;min-height:38px}' +
      '.nv-lang .lang-trigger:hover{border-color:rgba(201,169,106,.46);box-shadow:0 0 22px rgba(201,169,106,.12)}' +
      '.nv-lang .lang-trigger svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.7;flex:0 0 auto}' +
      '.nv-dropdown{position:absolute;top:100%;right:0;margin-top:.4rem;min-width:130px;background:rgba(17,19,26,.97);border:1px solid rgba(201,169,106,.2);border-radius:8px;padding:.35rem 0;z-index:300;opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .2s ease,visibility .2s ease,transform .2s ease;box-shadow:0 18px 50px rgba(0,0,0,.4)}' +
      '.nv-dropdown.open{opacity:1;visibility:visible;transform:translateY(0)}' +
      '.nv-dropdown-item{display:block;width:100%;text-align:left;padding:.55rem .9rem;background:none;border:none;color:#E8EBF2;font-size:.78rem;cursor:pointer;transition:background .18s,color .18s;font-family:inherit;letter-spacing:.3px;text-decoration:none;white-space:nowrap}' +
      '.nv-dropdown-item:hover,.nv-dropdown-item:focus{background:rgba(201,169,106,.08);color:var(--gold);outline:none}' +
      '.nv-dropdown-item.active{color:var(--gold)}' +
      '.menu-dropdown{min-width:170px}' +
      '.menu-trigger{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:5px;background:none;border:none;cursor:pointer;padding:.5rem;border-radius:6px;transition:background .2s;min-height:38px;min-width:38px}' +
      '.menu-trigger:hover{background:rgba(201,169,106,.06)}' +
      '.menu-trigger span{display:block;width:20px;height:2px;background:var(--gold);border-radius:1px;transition:transform .3s ease,opacity .3s ease}' +
      '.menu-trigger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}' +
      '.menu-trigger.open span:nth-child(2){opacity:0}' +
      '.menu-trigger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}' +
      '@media(max-width:768px){.nv-inner{padding:1rem 1.25rem}.nv-dropdown{position:fixed;top:calc(env(safe-area-inset-top,0px) + 62px);left:1rem;right:1rem;width:auto;margin-top:0}}' +
      '@media(prefers-reduced-motion:reduce){.nv-dropdown{transition:none!important}.menu-trigger span{transition:none!important}}';
    document.head.appendChild(s);
  }

  /* ---------- build HTML ---------- */
  var i18n = window.luxivalI18n || {};
  var t = function (k, fb) { return (i18n.t && i18n.t(k, fb)) || fb || k; };

  var SUPPORTED_LANGS = ['en', 'fi', 'sv', 'de', 'fr', 'it', 'ru', 'no', 'da', 'ja', 'zh'];
  var langNames = { en: 'English', fi: 'Suomi', sv: 'Svenska', de: 'Deutsch', fr: 'Français', it: 'Italiano', ru: 'Русский', no: 'Norsk', da: 'Dansk', ja: '日本語', zh: '中文' };
  var currentLang = (i18n.getLang && i18n.getLang()) || 'en';

  var menuItems = [
    { href: '/services', key: 'nav.services', label: 'Services' },
    { href: '/about', key: 'nav.about', label: 'About' },
    { href: '/portfolio', key: 'nav.portfolio', label: 'Portfolio' },
    { href: '/tourism', key: 'nav.tourism', label: 'Tourism' },
    { href: '/blog', key: 'nav.blog', label: 'Blog' },
    { href: '/contact', key: 'nav.contact', label: 'Contact' }
  ];

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
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function openDropdown(dd, btn) {
    dd.classList.add('open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
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
      if (i18n.setLang) i18n.setLang(lang);
      closeDropdown(langDropdown, langToggle);
      closeDropdown(menuDropdown, menuToggle);
    });
  }

  /* ---------- menu toggle ---------- */
  if (menuToggle && menuDropdown) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown(menuDropdown, menuToggle, langDropdown, langToggle);
      menuToggle.classList.toggle('open');
    });

    menuDropdown.addEventListener('click', function (e) {
      var link = e.target.closest('[role="menuitem"][href]');
      if (link) {
        closeAll();
        menuToggle.classList.remove('open');
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
      menuToggle.classList.remove('open');
    }
  });

  /* ---------- close on Escape ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (langDropdown && langDropdown.classList.contains('open')) closeDropdown(langDropdown, langToggle);
      if (menuDropdown && menuDropdown.classList.contains('open')) {
        closeDropdown(menuDropdown, menuToggle);
        menuToggle.classList.remove('open');
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
})();
