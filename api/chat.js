// api/chat.js
// Vercel serverless function for Luxival website chat.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const LUXIVAL_SYSTEM_PROMPT = [
  'You are Luxival assistant, an on-site sales and support AI for a Helsinki-based premium business.',
  'Business focus: digital services (web design, SEO, automation), tourism and transfers, and QA/audit services.',
  'Speak in clear, concise English and keep replies practical.',
  'When useful, ask one qualifying follow-up question to move the lead forward.',
  'Do not invent prices or guarantees.',
  'If the user asks for booking or direct contact, point them to /contact and WhatsApp +358 50 351 8366.',
  'Keep answers under 140 words unless the user explicitly asks for detail.'
].join(' ');

function normalizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages
    .filter((message) => message && typeof message.content === 'string')
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content.trim().slice(0, 1200),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-12);
}

function fallbackReply(lastUserMessage) {
  const text = (lastUserMessage || '').toLowerCase();

  if (/(transfer|airport|ride|tourism|travel)/.test(text)) {
    return 'Great fit. Luxival handles airport pickups, private rides, and Finland travel planning. Share your date, pickup location, and number of passengers, and we can guide the next step. You can also book directly via /transfers.';
  }

  if (/(seo|website|web design|automation|lead)/.test(text)) {
    return 'Luxival can help with website design, SEO visibility, and automation workflows. Tell me your main business goal for the next 90 days, and I will suggest the best starting package.';
  }

  if (/(qa|audit|test|testing)/.test(text)) {
    return 'Luxival provides website QA and audit services with actionable reports. If you share your site URL and biggest current issue, I can suggest the most suitable audit path.';
  }

  if (/(price|cost|quote)/.test(text)) {
    return 'Pricing depends on your scope. I can help you get a fast estimate if you share your service type, timeline, and target result. For a formal quote, use /contact.';
  }

  return 'Happy to help. Tell me whether you need digital growth, transfers/tourism, or QA/audit support, and I will recommend the best next step.';
}

async function askAnthropic(messages) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      system: LUXIVAL_SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data && data.content && data.content[0] && data.content[0].text;

  if (!text || typeof text !== 'string') {
    throw new Error('No reply returned by model');
  }

  return text.trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const messages = normalizeMessages(req.body && req.body.messages);
    if (!messages.length) {
      return res.status(400).json({ error: 'No chat messages provided' });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

    if (!ANTHROPIC_API_KEY) {
      return res.status(200).json({ reply: fallbackReply(lastUserMessage ? lastUserMessage.content : '') });
    }

    const reply = await askAnthropic(messages);
    return res.status(200).json({ reply });
  } catch (error) {
    const lastUserMessage =
      req.body && Array.isArray(req.body.messages)
        ? req.body.messages[req.body.messages.length - 1] && req.body.messages[req.body.messages.length - 1].content
        : '';

    console.error('[chat] Error:', error);
    return res.status(200).json({
      reply: fallbackReply(typeof lastUserMessage === 'string' ? lastUserMessage : ''),
      degraded: true,
    });
  }
};
