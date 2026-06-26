(function () {
  const TRANSLATE_API = window.LuxivalConfig?.translateApi || 'https://luxival-audit-api.fly.dev/translate';
  const FALLBACK_LANG = 'en';

  let currentLang = localStorage.getItem('luxival_page_lang') || FALLBACK_LANG;

  function getPageLang() {
    const html = document.documentElement;
    return html.getAttribute('lang') || html.getAttribute('data-lang') || FALLBACK_LANG;
  }

  const pageLang = getPageLang();

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
      if (text.length > 2 && !/^[\d\s%$€£¥+\-.,;:!?()]+$/.test(text)) {
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

  }

  if (currentLang !== pageLang && currentLang !== FALLBACK_LANG) {
    setTimeout(() => translatePage(currentLang), 500);
  }
})();
