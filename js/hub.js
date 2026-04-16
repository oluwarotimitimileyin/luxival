// hub.js — Supabase content loader for hub.html
// Load order: Supabase CDN → config.js → supabase-client.js → hub.js

(function () {
  'use strict';

  const cfg = window.LuxivalConfig || {};
  const dbUrl = cfg.SUPABASE_URL;
  const dbKey = cfg.SUPABASE_PUBLISHABLE_KEY;

  // If not yet configured, show friendly empty states without crashing
  if (!dbUrl || !dbKey) {
    console.warn('[Hub] Supabase credentials not set — showing empty states.');
    showAllEmpty();
    return;
  }

  const db = window.supabase.createClient(dbUrl, dbKey);

  // ─── Date helpers ─────────────────────────────────────────────────────────

  function fmtDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  function fmtDay(iso) {
    if (!iso) return '--';
    return String(new Date(iso).getDate()).padStart(2, '0');
  }

  function fmtMon(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
  }

  function titleCase(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
  }

  // ─── Empty / error state ──────────────────────────────────────────────────

  function emptyHTML(msg) {
    return `<div class="empty"><h3>Nothing here yet</h3><p>${msg}</p></div>`;
  }

  function showAllEmpty() {
    setGrid('helsinkiGrid', 'content-grid',
      emptyHTML('Helsinki hotspots will appear here once the daily AI update runs.'));
    setGrid('blogGrid', 'content-grid',
      emptyHTML('Blog posts will appear here as they are published.'));
    setGrid('productsGrid', 'products-grid',
      emptyHTML('Service listings will appear once connected to the database.'));
    document.getElementById('suggestionsGrid').innerHTML =
      emptyHTML('Service recommendations will appear here.');
    document.getElementById('eventsList').innerHTML =
      emptyHTML('Upcoming events will be listed here.');
    const lu = document.getElementById('lastUpdated');
    if (lu) lu.textContent = 'Connect Supabase to enable live updates.';
  }

  function setGrid(id, className, html) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = className;
    el.innerHTML = html;
  }

  // ─── Card builders ────────────────────────────────────────────────────────

  function contentCard(post) {
    const cat = titleCase(post.category || 'update');
    const date = fmtDate(post.published_at || post.created_at);
    const imgBlock = post.featured_image
      ? `<img src="${post.featured_image}" alt="${post.title}" loading="lazy">`
      : `<div class="card-img-placeholder">${cat}</div>`;
    return `<article class="content-card">
  <div class="card-img">${imgBlock}<span class="card-cat">${cat}</span></div>
  <div class="card-body">
    <h3>${post.title}</h3>
    <p>${post.excerpt || ''}</p>
    <div class="card-meta"><span>${date}</span><span>${post.author || 'Luxival'}</span></div>
  </div>
</article>`;
  }

  function eventRow(evt) {
    const loc = evt.location || evt.address || '';
    const cat = titleCase(evt.category || 'event');
    const extLink = evt.external_url
      ? `<a href="${evt.external_url}" target="_blank" rel="noopener" class="event-cat">${cat}</a>`
      : `<span class="event-cat">${cat}</span>`;
    return `<div class="event-row">
  <div class="event-date">
    <div class="event-day">${fmtDay(evt.event_date)}</div>
    <div class="event-month">${fmtMon(evt.event_date)}</div>
  </div>
  <div>
    <div class="event-title">${evt.title}</div>
    ${loc ? `<div class="event-loc">${loc}</div>` : ''}
  </div>
  ${extLink}
</div>`;
  }

  function productCard(p) {
    const cat = titleCase(p.category || 'service');
    const price = p.price_label || (p.price ? `\u20AC${p.price}` : 'Quote on request');
    const cta = p.detail_page
      ? `<a href="${p.detail_page}" class="btn" style="font-size:.72rem;padding:.55rem 1.3rem">View service</a>`
      : '';
    return `<div class="product-card${p.featured ? ' featured' : ''}">
  <div class="product-cat">${cat}</div>
  <h3>${p.name}</h3>
  <p>${p.description || ''}</p>
  <div class="product-price">${price}</div>
  ${cta}
</div>`;
  }

  function suggestionCard(s) {
    const url = s.cta_url || 'contact.html';
    const label = s.cta_label || 'Learn more';
    return `<div class="suggestion-card">
  ${s.target_audience ? `<div class="suggestion-audience">${s.target_audience}</div>` : ''}
  <h3>${s.title}</h3>
  <p>${s.description || ''}</p>
  <a href="${url}" class="btn btn-outline" style="font-size:.7rem;padding:.5rem 1.2rem">${label}</a>
</div>`;
  }

  // ─── Loaders ──────────────────────────────────────────────────────────────

  async function loadHelsinki() {
    const { data } = await db
      .from('blog_posts')
      .select('*')
      .eq('category', 'helsinki')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(6);
    if (!data || data.length === 0) {
      setGrid('helsinkiGrid', 'content-grid',
        emptyHTML('Our AI will publish Helsinki hotspot posts once the first daily update runs.'));
      return;
    }
    setGrid('helsinkiGrid', 'content-grid', data.map(contentCard).join(''));
    updateTimestamp(data[0].published_at || data[0].created_at);
  }

  async function loadBlog() {
    const { data } = await db
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(9);
    if (!data || data.length === 0) {
      setGrid('blogGrid', 'content-grid',
        emptyHTML('Blog posts will appear here as they are published.'));
      return;
    }
    setGrid('blogGrid', 'content-grid', data.map(contentCard).join(''));
  }

  async function loadEvents() {
    const el = document.getElementById('eventsList');
    if (!el) return;
    const now = new Date().toISOString();
    const { data } = await db
      .from('events')
      .select('*')
      .eq('published', true)
      .gte('event_date', now)
      .order('event_date', { ascending: true })
      .limit(10);
    if (!data || data.length === 0) {
      el.innerHTML = emptyHTML('Upcoming events will appear here. Check back soon.');
      return;
    }
    el.className = 'events-list';
    el.innerHTML = data.map(eventRow).join('');
  }

  async function loadProducts() {
    const { data } = await db
      .from('product_listings')
      .select('*')
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .limit(12);
    if (!data || data.length === 0) {
      setGrid('productsGrid', 'products-grid',
        emptyHTML('Service listings will appear once connected to the database.'));
      return;
    }
    setGrid('productsGrid', 'products-grid', data.map(productCard).join(''));
  }

  async function loadSuggestions() {
    const el = document.getElementById('suggestionsGrid');
    if (!el) return;
    const { data } = await db
      .from('service_suggestions')
      .select('*')
      .eq('published', true)
      .limit(6);
    if (!data || data.length === 0) {
      el.innerHTML = emptyHTML('Service recommendations will appear here.');
      return;
    }
    el.innerHTML = data.map(suggestionCard).join('');
  }

  function updateTimestamp(iso) {
    const el = document.getElementById('lastUpdated');
    if (el && iso) el.textContent = 'Last updated: ' + fmtDate(iso);
  }

  // ─── Run all loaders in parallel ──────────────────────────────────────────

  Promise.all([
    loadHelsinki(),
    loadBlog(),
    loadEvents(),
    loadProducts(),
    loadSuggestions(),
  ]).catch(err => console.error('[Hub] Load error:', err));

})();
