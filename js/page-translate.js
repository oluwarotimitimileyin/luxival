(function () {
  const TRANSLATE_API = window.LuxivalConfig?.translateApi || 'https://luxival-audit-api.fly.dev/translate';
  const LANG_NAMES = {
    en: 'English', fi: 'Suomi', sv: 'Svenska', de: 'Deutsch', fr: 'Français',
    it: 'Italiano', ru: 'Русский', no: 'Norsk', da: 'Dansk', ja: '日本語',
    zh: '中文', es: 'Español', pt: 'Português', nl: 'Nederlands',
  };
  const FALLBACK_LANG = 'en';

  let currentLang = localStorage.getItem('luxival_page_lang') || FALLBACK_LANG;
  let translateCache = {};

  function getPageLang() {
    const html = document.documentElement;
    return html.getAttribute('lang') || html.getAttribute('data-lang') || FALLBACK_LANG;
  }

  const pageLang = getPageLang();

  function createSwitcher() {
    const wrapper = document.createElement('div');
    wrapper.id = 'luxival-lang-switcher';
    wrapper.setAttribute('role', 'navigation');
    wrapper.setAttribute('aria-label', 'Language selector');
    wrapper.innerHTML = `
      <style>
        #luxival-lang-switcher {
          position: fixed; bottom: 80px; right: 20px; z-index: 9999;
          font-family: inherit;
        }
        #luxival-lang-switcher select {
          appearance: none; -webkit-appearance: none;
          background: rgba(8,9,16,.85); backdrop-filter: blur(12px);
          border: 1px solid rgba(201,169,106,.3);
          color: #e8e0d0; padding: 8px 32px 8px 14px;
          border-radius: 8px; font-size: .78rem; cursor: pointer;
          outline: none; transition: border-color .2s;
          min-width: 140px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23c9a96a'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 10px center;
        }
        #luxival-lang-switcher select:hover { border-color: rgba(201,169,106,.6); }
        #luxival-lang-switcher select option {
          background: #080910; color: #e8e0d0;
        }
        #luxival-lang-switcher .lang-label {
          position: absolute; top: -22px; left: 0; font-size: .65rem;
          letter-spacing: 1px; text-transform: uppercase; opacity: .4;
        }
      </style>
      <select id="luxival-lang-select" aria-label="Select language">
        ${Object.entries(LANG_NAMES).map(([code, name]) =>
          `<option value="${code}" ${code === currentLang ? 'selected' : ''}>${name}</option>`
        ).join('')}
      </select>
    `;
    document.body.appendChild(wrapper);

    const select = document.getElementById('luxival-lang-select');
    select.addEventListener('change', function () {
      const lang = this.value;
      currentLang = lang;
      localStorage.setItem('luxival_page_lang', lang);
      translatePage(lang);
    });
  }

  function getTextNodes(node) {
    const nodes = [];
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent.trim();
      if (text.length > 1 && !/^[\d\s%$€£¥+\-.,;:!?()]+$/.test(text)) {
        nodes.push(walker.currentNode);
      }
    }
    return nodes;
  }

  const TRANSLATE_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, li, span, a, label, blockquote, td, th, figcaption, .lead, .eyebrow, .btn, .tag';

  async function translatePage(targetLang) {
    if (targetLang === pageLang || targetLang === FALLBACK_LANG && pageLang === 'en') {
      location.reload();
      return;
    }

    const elements = document.querySelectorAll(TRANSLATE_SELECTOR);
    const textMap = new Map();

    elements.forEach(el => {
      const text = el.textContent.trim();
      if (text.length > 2 && !/^[\d\s%$€£¥+\-.,;:!?()]+$/.test(text) && !el.closest('#luxival-lang-switcher')) {
        textMap.set(el, text);
      }
    });

    const uniqueTexts = [...new Set(textMap.values())];
    const batchSize = 20;
    const translatedMap = new Map();

    for (let i = 0; i < uniqueTexts.length; i += batchSize) {
      const batch = uniqueTexts.slice(i, i + batchSize);
      try {
        const resp = await fetch(TRANSLATE_API + '/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: batch, source: 'auto', target: targetLang }),
        });
        if (!resp.ok) continue;
        const data = await resp.json();
        if (data.success && Array.isArray(data.translated_texts)) {
          batch.forEach((orig, idx) => {
            if (data.translated_texts[idx]) {
              translatedMap.set(orig, data.translated_texts[idx]);
            }
          });
        }
      } catch (e) {
        console.warn('[page-translate] batch failed', e);
      }

      await new Promise(r => setTimeout(r, 200));
    }

    textMap.forEach((origText, el) => {
      const translated = translatedMap.get(origText);
      if (translated && translated !== origText) {
        if (el.children.length === 0 || !el.querySelector('*')) {
          el.textContent = translated;
        } else {
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            const t = node.textContent.trim();
            if (translatedMap.has(t)) {
              node.textContent = node.textContent.replace(t, translatedMap.get(t));
            }
          }
        }
      }
    });

    document.documentElement.lang = targetLang;
    currentLang = targetLang;
    localStorage.setItem('luxival_page_lang', targetLang);
    document.getElementById('luxival-lang-select').value = targetLang;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createSwitcher();
      if (currentLang !== pageLang && currentLang !== FALLBACK_LANG) {
        setTimeout(() => translatePage(currentLang), 500);
      }
    });
  } else {
    createSwitcher();
    if (currentLang !== pageLang && currentLang !== FALLBACK_LANG) {
      setTimeout(() => translatePage(currentLang), 500);
    }
  }
})();
