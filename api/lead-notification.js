const DEFAULT_TO_EMAIL = 'rotimikun@gmail.com';
const DEFAULT_FROM_EMAIL = 'Luxival Website <onboarding@resend.dev>';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeLead(raw) {
  const lead = raw && typeof raw === 'object' ? raw : {};
  return {
    type: String(lead.type || 'Website inquiry').slice(0, 120),
    name: String(lead.name || '').slice(0, 160),
    email: String(lead.email || '').slice(0, 200),
    phone: String(lead.phone || '').slice(0, 120),
    company: String(lead.company || '').slice(0, 180),
    preferredDate: String(lead.preferredDate || '').slice(0, 80),
    preferredTime: String(lead.preferredTime || '').slice(0, 80),
    message: String(lead.message || '').slice(0, 5000),
    source: String(lead.source || 'website').slice(0, 160),
  };
}

function parseRecipients(value) {
  const recipients = String(value || DEFAULT_TO_EMAIL)
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  return recipients.length ? recipients : [DEFAULT_TO_EMAIL];
}

function validReplyTo(value) {
  const email = String(value || '').trim();
  return EMAIL_PATTERN.test(email) ? email : undefined;
}

function buildEmail(lead) {
  const subject = `New Luxival request: ${lead.type}${lead.company ? ` - ${lead.company}` : ''}`;
  const rows = [
    ['Type', lead.type],
    ['Name', lead.name],
    ['Email', lead.email],
    ['Phone / WhatsApp', lead.phone],
    ['Company', lead.company],
    ['Preferred date', lead.preferredDate],
    ['Preferred time', lead.preferredTime],
    ['Source', lead.source],
  ];

  const text = [
    subject,
    '',
    ...rows.map(([label, value]) => `${label}: ${value || '-'}`),
    '',
    'Details:',
    lead.message || '-',
  ].join('\n');

  const htmlRows = rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555;width:170px">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111">${escapeHtml(value || '-')}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.5;color:#111">
      <h1 style="font-size:22px;margin:0 0 12px">New Luxival website request</h1>
      <p style="margin:0 0 18px;color:#555">A visitor submitted a request from luxival.com.</p>
      <table style="border-collapse:collapse;width:100%;max-width:680px;border:1px solid #eee">${htmlRows}</table>
      <h2 style="font-size:16px;margin:22px 0 8px">Details</h2>
      <pre style="white-space:pre-wrap;background:#f7f7f7;border:1px solid #eee;padding:12px;border-radius:6px">${escapeHtml(lead.message || '-')}</pre>
    </div>
  `;

  return { subject, text, html };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = parseRecipients(process.env.LEAD_NOTIFY_EMAIL || process.env.CONTACT_NOTIFY_EMAIL);
  const fromEmail = process.env.LEAD_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  if (!apiKey) {
    return res.status(503).json({
      error: 'Email notification is not configured',
      requiredEnv: ['RESEND_API_KEY'],
    });
  }

  const lead = normalizeLead(req.body);
  if (!lead.email || !lead.name) {
    return res.status(400).json({ error: 'Lead name and email are required' });
  }

  const email = buildEmail(lead);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        reply_to: validReplyTo(lead.email),
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Email provider rejected the notification',
        details: data && data.message ? data.message : data,
      });
    }

    return res.status(200).json({ ok: true, id: data.id || null });
  } catch (error) {
    return res.status(502).json({
      error: 'Email notification failed',
      details: error.message,
    });
  }
};
