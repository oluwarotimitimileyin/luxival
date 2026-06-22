// api/chat.js
// Vercel serverless function for Luxival website chat.
// Multi-model router: routes each query to the best AI model
// across Anthropic, OpenAI, Google Gemini, Moonshot/Kimi, and DeepSeek.
// Grounded in real service data with lead capture.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const SERVICES_CATALOG = `
## SERVICES CATALOG

### Digital Services (luxival.com/services)

1. **Website Design** — Premium brand experiences with modern visuals, clear messaging, and conversion-first structure. Tags: UX, Visual Design, Conversion. /services/web-design
2. **Website Development** — Responsive, maintainable websites built for performance and scalability. HTML/CSS/JS, Supabase. /services/web-design
3. **SEO Analysis & Strategy** — Technical and content-level SEO audits grounded in Helsinki local search intent. Tags: Technical SEO, Local SEO. /qa
4. **SEO Competitor Analysis** — Competitor insights revealing content gaps, keyword opportunities, ranking strategy. /booking
5. **Offline Installation Processes** — On-site setup, signage deployment, installation workflows for retail, hospitality, venue launches. /booking
6. **3D UX / 3D Web Design** — Immersive interfaces, CSS 3D animations, motion-led interactions. /services/web-design
7. **UX Funnel Optimisation** — Flow design, user journey mapping, A/B-ready recommendations. Tags: UX Maps, A/B, Analytics. /booking
8. **Web QA & Quality Assurance** — Structured testing, Playwright/Selenium automation, ISTQB-certified. /services/software-testing or /qa
9. **UGC Character Content** — Character-led content systems, visual storytelling, social promotion. /booking
10. **TikTok Agency & UGC Content** — TikTok content strategy and production. /services/tiktok-agency
11. **AI Agent Infrastructure** — AI agent workflow design and implementation. From EUR 800. /services/ai-agents

### Tourism & Transport (luxival.com/tourism)

1. **Helsinki Airport Transfer** — Premium Helsinki-Vantaa pickup. EUR 225 fixed price. Professional drivers, no-smoking. /services/airport-transfer
2. **Private Rides & Custom Tours** — Sightseeing, city-to-city travel, custom routes tailored to schedule. /services/private-rides
3. **Hotel & House Sourcing** — Premium stays, boutique hotels, private homes in Helsinki and nearby regions. /services/hotel-sourcing
4. **Private Airport Pickup** — No-wait arrival support with flight tracking. /services/private-pickup
5. **City to City Travel** — Transfers between Helsinki, Espoo, Vantaa, Lahti, and nearby destinations. /services/city-to-city
6. **Tourism Planning** — Seasonal Finland experiences: northern lights, lake trips, sauna/wellness. /tourism-planning

### QA & Audit (luxival.com/qa)

1. **Website QA Audit** — Structured website quality audit with actionable PDF reports. From EUR 499. Playwright, Selenium, ISTQB.
2. **Software Test Automation** — CI/CD-integrated automated testing. /services/software-testing
3. **Performance Validation** — Speed, accessibility, reliability testing. /qa

### Special Services

1. **Custom Sewing Patterns** — Measurement support and custom pattern creation. /services/sewing-pattern
`;

const LUXIVAL_SYSTEM_PROMPT = `You are Luxival Assistant, the on-site sales AI for Luxival (luxival.com), a premium multi-service company based in Helsinki, Finland.

${SERVICES_CATALOG}

## LEAD CAPTURE INSTRUCTION

When a visitor shows clear purchase intent (asks to book, requests pricing for a specific service, provides contact details, or says they want to hire/order), append a lead block at the END of your reply on its own line:

[LEAD:{"service":"<id>","intent":"book|inquire","name":"<if provided>","email":"<if provided>","phone":"<if provided>","message":"<brief summary of what they want>"}]

Service IDs: web-design, web-development, seo-analysis, seo-competitor, offline-install, 3d-ux, ux-funnel, web-qa, ugc-content, tiktok-agency, ai-agents, airport-transfer, private-rides, hotel-sourcing, private-pickup, city-to-city, tourism-planning, website-audit, test-automation, performance-validation, sewing-pattern

Only include fields the visitor has actually shared. Never invent contact details.

## RULES
- Speak clear, concise English. Keep replies practical, under 140 words unless asked.
- Recommend the most relevant service based on what the visitor describes. Ask 1-2 qualifying questions if needed.
- Do not invent prices. Refer only to: EUR 225 airport transfer, EUR 499 website audit, EUR 800 AI agent infrastructure.
- For other pricing, say it depends on scope and offer to connect with the team.
- Never guarantee specific results.
- For booking or urgent contact: /contact or WhatsApp +358 50 351 8366.
- Adapt to page context: tourism page → emphasize transport. Services page → emphasize digital. QA page → emphasize audits.
- Be warm, professional, helpful. You are the first impression of Luxival.`;

// ---- TASK CLASSIFIER ----

const TASKS = {
  GREETING: 'greeting',
  FAQ: 'faq',
  SERVICE_RECOMMEND: 'service_recommend',
  TECHNICAL: 'technical',
  BOOKING: 'booking',
  TOURISM: 'tourism',
  PRICING: 'pricing',
  GENERAL: 'general',
};

function classifyTask(text) {
  const t = (text || '').toLowerCase();

  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|yo|sup)\b/.test(t)) return TASKS.GREETING;
  if (/(book|hire|order|engage|start\s*(project|working)|want\s*to\s*(hire|work|buy))/.test(t)) return TASKS.BOOKING;
  if (/(transfer|airport.*pickup|private.*ride|tourism|travel.*finland|hotel|trip\s*(to|plan)|helsinki.*(tour|sight)|lapland|northern.*light)/.test(t)) return TASKS.TOURISM;
  if (/(qa|audit|test\s*(ing|automation)|playwright|selenium|istqb|quality.*assurance)/.test(t)) return TASKS.TECHNICAL;
  if (/(seo|website|web\s*design|development|3d|ux|funnel|ugc|tiktok|content|character)/.test(t)) return TASKS.SERVICE_RECOMMEND;
  if (/(ai\s*agent|automation|workflow|pipeline|agentic)/.test(t)) return TASKS.TECHNICAL;
  if (/(price|cost|quote|how\s*much|pricing|estimate|budget|rate)/.test(t)) return TASKS.PRICING;
  if (/what\s*(services|do\s*you\s*offer|can\s*you\s*help)/.test(t)) return TASKS.FAQ;

  return TASKS.GENERAL;
}

// ---- MODEL REGISTRY ----

const PROVIDERS = {
  ANTHROPIC: 'anthropic',
  OPENAI: 'openai',
  GEMINI: 'gemini',
  MOONSHOT: 'moonshot',
  DEEPSEEK: 'deepseek',
};

const MODELS = {
  [PROVIDERS.ANTHROPIC]: {
    fast: 'claude-3-5-haiku-20241022',
    strong: 'claude-3-5-sonnet-20241022',
    key: () => ANTHROPIC_API_KEY,
  },
  [PROVIDERS.OPENAI]: {
    fast: 'gpt-4o-mini',
    strong: 'gpt-4o-2024-11-20',
    key: () => OPENAI_API_KEY,
  },
  [PROVIDERS.GEMINI]: {
    fast: 'gemini-2.0-flash-001',
    strong: 'gemini-2.5-flash-preview-04-17',
    key: () => GEMINI_API_KEY,
  },
  [PROVIDERS.MOONSHOT]: {
    fast: 'moonshot-v1-8k',
    strong: 'moonshot-v1-32k',
    key: () => MOONSHOT_API_KEY,
  },
  [PROVIDERS.DEEPSEEK]: {
    fast: 'deepseek-chat',
    strong: 'deepseek-reasoner',
    key: () => DEEPSEEK_API_KEY,
  },
};

function isAvailable(provider) {
  const cfg = MODELS[provider];
  return cfg && !!cfg.key();
}

// Task → preferred provider/model tier + fallback chain
const TASK_ROUTES = {
  [TASKS.GREETING]: [
    { provider: PROVIDERS.GEMINI, tier: 'fast' },
    { provider: PROVIDERS.ANTHROPIC, tier: 'fast' },
    { provider: PROVIDERS.OPENAI, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.FAQ]: [
    { provider: PROVIDERS.ANTHROPIC, tier: 'fast' },
    { provider: PROVIDERS.OPENAI, tier: 'fast' },
    { provider: PROVIDERS.GEMINI, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.SERVICE_RECOMMEND]: [
    { provider: PROVIDERS.ANTHROPIC, tier: 'strong' },
    { provider: PROVIDERS.OPENAI, tier: 'strong' },
    { provider: PROVIDERS.GEMINI, tier: 'strong' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.TECHNICAL]: [
    { provider: PROVIDERS.ANTHROPIC, tier: 'strong' },
    { provider: PROVIDERS.OPENAI, tier: 'strong' },
    { provider: PROVIDERS.GEMINI, tier: 'strong' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.BOOKING]: [
    { provider: PROVIDERS.OPENAI, tier: 'strong' },
    { provider: PROVIDERS.ANTHROPIC, tier: 'strong' },
    { provider: PROVIDERS.GEMINI, tier: 'strong' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.TOURISM]: [
    { provider: PROVIDERS.GEMINI, tier: 'strong' },
    { provider: PROVIDERS.ANTHROPIC, tier: 'strong' },
    { provider: PROVIDERS.OPENAI, tier: 'strong' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.PRICING]: [
    { provider: PROVIDERS.ANTHROPIC, tier: 'fast' },
    { provider: PROVIDERS.OPENAI, tier: 'fast' },
    { provider: PROVIDERS.GEMINI, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.GENERAL]: [
    { provider: PROVIDERS.ANTHROPIC, tier: 'fast' },
    { provider: PROVIDERS.OPENAI, tier: 'fast' },
    { provider: PROVIDERS.GEMINI, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
};

// ---- PROVIDER ADAPTERS ----

function buildProviderMessages(messages) {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

async function askAnthropic(messages, tier) {
  const model = MODELS[PROVIDERS.ANTHROPIC][tier || 'fast'];
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 450,
      system: LUXIVAL_SYSTEM_PROMPT,
      messages: buildProviderMessages(messages),
    }),
  });

  if (!response.ok) throw new Error(`Anthropic ${response.status}`);

  const data = await response.json();
  const text = data && data.content && data.content[0] && data.content[0].text;

  if (!text || typeof text !== 'string') throw new Error('No reply from Anthropic');

  return text.trim();
}

async function askOpenAI(messages, tier) {
  const model = MODELS[PROVIDERS.OPENAI][tier || 'fast'];
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 450,
      messages: [
        { role: 'system', content: LUXIVAL_SYSTEM_PROMPT },
        ...buildProviderMessages(messages),
      ],
    }),
  });

  if (!response.ok) throw new Error(`OpenAI ${response.status}`);

  const data = await response.json();
  const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

  if (!text || typeof text !== 'string') throw new Error('No reply from OpenAI');

  return text.trim();
}

async function askGemini(messages, tier) {
  const model = MODELS[PROVIDERS.GEMINI][tier || 'fast'];

  const geminiContents = [];
  const systemParts = [];

  if (LUXIVAL_SYSTEM_PROMPT) {
    systemParts.push({ text: LUXIVAL_SYSTEM_PROMPT });
  }

  for (const msg of messages) {
    geminiContents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  const body = {
    contents: geminiContents,
    generationConfig: { maxOutputTokens: 450 },
  };

  if (systemParts.length) {
    body.systemInstruction = { parts: systemParts };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) throw new Error(`Gemini ${response.status}`);

  const data = await response.json();
  const text =
    data &&
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].text;

  if (!text || typeof text !== 'string') throw new Error('No reply from Gemini');

  return text.trim();
}

async function askMoonshot(messages, tier) {
  const model = MODELS[PROVIDERS.MOONSHOT][tier || 'fast'];
  const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MOONSHOT_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 450,
      messages: [
        { role: 'system', content: LUXIVAL_SYSTEM_PROMPT },
        ...buildProviderMessages(messages),
      ],
    }),
  });

  if (!response.ok) throw new Error(`Moonshot ${response.status}`);

  const data = await response.json();
  const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

  if (!text || typeof text !== 'string') throw new Error('No reply from Moonshot');

  return text.trim();
}

async function askDeepSeek(messages, tier) {
  const model = MODELS[PROVIDERS.DEEPSEEK][tier || 'fast'];
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 450,
      messages: [
        { role: 'system', content: LUXIVAL_SYSTEM_PROMPT },
        ...buildProviderMessages(messages),
      ],
    }),
  });

  if (!response.ok) throw new Error(`DeepSeek ${response.status}`);

  const data = await response.json();
  const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

  if (!text || typeof text !== 'string') throw new Error('No reply from DeepSeek');

  return text.trim();
}

const PROVIDER_CALLS = {
  [PROVIDERS.ANTHROPIC]: askAnthropic,
  [PROVIDERS.OPENAI]: askOpenAI,
  [PROVIDERS.GEMINI]: askGemini,
  [PROVIDERS.MOONSHOT]: askMoonshot,
  [PROVIDERS.DEEPSEEK]: askDeepSeek,
};

// ---- ROUTER ----

async function askModel(messages, task) {
  const route = TASK_ROUTES[task] || TASK_ROUTES[TASKS.GENERAL];
  const errors = [];

  for (const choice of route) {
    if (!isAvailable(choice.provider)) {
      errors.push(`${choice.provider} not configured`);
      continue;
    }

    try {
      const call = PROVIDER_CALLS[choice.provider];
      return await call(messages, choice.tier);
    } catch (err) {
      errors.push(`${choice.provider}: ${err.message}`);
      console.error(`[chat] ${choice.provider} failed:`, err.message);
    }
  }

  throw new Error(`All models failed: ${errors.join('; ')}`);
}

// ---- MESSAGE HELPERS ----

function normalizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages
    .filter((message) => message && typeof message.content === 'string')
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content.trim().slice(0, 1200),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-30);
}

function parseLeadBlock(reply) {
  const match = reply.match(/\[LEAD:(\{[\s\S]*?\})\]/);
  if (!match) return { reply, lead: null };

  try {
    const lead = JSON.parse(match[1]);
    const cleanReply = reply.replace(match[0], '').trim();
    return { reply: cleanReply, lead };
  } catch {
    return { reply, lead: null };
  }
}

// ---- FALLBACK REPLIES ----

function fallbackReply(lastUserMessage) {
  const text = (lastUserMessage || '').toLowerCase();

  if (/(transfer|airport|ride|tourism|travel)/.test(text)) {
    return 'Great fit. Luxival handles airport pickups (EUR 225 fixed), private rides, and Finland travel planning. Share your date, pickup location, and number of passengers, and we can guide the next step. You can also book directly via luxival.com/tourism.';
  }

  if (/(seo|website|web design|automation|lead)/.test(text)) {
    return 'Luxival can help with website design, SEO visibility, and automation workflows. Tell me your main business goal for the next 90 days, and I will suggest the best starting package.';
  }

  if (/(qa|audit|test|testing)/.test(text)) {
    return 'Luxival provides website QA and audit services with actionable PDF reports starting from EUR 499. If you share your site URL and biggest current issue, I can suggest the most suitable audit path.';
  }

  if (/(price|cost|quote)/.test(text)) {
    return 'Pricing depends on your scope. I can help you get a fast estimate if you share your service type, timeline, and target result. For a formal quote, use luxival.com/contact.';
  }

  if (/(ai|agent|automation|workflow)/.test(text)) {
    return 'Luxival offers AI agent infrastructure starting at EUR 800. Tell me what process you want to automate and I can recommend the right approach.';
  }

  return 'Happy to help. Tell me whether you need digital growth, transfers/tourism, QA/audit support, or AI automation, and I will recommend the best next step.';
}

// ---- HANDLER ----

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const messages = normalizeMessages(req.body && req.body.messages);
    const sessionId = req.body && req.body.session_id ? req.body.session_id.slice(0, 64) : null;

    if (!messages.length) {
      return res.status(400).json({ error: 'No chat messages provided' });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const userText = lastUserMessage ? lastUserMessage.content : '';

    const hasAnyKey = ANTHROPIC_API_KEY || OPENAI_API_KEY || GEMINI_API_KEY || MOONSHOT_API_KEY;

    if (!hasAnyKey) {
      return res.status(200).json({ reply: fallbackReply(userText) });
    }

    const task = classifyTask(userText);
    const rawReply = await askModel(messages, task);
    const { reply, lead } = parseLeadBlock(rawReply);

    return res.status(200).json({
      reply,
      lead: lead || undefined,
      model: task,
      session_id: sessionId,
    });
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
