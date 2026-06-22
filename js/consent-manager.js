(function() {
  'use strict';

  var CONSENT_KEY = 'luxival-consent-v1';
  var LEGACY_GT_CONSENT_KEY = 'luxival-gt-consent';
  var CONSENT_VERSION = 1;

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      // Consent UI still works for the session if storage is unavailable.
    }
  }

  function defaultState() {
    return {
      version: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
      categories: {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false
      }
    };
  }

  function normalizeState(state) {
    if (!state || state.version !== CONSENT_VERSION || !state.categories) return null;
    return {
      version: CONSENT_VERSION,
      updatedAt: state.updatedAt || new Date().toISOString(),
      categories: {
        necessary: true,
        functional: state.categories.functional === true,
        analytics: state.categories.analytics === true,
        marketing: state.categories.marketing === true
      }
    };
  }

  function readState() {
    var raw = storageGet(CONSENT_KEY);
    if (!raw) return null;
    try {
      return normalizeState(JSON.parse(raw));
    } catch (err) {
      return null;
    }
  }

  function saveState(state) {
    var normalized = normalizeState(state) || defaultState();
    normalized.updatedAt = new Date().toISOString();
    storageSet(CONSENT_KEY, JSON.stringify(normalized));
    document.dispatchEvent(new CustomEvent('luxival:consent-changed', { detail: normalized }));
    applyConsentedScripts(normalized);
    return normalized;
  }

  function stateFromCategories(categories) {
    var state = defaultState();
    state.categories.functional = !!(categories && categories.functional);
    state.categories.analytics = !!(categories && categories.analytics);
    state.categories.marketing = !!(categories && categories.marketing);
    return state;
  }

  function migrateLegacyTranslateConsent() {
    if (readState()) return;
    var legacy = storageGet(LEGACY_GT_CONSENT_KEY);
    if (legacy !== 'true' && legacy !== 'false') return;
    saveState(stateFromCategories({ functional: legacy === 'true' }));
  }

  function hasConsent(category) {
    if (category === 'necessary') return true;
    var state = readState();
    return !!(state && state.categories && state.categories[category] === true);
  }

  function ensureStyles() {
    if (document.getElementById('luxival-consent-style')) return;
    var style = document.createElement('style');
    style.id = 'luxival-consent-style';
    style.textContent = '#luxival-consent-banner{position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);width:min(720px,92vw);background:#11131A;border:1px solid rgba(201,169,106,.35);box-shadow:0 16px 36px rgba(0,0,0,.45);border-radius:6px;padding:1rem;z-index:10050;color:#E8EBF2;font-size:.88rem;line-height:1.5}#luxival-consent-banner p{margin:0 0 .9rem 0;opacity:.9}#luxival-consent-actions{display:flex;gap:.6rem;flex-wrap:wrap}#luxival-consent-actions button{border:none;border-radius:3px;padding:.48rem .86rem;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;font-family:inherit}#luxival-consent-accept,#luxival-consent-save{background:#C9A96A;color:#0A0B0F}#luxival-consent-reject,#luxival-consent-close{background:transparent;color:#E8EBF2;border:1px solid rgba(255,255,255,.25)}#luxival-consent-customize{background:rgba(255,255,255,.08);color:#E8EBF2}#luxival-consent-manage{position:fixed;left:1rem;bottom:1rem;background:#0E121A;color:#C9A96A;border:1px solid rgba(201,169,106,.4);border-radius:999px;padding:.42rem .72rem;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;z-index:10040}#luxival-consent-modal{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:10060;padding:1rem}#luxival-consent-panel{background:#11131A;border:1px solid rgba(201,169,106,.35);width:min(640px,96vw);border-radius:8px;padding:1.2rem;color:#E8EBF2}#luxival-consent-panel h3{margin:0 0 .45rem 0;color:#C9A96A;font-size:1rem}#luxival-consent-panel p{margin:0 0 .8rem 0;opacity:.88;font-size:.88rem}#luxival-consent-options{display:grid;gap:.55rem;margin:.8rem 0 1rem}#luxival-consent-options label{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.55rem .65rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:4px;font-size:.84rem}#luxival-consent-options input[type=checkbox]{accent-color:#C9A96A}#luxival-consent-modal-actions{display:flex;gap:.6rem;flex-wrap:wrap}#luxival-consent-modal-actions button{border-radius:3px;padding:.48rem .86rem;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;font-family:inherit}@media(max-width:768px){#luxival-consent-banner{bottom:.8rem;padding:.9rem}#luxival-consent-actions button{flex:1 1 auto}#luxival-consent-manage{bottom:5rem}}';
    document.head.appendChild(style);
  }

  function removeBanner() {
    var banner = document.getElementById('luxival-consent-banner');
    if (banner) banner.remove();
  }

  function applyChoice(categories) {
    removeBanner();
    return saveState(stateFromCategories(categories));
  }

  function closePreferences() {
    var modal = document.getElementById('luxival-consent-modal');
    if (modal) modal.remove();
  }

  function openPreferences() {
    ensureStyles();
    closePreferences();
    var current = readState() || defaultState();
    var modal = document.createElement('div');
    modal.id = 'luxival-consent-modal';
    modal.innerHTML = '<div id="luxival-consent-panel" role="dialog" aria-modal="true" aria-labelledby="luxival-consent-title">' +
      '<h3 id="luxival-consent-title">Cookie Preferences</h3>' +
      '<p>Control optional cookies and third-party scripts. Necessary storage stays enabled for core site functions.</p>' +
      '<div id="luxival-consent-options">' +
      '<label>Necessary <input type="checkbox" checked disabled></label>' +
      '<label>Functional translation and preferences <input id="consent-functional" type="checkbox" ' + (current.categories.functional ? 'checked' : '') + '></label>' +
      '<label>Analytics performance measurement <input id="consent-analytics" type="checkbox" ' + (current.categories.analytics ? 'checked' : '') + '></label>' +
      '<label>Marketing personalization <input id="consent-marketing" type="checkbox" ' + (current.categories.marketing ? 'checked' : '') + '></label>' +
      '</div>' +
      '<div id="luxival-consent-modal-actions">' +
      '<button id="luxival-consent-save" type="button">Save Preferences</button>' +
      '<button id="luxival-consent-close" type="button">Close</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById('luxival-consent-save').addEventListener('click', function() {
      applyChoice({
        functional: document.getElementById('consent-functional').checked,
        analytics: document.getElementById('consent-analytics').checked,
        marketing: document.getElementById('consent-marketing').checked
      });
      closePreferences();
    });
    document.getElementById('luxival-consent-close').addEventListener('click', closePreferences);
    modal.addEventListener('click', function(event) {
      if (event.target === modal) closePreferences();
    });
  }

  function ensureManageButton() {
    if (document.getElementById('luxival-consent-manage')) return;
    var button = document.createElement('button');
    button.id = 'luxival-consent-manage';
    button.type = 'button';
    button.textContent = 'Cookie Settings';
    button.addEventListener('click', openPreferences);
    document.body.appendChild(button);
  }

  function showBannerIfNeeded() {
    if (readState()) return;
    ensureStyles();
    if (document.getElementById('luxival-consent-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'luxival-consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = '<p>We use necessary storage for core site operation and optional scripts for translation, performance analytics, and future marketing features.</p>' +
      '<div id="luxival-consent-actions">' +
      '<button id="luxival-consent-accept" type="button">Accept All</button>' +
      '<button id="luxival-consent-reject" type="button">Reject Optional</button>' +
      '<button id="luxival-consent-customize" type="button">Customize</button>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('luxival-consent-accept').addEventListener('click', function() {
      applyChoice({ functional: true, analytics: true, marketing: true });
    });
    document.getElementById('luxival-consent-reject').addEventListener('click', function() {
      applyChoice({ functional: false, analytics: false, marketing: false });
    });
    document.getElementById('luxival-consent-customize').addEventListener('click', openPreferences);
  }

  function loadSpeedInsights() {
    if (!hasConsent('analytics')) return;
    if (document.getElementById('vercel-speed-insights-script')) return;
    window.si = window.si || function() {
      (window.siq = window.siq || []).push(arguments);
    };
    var script = document.createElement('script');
    script.id = 'vercel-speed-insights-script';
    script.defer = true;
    script.src = '/_vercel/speed-insights/script.js';
    document.head.appendChild(script);
  }

  function applyConsentedScripts(state) {
    if (!state || !state.categories) return;
    if (state.categories.analytics) loadSpeedInsights();
  }

  window.luxivalConsent = {
    getState: readState,
    hasConsent: hasConsent,
    openPreferences: openPreferences,
    acceptAll: function() { return applyChoice({ functional: true, analytics: true, marketing: true }); },
    rejectOptional: function() { return applyChoice({ functional: false, analytics: false, marketing: false }); }
  };

  document.addEventListener('DOMContentLoaded', function() {
    migrateLegacyTranslateConsent();
    showBannerIfNeeded();
    ensureManageButton();
    applyConsentedScripts(readState());
  });
})();
