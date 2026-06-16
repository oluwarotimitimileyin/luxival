(function () {
  const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
  const travelPages = new Set([
    '/services/airport-transfer',
    '/services/private-pickup',
    '/services/private-rides',
    '/services/city-to-city',
    '/transfers',
    '/helsinki-airport-pickup'
  ]);
  const tourismPages = new Set([
    '/tourism',
    '/tourism-planning',
    '/luxury-lapland',
    '/helsinki-design-district',
    '/finland-winter-travel'
  ]);
  const digitalPages = new Set([
    '/services/web-design',
    '/services/ai-agents',
    '/services/software-testing',
    '/services/hotel-sourcing',
    '/services/sewing-pattern',
    '/services/tiktok-agency',
    '/services/electrical-design',
    '/services/mechanical-design',
    '/digital',
    '/services'
  ]);

  if (document.querySelector('[data-funnel-cta]')) return;

  let type = '';
  if (travelPages.has(path)) type = 'travel';
  if (tourismPages.has(path)) type = 'tourism';
  if (digitalPages.has(path)) type = 'digital';
  if (!type) return;

  function addStyle() {
    if (document.getElementById('luxival-funnel-style')) return;
    const style = document.createElement('style');
    style.id = 'luxival-funnel-style';
    style.textContent = `
      .luxival-funnel{max-width:1180px;margin:4rem auto;padding:0 5%;position:relative;z-index:2}
      .luxival-funnel__box{background:#11131A;border:1px solid rgba(201,169,106,.22);border-radius:6px;padding:2rem}
      .luxival-funnel__eyebrow{display:block;color:#C9A96A;font-size:.72rem;letter-spacing:3px;text-transform:uppercase;margin-bottom:.7rem}
      .luxival-funnel h2{font-size:clamp(1.5rem,3vw,2.3rem);font-weight:300;margin:0 0 .7rem;color:#E8EBF2}
      .luxival-funnel p{opacity:.72;margin:0 0 1.2rem;color:#E8EBF2}
      .luxival-funnel form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.85rem}
      .luxival-funnel .full{grid-column:1/-1}
      .luxival-funnel input,.luxival-funnel select,.luxival-funnel textarea{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(201,169,106,.25);border-radius:4px;color:#fff;padding:.75rem .85rem;font:inherit}
      .luxival-funnel input[type="date"]::-webkit-calendar-picker-indicator,.luxival-funnel input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:.85;cursor:pointer}
      .luxival-funnel textarea{min-height:110px;resize:vertical}
      .luxival-funnel button{background:#C9A96A;color:#0A0B0F;border:0;border-radius:4px;padding:.85rem 1rem;text-transform:uppercase;letter-spacing:1px;font-weight:600}
      .luxival-funnel__status{font-size:.85rem;min-height:1.4rem;margin-top:.85rem}
      @media(max-width:720px){.luxival-funnel form{grid-template-columns:1fr}.luxival-funnel__box{padding:1.4rem}}
    `;
    document.head.appendChild(style);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if ([...document.scripts].some((script) => script.src.includes(src))) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function ensureSupabase() {
    if (window.LuxivalSupabase) return true;
    try {
      if (!window.supabase) {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
      }
      if (!window.LuxivalConfig) await loadScript('/js/config.js');
      await loadScript('/js/supabase-client.js');
      return Boolean(window.LuxivalSupabase);
    } catch (error) {
      return false;
    }
  }

  function field(id, tag, attrs, options) {
    if (tag === 'select') {
      return `<select id="${id}" ${attrs || ''}>${options.map((item) => `<option value="${item.value}">${item.label}</option>`).join('')}</select>`;
    }
    if (tag === 'textarea') return `<textarea id="${id}" ${attrs || ''}></textarea>`;
    return `<input id="${id}" ${attrs || ''}>`;
  }

  const content = {
    travel: {
      eyebrow: 'Travel lead',
      title: 'Request a ride quote',
      intro: 'Send the route, timing, passenger, and luggage details so Luxival can confirm the best transfer option.',
      submit: 'Request a ride quote',
      fields: [
        field('funnelName', 'input', 'type="text" placeholder="Name" required'),
        field('funnelEmail', 'input', 'type="email" placeholder="Email" required'),
        field('funnelPhone', 'input', 'type="tel" placeholder="Phone / WhatsApp" required'),
        field('funnelService', 'select', 'required', [
          { value: '', label: 'Service type' },
          { value: 'airport', label: 'Airport transfer' },
          { value: 'private-rides', label: 'Private rides' },
          { value: 'city-to-city', label: 'City-to-city' },
          { value: 'tourism', label: 'Tourism transfer' }
        ]),
        field('funnelPickup', 'input', 'type="text" placeholder="Pickup location" required'),
        field('funnelDropoff', 'input', 'type="text" placeholder="Dropoff location" required'),
        field('funnelDate', 'input', 'type="date" required'),
        field('funnelTime', 'input', 'type="time" required'),
        field('funnelPassengers', 'input', 'type="number" min="1" placeholder="Passengers" required'),
        field('funnelLuggage', 'input', 'type="number" min="0" placeholder="Luggage count" required'),
        field('funnelNotes', 'textarea', 'class="full" placeholder="Notes, flight number, child seats, or special requests"')
      ]
    },
    tourism: {
      eyebrow: 'Travel planning lead',
      title: 'Plan my Finland trip',
      intro: 'Share dates, travellers, interests, and budget so Luxival can shape a practical Finland itinerary.',
      submit: 'Plan my Finland trip',
      fields: [
        field('funnelName', 'input', 'type="text" placeholder="Name" required'),
        field('funnelEmail', 'input', 'type="email" placeholder="Email" required'),
        field('funnelPhone', 'input', 'type="tel" placeholder="WhatsApp" required'),
        field('funnelDates', 'input', 'type="text" placeholder="Travel dates" required'),
        field('funnelTravelers', 'input', 'type="number" min="1" placeholder="Number of travelers" required'),
        field('funnelBudget', 'input', 'type="text" placeholder="Budget range" required'),
        field('funnelDestinations', 'input', 'class="full" type="text" placeholder="Preferred destinations" required'),
        field('funnelInterests', 'textarea', 'class="full" placeholder="Interests and notes" required')
      ]
    },
    digital: {
      eyebrow: 'Project lead',
      title: 'Request a project consultation',
      intro: 'Send the service, scope, budget, and timeline so Luxival can respond with next steps.',
      submit: 'Request a project consultation',
      fields: [
        field('funnelName', 'input', 'type="text" placeholder="Name" required'),
        field('funnelEmail', 'input', 'type="email" placeholder="Email" required'),
        field('funnelCompany', 'input', 'type="text" placeholder="Company"'),
        field('funnelWebsite', 'input', 'type="url" placeholder="Website"'),
        field('funnelService', 'select', 'required', [
          { value: '', label: 'Service interest' },
          { value: 'Web design', label: 'Web design' },
          { value: 'SEO', label: 'SEO' },
          { value: 'AI agents', label: 'AI agents / workflows' },
          { value: 'Software testing', label: 'Software testing' },
          { value: 'Hotel sourcing', label: 'Hotel sourcing' },
          { value: 'TikTok agency', label: 'TikTok / content services' },
          { value: 'Sewing pattern', label: 'Sewing pattern services' },
          { value: 'Electrical design', label: 'Electrical design' },
          { value: 'Mechanical design', label: 'Mechanical design' }
        ]),
        field('funnelBudget', 'input', 'type="text" placeholder="Budget range" required'),
        field('funnelTimeline', 'input', 'type="text" placeholder="Timeline" required'),
        field('funnelDescription', 'textarea', 'class="full" placeholder="Project description" required')
      ]
    }
  }[type];

  function value(id) {
    return document.getElementById(id)?.value.trim() || '';
  }

  async function submit(event) {
    event.preventDefault();
    const status = document.getElementById('luxivalFunnelStatus');
    status.style.color = '#C9A96A';
    status.textContent = 'Sending...';

    const ready = await ensureSupabase();
    if (!ready) {
      status.style.color = '#f77';
      status.textContent = 'Unable to connect right now. Please use the contact page or WhatsApp.';
      return;
    }

    let result;
    if (type === 'travel') {
      result = await window.LuxivalSupabase.submitRideRequest({
        customer_name: value('funnelName'),
        email: value('funnelEmail'),
        phone: value('funnelPhone'),
        pickup_location: value('funnelPickup'),
        destination: value('funnelDropoff'),
        preferred_date: value('funnelDate') || null,
        ride_time: value('funnelTime') || null,
        service_type: value('funnelService'),
        estimated_distance_km: 0,
        estimated_price: 0,
        notes: `Passengers: ${value('funnelPassengers')}\nLuggage: ${value('funnelLuggage')}\n${value('funnelNotes')}`,
        airport_surcharge: false,
        busy_hour: false,
        status: 'pending',
        source: `funnel:${path}`
      });
    } else {
      const message = type === 'tourism'
        ? [
          `WhatsApp: ${value('funnelPhone')}`,
          `Travel dates: ${value('funnelDates')}`,
          `Travelers: ${value('funnelTravelers')}`,
          `Budget: ${value('funnelBudget')}`,
          `Destinations: ${value('funnelDestinations')}`,
          `Interests: ${value('funnelInterests')}`
        ].join('\n')
        : [
          `Website: ${value('funnelWebsite')}`,
          `Budget: ${value('funnelBudget')}`,
          `Timeline: ${value('funnelTimeline')}`,
          `Description: ${value('funnelDescription')}`
        ].join('\n');

      result = await window.LuxivalSupabase.submitContactInquiry({
        name: value('funnelName'),
        email: value('funnelEmail'),
        phone: value('funnelPhone') || '',
        company: value('funnelCompany') || '',
        service_interest: type === 'tourism' ? 'Finland tourism planning' : value('funnelService'),
        message,
        source: `funnel:${path}`,
        status: 'new'
      });
    }

    if (result && result.error) {
      status.style.color = '#f77';
      status.textContent = 'Unable to submit now. Please try again.';
      return;
    }

    event.currentTarget.reset();
    status.style.color = '#C9A96A';
    status.textContent = 'Thanks. Luxival will follow up shortly.';
  }

  function render() {
    addStyle();
    const section = document.createElement('section');
    section.className = 'luxival-funnel';
    section.setAttribute('data-funnel-cta', type);
    section.innerHTML = `
      <div class="luxival-funnel__box">
        <span class="luxival-funnel__eyebrow">${content.eyebrow}</span>
        <h2>${content.title}</h2>
        <p>${content.intro}</p>
        <form id="luxivalFunnelForm">${content.fields.join('')}<button class="full" type="submit">${content.submit}</button></form>
        <div id="luxivalFunnelStatus" class="luxival-funnel__status" aria-live="polite"></div>
      </div>
    `;
    const footer = document.querySelector('footer');
    if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer);
    else document.body.appendChild(section);
    document.getElementById('luxivalFunnelForm')?.addEventListener('submit', submit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
