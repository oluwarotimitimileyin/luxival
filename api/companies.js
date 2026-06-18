// api/companies.js
// Vercel serverless function — Finnish Business Intelligence dashboard data.
// Proxies the Finnish PRH open API (avoindata.prh.fi) for publicly registered companies.
// The PRH API is public and requires no authentication.

const PRH_BASE = 'https://avoindata.prh.fi/opendata-ytj-api/v3/companies';

function buildPrhUrl(date) {
  const params = new URLSearchParams({
    registrationDateStart: date,
    registrationDateEnd: date,
    companyForm: 'OY',
    resultsPerPage: '100',
  });
  return `${PRH_BASE}?${params.toString()}`;
}

function sanitizeString(value, fallback) {
  if (!value || typeof value !== 'string') return fallback;
  return value.replace(/\s+/g, ' ').trim().slice(0, 200);
}

function mapCompany(company, index) {
  return {
    id: `prh-llc-${sanitizeString(company.businessId, String(index))}`,
    name: sanitizeString(company.name, 'Unknown Entity'),
    idCode: sanitizeString(company.businessId, 'N/A'),
    type: 'OY',
    date: sanitizeString(company.registrationDate, ''),
    status: 'Registered',
    city: sanitizeString(company.domicile, 'Helsinki'),
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const queryDate =
    typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : new Date().toISOString().split('T')[0];

  try {
    const prhRes = await fetch(buildPrhUrl(queryDate), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!prhRes.ok) {
      throw new Error(`PRH API responded with ${prhRes.status}`);
    }

    const json = await prhRes.json();
    const results = Array.isArray(json.results) ? json.results : [];
    const companies = results.map(mapCompany);

    return res.status(200).json({
      success: true,
      dateQueried: queryDate,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    console.error('[companies] PRH API error:', error);
    return res.status(200).json({ success: false, count: 0, data: [] });
  }
};
