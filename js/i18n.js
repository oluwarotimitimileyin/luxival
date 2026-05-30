(function() {
  var SUPPORTED_LANGS = ['en', 'fi', 'sv', 'de', 'fr', 'it'];
  var DEFAULT_LANG = 'en';
  var TRANSLATIONS_URL = '/i18n/';
  var GOOGLE_TRANSLATE_SCRIPT = 'https://translate.google.com/translate_a/element.js?cb=luxivalGoogleTranslateInit';
  var LANG_NAMES = {
    en: 'English',
    fi: 'Suomi',
    sv: 'Svenska',
    de: 'Deutsch',
    fr: 'Français',
    it: 'Italiano'
  };
  var googleTranslatePromise = null;
  var BUNDLED_TRANSLATIONS = {
    fi: {
      "nav.home": "Koti",
      "nav.about": "Meista",
      "nav.digital": "Digitaaliset",
      "nav.tourism": "Matkailu",
      "nav.transfers": "Kuljetukset",
      "nav.portfolio": "Portfolio",
      "nav.contact": "Yhteystiedot",
      "nav.qa": "Laadunvarmistus",
      "nav.booking": "Varaa",
      "nav.pattern": "Kaavat",
      "nav.platform": "Alusta",
      "nav.blog": "Blogi",
      "hero.title": "Helsingin premium-kuljetus- ja digitaalitoimisto",
      "hero.subtitle": "Lentokenttakuljetukset, verkkosuunnittelu, hakukoneoptimointi ja ohjelmistotestaus Helsingista kasin.",
      "cta.book": "Varaa nyt",
      "cta.quote": "Pyyda tarjous",
      "footer.copyright": "Luxival © 2026 · Ensiluokkaiset digitaaliset ja kuljetuskokemukset"
    },
    sv: {
      "nav.home": "Hem",
      "nav.about": "Om oss",
      "nav.digital": "Digitalt",
      "nav.tourism": "Resor",
      "nav.transfers": "Transfer",
      "nav.portfolio": "Portfolio",
      "nav.contact": "Kontakt",
      "nav.qa": "QA",
      "nav.booking": "Boka",
      "nav.pattern": "Monster",
      "nav.platform": "Plattform",
      "nav.blog": "Blogg",
      "hero.title": "Helsingfors premiumbyra for transfer och digitala tjanster",
      "hero.subtitle": "Flygplatstransfer, webbdesign, SEO och programvarutestning fran Helsingfors.",
      "cta.book": "Boka nu",
      "cta.quote": "Begär offert",
      "footer.copyright": "Luxival © 2026 · Premium digitala upplevelser och transportupplevelser"
    },
    de: {
      "nav.home": "Start",
      "nav.about": "Uber uns",
      "nav.digital": "Digital",
      "nav.tourism": "Reisen",
      "nav.transfers": "Transfers",
      "nav.portfolio": "Portfolio",
      "nav.contact": "Kontakt",
      "nav.qa": "QA",
      "nav.booking": "Buchen",
      "nav.pattern": "Schnittmuster",
      "nav.platform": "Plattform",
      "nav.blog": "Blog",
      "hero.title": "Helsinkis Premium-Agentur fur Chauffeur- und Digitalservices",
      "hero.subtitle": "Flughafentransfers, Webdesign, SEO und Softwaretests aus Helsinki.",
      "cta.book": "Jetzt buchen",
      "cta.quote": "Angebot anfragen",
      "footer.copyright": "Luxival © 2026 · Premium-Erlebnisse fur Digitales und Transport"
    },
    fr: {
      "nav.home": "Accueil",
      "nav.about": "A propos",
      "nav.digital": "Digital",
      "nav.tourism": "Voyage",
      "nav.transfers": "Transferts",
      "nav.portfolio": "Portfolio",
      "nav.contact": "Contact",
      "nav.qa": "QA",
      "nav.booking": "Reserver",
      "nav.pattern": "Patrons",
      "nav.platform": "Plateforme",
      "nav.blog": "Blog",
      "hero.title": "L'agence premium d'Helsinki pour chauffeurs et services digitaux",
      "hero.subtitle": "Transferts aeroport, design web, SEO et tests logiciels depuis Helsinki.",
      "cta.book": "Reserver",
      "cta.quote": "Demander un devis",
      "footer.copyright": "Luxival © 2026 · Experiences premium digitales et de transport"
    },
    it: {
      "nav.home": "Home",
      "nav.about": "Chi siamo",
      "nav.digital": "Digitale",
      "nav.tourism": "Viaggi",
      "nav.transfers": "Transfer",
      "nav.portfolio": "Portfolio",
      "nav.contact": "Contatti",
      "nav.qa": "QA",
      "nav.booking": "Prenota",
      "nav.pattern": "Modelli",
      "nav.platform": "Piattaforma",
      "nav.blog": "Blog",
      "hero.title": "L'agenzia premium di Helsinki per chauffeur e servizi digitali",
      "hero.subtitle": "Transfer aeroportuali, web design, SEO e test software da Helsinki.",
      "cta.book": "Prenota ora",
      "cta.quote": "Richiedi un preventivo",
      "footer.copyright": "Luxival © 2026 · Esperienze premium digitali e di trasporto"
    }
  };

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

  function syncLangInUrl(lang) {
    var url = new URL(window.location.href);
    if (lang === DEFAULT_LANG) url.searchParams.delete('lang');
    else url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
  }

  function getCookieDomains() {
    var host = window.location.hostname;
    if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      return [''];
    }
    var parts = host.split('.');
    var domains = [''];
    domains.push(host);
    if (parts.length >= 2) domains.push('.' + parts.slice(-2).join('.'));
    return domains.filter(function(value, index, arr) {
      return arr.indexOf(value) === index;
    });
  }

  function writeCookie(name, value, expiresAt) {
    getCookieDomains().forEach(function(domain) {
      var cookie = name + '=' + value + ';path=/;expires=' + expiresAt.toUTCString() + ';SameSite=Lax';
      if (domain) cookie += ';domain=' + domain;
      document.cookie = cookie;
    });
  }

  function setGoogleTranslateCookie(lang) {
    var expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    writeCookie('googtrans', '/en/' + lang, expiresAt);
  }

  function clearGoogleTranslateCookie() {
    writeCookie('googtrans', '', new Date(0));
  }

  function restoreOriginalContent() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      if (el.dataset.i18nOriginal) el.innerHTML = el.dataset.i18nOriginal;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      if (el.dataset.i18nPlaceholderOriginal) el.setAttribute('placeholder', el.dataset.i18nPlaceholderOriginal);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function(el) {
      if (el.dataset.i18nAriaLabelOriginal) el.setAttribute('aria-label', el.dataset.i18nAriaLabelOriginal);
    });
  }

  function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.dataset.i18n;
      if (!el.dataset.i18nOriginal) el.dataset.i18nOriginal = el.innerHTML;
      if (translations[key]) el.innerHTML = translations[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.dataset.i18nPlaceholder;
      if (!el.dataset.i18nPlaceholderOriginal) el.dataset.i18nPlaceholderOriginal = el.getAttribute('placeholder') || '';
      if (translations[key]) el.setAttribute('placeholder', translations[key]);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(function(el) {
      var key = el.dataset.i18nAriaLabel;
      if (!el.dataset.i18nAriaLabelOriginal) el.dataset.i18nAriaLabelOriginal = el.getAttribute('aria-label') || '';
      if (translations[key]) el.setAttribute('aria-label', translations[key]);
    });
  }

  function loadTranslations(lang) {
    restoreOriginalContent();
    if (lang === DEFAULT_LANG) return Promise.resolve();
    if (BUNDLED_TRANSLATIONS[lang]) {
      applyTranslations(BUNDLED_TRANSLATIONS[lang]);
      return Promise.resolve();
    }
    return fetch(TRANSLATIONS_URL + lang + '.json')
      .then(function(r) { return r.json(); })
      .then(applyTranslations)
      .catch(function() {});
  }

  function ensureGoogleTranslateHost() {
    if (document.getElementById('google_translate_element')) return;
    var host = document.createElement('div');
    host.id = 'google_translate_element';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);
  }

  function ensureGoogleTranslateStyles() {
    if (document.getElementById('luxival-google-translate-style')) return;
    var style = document.createElement('style');
    style.id = 'luxival-google-translate-style';
    style.textContent = '#google_translate_element{position:fixed;left:-9999px;bottom:0;opacity:0;pointer-events:none}.goog-te-banner-frame.skiptranslate,.goog-te-balloon-frame{display:none!important}body{top:0!important}';
    document.head.appendChild(style);
  }

  function waitForTranslateSelect(resolve, reject, attempt) {
    var select = document.querySelector('.goog-te-combo');
    if (select) {
      resolve(select);
      return;
    }
    if (attempt > 50) {
      reject(new Error('Translate control unavailable'));
      return;
    }
    window.setTimeout(function() {
      waitForTranslateSelect(resolve, reject, attempt + 1);
    }, 200);
  }

  function ensureGoogleTranslate() {
    if (googleTranslatePromise) return googleTranslatePromise;

    googleTranslatePromise = new Promise(function(resolve, reject) {
      function bootTranslator() {
        if (!(window.google && window.google.translate && window.google.translate.TranslateElement)) {
          return false;
        }
        try {
          ensureGoogleTranslateHost();
          if (!window.luxivalGoogleTranslateElement) {
            window.luxivalGoogleTranslateElement = new window.google.translate.TranslateElement({
              pageLanguage: DEFAULT_LANG,
              includedLanguages: SUPPORTED_LANGS.filter(function(lang) { return lang !== DEFAULT_LANG; }).join(','),
              autoDisplay: false
            }, 'google_translate_element');
          }
          waitForTranslateSelect(resolve, reject, 0);
          return true;
        } catch (error) {
          reject(error);
          return true;
        }
      }

      ensureGoogleTranslateStyles();
      ensureGoogleTranslateHost();

      window.luxivalGoogleTranslateInit = function() {
        bootTranslator();
      };

      if (bootTranslator()) return;

      if (!document.querySelector('script[data-google-translate]')) {
        var script = document.createElement('script');
        script.src = GOOGLE_TRANSLATE_SCRIPT;
        script.defer = true;
        script.setAttribute('data-google-translate', 'true');
        script.onerror = reject;
        document.head.appendChild(script);
      }

      var attempts = 0;
      var timer = window.setInterval(function() {
        attempts += 1;
        if (bootTranslator()) {
          window.clearInterval(timer);
        } else if (attempts > 50) {
          window.clearInterval(timer);
          reject(new Error('Translate script failed to load'));
        }
      }, 200);
    }).catch(function(error) {
      googleTranslatePromise = null;
      throw error;
    });

    return googleTranslatePromise;
  }

  function applyDocumentTranslation(lang) {
    if (lang === DEFAULT_LANG) return Promise.resolve();
    setGoogleTranslateCookie(lang);
    return ensureGoogleTranslate()
      .then(function(select) {
        if (select.value === lang) {
          select.dispatchEvent(new Event('change'));
          return;
        }
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      })
      .catch(function() {});
  }

  function hasAutoTranslationArtifacts() {
    return !!document.querySelector('.goog-te-combo') || document.cookie.indexOf('googtrans=') !== -1;
  }

  function setLang(lang, options) {
    options = options || {};
    if (SUPPORTED_LANGS.indexOf(lang) === -1) return;

    localStorage.setItem('luxival-lang', lang);
    syncLangInUrl(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';

    if (lang === DEFAULT_LANG) {
      clearGoogleTranslateCookie();
      loadTranslations(lang);
      if (!options.isInitial && hasAutoTranslationArtifacts()) {
        window.location.reload();
      }
      return;
    }

    loadTranslations(lang).finally(function() {
      applyDocumentTranslation(lang);
    });
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

    var nav = document.querySelector('nav');
    if (!nav) return;

    var switcher = document.createElement('div');
    switcher.className = 'lang-switcher';
    switcher.innerHTML = '<select id="lang-select" aria-label="Select language">' +
      SUPPORTED_LANGS.map(function(lang) {
        return '<option value="' + lang + '">' + (LANG_NAMES[lang] || lang) + '</option>';
      }).join('') + '</select>';

    switcher.style.cssText = 'margin-left:auto;margin-right:1rem;';
    var burger = nav.querySelector('.nav-burger');
    if (burger) nav.insertBefore(switcher, burger);
    else nav.appendChild(switcher);

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
    setLang(getPreferredLang(), { isInitial: true });
  });

  window.luxivalI18n = { setLang: setLang, getLang: getPreferredLang, closeMobileNav: closeMobileNav };
})();
