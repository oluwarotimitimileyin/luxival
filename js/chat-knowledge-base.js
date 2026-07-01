window.LuxivalChatKnowledge = {
  services: {
    digital: {
      id: 'digital',
      title: 'Digital Services',
      path: '/services',
      description: 'Premium web design, SEO, and automation services for Helsinki businesses and beyond.',
      price: 'From €499',
      questions: [
        'What type of website do you need? (business, portfolio, e-commerce)',
        'Do you have brand assets (logo, colors, fonts) ready?',
        'What is your target timeline?',
        'Do you need SEO/visibility in Finnish market?'
      ]
    },
    webDesign: {
      id: 'web-design',
      title: 'Website Design & Development',
      path: '/services/web-design',
      description: 'Premium brand experiences with modern visuals, clear messaging, and conversion-first structure.',
      price: 'From €499',
      questions: [
        'What type of website do you need?',
        'Do you have brand assets ready?',
        'What is your timeline?',
        'Do you need SEO for Finnish customers?'
      ]
    },
    seoAnalysis: {
      id: 'seo-analysis',
      title: 'SEO Analysis & Strategy',
      path: '/qa',
      description: 'Technical and content-level SEO audits grounded in Helsinki local search intent.',
      price: 'From €299',
      questions: [
        'What is your main target keyword?',
        'Do you want local Helsinki SEO or broader reach?',
        'What are your top 3 competitors?'
      ]
    },
    webQa: {
      id: 'web-qa',
      title: 'Web QA & Quality Assurance',
      path: '/services/software-testing',
      description: 'Structured testing, Playwright/Selenium automation, ISTQB-certified.',
      price: 'From €499',
      questions: [
        'What is your website URL?',
        'Which pages need priority testing?',
        'Have you noticed specific issues (speed, errors)?'
      ]
    },
    websiteAudit: {
      id: 'website-audit',
      title: 'Website QA Audit',
      path: '/audit',
      description: 'Structured website quality audit with actionable PDF reports. ISTQB-certified.',
      price: 'From €499',
      questions: [
        'What is your website URL?',
        'What issues are you noticing?',
        'Do you need performance, accessibility, or functional testing?'
      ]
    },
    aiAgents: {
      id: 'ai-agents',
      title: 'AI Agent Infrastructure',
      path: '/services/ai-agents',
      description: 'AI agent workflow design and implementation. Automates processes and saves time.',
      price: 'From €800',
      questions: [
        'What process do you want to automate?',
        'What tools do you currently use?',
        'Who will be the end users?',
        'What outcome are you aiming for?'
      ]
    },
    tiktokAgency: {
      id: 'tiktok-agency',
      title: 'TikTok Agency & UGC Content',
      path: '/services/tiktok-agency',
      description: 'TikTok content strategy and production. Character-led storytelling.',
      price: 'Varies by scope',
      questions: [
        'What products/services do you want to promote?',
        'Do you have existing video content?',
        'What is your target audience age group?'
      ]
    },
    sewingPattern: {
      id: 'sewing-pattern',
      title: 'Custom Sewing Patterns',
      path: '/services/sewing-pattern',
      description: 'Measurement support and custom pattern creation for garments.',
      price: 'From €150',
      questions: [
        'What garment type do you need?',
        'Do you have body measurements ready?',
        'Any fabric preferences?',
        'Any fit references?'
      ]
    },
    airportTransfer: {
      id: 'airport-transfer',
      title: 'Helsinki Airport Transfer',
      path: '/services/airport-transfer',
      description: 'Premium Helsinki-Vantaa pickup. EUR 225 fixed price. No-smoking vehicles.',
      price: '€225 fixed',
      questions: [
        'Flight number and arrival time?',
        'Number of passengers?',
        'Luggage amount?',
        'Destination address?'
      ]
    },
    privateRides: {
      id: 'private-rides',
      title: 'Private Rides & Custom Tours',
      path: '/services/private-rides',
      description: 'Sightseeing, city-to-city travel, custom routes tailored to schedule.',
      price: 'From €90/hour',
      questions: [
        'Pickup location?',
        'Destination?',
        'Preferred date/time?',
        'Any special stops?'
      ]
    },
    hotelSourcing: {
      id: 'hotel-sourcing',
      title: 'Hotel & House Sourcing',
      path: '/services/hotel-sourcing',
      description: 'Premium stays, boutique hotels, private homes in Helsinki and nearby.',
      price: 'Varies by property',
      questions: [
        'Travel dates?',
        'Guest count?',
        'Preferred area in Helsinki?',
        'Budget range?'
      ]
    },
    privatePickup: {
      id: 'private-pickup',
      title: 'Private Airport Pickup',
      path: '/services/private-pickup',
      description: 'No-wait arrival support with flight tracking. Direct to your door.',
      price: 'From €195',
      questions: [
        'Flight number?',
        'Arrival date?',
        'Passengers?',
        'Destination?'
      ]
    },
    cityToCity: {
      id: 'city-to-city',
      title: 'City to City Travel',
      path: '/services/city-to-city',
      description: 'Transfers between Helsinki, Espoo, Vantaa, Lahti, and nearby destinations.',
      price: 'From €120',
      questions: [
        'From where to where?',
        'Travel date?',
        'Passengers and luggage?'
      ]
    },
    mechanicalDesign: {
      id: 'mechanical-design',
      title: 'Mechanical Design',
      path: '/services/mechanical-design',
      description: 'HVAC layouts, piping diagrams, structural mechanical drawings for residential, commercial, and light industrial projects.',
      price: 'From €800',
      questions: [
        'What type of building/project?',
        'What scope? (HVAC, piping, structural)',
        'What file format? (CAD/PDF)',
        'Timeline?'
      ]
    },
    electricalDesign: {
      id: 'electrical-design',
      title: 'Electrical Design',
      path: '/services/electrical-design',
      description: 'Power and lighting layouts, panel schedules, single-line diagrams for residential and commercial projects.',
      price: 'From €800',
      questions: [
        'Project type? (residential/commercial)',
        'Scope? (power, lighting, panels)',
        'Load requirements?',
        'Timeline?'
      ]
    },
    tourismPlanning: {
      id: 'tourism-planning',
      title: 'Tourism Planning',
      path: '/tourism-planning',
      description: 'Seasonal Finland experiences: northern lights, lake trips, sauna/wellness, archipelago adventures.',
      price: 'From €150',
      questions: [
        'What season?',
        'How many days?',
        'Group size?',
        'Special interests?'
      ]
    }
  },

  portfolioMappings: {
    website: ['businesslauncher', 'ugc-studio-ai', 'auraframe', 'vortex-ai-platform'],
    qa: ['autonomous-qa-audit-dashboard', 'esg-compliance-auditor', 'finnish-business-intelligence'],
    ai: ['esg-compliance-auditor', 'vortex-ai-platform', 'growth-architect'],
    tourism: ['ugc-studio-ai', 'luxury-lapland'],
    automation: ['growth-architect', 'vortex-ai-platform', 'auraframe'],
    sewing: ['pattern-studio'],
    esg: ['esg-compliance-auditor'],
    growth: ['growth-architect', 'finnish-business-intelligence'],
    launcher: ['businesslauncher'],
    ugc: ['ugc-studio-ai']
  },

  blogMappings: {
    services: [
      { keywords: ['web design', 'website design', 'site', 'landing page', 'homepage'], posts: ['/blog/web-design-mistakes-conversion', '/blog/web-design-finland-small-business-questions', '/blog/how-i-built-an-automated-lead-generation-system-for-web-design-clients'] },
      { keywords: ['seo', 'search engine', 'ranking', 'google', 'keywords'], posts: ['/blog/seo-for-finnish-businesses', '/blog/helsinki-airport-transfer-guide'] },
      { keywords: ['ai agent', 'automation', 'workflow', 'agentic'], posts: ['/blog/agentic-qa-release-confidence', '/blog/agentic-workflow-beginners-guide', '/blog/agentic-workflow-playbooks', '/blog/ai-agents-business-automation-questions'] },
      { keywords: ['qa', 'testing', 'audit', 'quality'], posts: ['/blog/software-testing-qa-business-questions', '/blog/website-audit-what-it-is-why-you-need-it', '/blog/what-is-istqb-certification', '/blog/agentic-qa-release-confidence'] },
      { keywords: ['tiktok', 'ugc', 'content', 'social'], posts: ['/blog/tiktok-agency-live-selling-ugc', '/blog/ugc-ai-video-creation-brand-campaigns'] },
      { keywords: ['pricing', 'cost', 'budget'], posts: ['/blog/luxury-transport-and-digital-strategy'] },
      { keywords: ['conversion', 'leads', 'visibility', 'digital strategy'], posts: ['/blog/why-businesses-need-visibility-strategy-automation', '/blog/website-losing-customers-how-to-fix'] },
      { keywords: ['mechanical design', 'hvac', 'piping', 'mechanical drawing'], posts: ['/services/mechanical-design'] },
      { keywords: ['electrical design', 'power layout', 'lighting layout', 'panel schedule'], posts: ['/services/electrical-design'] },
      { keywords: ['sewing', 'pattern', 'garment', 'dress', 'suit', 'measurement'], posts: ['/blog/sewing-pattern-custom-suit-measurements'] },
      { keywords: ['istqb', 'certification', 'software testing'], posts: ['/blog/what-is-istqb-certification', '/blog/software-testing-qa-business-questions'] },
      { keywords: ['about luxival', 'luxival story', 'founder', 'olakunle'], posts: ['/blog/the-luxival-story'] }
    ],
    tourism: [
      { keywords: ['airport', 'transfer', 'pickup', 'vantaa', 'helsinki airport'], posts: ['/blog/helsinki-airport-transfer-guide', '/blog/helsinki-airport-transfer-questions-answered'] },
      { keywords: ['winter', 'snow', 'lapland', 'northern lights', 'aurora'], posts: ['/blog/finland-winter-trip-guide', '/blog/finnish-lapland-luxury-winter-experiences', '/blog/private-northern-lights-tour-finland'] },
      { keywords: ['helsinki', 'city tour', 'sightseeing', 'hidden'], posts: ['/blog/helsinki-private-city-tour-worth-it', '/blog/top-5-hidden-gems-helsinki', '/blog/helsinki-night-transfers', '/blog/helsinki-food-tour-restaurants-guide'] },
      { keywords: ['tallinn', 'cruise', 'ferry'], posts: ['/blog/helsinki-to-tallinn-ferry-day-trip', '/blog/helsinki-archipelago-luxury-boat-experience'] },
      { keywords: ['sauna', 'wellness', 'spa'], posts: ['/blog/helsinki-spa-wellness-luxury-day', '/blog/finnish-sauna-experience-tourists-guide'] },
      { keywords: ['food', 'restaurant', 'dining', 'market', 'cuisine'], posts: ['/blog/helsinki-food-tour-restaurants-guide'] },
      { keywords: ['business', 'corporate', 'work', 'chauffeur'], posts: ['/blog/helsinki-business-travel-destination', '/blog/private-chauffeur-helsinki-business'] },
      { keywords: ['design', 'shopping', 'fashion'], posts: ['/blog/helsinki-design-district-luxury-shopping'] },
      { keywords: ['summer', 'lakeland', 'lake', 'archipelago', 'boat', 'island'], posts: ['/blog/summer-finland-lakeland-guide', '/blog/helsinki-archipelago-luxury-boat-experience'] },
      { keywords: ['tourism', 'planning', 'trip', 'travel', 'itinerary'], posts: ['/blog/finland-tourism-planning-questions', '/blog/luxury-helsinki-experiences-not-on-viator'] },
      { keywords: ['santa', 'rovaniemi', 'santa claus'], posts: ['/blog/rovaniemi-santa-claus-village-transfer'] },
      { keywords: ['special occasion', 'night', 'evening', 'event'], posts: ['/blog/special-occasion-transport-helsinki', '/blog/helsinki-night-transfers'] },
      { keywords: ['luxury', 'premium', 'viator'], posts: ['/blog/luxury-helsinki-experiences-not-on-viator', '/blog/luxury-transport-and-digital-strategy'] }
    ]
  },

  faqPatterns: {
    digital: {
      'website cost': 'Our website design starts at €499. Final pricing depends on pages, features, and integrations needed. Custom conversion-optimised sites typically €3,000–€8,000.',
      'seo finland': 'We provide Helsinki-focused SEO audits. We analyze your site\'s technical health and local search visibility starting at €299.',
      'timeline': 'Typical website projects: 2-4 weeks. SEO audits: 5-7 days. Rush projects available.',
      'languages': 'We build sites in Finnish, English, Swedish, and German. SEO optimized for each market.',
      'bilingual': 'For Helsinki businesses, bilingual Finnish/English is recommended — Finnish builds trust locally, English opens to expats and international clients.',
      'conversion': 'Most small business websites fail because they lack clarity — visitor should understand within 3 seconds what you do and what to do next.',
      'mistakes': 'Common website mistakes: unclear value proposition, too many choices, no social proof, slow load time, bad mobile experience.'
    },
    tourism: {
      'best time to visit': 'June-August for midnight sun and outdoor festivals (mid 20s °C). December-March for snow and northern lights (best in Lapland). Shoulder seasons have fewer crowds and lower prices.',
      'booking advance': 'Airport transfers: 24h minimum. Private tours: 48-72h. Peak season: 1 week ahead.',
      'what included': 'All transfers include flight tracking, meet-and-greet, luggage help, and direct door service.',
      'payment': 'Credit card or invoice. 50% deposit for bookings over €200. Full refund for cancellations 24h before.',
      'northern lights': 'Best seen in Lapland September–March. Helsinki-area sightings possible but rarer. Multi-night aurora tours from €1,200–€2,500. Evening chases from Rovaniemi €150–€350.',
      'winter pack': 'Thermal layers, waterproof winter boots, insulated gloves, wool hat. Lapland temps -15°C to -30°C. Private transfers essential for remote locations.',
      'helsinki must see': 'Oodi Library (free), Market Square, Design District, Suomenlinna fortress, at least one Finnish sauna.',
      'food tour': 'Private half-day food tours €150–€280/person. Best stops: Old Market Hall (Vanha Kauppahalli), Market Square, OLO/Grön/Ora for fine dining. Must-try: lohikeitto, karjalanpiirakka, reindeer, chanterelles.',
      'language': 'English is widely spoken throughout Finland. No need to speak Finnish. Helsinki is very English-friendly.',
      'cost': 'Restaurant meal €12–€18, coffee €4–€6, hotel €80–€150/night. Free activities: beaches, forest trails, design museums, markets.',
      'summer': 'Midnight sun in June–July. Archipelago boat trips, lakeland cruises, Nuuksio foraging (Aug–Sep chanterelles), private island picnics (€300–€600).',
      'sauna': 'Traditional Finnish sauna is a must. Historic manor saunas 60–90 min from Helsinki. Wood-fired lakeside experiences. Public saunas available in city.',
      'hidden gems': 'Private twilight archipelago kayaking, Nuuksio foraging, early morning market with private chef, private island picnic, ice road driving (Feb–Mar).',
      'business travel': 'Helsinki airport ranks top in Europe. Excellent English. Low corruption, trust-based culture. Clean, safe, walkable. Great summer light, cosy winter.',
      'day trips': 'Porvoo old town (1h bus), Nuuksio National Park (35km), Tallinn via 2h ferry, Suomenlinna (15-min ferry).',
      'airport cost': 'Taxi €40–€60 city centre. Private transfer €225 fixed. Train under €5 but drops at central station not your door.',
      'flight delay': 'Private transfer drivers track flights in real time. No extra charge for monitored delays.'
    },
    qa: {
      'istqb': 'Our QA audits follow ISTQB-certified methodology covering functionality, usability, performance, and security.',
      'report format': 'All audits include a PDF report with findings, screenshots, and actionable recommendations.',
      'automated testing': 'We use Playwright and Selenium for automated test coverage. Custom scripts for your workflows.',
      'how fast': 'Standard audit: 5-7 days. Quick check: 24-48h. Larger sites may require more time.',
      'why audit': 'Catch issues before customers do. Improve conversion, performance, accessibility. Build trust with users.',
      'what we test': 'Functionality, usability, performance, security, accessibility, cross-browser compatibility.'
    },
    design: {
      'mechanical': 'Mechanical design: HVAC layouts, piping diagrams, structural drawings. From €800. Requirements review, CAD/PDF deliverables, 30-day support.',
      'electrical': 'Electrical design: power/lighting layouts, panel schedules, single-line diagrams. From €800. Load review, safety docs, 30-day support.',
      'who needs': 'Architects, contractors, builders, property developers needing technical drawings for permitting, tendering, or construction.',
      'format': 'CAD and PDF files delivered with version control. Source files included for client ownership.',
      'timeline': 'Initial concepts within 1 week. Full packages depend on scope. Project brief reviewed within 1 business day.'
    },
    ai: {
      'what is ai agent': 'An AI agent receives a goal, breaks it into steps, and completes them using tools. Unlike chatbots, agents actually do things — browse, write, email, update spreadsheets, call APIs.',
      'vs automation': 'Regular automation (Zapier/scripts) follows fixed if-then rules. AI agents handle ambiguity — they can read messy input, understand intent, and respond appropriately.',
      'what automate': 'Customer enquiries, lead qualification, follow-up emails, competitor monitoring, multi-source reporting, conditional workflow triggers.',
      'tech knowledge': 'Pre-built agents: none needed. Custom build: some help needed or hire us. We build custom AI workflows from €800.',
      'reliability': 'Reliable for well-defined bounded tasks. Human review recommended for high-stakes decisions (financial, medical, legal).',
      'roi': 'Simple agent built in days. Usually pays for itself within 2–3 months in time saved.'
    }
  },

  prebookingAdvice: {
    digital: 'For website projects, prepare: 1) Your brand vision/goals, 2) Content/text ready, 3) Preferred timeline, 4) Budget range.',
    tourism: 'For transport bookings, prepare: 1) Flight/train details, 2) Pickup/dropoff addresses, 3) Passenger count, 4) Luggage amount.',
    qa: 'For audits, prepare: 1) Website URL, 2) Key pages to test, 3) Known issues, 4) Report preferences.',
    ai: 'For AI agents, prepare: 1) Process to automate, 2) Current tools used, 3) Expected users, 4) Outcome goals.',
    design: 'For engineering design, prepare: 1) Project type and scope, 2) Building/space details, 3) Required deliverables (CAD/PDF), 4) Timeline and budget.'
  },

  quickResponses: {
    greeting: 'Hi! I am Luxival assistant. How can I help? You can ask about our services, pricing, design, or Finland travel.',
    fallback: 'Happy to help. Tell me whether you need digital growth, transfers/tourism, QA/audit, engineering design, or AI automation.'
  }
};