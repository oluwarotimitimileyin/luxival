const LINKED_EVENTS_ENDPOINT = 'https://api.hel.fi/linkedevents/v1/event/';

function setCors(req, res) {
  const allowedOrigins = ['https://luxival.com', 'https://www.luxival.com'];
  const requestOrigin = req.headers.origin || '';
  if (allowedOrigins.includes(requestOrigin) || requestOrigin.startsWith('http://localhost')) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.luxival.com');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function pickLocalizedName(value, fallback = '') {
  if (!value || typeof value !== 'object') return fallback;
  return value.en || value.fi || value.sv || fallback;
}

module.exports = async (req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pageSize = Math.min(12, Math.max(1, Number(req.query.page_size) || 6));
  const start = req.query.start || new Date().toISOString().split('T')[0];
  const sort = req.query.sort || 'start_time';

  const url = new URL(LINKED_EVENTS_ENDPOINT);
  url.searchParams.set('start', start);
  url.searchParams.set('sort', sort);
  url.searchParams.set('page_size', String(pageSize));
  url.searchParams.set('format', 'json');

  try {
    const upstream = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!upstream.ok) {
      const errorBody = await upstream.text();
      console.error('[helsinki-events] Upstream error:', upstream.status, errorBody.slice(0, 300));
      return res.status(502).json({ error: 'Unable to fetch events at the moment.' });
    }

    const data = await upstream.json();
    const events = Array.isArray(data.data) ? data.data : [];
    const normalized = events
      .map((event) => ({
        id: event.id,
        title: pickLocalizedName(event.name, 'Unnamed event'),
        tag: event.keywords?.[0] ? pickLocalizedName(event.keywords[0].name, 'Event') : 'Event',
        location: event.location?.name ? pickLocalizedName(event.location.name, 'Helsinki') : 'Helsinki',
        start_time: event.start_time || null,
        image: event.images?.[0]?.url || '',
        info_url: event.info_url ? pickLocalizedName(event.info_url, '') : '',
      }))
      .filter((event) => event.title && event.title.trim().length > 0);

    return res.status(200).json({ events: normalized });
  } catch (error) {
    console.error('[helsinki-events] Request failed:', error);
    return res.status(500).json({ error: 'Event service temporarily unavailable.' });
  }
};
