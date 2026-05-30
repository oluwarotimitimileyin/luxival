(function() {
  var SUPPORTED_LANGS = ['en', 'fi', 'sv', 'de', 'fr', 'it'];
  var DEFAULT_LANG = 'en';
  var TRANSLATIONS_URL = '/i18n/';

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
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    loadTranslations(lang);
  }

  function loadTranslations(lang) {
    if (lang === DEFAULT_LANG) {
      document.querySelectorAll('[data-i18n]').forEach(function(el) {
        if (el.dataset.i18nOriginal) el.innerHTML = el.dataset.i18nOriginal;
      });
      return;
    }
    fetch(TRANSLATIONS_URL + lang + '.json')
      .then(function(r) { return r.json(); })
      .then(function(translations) {
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
          var key = el.dataset.i18n;
          if (!el.dataset.i18nOriginal) el.dataset.i18nOriginal = el.innerHTML;
          if (translations[key]) el.innerHTML = translations[key];
        });
      })
      .catch(function() {});
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
      window.setTimeout(function() {
        var isOpen = links.classList.contains('open') || burger.classList.contains('open') || window.getComputedStyle(links).display === 'flex';
        document.body.classList.toggle('nav-open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
      }, 0);
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
    if (document.getElementById('lang-select')) return;
    var switcher = document.createElement('div');
    switcher.className = 'lang-switcher';
    switcher.innerHTML = '<select id="lang-select" aria-label="Select language">' +
      SUPPORTED_LANGS.map(function(l) {
        var names = {en:'English',fi:'Suomi',sv:'Svenska',de:'Deutsch',fr:'Francais',it:'Italiano'};
        return '<option value="' + l + '">' + (names[l] || l) + '</option>';
      }).join('') + '</select>';

    var nav = document.querySelector('nav');
    if (nav) {
      switcher.style.cssText = 'margin-left:auto;margin-right:1rem;';
      var burger = nav.querySelector('.nav-burger');
      if (burger) nav.insertBefore(switcher, burger);
      else nav.appendChild(switcher);
    }

    var select = switcher.querySelector('select');
    select.value = getPreferredLang();
    select.addEventListener('change', function() {
      setLang(this.value);
      closeMobileNav();
    });
  }

  var style = document.createElement('style');
  style.textContent = '#lang-select{background:rgba(255,255,255,.05);border:1px solid rgba(201,169,106,.2);color:#C9A96A;padding:.4rem .6rem;border-radius:2px;font-size:.72rem;letter-spacing:1px;cursor:pointer;font-family:inherit}#lang-select:focus{outline:none;border-color:#C9A96A}#lang-select option{background:#11131A;color:#E8EBF2}@media(max-width:768px){.lang-switcher{margin-left:auto!important;margin-right:.5rem!important}#lang-select{max-width:6.8rem}}';
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', function() {
    createLanguageSwitcher();
    enhanceMobileNav();
    setLang(getPreferredLang());
  });

  window.luxivalI18n = { setLang: setLang, getLang: getPreferredLang, closeMobileNav: closeMobileNav };
})();
