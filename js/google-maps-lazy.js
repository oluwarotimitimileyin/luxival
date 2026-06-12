(function () {
  'use strict';

  var API_KEY = 'AIzaSyANbQ4Shsjzt6DOl7pw9xmv6ZyAHNtSCas';
  var loadedCallbacks = {};
  var pendingCallbacks = [];
  var loading = false;

  window.__luxivalGoogleMapsLoaded = function () {
    var callbacks = pendingCallbacks.slice();
    pendingCallbacks = [];
    loading = false;
    callbacks.forEach(function (callbackName) {
      if (typeof window[callbackName] === 'function') window[callbackName]();
    });
  };

  function showMapFallback() {
    var containers = document.querySelectorAll('[id*="Map"], [id*="map"], .map-container');
    containers.forEach(function (c) {
      c.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;min-height:300px;background:#11131A;border:1px solid rgba(201,169,106,0.2);border-radius:2px;text-align:center;padding:2rem"><div><p style="color:#C9A96A;font-size:1rem;margin-bottom:0.5rem">Map temporarily unavailable</p><p style="color:#E8EBF2;opacity:0.5;font-size:0.85rem">Varikkokaarre 7A, 01700 Vantaa, Finland</p><a href="https://maps.google.com/?q=Varikkokaarre+7A+01700+Vantaa+Finland" target="_blank" rel="noopener" style="color:#C9A96A;font-size:0.78rem;letter-spacing:1px;text-transform:uppercase;margin-top:1rem;display:inline-block">Open in Google Maps -></a></div></div>';
    });
  }

  function inject(callbackName) {
    if (window.google && window.google.maps) {
      if (typeof window[callbackName] === 'function') window[callbackName]();
      return;
    }
    if (loadedCallbacks[callbackName]) return;
    loadedCallbacks[callbackName] = true;
    pendingCallbacks.push(callbackName);

    if (loading) return;
    loading = true;

    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + API_KEY + '&libraries=places&loading=async&callback=__luxivalGoogleMapsLoaded';
    script.async = true;
    script.defer = true;
    script.onerror = showMapFallback;
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

  window.gm_authFailure = showMapFallback;
})();
