const DEFAULT_UPSTREAM_BASE = 'https://luxival-audit-api.fly.dev';

function buildUpstreamUrl() {
  const configured = process.env.VERTEX_PROXY_UPSTREAM_URL || process.env.ESG_PROXY_UPSTREAM_URL || DEFAULT_UPSTREAM_BASE;
  const trimmed = configured.replace(/\/+$/, '');
  return `${trimmed}/api-proxy`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const upstreamUrl = buildUpstreamUrl();

  try {
    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-proxy': req.headers['x-app-proxy'] || '',
      },
      body: JSON.stringify(req.body || {}),
    });

    const contentType = response.headers.get('content-type') || 'application/json';
    const raw = await response.text();

    res.status(response.status);
    res.setHeader('Content-Type', contentType);
    return res.send(raw);
  } catch (error) {
    return res.status(503).json({
      error: 'Upstream proxy unavailable',
      details: error.message,
      upstreamUrl,
    });
  }
};
