const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const META_APP_SECRET = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET || '';
const SITE_URL = (process.env.SITE_URL || 'https://www.luxival.com').replace(/\/+$/, '');

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function base64UrlDecode(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, 'base64');
}

function timingSafeEqualHex(left, right) {
  const leftBuffer = Buffer.from(left || '', 'hex');
  const rightBuffer = Buffer.from(right || '', 'hex');
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseSignedRequest(signedRequest) {
  const [encodedSignature, encodedPayload] = String(signedRequest || '').split('.');
  if (!encodedSignature || !encodedPayload) {
    throw new Error('Invalid signed_request format');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8'));

  if (META_APP_SECRET) {
    const expectedSignature = crypto
      .createHmac('sha256', META_APP_SECRET)
      .update(encodedPayload)
      .digest('hex');
    const actualSignature = base64UrlDecode(encodedSignature).toString('hex');

    if (!timingSafeEqualHex(actualSignature, expectedSignature)) {
      throw new Error('Invalid signed_request signature');
    }
  }

  return payload;
}

function parseBody(req) {
  const body = req.body || {};
  if (typeof body === 'string') {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      return Object.fromEntries(new URLSearchParams(body));
    }
    try {
      return JSON.parse(body);
    } catch (error) {
      return {};
    }
  }
  return body;
}

function buildSupabaseHeaders(prefer = 'return=representation') {
  return {
    'Content-Type': 'application/json',
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    Prefer: prefer,
  };
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...buildSupabaseHeaders(options.prefer),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = text;
    }
  }

  if (!response.ok) {
    const detail = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }

  return Array.isArray(data) ? data : [];
}

async function deleteByEmail(table, email) {
  const rows = await supabaseRequest(`${table}?email=eq.${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
  return rows.length;
}

async function anonymizeRideRequests(email, confirmationCode) {
  const anonymizedEmail = `deleted-${confirmationCode}@privacy.luxival.local`;
  const rows = await supabaseRequest(`ride_requests?email=eq.${encodeURIComponent(email)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      customer_name: 'Deleted user',
      email: anonymizedEmail,
      phone: null,
      pickup_location: null,
      destination: null,
      flight_number: null,
      airline: null,
      notes: null,
      status: 'privacy_deleted',
    }),
  });
  return rows.length;
}

async function processEmailDeletion(email, confirmationCode) {
  const [contactInquiries, newsletterSubscribers, tiktokApplications, rideRequestsAnonymized] = await Promise.all([
    deleteByEmail('contact_inquiries', email),
    deleteByEmail('newsletter_subscribers', email),
    deleteByEmail('tiktok_agency_applications', email),
    anonymizeRideRequests(email, confirmationCode),
  ]);

  return {
    contactInquiries,
    newsletterSubscribers,
    tiktokApplications,
    rideRequestsAnonymized,
  };
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      message: 'Submit a POST request with an email address, or use /user-data-deletion.',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = parseBody(req);
    const signedRequest = body.signed_request || body.signedRequest;
    const confirmationCode = crypto.randomBytes(8).toString('hex');

    if (signedRequest) {
      const payload = parseSignedRequest(signedRequest);
      console.info('[user-data-deletion] Meta deletion callback received', {
        userId: payload.user_id || payload.userID || null,
        issuedAt: payload.issued_at || null,
      });

      return res.status(200).json({
        url: `${SITE_URL}/user-data-deletion?confirmation=${confirmationCode}`,
        confirmation_code: confirmationCode,
      });
    }

    const email = normalizeEmail(body.email);
    const confirmEmail = normalizeEmail(body.confirmEmail || body.confirm_email || body.email);

    if (!isValidEmail(email) || email !== confirmEmail) {
      return res.status(400).json({ error: 'Please provide matching valid email addresses.' });
    }

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: 'Deletion service is not configured',
        missing: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].filter((key) => !process.env[key]),
      });
    }

    const deleted = await processEmailDeletion(email, confirmationCode);

    return res.status(200).json({
      success: true,
      confirmationCode,
      message: 'Personal data deletion has been processed for the supplied email address.',
      deleted,
    });
  } catch (error) {
    console.error('[user-data-deletion] Error:', error);
    return res.status(500).json({ error: 'Unable to process deletion request right now.' });
  }
};
