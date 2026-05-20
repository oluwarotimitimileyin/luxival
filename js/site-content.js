(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function applySiteContent(pageKey) {
    if (!pageKey || !window.supabase || !window.LuxivalConfig) return;
    if (!window.LuxivalConfig.SUPABASE_URL || !window.LuxivalConfig.SUPABASE_PUBLISHABLE_KEY) return;

    const client = window.supabase.createClient(
      window.LuxivalConfig.SUPABASE_URL,
      window.LuxivalConfig.SUPABASE_PUBLISHABLE_KEY
    );

    const { data, error } = await client
      .from('site_content')
      .select('content_key, content_value')
      .eq('page_key', pageKey);

    if (error || !Array.isArray(data) || data.length === 0) return;

    const contentMap = {};
    data.forEach((entry) => {
      if (!entry || !entry.content_key) return;
      contentMap[entry.content_key] = entry.content_value;
    });

    const nodes = document.querySelectorAll('[data-content-key]');
    nodes.forEach((node) => {
      const key = node.getAttribute('data-content-key');
      if (!key || !Object.prototype.hasOwnProperty.call(contentMap, key)) return;

      const value = contentMap[key];
      const targetAttr = (node.getAttribute('data-content-attr') || 'text').toLowerCase();

      if (targetAttr === 'html') {
        node.innerHTML = String(value || '');
        return;
      }

      if (targetAttr === 'text') {
        node.textContent = String(value || '');
        return;
      }

      node.setAttribute(targetAttr, String(value || ''));
    });

    window.dispatchEvent(
      new CustomEvent('luxival:site-content-applied', {
        detail: {
          pageKey,
          content: contentMap,
          keys: Object.keys(contentMap),
        },
      })
    );
  }

  window.LuxivalSiteContent = {
    applySiteContent,
    escapeHtml,
  };

  document.addEventListener('DOMContentLoaded', async () => {
    const pageKey = document.body && document.body.getAttribute('data-page-key');
    if (!pageKey) return;
    try {
      await applySiteContent(pageKey);
    } catch (error) {
      // Fail quietly; static fallback content remains visible.
    }
  });
})();
