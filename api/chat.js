// api/chat.js
// Vercel serverless function for Luxival website chat.
// Multi-model router: routes each query to the best AI model
// across Anthropic, OpenAI, Google Gemini, Moonshot/Kimi, DeepSeek, and Groq.
// Grounded in real service data with lead capture.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TRANSLATE_API = process.env.TRANSLATE_API || 'https://luxival-audit-api.fly.dev/translate';

const SERVICES_CATALOG = `
## SERVICES CATALOG

### Digital Services (luxival.com/services)

1. **Website Design** — Premium brand experiences with modern visuals, clear messaging, and conversion-first structure. From EUR 499. Tags: UX, Visual Design, Conversion. /services/web-design
2. **Website Development** — Responsive, maintainable websites built for performance and scalability. HTML/CSS/JS, Supabase. /services/web-design
3. **SEO Analysis & Strategy** — Technical and content-level SEO audits grounded in Helsinki local search intent. From EUR 299. Tags: Technical SEO, Local SEO. /qa
4. **SEO Competitor Analysis** — Competitor insights revealing content gaps, keyword opportunities, ranking strategy. /booking
5. **Offline Installation Processes** — On-site setup, signage deployment, installation workflows for retail, hospitality, venue launches. /booking
6. **3D UX / 3D Web Design** — Immersive interfaces, CSS 3D animations, motion-led interactions. /services/web-design
7. **UX Funnel Optimisation** — Flow design, user journey mapping, A/B-ready recommendations. Tags: UX Maps, A/B, Analytics. /booking
8. **Web QA & Quality Assurance** — Structured testing, Playwright/Selenium automation, ISTQB-certified from Helsinki. /services/software-testing or /qa
9. **UGC Character Content** — Character-led content systems, visual storytelling, social promotion. /booking
10. **TikTok Agency & UGC Content** — TikTok content strategy and production. /services/tiktok-agency
11. **AI Agent Infrastructure** — AI agent workflow design and implementation. Automates repetitive business tasks, lead processes, and reporting. From EUR 800. /services/ai-agents

### Engineering Design Services (luxival.com/services)

1. **Mechanical Design** — HVAC layouts, piping diagrams, structural mechanical drawings for residential, commercial, and light industrial projects. Requirements review, coordination-ready CAD/PDF files, calculation support, revision control, and 30-day post-delivery support. From EUR 800. /services/mechanical-design
2. **Electrical Design** — Power and lighting layouts, panel schedules, single-line diagrams, system schematics for residential and commercial projects. Load and scope review, safety-minded documentation, coordination file package, and 30-day clarification window. From EUR 800. /services/electrical-design

### Tourism & Transport (luxival.com/tourism)

1. **Helsinki Airport Transfer** — Premium Helsinki-Vantaa pickup. EUR 225 fixed price. Professional drivers, flight tracking, no-smoking vehicles. /services/airport-transfer
2. **Private Rides & Custom Tours** — Sightseeing, city-to-city travel, custom routes tailored to schedule. From EUR 90/hour. /services/private-rides
3. **Hotel & House Sourcing** — Premium stays, boutique hotels, private homes in Helsinki and nearby regions. /services/hotel-sourcing
4. **Private Airport Pickup** — No-wait arrival support with real-time flight tracking. From EUR 195. /services/private-pickup
5. **City to City Travel** — Transfers between Helsinki, Espoo, Vantaa, Lahti, Tampere, Turku, and nearby destinations. From EUR 120. /services/city-to-city
6. **Tourism Planning** — Seasonal Finland experiences: northern lights, lake trips, sauna/wellness, archipelago adventures. From EUR 150. /tourism-planning

### QA & Audit (luxival.com/qa)

1. **Website QA Audit** — Structured website quality audit with actionable PDF reports. ISTQB-certified methodology. From EUR 499. Playwright, Selenium.
2. **Software Test Automation** — CI/CD-integrated automated testing using Playwright and Selenium. Custom scripts for your workflows. /services/software-testing
3. **Performance Validation** — Speed, accessibility, reliability testing. /qa

### Special Services

1. **Custom Sewing Patterns** — Measurement support and custom pattern creation for any garment type. From EUR 150. /services/sewing-pattern

### Portfolio Projects (luxival.com/portfolio)

1. **ESG Compliance Auditor** — AI agent on Google Vertex AI + Gemini that analyses corporate ESG documents, surfaces compliance gaps, and generates board-ready recommendations. Live at /esg-compliance-auditor
2. **GROWTH_ARCHITECT** — Business intelligence and growth automation platform. /growth-architect
3. **BusinessLauncher** — Launch toolkit for new ventures with integrated digital presence. /businesslauncher
4. **UGC Studio AI** — AI-powered user-generated content studio for brand storytelling. /ugc-studio-ai
5. **Vortex AI Platform** — Multi-agent AI orchestration platform. /vortex-ai-platform
6. **Autonomous QA Audit Dashboard** — Self-running QA audit dashboard with Playwright/Selenium integration. /autonomous-qa-audit-dashboard
7. **AuraFrame** — Premium digital frame and visual experience platform. /apps/auraframe
8. **Finnish Business Intelligence Hub** — Finland-focused BI and market intelligence dashboard.
9. **Pattern Studio** — Bespoke custom sewing pattern creation with PDF download. /pattern

## COMPANY BACKGROUND

Luxival was founded by Olakunle Shopeju in Vantaa, Helsinki. Olakunle is a Senior QA Automation Engineer with 9+ years of experience across automotive, mobile, embedded, API, and web environments. ISTQB-certified. BEng in Mechanical Engineering. Currently completing IT studies in Helsinki. Luxival started with private airport transfers and expanded into digital services (web design, SEO, QA testing, AI automation) and engineering design (mechanical, electrical). The name combines luxury and value — precision service without unnecessary overhead.

## FAQ KNOWLEDGE BASE

### Airport Transfer FAQ (sourced from /blog/helsinki-airport-transfer-guide and /blog/helsinki-airport-transfer-questions-answered)
- **Cost**: Metered taxi €40–€60 city centre. Private transfer EUR 225 fixed (no meter, known upfront). Train under €5 but drops at central station not your door.
- **Flight delay**: Driver tracks flight in real time. No extra charge for monitored delays. Driver adjusts arrival automatically.
- **Booking**: Provide flight number, arrival date, and destination. Confirmed in 2 minutes. Driver meets in arrivals with name board. 24h minimum recommended.
- **Safety**: Finland is one of safest countries in Europe. Luxival drivers are professional, licensed, familiar with Finnish roads.
- **Other cities**: Operate city-to-city to Tampere, Turku, Oulu, Rovaniemi (Lapland gateway). Long distance priced upfront.
- **Comparison**: Private transfer vs taxi similar price for groups. vs train cheaper but no door-to-door. For business/late night/luggage: private wins.

### Tourism FAQ (sourced from /blog/finland-tourism-planning-questions, /blog/finland-winter-trip-guide, /blog/private-northern-lights-tour-finland, /blog/helsinki-private-city-tour-worth-it, /blog/finnish-lapland-luxury-winter-experiences, /blog/helsinki-food-tour-restaurants-guide, /blog/finnish-sauna-experience-tourists-guide, /blog/summer-finland-lakeland-guide, /blog/helsinki-archipelago-luxury-boat-experience, /blog/luxury-helsinki-experiences-not-on-viator, /blog/helsinki-business-travel-destination, /blog/helsinki-design-district-luxury-shopping, /blog/helsinki-spa-wellness-luxury-day)
- **Best time**: June–August for midnight sun, outdoor festivals, mid 20s °C. December–February for snow, northern lights (best in Lapland), quiet atmosphere. Shoulder seasons (spring/autumn): fewer crowds, lower prices.
- **Cost of visiting**: Helsinki restaurant meal €12–€18. Coffee €4–€6. Hotel €80–€150/night. Free experiences: public beaches, forest trails, design museums, open markets.
- **Must-see in Helsinki**: Oodi Library (free), Market Square (Kauppatori), Design District, Suomenlinna sea fortress (15-min ferry), at least one Finnish sauna.
- **Language**: English widely and confidently spoken. No need to speak Finnish. Bilingual Finnish/English content common.
- **Getting around**: Helsinki walkable with excellent trams/metro/buses/ferries. Trains to Tampere, Turku, Oulu, Rovaniemi. Private transfers for groups/families/business.
- **Planning approach**: Start with clear goal (nature, culture, city, adventure). 5-day well-planned itinerary > 10-day rush. Finland rewards slow travel.
- **Northern lights**: Best seen in Lapland (Rovaniemi, Inari) September–March. Helsinki-area sightings possible but rarer due to light pollution. Private multi-night aurora tours from EUR 1,200–2,500. Evening aurora chases from Rovaniemi EUR 150–350.
- **Winter essentials**: Thermal layers, waterproof winter boots, insulated gloves, wool hat. Temperatures can reach -20°C to -30°C in Lapland. Private transfers essential for remote locations.
- **Summer experiences**: Lakeland cruises, archipelago kayaking, Nuuksio foraging (Aug–Sep chanterelle peak), private island picnics (EUR 300–600), midnight sun experiences.
- **Food tours**: Private half-day food experiences €150–€280/person. Best stops: Old Market Hall (Vanha Kauppahalli), Market Square, fine dining at OLO/Grön/Ora. Must-try: lohikeitto (salmon soup), karjalanpiirakka (Karelian pastry), reindeer, chanterelles in autumn.
- **Sauna**: Traditional Finnish sauna is a must. Historic manor saunas within 60–90 min of Helsinki offer wood-fired lakeside experiences. Public saunas in Helsinki also available. Spa/wellness packages available.
- **Helsinki business travel**: Airport ranks top in Europe. Excellent English proficiency. Low corruption, trust-based business culture. Meetings start on time. Clean, safe, walkable. Summer light extraordinary, winter cosy.
- **Design District**: Multiple city blocks of design shops, fashion, architecture. Unlike any other shopping area in Europe.
- **Hidden gems**: Private twilight archipelago kayaking, Nuuksio foraging, early morning market with private chef, private island picnic, ice road driving (Feb–Mar), private Finnish music evening, luxury manor sauna.

### Web Design FAQ (sourced from /blog/web-design-finland-small-business-questions, /blog/web-design-mistakes-conversion, /blog/why-businesses-need-visibility-strategy-automation)
- **Cost**: Template site €500–€2,000. Custom conversion-optimised site €3,000–€8,000. Luxival starts from EUR 499.
- **Timeline**: Simple site 2–4 weeks. E-commerce or custom system 6–12 weeks. Biggest delay: client content readiness.
- **Will a new website bring customers?**: Only if built for conversion + SEO. A site that exists vs a site that works are different things.
- **Most important thing**: Clarity — visitor should understand within 3 seconds what you do, who it's for, what to do next.
- **Finnish vs English**: Both for widest reach. Finnish builds trust locally. English opens to international/expats. Bilingual recommended for Helsinki businesses.
- **Do I need a Finnish designer?**: You need someone who understands Finnish market, language requirements, and local customer expectations. Local SEO knowledge matters.
- **Common mistakes**: Trying to say too much at once, unclear CTAs, slow loading, poor mobile experience, no local SEO.
- **Conversion killers**: Unclear value proposition, too many choices, no social proof, slow load time, bad mobile experience.

### QA & Audit FAQ (sourced from /blog/software-testing-qa-business-questions, /blog/website-audit-what-it-is-why-you-need-it, /blog/what-is-istqb-certification, /blog/agentic-qa-release-confidence)
- **ISTQB**: International Software Testing Qualifications Board certification. Our QA follows ISTQB methodology covering functionality, usability, performance, security.
- **Report format**: PDF report with findings, screenshots, actionable recommendations.
- **Automation tools**: Playwright and Selenium for automated test coverage. Custom scripts for your workflows.
- **Timeline**: Standard audit 5–7 days. Quick check 24–48h. Larger sites more time.
- **Why audit?**: Catch issues before customers do. Improve conversion, performance, accessibility. Build trust.
- **What we test**: Functionality, usability, performance, security, accessibility, cross-browser compatibility.

### AI Agents FAQ (sourced from /blog/ai-agents-business-automation-questions, /blog/agentic-workflow-beginners-guide, /blog/agentic-workflow-playbooks)
- **What is an AI agent?**: A program that receives a goal, breaks it into steps, and completes them using tools (browsing, writing, emailing, APIs, forms). Unlike chatbots — agents actually do things.
- **What can they automate?**: Customer enquiries, lead qualification, follow-up emails, competitor monitoring, multi-source reporting, conditional workflow triggers.
- **vs regular automation**: Regular automation (Zapier, scripts) follows fixed if-then rules. AI agents handle ambiguity — can read messy input, understand intent, respond appropriately.
- **Do I need technical knowledge?**: Pre-built agents: no. Custom build: some help needed, or hire us. We build custom AI workflows.
- **Reliability**: Reliable for well-defined bounded tasks. Human review step recommended for high-stakes decisions (financial, medical, legal).
- **Cost**: Simple agent built in days. Complex multi-step system integrating CRM/email/APIs is larger. Usually pays for itself within 2–3 months in time saved.

### Mechanical & Electrical Design FAQ (sourced from /services/mechanical-design, /services/electrical-design)
- **Mechanical design**: HVAC layouts, piping diagrams, structural mechanical drawings. Requirements review, calculation support, CAD/PDF deliverables, 30-day support. From EUR 800.
- **Electrical design**: Power/lighting layouts, panel schedules, single-line diagrams. Load review, safety documentation, coordination file package, 30-day support. From EUR 800.
- **Who needs it?**: Architects, contractors, builders, property developers needing technical drawings for permitting, tendering, or construction.
- **Format**: CAD and PDF files delivered with version control. Source files included for client ownership.
- **Timeline**: Initial concepts within 1 week. Full packages depend on scope. Project brief reviewed within 1 business day.

## SEASONAL TOURISM KNOWLEDGE

- **Winter (Dec–Mar)**: Northern lights season. Lapland experiences, snow activities, ice road driving on Baltic Sea (Feb–Mar), cosy Helsinki winter atmosphere. Temperatures Helsinki -5°C to -15°C, Lapland -15°C to -30°C.
- **Spring (Apr–May)**: Shoulder season. Fewer crowds, lower prices. Melting snow, longer days. Good for city-focused trips.
- **Summer (Jun–Aug)**: Midnight sun (June–July). Outdoor festivals, archipelago boat trips, lakeland cruises, foraging in Nuuksio (Aug–Sep chanterelle peak), private island picnics. Temps mid 20s °C. Peak tourist season.
- **Autumn (Sep–Nov)**: Shoulder season. Beautiful autumn colours (ruska). Mushroom foraging peak. Fewer tourists. Northern lights season starts in September.

## HELSINKI LOCAL KNOWLEDGE

- **Neighbourhoods**: City centre (Kamppi, Kluuvi), Design District (Punavuori, Ullanlinna), waterfront (Katajanokka, Eira), trendy (Kallio, Suvilahti).
- **Key landmarks**: Oodi Library, Market Square (Kauppatori), Suomenlinna fortress, Uspenski Cathedral, Helsinki Cathedral, Temppeliaukio Church (rock church), Esplanadi Park.
- **Transport**: Helsinki-Vantaa Airport (HEL) — top-ranked European airport. Public transport: trams, metro, buses, ferries, commuter trains. All accessible via HSL app.
- **Day trips**: Porvoo (old town, 1h bus), Nuuksio National Park (35km, hiking/foraging), Tallinn (2h ferry), Suomenlinna (15-min ferry).
- **Food scene**: Old Market Hall (Vanha Kauppahalli, 1889), Market Square (Kauppatori, summer), fine dining at OLO/Grön/Ora. Must-try: lohikeitto, karjalanpiirakka, reindeer, chanterelles.
- **Design**: Design District covers Punavuori/Ullanlinna blocks. Marimekko, Artek, Iittala flagship stores. Unlike any other shopping area in Europe.
- **Business climate**: Low corruption (#1 globally), trust-based culture, meetings start on time, English widely spoken.

### Key Blog Posts

**For Website/SEO:** /blog/web-design-mistakes-conversion, /blog/seo-for-finnish-businesses, /blog/web-design-finland-small-business-questions, /blog/how-i-built-an-automated-lead-generation-system-for-web-design-clients, /blog/why-businesses-need-visibility-strategy-automation, /blog/website-losing-customers-how-to-fix

**For AI/Automation:** /blog/agentic-qa-release-confidence, /blog/agentic-workflow-beginners-guide, /blog/agentic-workflow-playbooks, /blog/ai-agents-business-automation-questions

**For QA/Testing:** /blog/software-testing-qa-business-questions, /blog/website-audit-what-it-is-why-you-need-it, /blog/what-is-istqb-certification

**For Tourism:** /blog/helsinki-airport-transfer-guide, /blog/helsinki-airport-transfer-questions-answered, /blog/finland-winter-trip-guide, /blog/private-northern-lights-tour-finland, /blog/helsinki-private-city-tour-worth-it, /blog/finland-tourism-planning-questions, /blog/finnish-lapland-luxury-winter-experiences, /blog/helsinki-food-tour-restaurants-guide, /blog/finnish-sauna-experience-tourists-guide, /blog/summer-finland-lakeland-guide, /blog/helsinki-archipelago-luxury-boat-experience, /blog/luxury-helsinki-experiences-not-on-viator, /blog/helsinki-business-travel-destination, /blog/helsinki-design-district-luxury-shopping, /blog/helsinki-spa-wellness-luxury-day, /blog/top-5-hidden-gems-helsinki

**For Sewing:** /blog/sewing-pattern-custom-suit-measurements

**For Transport:** /blog/private-chauffeur-helsinki-business, /blog/special-occasion-transport-helsinki, /blog/helsinki-night-transfers, /blog/rovaniemi-santa-claus-village-transfer

**About Luxival:** /blog/the-luxival-story
`;

function getSystemPrompt(language) {
  const lang = (language && language.trim()) || 'English';
  return `You are Luxival Assistant, the on-site sales AI for Luxival (luxival.com), a premium multi-service company based in Helsinki, Finland.

${SERVICES_CATALOG}

## LEAD CAPTURE INSTRUCTION

When a visitor shows clear purchase intent (asks to book, requests pricing for a specific service, provides contact details, or says they want to hire/order), append a lead block at the END of your reply on its own line:

[LEAD:{"service":"<id>","intent":"book|inquire","name":"<if provided>","email":"<if provided>","phone":"<if provided>","message":"<brief summary of what they want>"}]

Service IDs: web-design, web-development, seo-analysis, seo-competitor, offline-install, 3d-ux, ux-funnel, web-qa, ugc-content, tiktok-agency, ai-agents, mechanical-design, electrical-design, airport-transfer, private-rides, hotel-sourcing, private-pickup, city-to-city, tourism-planning, website-audit, test-automation, performance-validation, sewing-pattern

Only include fields the visitor has actually shared. Never invent contact details.

## BLOG POST RECOMMENDATIONS

When relevant, mention key blog posts from the list above to help visitors learn more. Format: "Read more: /blog/post-slug-title"

## RULES
- Respond in ${lang}. Speak clear, concise ${lang}. Keep replies practical, under 140 words unless asked.
- Recommend the most relevant service based on what the visitor describes. Ask 1-2 qualifying questions if needed.
- Refer to pricing from the catalog above when available (EUR 225 airport transfer, EUR 499 website audit, EUR 299 SEO, EUR 800 AI agents, EUR 800 mechanical design, EUR 800 electrical design, EUR 90/h private rides, EUR 195 private pickup, EUR 120 city-to-city, EUR 150 tourism planning, EUR 150 sewing patterns, EUR 499 website design starting).
- For complex pricing that varies by scope (full web design projects, custom multi-step AI workflows, large design packages), say it depends on scope and offer to connect with the team.
- Never guarantee specific results.
- For booking or urgent contact: /contact or WhatsApp +358 50 351 8366.
- Adapt to page context: tourism page → emphasize transport. Services page → emphasize digital. QA page → emphasize audits.
- Be warm, professional, helpful. You are the first impression of Luxival.

## PORTFOLIO & PRE-BOOKING ADVISORY
- When a visitor asks about past work or what you have built, showcase relevant portfolio projects from the PORTFOLIO list above. Match projects to their stated needs (e.g. need a website → show BusinessLauncher, UGC Studio AI, AuraFrame; need QA → show Autonomous QA Audit Dashboard; need AI → show ESG Compliance Auditor, Vortex AI Platform).
- When a visitor expresses interest in booking (any service), advise them on what to prepare before booking:
  * For digital/website: ask about their brand vision, preferred style/colour direction, content readiness (copy, images), timeline, and budget range.
  * For tourism/transfer: ask for flight number/pickup time, passenger count, luggage details, destination address, and any special requirements.
  * For QA/audit: ask for the website URL, key pages to test, specific issues they have noticed, and preferred report format.
  * For AI agents: ask what process they want to automate, current tools/stack, data sources, expected users, and outcome goals.
  * For mechanical design: ask about building type, scope (HVAC/piping/structural), project phase, required file formats (CAD/PDF), and timeline.
  * For electrical design: ask about project type (residential/commercial), scope (power/lighting/panels), load requirements, file format needs, and timeline.
  * For sewing patterns: ask for body measurements, garment type, fabric preferences, and fit references.
- After gathering 2-3 qualifying details, recommend the best next step (usually /booking or /contact) or offer to capture their details as a lead.

## CONVERSATION CONTEXT
When a lead is captured with conversation history, include the full transcript in the lead block. The system will include the conversation array when sending lead details.`;
}

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
  GROQ: 'groq',
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
  [PROVIDERS.GROQ]: {
    fast: 'llama-3.3-70b-versatile',
    strong: 'llama-3.3-70b-versatile',
    key: () => GROQ_API_KEY,
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
    { provider: PROVIDERS.GROQ, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.FAQ]: [
    { provider: PROVIDERS.ANTHROPIC, tier: 'fast' },
    { provider: PROVIDERS.OPENAI, tier: 'fast' },
    { provider: PROVIDERS.GEMINI, tier: 'fast' },
    { provider: PROVIDERS.GROQ, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.SERVICE_RECOMMEND]: [
    { provider: PROVIDERS.ANTHROPIC, tier: 'strong' },
    { provider: PROVIDERS.OPENAI, tier: 'strong' },
    { provider: PROVIDERS.GEMINI, tier: 'strong' },
    { provider: PROVIDERS.GROQ, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.TECHNICAL]: [
    { provider: PROVIDERS.ANTHROPIC, tier: 'strong' },
    { provider: PROVIDERS.OPENAI, tier: 'strong' },
    { provider: PROVIDERS.GEMINI, tier: 'strong' },
    { provider: PROVIDERS.GROQ, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.BOOKING]: [
    { provider: PROVIDERS.OPENAI, tier: 'strong' },
    { provider: PROVIDERS.ANTHROPIC, tier: 'strong' },
    { provider: PROVIDERS.GEMINI, tier: 'strong' },
    { provider: PROVIDERS.GROQ, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.TOURISM]: [
    { provider: PROVIDERS.GEMINI, tier: 'strong' },
    { provider: PROVIDERS.ANTHROPIC, tier: 'strong' },
    { provider: PROVIDERS.OPENAI, tier: 'strong' },
    { provider: PROVIDERS.GROQ, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.PRICING]: [
    { provider: PROVIDERS.ANTHROPIC, tier: 'fast' },
    { provider: PROVIDERS.OPENAI, tier: 'fast' },
    { provider: PROVIDERS.GEMINI, tier: 'fast' },
    { provider: PROVIDERS.GROQ, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
  [TASKS.GENERAL]: [
    { provider: PROVIDERS.ANTHROPIC, tier: 'fast' },
    { provider: PROVIDERS.OPENAI, tier: 'fast' },
    { provider: PROVIDERS.GEMINI, tier: 'fast' },
    { provider: PROVIDERS.GROQ, tier: 'fast' },
    { provider: PROVIDERS.DEEPSEEK, tier: 'fast' },
    { provider: PROVIDERS.MOONSHOT, tier: 'fast' },
  ],
};

// ---- PROVIDER ADAPTERS ----

function buildProviderMessages(messages) {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

async function askAnthropic(messages, tier, language) {
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
      system: getSystemPrompt(language),
      messages: buildProviderMessages(messages),
    }),
  });

  if (!response.ok) throw new Error(`Anthropic ${response.status}`);

  const data = await response.json();
  const text = data && data.content && data.content[0] && data.content[0].text;

  if (!text || typeof text !== 'string') throw new Error('No reply from Anthropic');

  return text.trim();
}

async function askOpenAI(messages, tier, language) {
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
        { role: 'system', content: getSystemPrompt(language) },
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

async function askGemini(messages, tier, language) {
  const model = MODELS[PROVIDERS.GEMINI][tier || 'fast'];

  const geminiContents = [];
  const systemParts = [];
  const sysPrompt = getSystemPrompt(language);

  if (sysPrompt) {
    systemParts.push({ text: sysPrompt });
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

async function askMoonshot(messages, tier, language) {
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
        { role: 'system', content: getSystemPrompt(language) },
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

async function askDeepSeek(messages, tier, language) {
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
        { role: 'system', content: getSystemPrompt(language) },
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

async function askGroq(messages, tier, language) {
  const model = MODELS[PROVIDERS.GROQ][tier || 'fast'];
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 450,
      messages: [
        { role: 'system', content: getSystemPrompt(language) },
        ...buildProviderMessages(messages),
      ],
    }),
  });

  if (!response.ok) throw new Error(`Groq ${response.status}`);

  const data = await response.json();
  const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

  if (!text || typeof text !== 'string') throw new Error('No reply from Groq');

  return text.trim();
}

const PROVIDER_CALLS = {
  [PROVIDERS.ANTHROPIC]: (messages, tier, language) => askAnthropic(messages, tier, language),
  [PROVIDERS.OPENAI]: (messages, tier, language) => askOpenAI(messages, tier, language),
  [PROVIDERS.GEMINI]: (messages, tier, language) => askGemini(messages, tier, language),
  [PROVIDERS.MOONSHOT]: (messages, tier, language) => askMoonshot(messages, tier, language),
  [PROVIDERS.DEEPSEEK]: (messages, tier, language) => askDeepSeek(messages, tier, language),
  [PROVIDERS.GROQ]: (messages, tier, language) => askGroq(messages, tier, language),
};

// ---- ROUTER ----

async function askModel(messages, task, language) {
  const route = TASK_ROUTES[task] || TASK_ROUTES[TASKS.GENERAL];
  const errors = [];

  for (const choice of route) {
    if (!isAvailable(choice.provider)) {
      errors.push(`${choice.provider} not configured`);
      continue;
    }

    try {
      const call = PROVIDER_CALLS[choice.provider];
      return await call(messages, choice.tier, language);
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

// ---- TRANSLATION HELPER ----

async function translateText(text, targetLang) {
  if (!targetLang || targetLang === 'en' || targetLang === 'English') return text;
  const langCode = { finnish: 'fi', swedish: 'sv', german: 'de', french: 'fr', italian: 'it', russian: 'ru', norwegian: 'no', danish: 'da', japanese: 'ja', chinese: 'zh', spanish: 'es', portuguese: 'pt', dutch: 'nl' }[targetLang.toLowerCase()] || targetLang.slice(0, 2);
  if (langCode === 'en') return text;
  try {
    const resp = await fetch(TRANSLATE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source: 'auto', target: langCode }),
    });
    if (!resp.ok) return text;
    const data = await resp.json();
    return data.translated_text || text;
  } catch {
    return text;
  }
}

// ---- BLOG RECOMMENDATIONS ----

function getBlogRecommendations(userText, pagePath) {
  const text = (userText || '').toLowerCase();
  const recommendations = [];

  const serviceBlogMap = {
    website: ['/blog/web-design-mistakes-conversion', '/blog/web-design-finland-small-business-questions', '/blog/how-i-built-an-automated-lead-generation-system-for-web-design-clients', '/blog/why-businesses-need-visibility-strategy-automation', '/blog/website-losing-customers-how-to-fix'],
    seo: ['/blog/seo-for-finnish-businesses', '/blog/helsinki-airport-transfer-guide'],
    ai: ['/blog/agentic-qa-release-confidence', '/blog/agentic-workflow-beginners-guide', '/blog/agentic-workflow-playbooks', '/blog/ai-agents-business-automation-questions'],
    qa: ['/blog/software-testing-qa-business-questions', '/blog/website-audit-what-it-is-why-you-need-it', '/blog/what-is-istqb-certification'],
    tiktok: ['/blog/tiktok-agency-live-selling-ugc', '/blog/ugc-ai-video-creation-brand-campaigns'],
    airport: ['/blog/helsinki-airport-transfer-guide', '/blog/helsinki-airport-transfer-questions-answered'],
    winter: ['/blog/finland-winter-trip-guide', '/blog/finnish-lapland-luxury-winter-experiences'],
    lapland: ['/blog/finnish-lapland-luxury-winter-experiences', '/blog/private-northern-lights-tour-finland', '/blog/rovaniemi-santa-claus-village-transfer'],
    sauna: ['/blog/helsinki-spa-wellness-luxury-day', '/blog/finnish-sauna-experience-tourists-guide'],
    helsinki: ['/blog/helsinki-private-city-tour-worth-it', '/blog/top-5-hidden-gems-helsinki', '/blog/helsinki-food-tour-restaurants-guide', '/blog/helsinki-design-district-luxury-shopping'],
    food: ['/blog/helsinki-food-tour-restaurants-guide'],
    design: ['/blog/helsinki-design-district-luxury-shopping'],
    archipelago: ['/blog/helsinki-archipelago-luxury-boat-experience'],
    summer: ['/blog/summer-finland-lakeland-guide', '/blog/helsinki-archipelago-luxury-boat-experience'],
    northern: ['/blog/private-northern-lights-tour-finland', '/blog/finland-winter-trip-guide'],
    tourism: ['/blog/finland-tourism-planning-questions', '/blog/luxury-helsinki-experiences-not-on-viator'],
    ferry: ['/blog/helsinki-to-tallinn-ferry-day-trip'],
    business: ['/blog/helsinki-business-travel-destination', '/blog/private-chauffeur-helsinki-business'],
    chauffeur: ['/blog/private-chauffeur-helsinki-business', '/blog/special-occasion-transport-helsinki'],
    sewing: ['/blog/sewing-pattern-custom-suit-measurements'],
    istqb: ['/blog/what-is-istqb-certification'],
    mechanical: ['/services/mechanical-design'],
    electrical: ['/services/electrical-design']
  };

  for (const [keyword, posts] of Object.entries(serviceBlogMap)) {
    if (text.includes(keyword)) {
      recommendations.push(...posts.slice(0, 2));
    }
  }

  return [...new Set(recommendations)].slice(0, 3);
}

function formatBlogLinks(posts) {
  if (!posts.length) return '';
  const links = posts.map(p => `<a href="${p}" target="_blank">${p.split('/').pop()?.replace(/-/g, ' ')}</a>`).join(', ');
  return `\n\nRelated reading: ${links}`;
}

// ---- FALLBACK REPLIES ----

function fallbackReply(lastUserMessage, pagePath) {
  const text = (lastUserMessage || '').toLowerCase();

  if (/(transfer|airport|ride|tourism|travel)/.test(text)) {
    const blogs = getBlogRecommendations(text, pagePath);
    return `Great fit. Luxival handles airport pickups (EUR 225 fixed), private rides, and Finland travel planning. Share your date, pickup location, and number of passengers, and we can guide the next step. You can also book directly via luxival.com/tourism.${blogs.length ? formatBlogLinks(blogs) : ''}`;
  }

  if (/(seo|website|web design|automation|lead)/.test(text)) {
    const blogs = getBlogRecommendations(text, pagePath);
    return `Luxival can help with website design, SEO visibility, and automation workflows. Tell me your main business goal for the next 90 days, and I will suggest the best starting package.${blogs.length ? formatBlogLinks(blogs) : ''}`;
  }

  if (/(qa|audit|test|testing)/.test(text)) {
    const blogs = getBlogRecommendations(text, pagePath);
    return `Luxival provides website QA and audit services with actionable PDF reports starting from EUR 499. If you share your site URL and biggest current issue, I can suggest the most suitable audit path.${blogs.length ? formatBlogLinks(blogs) : ''}`;
  }

  if (/(price|cost|quote)/.test(text)) {
    return 'Pricing depends on your scope. I can help you get a fast estimate if you share your service type, timeline, and target result. For a formal quote, use luxival.com/contact.';
  }

  if (/(ai|agent|automation|workflow)/.test(text)) {
    const blogs = getBlogRecommendations(text, pagePath);
    return `Luxival offers AI agent infrastructure starting at EUR 800. Tell me what process you want to automate and I can recommend the right approach.${blogs.length ? formatBlogLinks(blogs) : ''}`;
  }

  if (/(mechanical|hvac|piping|lift|structural|mech.*design)/.test(text)) {
    return `Luxival provides mechanical design services — HVAC layouts, piping diagrams, structural drawings from EUR 800. Tell me about your project scope and I can guide the next step.`;
  }

  if (/(electrical|power.*layout|lighting.*layout|panel.*schedule|elec.*design)/.test(text)) {
    return `Luxival provides electrical design services — power/lighting layouts, panel schedules, single-line diagrams from EUR 800. Share your project type and I can help.`;
  }

  if (/(sewing|pattern|garment|dress|suit|measurement)/.test(text)) {
    return `Luxival offers custom sewing patterns from EUR 150. Tell me what garment type you need and I can guide you on the process.`;
  }

  if (/(lapland|aurora|northern.*light|santa|rovaniemi)/.test(text)) {
    const blogs = getBlogRecommendations(text, pagePath);
    return `We offer Lapland travel planning, northern lights tours, and Rovaniemi transfers. The best aurora season is September–March. Want me to suggest options?${blogs.length ? formatBlogLinks(blogs) : ''}`;
  }

  if (/(food|restaurant|dining|market|cuisine)/.test(text)) {
    const blogs = getBlogRecommendations(text, pagePath);
    return `Helsinki has a serious food scene — from Old Market Hall to fine dining at OLO/Grön. We arrange private food tours from EUR 150/person.${blogs.length ? formatBlogLinks(blogs) : ''}`;
  }

  if (/(sauna|spa|wellness|steam)/.test(text)) {
    const blogs = getBlogRecommendations(text, pagePath);
    return `Finnish sauna culture is a must-experience. We offer private sauna experiences and spa/wellness packages in Helsinki.${blogs.length ? formatBlogLinks(blogs) : ''}`;
  }

  if (/(archipelago|boat|kayak|island)/.test(text)) {
    const blogs = getBlogRecommendations(text, pagePath);
    return `Helsinki's archipelago is stunning. We offer private boat trips, island picnics, and kayaking experiences from June–August.${blogs.length ? formatBlogLinks(blogs) : ''}`;
  }

  if (/(about.*luxival|who.*(behind|founded|owner)|company.*background|luxival.*story)/.test(text)) {
    return `Luxival was founded by Olakunle Shopeju, a Senior QA Automation Engineer (ISTQB-certified) based in Vantaa, Helsinki. 9+ years in QA and engineering. We offer transport, digital, and engineering design services built around precision and clear communication. Read more: /blog/the-luxival-story`;
  }

  return 'Happy to help. Tell me whether you need digital growth, transfers/tourism, QA/audit, engineering design, or AI automation, and I will recommend the best next step.';
}

// ---- HANDLER ----

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const messages = normalizeMessages(req.body && req.body.messages);
    const sessionId = req.body && req.body.session_id ? req.body.session_id.slice(0, 64) : null;
    const language = req.body && req.body.language ? req.body.language.trim().slice(0, 30) : 'en';

    if (!messages.length) {
      return res.status(400).json({ error: 'No chat messages provided' });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const userText = lastUserMessage ? lastUserMessage.content : '';

    const hasAnyKey = ANTHROPIC_API_KEY || OPENAI_API_KEY || GEMINI_API_KEY || MOONSHOT_API_KEY;
    const pagePath = req.body && req.body.page ? req.body.page : '';

    if (!hasAnyKey) {
      const reply = await translateText(fallbackReply(userText, pagePath), language);
      return res.status(200).json({ reply });
    }

    const task = classifyTask(userText);
    const rawReply = await askModel(messages, task, language);
    const { reply, lead } = parseLeadBlock(rawReply);

    return res.status(200).json({
      reply,
      lead: lead || undefined,
      model: task,
      language: language,
      session_id: sessionId,
    });
  } catch (error) {
    const lastUserMessage =
      req.body && Array.isArray(req.body.messages)
        ? req.body.messages[req.body.messages.length - 1] && req.body.messages[req.body.messages.length - 1].content
        : '';
    const pagePath = req.body && req.body.page ? req.body.page : '';

    console.error('[chat] Error:', error);
    const fallback = fallbackReply(typeof lastUserMessage === 'string' ? lastUserMessage : '', pagePath);
    const translated = await translateText(fallback, req.body?.language || 'en').catch(() => fallback);
    return res.status(200).json({
      reply: translated,
      degraded: true,
    });
  }
};
