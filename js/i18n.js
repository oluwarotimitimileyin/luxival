/* Luxival — EN/FI internationalisation module
 * Reads data-i18n attributes and swaps text; persists choice in localStorage.
 * Load this script once per page, before </body>.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Translations                                                         */
  /* ------------------------------------------------------------------ */
  var T = {
    en: {
      /* --- Navigation --- */
      'nav-travel':    'Travel',
      'nav-design':    'Design',
      'nav-portfolio': 'Portfolio',
      'nav-qa':        'QA',
      'nav-platform':  'Platform',
      'nav-about':     'About',
      'nav-book':      'Book Now',

      /* --- Index — Hero --- */
      'index-eyebrow':    'Premium Airport Transfer · Helsinki',
      'index-h1':         'Luxival | Where Arrival Meets Architecture',
      'index-subhead':    'Premium airport transfer meets intelligent digital services. From tarmac to doorstep, every detail is orchestrated.',
      'index-hero-cta':   'Book Transfer',
      'index-scroll':     'Scroll',

      /* --- Index — Travel & Tourism --- */
      'index-travel-h2':   'Travel & Tourism',
      'index-jet-h3':      'Private Jet',
      'index-jet-p':       'Cinematic arrival — private charter with runway-side greeting and priority clearance from Helsinki-Vantaa.',
      'index-jet-cta':     'Book Now →',
      'index-luggage-h3':  'Luggage',
      'index-luggage-p':   'White-glove baggage handling — from aircraft hold to your suite door, managed with precision and care.',
      'index-luggage-cta': 'Learn More →',
      'index-arrival-h3':  'Arrival',
      'index-arrival-p':   'Chauffeured transfer with live GPS tracking, ETA updates, and chauffeur details from wheels-down to doorstep.',
      'index-arrival-cta': 'Request Ride →',

      /* --- Index — Tracking --- */
      'index-tracking-h2': 'Track Your Ride in Real Time',
      'index-tracking-p':  'Clients receive live GPS tracking, ETA updates, and chauffeur details — from wheels-down to doorstep in one seamless flow.',

      /* --- Index — Digital Services --- */
      'index-svc-h2': 'Digital Services & Web Design',
      'index-svc-p1': "Luxival's digital arm delivers conversion-focused web design, local SEO, technical QA, and immersive 3D UX experiences — all under one roof.",
      'index-svc-p2': 'We combine premium visual craft with search-first strategy so your brand ranks, converts, and feels like the luxury category it belongs in.',
      'index-svc-p3': 'From Helsinki to global reach — if it has a digital presence, we architect it.',
      'index-svc-cta': 'Explore Services',

      /* --- Stats (shared) --- */
      'stat-transfers':    'Transfers completed',
      'stat-satisfaction': 'Client satisfaction',
      'stat-audits':       'Website audits done',
      'stat-support':      'Hour support',
      'stat-years':        'Years of engineering',
      'stat-disciplines':  'Disciplines mastered',
      'stat-delivered':    'Audits delivered',

      /* --- Index — Portfolio --- */
      'index-portfolio-h2':    'Portfolio & Projects',
      'proj-view-case':        'View Case Study →',

      /* --- Index — Founder --- */
      'index-founder-eyebrow': 'About Luxival',
      'index-founder-h2':      'Built on precision.\nDriven by excellence.',
      'index-founder-quote':   '"I built Luxival to close the gap between premium airport transport and world-class digital services — because every touchpoint deserves the same obsessive attention to detail."',
      'index-founder-p':       'Based in Helsinki, Finland, Luxival combines 5+ years of digital expertise with deep knowledge of the Helsinki-Vantaa airport corridor — serving international travellers, businesses, and brands that refuse to compromise.',
      'index-founder-cta':     'Read Our Story',

      /* --- Footer (index) --- */
      'footer-contact-h3':  'Contact Luxival',
      'footer-send':        'Send Inquiry',
      'footer-connect-h3':  'Connect',
      'footer-privacy':     'Privacy Policy',
      'footer-terms':       'Terms of Service',
      'footer-copyright':   'Luxival © 2026 · Premium digital & transport experiences',

      /* --- Footer (inner pages) --- */
      'footer-nav-h3':      'Navigate',
      'footer-nav-home':    'Home',
      'footer-nav-travel':  'Travel',
      'footer-nav-design':  'Design',
      'footer-nav-port':    'Portfolio',
      'footer-nav-platform':'Platform',
      'footer-nav-about':   'About',
      'footer-nav-qa':      'QA',
      'footer-legal-h3':    'Legal',
      'footer-legal-priv':  'Privacy Policy',
      'footer-legal-terms': 'Terms of Service',
      'footer-legal-contact':'Contact',

      /* --- About page --- */
      'about-eyebrow':         'About Luxival · Helsinki, Finland',
      'about-h1':              'Built on precision.\nDriven by excellence.',
      'about-subhead':         'Luxival is a multidisciplinary premium brand uniting airport transfer, web design, QA engineering, and AI services — all under one obsessive standard of quality.',
      'about-cta-work':        'Work with us',
      'about-cta-services':    'Our services',
      'about-founder-eyebrow': 'The founder',
      'about-founder-quote':   '"I built Luxival to close the gap between premium airport transport and world-class digital services — because every touchpoint deserves the same obsessive attention to detail."',
      'about-founder-bio1':    'A Senior QA Automation Engineer with 9+ years of experience across automotive, mobile, embedded, and API-driven environments. ISTQB certified. BEng in Mechanical Engineering. Currently completing IT studies in Helsinki.',
      'about-founder-bio2':    'Based in Vantaa, Finland — serving international travellers, businesses, and digital brands that refuse to compromise.',
      'about-exp-eyebrow':     'Career history',
      'about-exp-h2':          'Experience that speaks for itself',
      'about-skills-eyebrow':  'Skills & tools',
      'about-skills-h2':       'What we bring to every engagement',
      'about-cta-band-h2':     "Ready to work with us?",
      'about-cta-band-p':      "Whether you need a premium airport transfer, a world-class website, or expert QA — Luxival delivers.",
      'about-cta-book':        'Book a service',
      'about-cta-contact':     'Contact us',

      /* --- Tourism page --- */
      'tourism-eyebrow':        'Tourism & Transport · Helsinki',
      'tourism-h1':             'Premium airport\ntransfer & Finland\ntravel experience.',
      'tourism-subhead':        'Seamless Helsinki-Vantaa pickups, private rides, hotel sourcing, and seasonal tour planning — wrapped in one premium transport experience.',
      'tourism-cta-fare':       'Estimate your fare',
      'tourism-cta-explore':    'Explore Finland',
      'tourism-seasons-eyebrow':'Finland by season',
      'tourism-seasons-h2':     'Travel the calendar',
      'winter':   'Winter',
      'winter-p': 'Northern lights, snow-white landscapes, and warm airport rides into Helsinki.',
      'spring':   'Spring',
      'spring-p': 'Blooming parks, city walks, and fresh travel days for tourism and corporate arrivals.',
      'summer':   'Summer',
      'summer-p': 'Lake trips, city festivals, and long daylight journeys with premium private rides.',
      'autumn':   'Autumn',
      'autumn-p': "Golden forests, harvest season, and crisp drives through Finland's colourful countryside.",
      'tourism-svc-eyebrow':    'What we offer',
      'tourism-svc-h2':         'Dedicated transport services',

      /* --- Contact page --- */
      'contact-eyebrow':  'Contact · Luxival Helsinki',
      'contact-h1':       "Let's start a\nconversation.",
      'contact-lead':     'For a transfer booking, a project brief, or a QA audit — we respond within one business day.',
      'contact-reach-h3': 'Reach us directly',
      'contact-form-h2':  'Send an inquiry',
      'contact-form-sub': "Transfer booking, project brief, or general question — we'll get back to you within one business day.",
      'contact-nl-h3':    'Newsletter',
      'contact-nl-p':     'Updates on premium launches, SEO strategy, and transport offers.',

      /* --- Booking page --- */
      'booking-eyebrow':        'Booking · Luxival Helsinki',
      'booking-h1':             'How can we\nhelp you today?',
      'booking-lead':           'Choose a service below — each path is tailored to your specific need and connects you to the right team.',
      'booking-choose-eyebrow': 'Choose a service',
      'booking-choose-h2':      'Select your booking type',
      'booking-ride-h3':        'Book a Ride',
      'booking-ride-p':         'Instant airport transfer or private city ride. Helsinki-Vantaa pickups, city routes, and custom transport — confirmed within one business day.',
      'booking-ride-cta':       'Book transfer →',
      'booking-tour-h3':        'Book Tourism Planning',
      'booking-tour-p':         'Custom day-by-day Finland itinerary built around your arrival and departure dates, with city, nature, and cultural highlights.',
      'booking-tour-cta':       'Plan journey →',
      'booking-design-h3':      'Book Design Services',
      'booking-design-p':       'Web design, SEO, 3D UX, AI agents, and full digital product development. Submit your project brief to get started.',
      'booking-design-cta':     'Start project →',
      'booking-qa-h3':          'Book QA Services',
      'booking-qa-p':           "Software testing, QA automation, and free website audit requests. Improve your product's reliability with expert QA.",
      'booking-qa-cta':         'Request audit →',
      'booking-accom-h3':       'Find Accommodation',
      'booking-accom-p':        'Hotel and private house sourcing across Helsinki and Finland. We find premium stays that perfectly match your trip.',
      'booking-accom-cta':      'Find a stay →',
      'booking-direct-eyebrow': 'Not sure where to start?',
      'booking-direct-h2':      'Speak to us directly',
      'booking-direct-p':       'For a custom multi-service request or a general question, send us a message and we will route you to the right team within one business day.',
      'booking-inquiry-cta':    'Send inquiry',
      'booking-whatsapp-cta':   'WhatsApp us',

      /* --- Portfolio page --- */
      'portfolio-eyebrow': 'Case studies & projects',
      'portfolio-h1':      'Work that speaks\nfor itself.',
      'portfolio-lead':    'Selected projects across web design, QA automation, airport transfer systems, SEO strategy, and 3D interactive experiences.',

      /* --- QA page --- */
      'qa-eyebrow': 'Quality Assurance · Luxival',
      'qa-h1':      'Precision testing.\nZero tolerance for failure.',

      /* --- Design Services page --- */
      'design-eyebrow': 'Digital Services · Luxival Helsinki',
      'design-h1':      'Digital services\nthat perform.',

      /* --- Platform page --- */
      'platform-eyebrow': 'Platform · Luxival',

      /* --- Privacy / Terms --- */
      'privacy-h1': 'Privacy Policy',
      'terms-h1':   'Terms of Service',

      /* --- Form placeholders --- */
      'ph-name':     'Your name',
      'ph-fullname': 'Full name',
      'ph-email':    'Email address',
      'ph-email-ex': 'you@example.com',
      'ph-phone':    '+358 ...',
      'ph-msg':      'Tell us about your journey or project',
      'ph-msg-full': 'Tell us about your project, journey, or question',
      'ph-nl-email': 'your@email.com',

      /* --- Form labels --- */
      'lbl-name':    'Your name',
      'lbl-email':   'Email address',
      'lbl-phone':   'Phone (optional)',
      'lbl-service': 'Service interest',
      'lbl-msg':     'Message',

      /* --- Form buttons --- */
      'btn-send':      'Send Inquiry',
      'btn-subscribe': 'Subscribe',
    },

    fi: {
      /* --- Navigation --- */
      'nav-travel':    'Matkustus',
      'nav-design':    'Suunnittelu',
      'nav-portfolio': 'Portfolio',
      'nav-qa':        'QA',
      'nav-platform':  'Alusta',
      'nav-about':     'Tietoa',
      'nav-book':      'Varaa nyt',

      /* --- Index — Hero --- */
      'index-eyebrow':    'Premium Lentokenttäkuljetus · Helsinki',
      'index-h1':         'Luxival | Missä saapuminen kohtaa arkkitehtuurin',
      'index-subhead':    'Premium lentokenttäkuljetus kohtaa älykkäät digitaaliset palvelut. Rullaustasolta ovellesi — jokainen yksityiskohta on suunniteltu.',
      'index-hero-cta':   'Varaa kuljetus',
      'index-scroll':     'Vieritä',

      /* --- Index — Travel & Tourism --- */
      'index-travel-h2':   'Matkailu & Turismi',
      'index-jet-h3':      'Yksityislentokone',
      'index-jet-p':       'Elokuvallinen saapuminen — yksityischarter kiitotienvierustervehdyksellä ja prioriteettiselvityksellä Helsinki-Vantaalta.',
      'index-jet-cta':     'Varaa nyt →',
      'index-luggage-h3':  'Matkatavarat',
      'index-luggage-p':   'Valkohanskainen matkatavaroiden käsittely — lentokoneen ruumasta huoneistosi ovelle, hoidettu täsmällisesti ja huolellisesti.',
      'index-luggage-cta': 'Lue lisää →',
      'index-arrival-h3':  'Saapuminen',
      'index-arrival-p':   'Chauffeur-kuljetus live GPS-seurannalla, ETA-päivityksillä ja kuskin tiedoilla — laskeutumisesta ovellesi.',
      'index-arrival-cta': 'Pyydä kyyti →',

      /* --- Index — Tracking --- */
      'index-tracking-h2': 'Seuraa kyytisi reaaliajassa',
      'index-tracking-p':  'Asiakkaat saavat live GPS-seurannan, ETA-päivitykset ja kuskin tiedot — laskeutumisesta ovellesi yhdessä saumattomassa virrassa.',

      /* --- Index — Digital Services --- */
      'index-svc-h2': 'Digitaaliset palvelut & Verkkosuunnittelu',
      'index-svc-p1': 'Luxivalin digitaalinen yksikkö toimittaa konversiolähtöistä verkkosuunnittelua, paikallista hakukoneoptimointia, teknistä laadunvarmistusta ja immersiivisiä 3D-käyttökokemussuunnittelua — kaikki saman katon alla.',
      'index-svc-p2': 'Yhdistämme premium-visuaalisen käsityön hakukonelähestymisstrategiaan, jotta brändisi menestyy, konvertoi ja tuntuu siltä luksusluokalta johon se kuuluu.',
      'index-svc-p3': 'Helsingistä globaaliin ulottuvuuteen — jos sillä on digitaalinen läsnäolo, me arkkitehturoidamme sen.',
      'index-svc-cta': 'Tutustu palveluihin',

      /* --- Stats (shared) --- */
      'stat-transfers':    'Kuljetusta suoritettu',
      'stat-satisfaction': 'Asiakastyytyväisyys',
      'stat-audits':       'Verkkosivutarkastusta tehty',
      'stat-support':      'Tunnin tuki',
      'stat-years':        'Vuotta insinöörityötä',
      'stat-disciplines':  'Hallittua alaa',
      'stat-delivered':    'Tarkastusta toimitettu',

      /* --- Index — Portfolio --- */
      'index-portfolio-h2':    'Portfolio & Projektit',
      'proj-view-case':        'Katso tapaustutkimus →',

      /* --- Index — Founder --- */
      'index-founder-eyebrow': 'Tietoa Luxivalista',
      'index-founder-h2':      'Rakennettu tarkkuudelle.\nAjettu erinomaisuudella.',
      'index-founder-quote':   '"Rakensin Luxivalin kuromaan umpeen kuilun premium-lentokenttäliikenteen ja maailmanluokan digitaalisten palveluiden välillä — koska jokainen kosketuspiste ansaitsee saman pakkomielteisen huomion yksityiskohtiin."',
      'index-founder-p':       'Helsingissä, Suomessa toimiva Luxival yhdistää yli 5 vuoden digitaalisen asiantuntemuksen syvälliseen tietämykseen Helsinki-Vantaan lentoasemakäytävästä — palvellen kansainvälisiä matkailijoita, yrityksiä ja brändejä, jotka kieltäytyvät kompromisseista.',
      'index-founder-cta':     'Lue tarinaamme',

      /* --- Footer (index) --- */
      'footer-contact-h3':  'Ota yhteyttä Luxivaliin',
      'footer-send':        'Lähetä kysely',
      'footer-connect-h3':  'Yhteydet',
      'footer-privacy':     'Tietosuojakäytäntö',
      'footer-terms':       'Palveluehdot',
      'footer-copyright':   'Luxival © 2026 · Premium digitaaliset & kuljetuskokemukset',

      /* --- Footer (inner pages) --- */
      'footer-nav-h3':      'Navigoi',
      'footer-nav-home':    'Etusivu',
      'footer-nav-travel':  'Matkustus',
      'footer-nav-design':  'Suunnittelu',
      'footer-nav-port':    'Portfolio',
      'footer-nav-platform':'Alusta',
      'footer-nav-about':   'Tietoa',
      'footer-nav-qa':      'QA',
      'footer-legal-h3':    'Juridiikka',
      'footer-legal-priv':  'Tietosuojakäytäntö',
      'footer-legal-terms': 'Palveluehdot',
      'footer-legal-contact':'Yhteystiedot',

      /* --- About page --- */
      'about-eyebrow':         'Tietoa Luxivalista · Helsinki, Suomi',
      'about-h1':              'Rakennettu tarkkuudelle.\nAjettu erinomaisuudella.',
      'about-subhead':         'Luxival on monialainen premium-brändi, joka yhdistää lentokenttäkuljetuksen, verkkosuunnittelun, laadunvarmistustekniikan ja tekoälypalvelut — kaikki yhden pakkomielteisen laadun standardin alla.',
      'about-cta-work':        'Tee yhteistyötä kanssamme',
      'about-cta-services':    'Palvelumme',
      'about-founder-eyebrow': 'Perustaja',
      'about-founder-quote':   '"Rakensin Luxivalin kuromaan umpeen kuilun premium-lentokenttäliikenteen ja maailmanluokan digitaalisten palveluiden välillä — koska jokainen kosketuspiste ansaitsee saman pakkomielteisen huomion yksityiskohtiin."',
      'about-founder-bio1':    'Vanhempi QA-automaatioinsinööri, jolla on yli 9 vuoden kokemus auto-, mobiili-, sulautettujen ja API-pohjaisten ympäristöjen parissa. ISTQB-sertifioitu. BEng konetekniikassa. Tällä hetkellä suorittaa IT-opintoja Helsingissä.',
      'about-founder-bio2':    'Toimipaikka Vantaalla, Suomessa — palvelemme kansainvälisiä matkailijoita, yrityksiä ja digitaalisia brändejä, jotka kieltäytyvät kompromisseista.',
      'about-exp-eyebrow':     'Urahistoria',
      'about-exp-h2':          'Kokemus puhuu puolestaan',
      'about-skills-eyebrow':  'Taidot & työkalut',
      'about-skills-h2':       'Mitä tuomme jokaiseen toimeksiantoon',
      'about-cta-band-h2':     'Valmiina tekemään yhteistyötä?',
      'about-cta-band-p':      'Tarvitsetko premium-lentokenttäkuljetuksen, maailmanluokan verkkosivuston tai asiantuntevaa laadunvarmistusta — Luxival toimittaa.',
      'about-cta-book':        'Varaa palvelu',
      'about-cta-contact':     'Ota yhteyttä',

      /* --- Tourism page --- */
      'tourism-eyebrow':        'Turismi & Liikenne · Helsinki',
      'tourism-h1':             'Premium lentokenttäkuljetus\n& Suomen matkakokemus.',
      'tourism-subhead':        'Saumattomat Helsinki-Vantaa-noutopalvelut, yksityisajelut, hotellivälitys ja kausittainen matkailusuunnittelu — kaikki yhdessä premium-kuljetuskokemuksessa.',
      'tourism-cta-fare':       'Arvioi hintasi',
      'tourism-cta-explore':    'Tutustu Suomeen',
      'tourism-seasons-eyebrow':'Suomi vuodenajan mukaan',
      'tourism-seasons-h2':     'Matkusta kalenterin mukaan',
      'winter':   'Talvi',
      'winter-p': 'Revontulet, lumivalkoiset maisemat ja lämpimät lentokenttäajelut Helsinkiin.',
      'spring':   'Kevät',
      'spring-p': 'Kukkivat puistot, kaupunkikävelyt ja raikkaita matkailupäiviä turisteille ja yritysvieraille.',
      'summer':   'Kesä',
      'summer-p': 'Järviretket, kaupunkifestivaalit ja pitkät valoisat matkat premium-yksityisajeluilla.',
      'autumn':   'Syksy',
      'autumn-p': 'Kultaiset metsät, sadonkorjuukausi ja raikkaita ajoja Suomen värikkyydessä.',
      'tourism-svc-eyebrow':    'Mitä tarjoamme',
      'tourism-svc-h2':         'Omistautuneet kuljetuspalvelut',

      /* --- Contact page --- */
      'contact-eyebrow':  'Yhteystiedot · Luxival Helsinki',
      'contact-h1':       'Aloitetaan\nkeskustelu.',
      'contact-lead':     'Kuljetusvarausta, projektibrieffiä tai laadunvarmistusauditointia varten — vastaamme yhden arkipäivän kuluessa.',
      'contact-reach-h3': 'Tavoita meidät suoraan',
      'contact-form-h2':  'Lähetä kysely',
      'contact-form-sub': 'Kuljetusvaraus, projektibrieffi tai yleinen kysymys — palaamme asiaan yhden arkipäivän kuluessa.',
      'contact-nl-h3':    'Uutiskirje',
      'contact-nl-p':     'Päivityksiä premium-julkaisuista, SEO-strategiasta ja kuljetustarjouksista.',

      /* --- Booking page --- */
      'booking-eyebrow':        'Varaus · Luxival Helsinki',
      'booking-h1':             'Miten voimme\nauttaa sinua tänään?',
      'booking-lead':           'Valitse alta palvelu — jokainen polku on räätälöity erityistarpeisiisi ja yhdistää sinut oikeaan tiimiin.',
      'booking-choose-eyebrow': 'Valitse palvelu',
      'booking-choose-h2':      'Valitse varaustyyppi',
      'booking-ride-h3':        'Varaa kyyti',
      'booking-ride-p':         'Välitön lentokenttäkuljetus tai yksityinen kaupunkiauto. Helsinki-Vantaa-noutopalvelut, kaupunkireittejä ja räätälöityä kuljetusta — vahvistettu yhden arkipäivän kuluessa.',
      'booking-ride-cta':       'Varaa kuljetus →',
      'booking-tour-h3':        'Varaa matkailusuunnittelu',
      'booking-tour-p':         'Räätälöity päivä päivältä -Suomi-matkaohjelma, joka on rakennettu saapumis- ja lähtöpäiviesi ympärille, kaupunki-, luonto- ja kulttuurikohteilla.',
      'booking-tour-cta':       'Suunnittele matka →',
      'booking-design-h3':      'Varaa suunnittelupalvelut',
      'booking-design-p':       'Verkkosuunnittelu, SEO, 3D-käyttökokemus, tekoälyagentit ja täysi digitaalinen tuotekehitys. Lähetä projektibrieffisi aloittaaksesi.',
      'booking-design-cta':     'Aloita projekti →',
      'booking-qa-h3':          'Varaa QA-palvelut',
      'booking-qa-p':           'Ohjelmistotestaus, QA-automaatio ja ilmaiset verkkosivutarkistuspyynnöt. Paranna tuotteesi luotettavuutta asiantuntevalla laadunvarmistuksella.',
      'booking-qa-cta':         'Pyydä auditointia →',
      'booking-accom-h3':       'Löydä majoitus',
      'booking-accom-p':        'Hotelli- ja yksityistalovälitys ympäri Helsinkiä ja Suomea. Löydämme premium-majoituksen, joka sopii täydellisesti matkallesi.',
      'booking-accom-cta':      'Etsi majoitus →',
      'booking-direct-eyebrow': 'Etkö tiedä mistä aloittaa?',
      'booking-direct-h2':      'Puhu meille suoraan',
      'booking-direct-p':       'Räätälöityä monipuolista palvelupyyntöä tai yleistä kysymystä varten lähetä meille viesti ja ohjaamme sinut oikealle tiimille yhden arkipäivän kuluessa.',
      'booking-inquiry-cta':    'Lähetä kysely',
      'booking-whatsapp-cta':   'WhatsApp meille',

      /* --- Portfolio page --- */
      'portfolio-eyebrow': 'Tapaustutkimukset & projektit',
      'portfolio-h1':      'Työ puhuu\npuolestaan.',
      'portfolio-lead':    'Valittuja projekteja verkkosuunnittelusta, QA-automaatiosta, lentokenttäkuljetusjärjestelmistä, SEO-strategiasta ja 3D-interaktiivisista kokemuksista.',

      /* --- QA page --- */
      'qa-eyebrow': 'Laadunvarmistus · Luxival',
      'qa-h1':      'Täsmällinen testaus.\nNolla toleranssia virheille.',

      /* --- Design Services page --- */
      'design-eyebrow': 'Digitaaliset palvelut · Luxival Helsinki',
      'design-h1':      'Digitaaliset palvelut\njotka suoriutuvat.',

      /* --- Platform page --- */
      'platform-eyebrow': 'Alusta · Luxival',

      /* --- Privacy / Terms --- */
      'privacy-h1': 'Tietosuojakäytäntö',
      'terms-h1':   'Palveluehdot',

      /* --- Form placeholders --- */
      'ph-name':     'Nimesi',
      'ph-fullname': 'Koko nimi',
      'ph-email':    'Sähköpostiosoite',
      'ph-email-ex': 'sinä@esimerkki.fi',
      'ph-phone':    '+358 ...',
      'ph-msg':      'Kerro matkastasi tai projektistasi',
      'ph-msg-full': 'Kerro projektistasi, matkastasi tai kysymyksestäsi',
      'ph-nl-email': 'sinä@sähköposti.fi',

      /* --- Form labels --- */
      'lbl-name':    'Nimesi',
      'lbl-email':   'Sähköpostiosoite',
      'lbl-phone':   'Puhelin (valinnainen)',
      'lbl-service': 'Palvelukiinnostus',
      'lbl-msg':     'Viesti',

      /* --- Form buttons --- */
      'btn-send':      'Lähetä kysely',
      'btn-subscribe': 'Tilaa',
    }
  };

  /* ------------------------------------------------------------------ */
  /* Inject button CSS once                                               */
  /* ------------------------------------------------------------------ */
  (function injectStyle() {
    var s = document.createElement('style');
    s.textContent = [
      '.lang-btn{background:none;border:1px solid rgba(201,169,106,.35);color:var(--gold);',
      'font-size:.62rem;letter-spacing:2px;text-transform:uppercase;padding:.28rem .65rem;',
      'border-radius:2px;cursor:none;transition:border-color .2s,opacity .2s;opacity:.55;',
      'font-family:inherit;line-height:1;}',
      '.lang-btn:hover{border-color:var(--gold);opacity:1;}'
    ].join('');
    document.head.appendChild(s);
  })();

  /* ------------------------------------------------------------------ */
  /* Core helpers                                                         */
  /* ------------------------------------------------------------------ */
  function getLang() {
    return localStorage.getItem('luxival-lang') || 'en';
  }

  function apply(lang) {
    var t = T[lang] || T.en;

    /* text content */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    /* placeholder attributes */
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-ph');
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    /* aria-label attributes */
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });

    document.documentElement.lang = lang;
  }

  function setLang(lang) {
    localStorage.setItem('luxival-lang', lang);
    apply(lang);
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'en' ? 'FI' : 'EN';
  }

  /* ------------------------------------------------------------------ */
  /* Bootstrap on DOM ready                                               */
  /* ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    var lang = getLang();
    apply(lang);

    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = lang === 'en' ? 'FI' : 'EN';
      btn.addEventListener('click', function () {
        setLang(getLang() === 'en' ? 'fi' : 'en');
      });
    }
  });

  /* expose for external use */
  window.LuxivalI18n = { setLang: setLang, getLang: getLang };
})();
