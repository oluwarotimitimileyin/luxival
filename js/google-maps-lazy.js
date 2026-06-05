(function () {
  'use strict';

  var loadedCallbacks = {};
  var scriptRequested = false;

  function getApiKey() {
    var keyCandidates = [];
    if (window.LuxivalPublicEnv) {
      keyCandidates.push(window.LuxivalPublicEnv.GOOGLE_MAPS_PUBLIC_KEY);
      keyCandidates.push(window.LuxivalPublicEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
      keyCandidates.push(window.LuxivalPublicEnv.VITE_GOOGLE_MAPS_API_KEY);
    }
    if (window.LuxivalConfig) {
      keyCandidates.push(window.LuxivalConfig.GOOGLE_MAPS_PUBLIC_KEY);
      keyCandidates.push(window.LuxivalConfig.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
      keyCandidates.push(window.LuxivalConfig.VITE_GOOGLE_MAPS_API_KEY);
    }

    for (var i = 0; i < keyCandidates.length; i++) {
      var candidate = typeof keyCandidates[i] === 'string' ? keyCandidates[i].trim() : '';
      if (candidate && candidate !== 'YOUR_GOOGLE_MAPS_PUBLIC_KEY') return candidate;
    }
    return '';
  }

  function emitMapsLoaded() {
    window.dispatchEvent(new CustomEvent('luxival:google-maps-loaded'));
  }

  function emitMapsFailed(error) {
    window.dispatchEvent(new CustomEvent('luxival:google-maps-failed', {
      detail: { error: error }
    }));
  }

  function showMapFallback() {
    var containers = document.querySelectorAll('[id*="Map"], [id*="map"], .map-container');
    containers.forEach(function (c) {
      c.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;min-height:300px;background:#11131A;border:1px solid rgba(201,169,106,0.2);border-radius:2px;text-align:center;padding:2rem"><div><p style="color:#C9A96A;font-size:1rem;margin-bottom:0.5rem">Map temporarily unavailable</p><p style="color:#E8EBF2;opacity:0.5;font-size:0.85rem">Varikkokaarre 7A, 01700 Vantaa, Finland</p><a href="https://maps.google.com/?q=Varikkokaarre+7A+01700+Vantaa+Finland" target="_blank" rel="noopener" style="color:#C9A96A;font-size:0.78rem;letter-spacing:1px;text-transform:uppercase;margin-top:1rem;display:inline-block">Open in Google Maps -></a></div></div>';
    });
  }

  function inject(callbackName) {
    var apiKey = getApiKey();
    if (window.google && window.google.maps) {
      if (typeof window[callbackName] === 'function') window[callbackName]();
      emitMapsLoaded();
      return;
    }
    if (!apiKey) {
      var keyError = new Error('Missing Google Maps browser API key');
      console.error("Google Maps load failed", keyError);
      emitMapsFailed(keyError);
      showMapFallback();
      return;
    }
    if (loadedCallbacks[callbackName]) return;
    loadedCallbacks[callbackName] = true;
    if (scriptRequested) return;
    scriptRequested = true;

    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(apiKey) + '&libraries=places&callback=' + encodeURIComponent(callbackName);
    script.async = true;
    script.defer = true;
    script.onload = emitMapsLoaded;
    script.onerror = function (error) {
      console.error("Google Maps load failed", error);
      emitMapsFailed(error);
      showMapFallback();
    };
    document.head.appendChild(script);
  }

  window.loadLuxivalGoogleMaps = function (callbackName, targetSelector) {
    var target = document.querySelector(targetSelector) || document.body;
    if (!('IntersectionObserver' in window)) {
      window.addEventListener('load', function () { inject(callbackName); }, { once: true });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        inject(callbackName);
      });
    }, { rootMargin: '300px 0px' });

    observer.observe(target);
  };

  window.gm_authFailure = function (error) {
    console.error("Google Maps load failed", error);
    emitMapsFailed(error);
    showMapFallback();
  };
})();
