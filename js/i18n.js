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

  document.addEventListener('DOMContentLoaded', function() {
    setLang(getPreferredLang());
  });

  function t(key, fallback) {
    var lang = getPreferredLang();
    if (lang === DEFAULT_LANG) return fallback || key;
    var bundle = translationCache[lang];
    if (bundle && bundle[key]) return bundle[key];
    return fallback || key;
  }

  window.luxivalI18n = { setLang: setLang, getLang: getPreferredLang, t: t };
})();
