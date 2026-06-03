(function () {
  'use strict';

  var CDN_SRC = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  var loadingPromise = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }
        existing.addEventListener('load', function () { resolve(); }, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.lazySupabase = 'true';
      script.addEventListener('load', function () {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  window.ensureLuxivalSupabase = function () {
    if (window.LuxivalSupabase) {
      return Promise.resolve(window.LuxivalSupabase);
    }

    if (!loadingPromise) {
      loadingPromise = loadScript(CDN_SRC)
        .then(function () { return loadScript('/js/config.js'); })
        .then(function () { return loadScript('/js/supabase-client.js'); })
        .then(function () { return window.LuxivalSupabase; });
    }

    return loadingPromise;
  };
})();
