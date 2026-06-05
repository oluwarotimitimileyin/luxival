const DEFAULT_TO_EMAILS = ['support@luxival.com'];

function setCors(req, res) {
  const allowedOrigins = ['https://luxival.com', 'https://www.luxival.com'];
  const requestOrigin = req.headers.origin || '';
  if (allowedOrigins.includes(requestOrigin) || requestOrigin.startsWith('http://localhost')) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.luxival.com');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getRecipients() {
  const configured = toArray(process.env.RIDE_REQUEST_TO_EMAILS);
  const cc = process.env.RIDE_REQUEST_CC_EMAIL ? [process.env.RIDE_REQUEST_CC_EMAIL.trim()] : [];
  return Array.from(new Set([...DEFAULT_TO_EMAILS, ...configured, ...cc].filter(Boolean)));
}

function sanitize(payload = {}) {
  return {
    customer_name: String(payload.customer_name || '').trim(),
    email: String(payload.email || '').trim(),
    phone: payload.phone ? String(payload.phone).trim() : null,
    pickup_location: String(payload.pickup_location || '').trim(),
    destination: String(payload.destination || '').trim(),
    preferred_date: payload.preferred_date || null,
    ride_time: payload.ride_time || null,
    service_type: String(payload.service_type || '').trim(),
    flight_number: payload.flight_number ? String(payload.flight_number).trim() : null,
    notes: payload.notes ? String(payload.notes).trim() : null,
    airport_surcharge: Boolean(payload.airport_surcharge),
    busy_hour: Boolean(payload.busy_hour),
    status: String(payload.status || 'pending'),
    source: String(payload.source || 'tourism-page'),
  };
}

function validate(payload) {
  if (!payload.customer_name) return 'Name is required.';
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) return 'A valid email is required.';
  if (!payload.pickup_location) return 'Pickup location is required.';
  if (!payload.destination) return 'Destination is required.';
  if (!payload.service_type) return 'Service type is required.';
  return null;
}

function formatEmailText(payload) {
  return [
    'New Luxival ride request',
    '',
    `Name: ${payload.customer_name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || '-'}`,
    `Pickup: ${payload.pickup_location}`,
    `Destination: ${payload.destination}`,
    `Preferred date: ${payload.preferred_date || '-'}`,
    `Ride time: ${payload.ride_time || '-'}`,
    `Service type: ${payload.service_type}`,
    `Flight number: ${payload.flight_number || '-'}`,
    `Airport surcharge route: ${payload.airport_surcharge ? 'Yes' : 'No'}`,
    `Busy hour: ${payload.busy_hour ? 'Yes' : 'No'}`,
    `Source: ${payload.source || '-'}`,
    '',
    'Notes:',
    payload.notes || '-',
  ].join('\n');
}

async function sendViaResend(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[ride-request] RESEND_API_KEY is not configured');
    return { ok: false, reason: 'resend_not_configured' };
  }

  const from = process.env.RIDE_REQUEST_FROM_EMAIL || 'Luxival <noreply@luxival.com>';
  const to = getRecipients();
  const subject = `New ride request: ${payload.pickup_location} → ${payload.destination}`;
  const text = formatEmailText(payload);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        reply_to: payload.email,
        text,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('[ride-request] Resend send failed:', response.status, data);
      return { ok: false, reason: 'resend_send_failed' };
    }
    return { ok: true, id: data.id || null };
  } catch (error) {
    console.error('[ride-request] Resend request error:', error);
    return { ok: false, reason: 'resend_request_failed' };
  }
}

module.exports = async (req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = sanitize(req.body || {});
  const validationError = validate(payload);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const emailResult = await sendViaResend(payload);
  if (!emailResult.ok) {
    return res.status(500).json({
      error: 'Unable to send your request right now. Please email support@luxival.com directly.',
    });
  }

  return res.status(200).json({ ok: true });
};
