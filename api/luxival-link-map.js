// api/luxival-link-map.js
// Central internal-linking map for the Luxival chatbot.
// Exports one structure + one helper. Every URL below is confirmed in sitemap.xml.
// Additive, dependency-free, Node CommonJS. Imported by api/chat.js.

const LINK_MAP = {
  webDesign: {
    intent: 'webDesign',
    keywords: ['website design', 'web design', 'business website', 'landing page', 'website redesign', 'build a website', 'homepage', 'portfolio site', 'company website'],
    primaryPage: '/services/web-design',
    primaryLabel: 'Website design & development',
    relatedPages: [
      { href: '/qa', label: 'SEO & visibility audit' },
      { href: '/contact', label: 'Contact Luxival' },
    ],
    relatedBlogs: [
      { href: '/blog/web-design-mistakes-conversion', label: '5 web design mistakes that kill conversion' },
    ],
    cta: 'Book a website design consultation',
  },

  seo: {
    intent: 'seo',
    keywords: ['seo', 'google ranking', 'search engine', 'indexing', 'search visibility', 'keywords', 'page speed', 'local seo', 'rank on google', 'organic traffic'],
    primaryPage: '/qa',
    primaryLabel: 'SEO analysis & strategy',
    relatedPages: [
      { href: '/services/web-design', label: 'Website design' },
      { href: '/contact', label: 'Contact Luxival' },
    ],
    relatedBlogs: [
      { href: '/blog/seo-for-finnish-businesses', label: 'SEO for Finnish businesses' },
    ],
    cta: 'Request an SEO audit',
  },

  qaTesting: {
    intent: 'qaTesting',
    keywords: ['testing', 'qa', 'software testing', 'website testing', 'mobile testing', 'bug report', 'iphone testing', 'android testing', 'playwright', 'selenium', 'istqb', 'quality assurance', 'test automation', 'automated testing'],
    primaryPage: '/services/software-testing',
    primaryLabel: 'Software testing & QA',
    relatedPages: [
      { href: '/audit', label: 'Website audit' },
      { href: '/qa', label: 'QA services' },
    ],
    relatedBlogs: [
      { href: '/blog/software-testing-qa-business-questions', label: 'QA questions answered' },
    ],
    cta: 'Request a website or software test',
  },

  audit: {
    intent: 'audit',
    keywords: ['website audit', 'site audit', 'audit my site', 'audit report', 'quality audit', 'pdf report', 'scan my website', 'website check'],
    primaryPage: '/audit',
    primaryLabel: 'Website audit',
    relatedPages: [
      { href: '/services/software-testing', label: 'Software testing' },
      { href: '/contact', label: 'Contact Luxival' },
    ],
    relatedBlogs: [
      { href: '/blog/website-audit-what-it-is-why-you-need-it', label: 'What a website audit is and why you need it' },
    ],
    cta: 'Run a free website scan',
  },

  aiAgents: {
    intent: 'aiAgents',
    keywords: ['ai agent', 'ai automation', 'automation', 'lead generation', 'data generator', 'agentic', 'workflow', 'automate', 'chatbot', 'ai tools', 'business automation'],
    primaryPage: '/services/ai-agents',
    primaryLabel: 'AI agent infrastructure',
    relatedPages: [
      { href: '/services/web-design', label: 'Website design' },
      { href: '/contact', label: 'Contact Luxival' },
    ],
    relatedBlogs: [
      { href: '/blog/ai-agents-business-automation-questions', label: 'AI agents questions answered' },
    ],
    cta: 'Ask about AI automation for your business',
  },

  tiktokUgc: {
    intent: 'tiktokUgc',
    keywords: ['tiktok', 'ugc', 'user generated content', 'content creation', 'social content', 'character content', 'video content', 'live selling'],
    primaryPage: '/services/tiktok-agency',
    primaryLabel: 'TikTok agency & UGC content',
    relatedPages: [
      { href: '/services/web-design', label: 'Website design' },
      { href: '/contact', label: 'Contact Luxival' },
    ],
    relatedBlogs: [
      { href: '/blog/tiktok-agency-live-selling-ugc', label: 'TikTok agency live selling & UGC' },
    ],
    cta: 'Plan a TikTok or UGC campaign',
  },

  airportTransfer: {
    intent: 'airportTransfer',
    keywords: ['airport transfer', 'airport pickup', 'helsinki airport', 'vantaa', 'arrivals pickup', 'flight pickup', 'airport taxi', 'airport driver'],
    primaryPage: '/services/airport-transfer',
    primaryLabel: 'Helsinki airport transfer',
    relatedPages: [
      { href: '/services/private-pickup', label: 'Private airport pickup' },
      { href: '/tourism', label: 'Travel & transport' },
    ],
    relatedBlogs: [
      { href: '/blog/helsinki-airport-transfer-guide', label: 'Helsinki airport transfer guide' },
    ],
    cta: 'Book an airport transfer',
  },

  privatePickup: {
    intent: 'privatePickup',
    keywords: ['private pickup', 'meet and greet', 'door to door', 'flight tracking pickup', 'no wait pickup'],
    primaryPage: '/services/private-pickup',
    primaryLabel: 'Private airport pickup',
    relatedPages: [
      { href: '/services/airport-transfer', label: 'Airport transfer' },
      { href: '/tourism', label: 'Travel & transport' },
    ],
    relatedBlogs: [
      { href: '/blog/helsinki-airport-transfer-questions-answered', label: 'Airport transfer questions answered' },
    ],
    cta: 'Book a private pickup',
  },

  privateRides: {
    intent: 'privateRides',
    keywords: ['private ride', 'private driver', 'sightseeing', 'city tour', 'custom tour', 'chauffeur', 'hourly ride'],
    primaryPage: '/services/private-rides',
    primaryLabel: 'Private rides & custom tours',
    relatedPages: [
      { href: '/services/city-to-city', label: 'City-to-city travel' },
      { href: '/tourism', label: 'Travel & transport' },
    ],
    relatedBlogs: [
      { href: '/blog/helsinki-private-city-tour-worth-it', label: 'Is a private Helsinki city tour worth it?' },
    ],
    cta: 'Book a private ride or tour',
  },

  cityToCity: {
    intent: 'cityToCity',
    keywords: ['city to city', 'intercity', 'tampere', 'turku', 'lahti', 'espoo', 'vantaa to', 'long distance transfer', 'road transfer'],
    primaryPage: '/services/city-to-city',
    primaryLabel: 'City-to-city travel',
    relatedPages: [
      { href: '/services/private-rides', label: 'Private rides' },
      { href: '/tourism', label: 'Travel & transport' },
    ],
    relatedBlogs: [
      { href: '/blog/private-chauffeur-helsinki-business', label: 'Private chauffeur for Helsinki business travel' },
    ],
    cta: 'Book a city-to-city transfer',
  },

  hotelSourcing: {
    intent: 'hotelSourcing',
    keywords: ['hotel', 'accommodation', 'boutique hotel', 'private home', 'stay in helsinki', 'lodging'],
    primaryPage: '/services/hotel-sourcing',
    primaryLabel: 'Hotel & house sourcing',
    relatedPages: [
      { href: '/tourism', label: 'Travel & transport' },
      { href: '/contact', label: 'Contact Luxival' },
    ],
    relatedBlogs: [
      { href: '/blog/helsinki-spa-wellness-luxury-day', label: 'Helsinki spa & wellness luxury day' },
    ],
    cta: 'Request hotel sourcing help',
  },

  tourismPlanning: {
    intent: 'tourismPlanning',
    keywords: ['tourism', 'travel', 'itinerary', 'finland trip', 'helsinki trip', 'trip planning', 'trip planner', 'places to visit', 'plan a trip', 'holiday in finland'],
    primaryPage: '/tourism-planning',
    primaryLabel: 'Tourism planning',
    relatedPages: [
      { href: '/tourism', label: 'Travel & transport' },
      { href: '/services/private-rides', label: 'Private rides' },
    ],
    relatedBlogs: [
      { href: '/blog/finland-tourism-planning-questions', label: 'Finland tourism planning questions' },
    ],
    cta: 'Start planning your trip',
  },

  lapland: {
    intent: 'lapland',
    keywords: ['lapland', 'northern lights', 'aurora', 'rovaniemi', 'santa claus', 'santa village', 'winter trip', 'snow'],
    primaryPage: '/tourism-planning',
    primaryLabel: 'Lapland & northern lights tours',
    relatedPages: [
      { href: '/services/private-rides', label: 'Private rides' },
      { href: '/luxury-lapland', label: 'Luxury Lapland' },
    ],
    relatedBlogs: [
      { href: '/blog/private-northern-lights-tour-finland', label: 'Private northern lights tour in Finland' },
    ],
    cta: 'Plan a Lapland or aurora trip',
  },

  mechanicalDesign: {
    intent: 'mechanicalDesign',
    keywords: ['mechanical design', 'hvac', 'piping', 'structural drawing', 'mechanical drawing', 'cad'],
    primaryPage: '/services/mechanical-design',
    primaryLabel: 'Mechanical design',
    relatedPages: [
      { href: '/services/electrical-design', label: 'Electrical design' },
      { href: '/contact', label: 'Contact Luxival' },
    ],
    relatedBlogs: [],
    cta: 'Request a mechanical design quote',
  },

  electricalDesign: {
    intent: 'electricalDesign',
    keywords: ['electrical design', 'power layout', 'lighting layout', 'panel schedule', 'single line diagram', 'electrical drawing'],
    primaryPage: '/services/electrical-design',
    primaryLabel: 'Electrical design',
    relatedPages: [
      { href: '/services/mechanical-design', label: 'Mechanical design' },
      { href: '/contact', label: 'Contact Luxival' },
    ],
    relatedBlogs: [],
    cta: 'Request an electrical design quote',
  },

  sewingPattern: {
    intent: 'sewingPattern',
    keywords: ['sewing pattern', 'custom pattern', 'garment pattern', 'suit pattern', 'dress pattern', 'measurements pattern'],
    primaryPage: '/services/sewing-pattern',
    primaryLabel: 'Custom sewing patterns',
    relatedPages: [
      { href: '/pattern', label: 'Pattern Studio tool' },
      { href: '/contact', label: 'Contact Luxival' },
    ],
    relatedBlogs: [
      { href: '/blog/sewing-pattern-custom-suit-measurements', label: 'Custom sewing pattern from body measurements' },
    ],
    cta: 'Get a custom sewing pattern',
  },

  general: {
    intent: 'general',
    keywords: [],
    primaryPage: '/services',
    primaryLabel: 'All Luxival services',
    relatedPages: [
      { href: '/contact', label: 'Contact Luxival' },
    ],
    relatedBlogs: [
      { href: '/blog/the-luxival-story', label: 'The Luxival story' },
    ],
    cta: 'Tell us what you need',
  },
};

function scoreIntent(intent, text, pagePath) {
  let score = 0;
  for (const kw of intent.keywords) {
    if (text.includes(kw)) score += 1;
  }
  if (pagePath && pagePath.indexOf(intent.primaryPage) === 0) score += 2;
  return score;
}

// Returns a structured link recommendation for the chatbot.
// Always returns an object; falls back to `general` when nothing matches.
function getLinkRecommendations(userText, pagePath) {
  const text = (userText || '').toLowerCase();
  const path = (pagePath || '').toLowerCase();

  let bestKey = null;
  let bestScore = 0;

  for (const key of Object.keys(LINK_MAP)) {
    if (key === 'general') continue;
    const intent = LINK_MAP[key];
    const score = scoreIntent(intent, text, path);
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  const result = LINK_MAP[bestKey] || LINK_MAP.general;

  return {
    intent: result.intent,
    primaryPage: result.primaryPage,
    primaryLabel: result.primaryLabel,
    relatedPages: result.relatedPages.slice(0, 2),
    relatedBlogs: result.relatedBlogs.slice(0, 1),
    cta: result.cta,
    matched: bestScore > 0,
  };
}

module.exports = { LINK_MAP, getLinkRecommendations };