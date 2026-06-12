(function () {
  'use strict';

  var DEFAULT_PICKUP = 'Helsinki Airport, 01531 Vantaa, Finland';
  var DEFAULT_DROPOFF = 'Hotel Kamp, Pohjoisesplanadi 29, 00100 Helsinki, Finland';
  var WHATSAPP_BASE = 'https://wa.me/358503518366';

  function injectStyles() {
    if (document.getElementById('luxival-ride-planner-styles')) return;
    var style = document.createElement('style');
    style.id = 'luxival-ride-planner-styles';
    style.textContent = [
      '.ride-planner{background:#11131A;border:1px solid rgba(201,169,106,.2);border-radius:8px;overflow:hidden;box-shadow:0 22px 60px rgba(0,0,0,.25)}',
      '.ride-planner-grid{display:grid;grid-template-columns:minmax(320px,.85fr) 1.15fr;min-height:520px}',
      '.ride-planner-panel{padding:1.4rem;background:linear-gradient(135deg,rgba(201,169,106,.08),rgba(17,19,26,.95))}',
      '.ride-planner-panel h3{color:#C9A96A;font-size:1.35rem;margin:0 0 .4rem;font-weight:400}',
      '.ride-planner-panel p{font-size:.92rem;opacity:.68;margin:0 0 1rem}',
      '.ride-field{display:grid;gap:.35rem;margin-bottom:.8rem}',
      '.ride-field label{font-size:.68rem;letter-spacing:1.8px;text-transform:uppercase;color:#C9A96A}',
      '.ride-field input{width:100%;background:#0A0B0F;border:1px solid rgba(255,255,255,.1);border-radius:4px;color:#E8EBF2;padding:.82rem .9rem;font:inherit}',
      '.ride-field input:focus{outline:none;border-color:#C9A96A}',
      '.ride-actions{display:flex;gap:.65rem;flex-wrap:wrap;margin:1rem 0}',
      '.ride-actions button,.ride-actions a{border:0;border-radius:4px;background:#C9A96A;color:#0A0B0F;padding:.78rem 1rem;font-weight:650;font-size:.72rem;letter-spacing:1px;text-transform:uppercase;text-decoration:none;cursor:pointer}',
      '.ride-actions .secondary{background:transparent;color:#C9A96A;border:1px solid #C9A96A}',
      '.ride-status{min-height:1.35rem;font-size:.86rem;color:#C9A96A;margin:.5rem 0 1rem}',
      '.ride-status.error{color:#ff8b8b}',
      '.ride-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;margin:1rem 0}',
      '.ride-stat{background:rgba(10,11,15,.68);border:1px solid rgba(255,255,255,.07);border-radius:4px;padding:.75rem}',
      '.ride-stat span{display:block;font-size:.65rem;text-transform:uppercase;letter-spacing:1.4px;opacity:.48}',
      '.ride-stat strong{display:block;color:#E8EBF2;font-size:1.05rem;font-weight:400;margin-top:.15rem}',
      '.ride-quick{display:grid;gap:.55rem;margin-top:1rem}',
      '.ride-quick button{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:4px;color:#E8EBF2;text-align:left;padding:.72rem .85rem;font:inherit;cursor:pointer}',
      '.ride-quick button:hover{border-color:rgba(201,169,106,.45)}',
      '.ride-map{min-height:520px;background:#0A0B0F}',
      '.ride-fallback{display:grid;place-items:center;min-height:520px;padding:2rem;text-align:center;background:#0A0B0F;color:#E8EBF2}',
      '@media(max-width:860px){.ride-planner-grid{grid-template-columns:1fr}.ride-map{min-height:380px}.ride-summary{grid-template-columns:1fr}.ride-planner-panel{padding:1.1rem}}'
    ].join('');
    document.head.appendChild(style);
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function setBookingPrefill() {
    var pickup = qs('pickup');
    var dropoff = qs('dropoff');
    var type = qs('type');
    var pickupInput = document.getElementById('bPickup');
    var dropoffInput = document.getElementById('bDropoff');
    var typeInput = document.getElementById('bType');
    if (pickup && pickupInput) pickupInput.value = pickup;
    if (dropoff && dropoffInput) dropoffInput.value = dropoff;
    if (type && typeInput) {
      Array.from(typeInput.options).forEach(function (option) {
        if (option.text.toLowerCase() === type.toLowerCase()) typeInput.value = option.text;
      });
    }
  }

  function render(container) {
    container.innerHTML = [
      '<div class="ride-planner">',
      '<div class="ride-planner-grid">',
      '<div class="ride-planner-panel">',
      '<h3>Plan your Luxival ride</h3>',
      '<p>Preview the route from Helsinki Airport or any Uusimaa pickup, then send the details into booking.</p>',
      '<div class="ride-field"><label for="' + container.id + '-pickup">Pickup</label><input id="' + container.id + '-pickup" class="ride-pickup" autocomplete="off"></div>',
      '<div class="ride-field"><label for="' + container.id + '-dropoff">Drop-off</label><input id="' + container.id + '-dropoff" class="ride-dropoff" autocomplete="off"></div>',
      '<div class="ride-actions"><button type="button" class="ride-calc">Show route</button><a class="secondary ride-book" href="/transfers#book">Book this ride</a></div>',
      '<div class="ride-status">Enter pickup and drop-off to preview drive time.</div>',
      '<div class="ride-summary" aria-live="polite">',
      '<div class="ride-stat"><span>Distance</span><strong class="ride-distance">--</strong></div>',
      '<div class="ride-stat"><span>Drive time</span><strong class="ride-duration">--</strong></div>',
      '<div class="ride-stat"><span>Estimate</span><strong class="ride-fare">--</strong></div>',
      '</div>',
      '<div class="ride-quick" aria-label="Popular routes">',
      '<button type="button" data-dropoff="Helsinki city centre, Helsinki, Finland">HEL to Helsinki city centre</button>',
      '<button type="button" data-dropoff="Port of Helsinki, Helsinki, Finland">HEL to Helsinki harbour</button>',
      '<button type="button" data-dropoff="Porvoo Old Town, Porvoo, Finland">HEL to Porvoo</button>',
      '</div>',
      '</div>',
      '<div class="ride-map" aria-label="Luxival route map"></div>',
      '</div>',
      '</div>'
    ].join('');
  }

  function attachAutocomplete(input) {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;
    new window.google.maps.places.Autocomplete(input, {
      fields: ['formatted_address', 'geometry', 'name'],
      componentRestrictions: { country: 'fi' }
    });
  }

  function updateLinks(container, pickup, dropoff) {
    var params = new URLSearchParams({
      pickup: pickup,
      dropoff: dropoff,
      type: pickup.toLowerCase().includes('airport') ? 'Airport transfer' : 'Private pickup'
    });
    var book = container.querySelector('.ride-book');
    if (book) book.href = '/transfers?' + params.toString() + '#book';

    var message = 'Hello Luxival, I would like to book a ride from ' + pickup + ' to ' + dropoff + '.';
    container.dataset.whatsapp = WHATSAPP_BASE + '?text=' + encodeURIComponent(message);
  }

  function setStatus(container, message, isError) {
    var status = container.querySelector('.ride-status');
    if (!status) return;
    status.textContent = message;
    status.className = 'ride-status' + (isError ? ' error' : '');
  }

  async function fetchFare(container, pickup, dropoff) {
    var fareEl = container.querySelector('.ride-fare');
    try {
      var res = await fetch('/api/get-fare?' + new URLSearchParams({
        origin: pickup,
        destination: dropoff,
        surcharges: pickup.toLowerCase().includes('airport') ? 'airport' : ''
      }));
      var data = await res.json();
      if (res.ok && !data.error) fareEl.textContent = '€' + data.total.toFixed(2);
    } catch {
      fareEl.textContent = 'On request';
    }
  }

  function initContainer(container) {
    if (!window.google || !window.google.maps) {
      container.innerHTML = '<div class="ride-fallback"><div><h3 style="color:#C9A96A">Map temporarily unavailable</h3><p>Use the booking form below and Luxival will confirm the route manually.</p></div></div>';
      return;
    }

    injectStyles();
    render(container);

    var pickupInput = container.querySelector('.ride-pickup');
    var dropoffInput = container.querySelector('.ride-dropoff');
    var mapEl = container.querySelector('.ride-map');
    var pickupDefault = container.dataset.pickup || DEFAULT_PICKUP;
    var dropoffDefault = container.dataset.dropoff || DEFAULT_DROPOFF;

    pickupInput.value = qs('pickup') || pickupDefault;
    dropoffInput.value = qs('dropoff') || dropoffDefault;
    attachAutocomplete(pickupInput);
    attachAutocomplete(dropoffInput);

    var map = new window.google.maps.Map(mapEl, {
      center: { lat: 60.320974, lng: 24.82872 },
      zoom: 11,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });
    var service = new window.google.maps.DirectionsService();
    var renderer = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: false,
      polylineOptions: { strokeColor: '#C9A96A', strokeWeight: 5, strokeOpacity: 0.9 }
    });

    function calculate() {
      var pickup = pickupInput.value.trim();
      var dropoff = dropoffInput.value.trim();
      if (pickup.length < 4 || dropoff.length < 4) {
        setStatus(container, 'Please enter both pickup and drop-off.', true);
        return;
      }
      setStatus(container, 'Calculating driving route...', false);
      updateLinks(container, pickup, dropoff);
      service.route({
        origin: pickup,
        destination: dropoff,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        region: 'FI'
      }).then(function (response) {
        var leg = response.routes[0].legs[0];
        renderer.setDirections(response);
        container.querySelector('.ride-distance').textContent = leg.distance ? leg.distance.text : '--';
        container.querySelector('.ride-duration').textContent = leg.duration ? leg.duration.text : '--';
        setStatus(container, 'Route preview ready. Final fare and pickup timing are confirmed after booking.', false);
        fetchFare(container, pickup, dropoff);
      }).catch(function () {
        setStatus(container, 'Could not preview that route. You can still send the request and we will confirm manually.', true);
      });
    }

    container.querySelector('.ride-calc').addEventListener('click', calculate);
    container.querySelectorAll('.ride-quick button').forEach(function (button) {
      button.addEventListener('click', function () {
        pickupInput.value = DEFAULT_PICKUP;
        dropoffInput.value = button.dataset.dropoff;
        calculate();
      });
    });
    [pickupInput, dropoffInput].forEach(function (input) {
      input.addEventListener('change', calculate);
    });

    calculate();
  }

  window.initLuxivalRidePlanner = function () {
    setBookingPrefill();
    document.querySelectorAll('[data-ride-planner]').forEach(initContainer);
  };

  document.addEventListener('DOMContentLoaded', setBookingPrefill);
})();
