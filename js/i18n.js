(function() {
  var SUPPORTED_LANGS = ['en', 'fi', 'sv', 'de', 'fr', 'it', 'ru', 'no', 'da', 'ja', 'zh'];
  var DEFAULT_LANG = 'en';
  var TRANSLATIONS_URL = '/i18n/';
  var translationCache = {};

  function getPreferredLang() {
    var params = new URLSearchParams(window.location.search);
    var queryLang = params.get('lang');
    if (queryLang && SUPPORTED_LANGS.indexOf(queryLang) !== -1) return queryLang;
    var saved = localStorage.getItem('luxival-lang');
    if (saved && SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
    var browserLang = (navigator.language || '').split('-')[0];
    if (SUPPORTED_LANGS.indexOf(browserLang) !== -1) return browserLang;
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) return;
    localStorage.setItem('luxival-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
    loadTranslations(lang);
    document.dispatchEvent(new CustomEvent('luxival:language-changed', { detail: { lang: lang } }));
  }

  function loadTranslations(lang) {
    if (lang === DEFAULT_LANG) {
      document.querySelectorAll('[data-i18n]').forEach(function(el) {
        if (el.dataset.i18nOriginal) el.innerHTML = el.dataset.i18nOriginal;
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
        if (el.dataset.i18nPlaceholderOriginal) el.placeholder = el.dataset.i18nPlaceholderOriginal;
      });
      updateMeta(null);
      return;
    }
    if (translationCache[lang]) {
      applyTranslations(translationCache[lang]);
      return;
    }
    fetch(TRANSLATIONS_URL + lang + '.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        translationCache[lang] = data;
        applyTranslations(data);
      })
      .catch(function() {});
  }

  function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.dataset.i18n;
      if (!el.dataset.i18nOriginal) el.dataset.i18nOriginal = el.innerHTML;
      if (translations[key]) el.innerHTML = translations[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (!el.dataset.i18nPlaceholderOriginal) el.dataset.i18nPlaceholderOriginal = el.placeholder;
      if (translations[key]) el.placeholder = translations[key];
    });
    updateMeta(translations);
  }

  function updateMeta(translations) {
    var page = document.body.dataset.page || 'home';
    var titleKey = 'meta.' + page + '.title';
    var descKey = 'meta.' + page + '.desc';
    if (translations && translations[titleKey]) {
      document.title = translations[titleKey];
    } else if (!translations) {
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) document.title = ogTitle.content;
    }
    var descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      if (translations && translations[descKey]) {
        descMeta.content = translations[descKey];
      }
    }
  }

  function closeMobileNav() {
    var burger = document.querySelector('.nav-burger');
    var links = document.querySelector('.nav-links');
    if (!burger || !links) return;
    links.classList.remove('open');
    links.style.display = '';
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  function enhanceMobileNav() {
    var burger = document.querySelector('.nav-burger');
    var links = document.querySelector('.nav-links');
    if (!burger || !links) return;

    burger.addEventListener('click', function() {
      var isOpen = links.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', closeMobileNav);
    });

    document.addEventListener('click', function(event) {
      if (!links.classList.contains('open')) return;
      if (burger.contains(event.target) || links.contains(event.target)) return;
      closeMobileNav();
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') closeMobileNav();
    });
  }

  function createLanguageSwitcher() {
    var toggle = document.getElementById('lang-toggle');
    if (toggle && !toggle.dataset.luxivalBound) {
      toggle.dataset.luxivalBound = 'true';

      var dropdown = document.createElement('div');
      dropdown.id = 'lang-dropdown';
      dropdown.style.cssText = 'position:absolute;top:100%;right:0;margin-top:.4rem;background:rgba(17,19,26,.95);border:1px solid rgba(201,169,106,.25);border-radius:6px;padding:.4rem 0;min-width:120px;display:none;z-index:100;';

      var langNames = {en:'English',fi:'Suomi',sv:'Svenska',de:'Deutsch',fr:'Français',it:'Italiano',ru:'Русский',no:'Norsk',da:'Dansk',ja:'日本語',zh:'中文'};
      dropdown.innerHTML = SUPPORTED_LANGS.map(function(l) {
        return '<button data-lang="' + l + '" style="display:block;width:100%;text-align:left;padding:.5rem .8rem;background:none;border:none;color:#E8EBF2;font-size:.78rem;cursor:pointer;transition:background .2s">' + (langNames[l] || l) + '</button>';
      }).join('');

      var navLang = toggle.closest('.nav-lang');
      if (navLang) navLang.style.position = 'relative';
      navLang.appendChild(dropdown);

      dropdown.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-lang]');
        if (btn) {
          setLang(btn.getAttribute('data-lang'));
          closeMobileNav();
          dropdown.style.display = 'none';
        }
      });

      toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        var isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
      });

      document.addEventListener('click', function() {
        if (dropdown.style.display === 'block') dropdown.style.display = 'none';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    createLanguageSwitcher();
    enhanceMobileNav();
    setLang(getPreferredLang());
  });

  function t(key, fallback) {
    var lang = getPreferredLang();
    if (lang === DEFAULT_LANG) return fallback || key;
    var bundle = translationCache[lang];
    if (bundle && bundle[key]) return bundle[key];
    return fallback || key;
  }

  window.luxivalI18n = { setLang: setLang, getLang: getPreferredLang, t: t, closeMobileNav: closeMobileNav };
})();
