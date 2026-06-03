(function() {
  var SUPPORTED_LANGS = ['en', 'fi', 'sv', 'de', 'fr', 'it'];
  var DEFAULT_LANG = 'en';
  var TRANSLATIONS_URL = '/i18n/';
  var BUNDLED_TRANSLATIONS = {
    fi: {
      "nav.home": "Koti",
      "nav.about": "Meista",
      "nav.digital": "Digitaaliset",
      "nav.tourism": "Matkailu",
      "nav.transfers": "Kuljetukset",
      "nav.portfolio": "Portfolio",
      "nav.contact": "Yhteystiedot",
      "nav.qa": "Laadunvarmistus",
      "nav.booking": "Varaa",
      "nav.pattern": "Kaavat",
      "nav.platform": "Alusta",
      "nav.blog": "Blogi",
      "hero.title": "Helsingin premium-kuljetus- ja digitaalitoimisto",
      "hero.subtitle": "Lentokenttakuljetukset, verkkosuunnittelu, hakukoneoptimointi ja ohjelmistotestaus Helsingista kasin.",
      "hero.eyebrow": "Luksusmatkailu · Helsinki",
      "hero.bookConsultation": "Varaa konsultaatio",
      "cta.book": "Varaa nyt",
      "cta.quote": "Pyyda tarjous",
      "cta.learnMore": "Lue lisaa →",
      "cta.getStarted": "Aloita",
      "cta.bookRide": "Varaa kyyti →",
      "cta.requestRide": "Pyyda kyyti →",
      "cta.exploreServices": "Tutustu palveluihin",
      "cta.viewCase": "Katso tapaustutkimus →",
      "cta.readStory": "Lue tarinamme",
      "cta.sendInquiry": "Lahetä kysely",
      "cta.estimateFare": "Arvioi hinta",
      "cta.bookNow": "Varaa nyt",
      "cta.bookTransfer": "Varaa kuljetus",
      "cta.seePortfolio": "Katso portfolio",
      "cta.getFreeAudit": "Tilaa ilmainen auditointi",
      "cta.confirmBooking": "Vahvista varaus",
      "cta.getInTouch": "Ota yhteytta",
      "cta.viewServices": "Katso palvelut",
      "cta.subscribe": "Tilaa",
      "footer.copyright": "Luxival © 2026 · Ensiluokkaiset digitaaliset ja kuljetuskokemukset",
      "footer.privacy": "Tietosuojakäytäntö",
      "footer.terms": "Kayttoehdot",
      "footer.contactTitle": "Ota yhteytta Luxivaliin",
      "footer.connectTitle": "Yhdista",
      "footer.tagline": "Luksusmatkailu · Verkkokehitys · SEO-palvelut · QA-testaus",

      "section.travel": "Matkailu ja kuljetus",
      "section.tracking": "Seuraa kyytiasi reaaliajassa",
      "section.digital": "Digitaalipalvelut ja verkkosivusuunnittelu",
      "section.portfolio": "Portfolio ja projektit",
      "section.socialVideo": "Seuraa tarinaa liikkeessa",
      "section.stats": "Tilastot",
      "section.founder": "Tietoa Luxivalista",

      "card.jet.title": "Yksityislento",
      "card.jet.desc": "Elokuvamainen saapuminen — yksityiskone, kiitoradan vieressä tapahtuva vastaanotto ja etuoikeus Helsinki-Vantaalla.",
      "card.luggage.title": "Matkatavarat",
      "card.luggage.desc": "Valkoinen hansikaspalvelu — lentokoneesta sviittisi ovelle, hoidettu tarkasti ja huolellisesti.",
      "card.arrival.title": "Saapuminen",
      "card.arrival.desc": "Kuljettajapalvelu GPS-seurannalla, ETA-päivityksilla ja kuljettajatiedoilla laskeutumisesta ovelle.",

      "tracking.desc": "Asiakkaat saavat reaaliaikaisen GPS-seurannan, ETA-paivitykset ja kuljettajatiedot — laskeutumisesta ovelle yhtenä saumattomana kokonaisuutena.",

      "digital.p1": "Luxivalin digitaalinen yksikko tuottaa konversiokeskeista verkkokehitysta, SEO-palveluita, QA-ohjelmistotestausta ja UGC-hahmokokemuksia.",
      "digital.p2": "Yhdistamme premium-visuaalisen taidon hakukonestrategiaan, jotta brandisi nakyy, konvertoi ja tuntuu luksuskategorialta.",
      "digital.p3": "Helsingista globaaliin — jos silla on digitaalinen lasnäolo, me suunnittelemme sen.",

      "stat.transfers": "Kuljetuksia suoritettu",
      "stat.satisfaction": "Asiakastyytyvaisyys",
      "stat.audits": "Verkkosivuauditointeja",
      "stat.support": "Tuntinen tuki",

      "social.title": "Sosiaalinen video",
      "social.desc": "Lyhyet videot, kulissien takaiset matkahetket, digitaaliset lanseeraukset ja brandipäivitykset sosiaalisen median kanavillamme.",
      "social.tiktok": "Lyhyet videot, live-myynti, matkahetket ja luovat brandi-kokeilut.",
      "social.instagram": "Kelat, tarinat, visuaaliset päivitykset ja paivittaiset Luxival-hetket.",
      "social.linkedin": "Liiketoimintapäivitykset, digitaalipalvelut, QA ja yritystieto.",
      "social.facebook": "Yhteisopäivitykset, matkapostaukset ja palveluilmoitukset.",
      "social.pinterest": "Matkainspiraatio, suunnittelureferenssit ja visuaaliset kokoelmat.",
      "social.youtube": "Pidemmät videot, selostukset ja pysyva brandisisalto.",

      "founder.tag": "Perustaja ja johtaja",
      "founder.eyebrow": "Tietoa Luxivalista",
      "founder.heading": "Rakennettu tarkkuudelle.<br>Huippuosaamisen ajamana.",
      "founder.quote": "\"Rakensin Luxivalin kuroa umpeen kuilun premium-lentokenttäkuljetusten ja maailmanluokan digitaalipalveluiden valilla — koska jokainen kohtaamispiste ansaitsee saman intohimoisen huomion yksityiskohtiin.\"",
      "founder.bio": "Helsinki, Suomi — Luxival yhdistaa yli 5 vuoden digitaalisen asiantuntemuksen ja syvan tuntemuksen Helsinki-Vantaan lentoasemakäytävästa — palvellen kansainvalisia matkustajia, yrityksiaä ja brandeja, jotka eivat tingi laadusta.",

      "form.title": "Pikakysely — ei sitoumusta",
      "form.name": "Nimesi",
      "form.email": "Sahkopostiosoite",
      "form.service": "Tarvitsen…",
      "form.serviceAirport": "Lentokenttakuljetus",
      "form.serviceRide": "Yksityinen kyyti / kaupunkikierros",
      "form.serviceWeb": "Verkkosivusuunnittelu / SEO",
      "form.serviceQa": "QA-ohjelmistotestaus",
      "form.serviceOther": "Jotain muuta",
      "form.date": "Paivamäärä / projektin aloitus",
      "form.submit": "Lahetä pikakysely →",
      "form.phone": "Puhelin",
      "form.message": "Kerro matkastasi tai projektistasi",
      "form.pickup": "Noutosijainti",
      "form.dropoff": "Jättösijainti",
      "form.website": "Verkkosivusi URL",
      "form.flightNumber": "Lennon numero (valinnainen)",
      "form.notes": "Huomautukset",
      "form.rideTime": "Kyydin aika",
      "form.transferType": "Kuljetustyyppi",

      "proof.transfers": "Kuljetuksia suoritettu",
      "proof.satisfaction": "Asiakastyytyvaisyys",
      "proof.audits": "Verkkosivuauditointeja",

      "meta.home.title": "Luxival | Helsingin premium-kuljetus- ja verkkosuunnittelutoimisto",
      "meta.home.desc": "Luxival — Helsingin premium-kuljetuspalvelu ja verkkosuunnittelutoimisto. Lentokenttäkuljetukset, SEO, QA-ohjelmistotestaus ja agenttisen työnkulun strategia.",

      "tourism.eyebrow": "Matkailu ja kuljetus · Helsinki",
      "tourism.title": "Premium-lentokenttäkuljetus ja Suomi-matkakokemus.",
      "tourism.subtitle": "Saumattomat Helsinki-Vantaan noudot, yksityiset kyydit, majoitushaku ja kausiluonteinen kiertuesuunnittelu — kaikki yhdessa luksuskokemuksessa.",
      "tourism.seasons": "Matkusta kalenterin mukaan",
      "tourism.winter": "Talvi",
      "tourism.spring": "Kevat",
      "tourism.summer": "Kesa",
      "tourism.autumn": "Syksy",
      "tourism.services": "Omistetut kuljetuspalvelut",
      "tourism.airport": "Lentokenttakuljetus",
      "tourism.privateRides": "Yksityiset kyydit ja räätälöidyt kierrokset",
      "tourism.hotel": "Hotelli- ja majoitushaku",
      "tourism.pickup": "Yksityinen lentokenttanouto",
      "tourism.cityToCity": "Kaupungista kaupunkiin",
      "tourism.planning": "Matkailun suunnittelu",
      "tourism.destinations": "Valikoituja kohteita ja kokemuksia",
      "tourism.map": "Valikoidut kohteet kartalla",
      "tourism.events": "Helsingin tapahtumat",
      "tourism.accommodation": "Majoitushaku",
      "tourism.fareEstimate": "Arvioi hintasi",
      "tourism.bookDetails": "Lahetä varaustietosi",
      "tourism.bookCta": "Varaa premium-kuljetuksesi.",
      "tourism.bookSubtitle": "Asematasolta ovelle — jokainen metri ennalta selvitetty, jokainen yksityiskohta orkestroitu.",
      "tourism.faq": "Usein kysytyt kysymykset",

      "transfers.eyebrow": "Premium-kuljetukset · Helsinki",
      "transfers.title": "Helsingin hienoin kuljettajapalvelu",
      "transfers.subtitle": "Lentokenttänoudot, yksityiset kaupunkikyydit ja eksklusiiviset risteilykuljetukset — GPS-seurannalla laskeutumisesta ovellesi.",
      "transfers.choose": "Valitse kuljetuksesi",
      "transfers.airport": "Lentokenttäkuljetus",
      "transfers.privatePickup": "Yksityinen nouto",
      "transfers.cityRides": "Kaupunkikyydit ja kierrokset",
      "transfers.cruise": "Yksityinen risteilykuljetus",
      "transfers.calcFare": "Laske hintasi",
      "transfers.bookTransfer": "Varaa kuljetus",

      "digital.eyebrow": "Digitaalipalvelut · Helsinki",
      "digital.title": "Verkkosuunnittelu ja digitaalipalvelut, jotka konvertoivat",
      "digital.subtitle": "ISTQB-sertifioitu laatu, agenttisen työnkulun strategia, SEO-ensin rakennettu — Helsingista globaaliin. Teemme sivustostasi tuottavan.",
      "digital.whatWeBuild": "Mita me rakennamme",
      "digital.webDesign": "Verkkosuunnittelu ja kehitys",
      "digital.seo": "SEO-strategia",
      "digital.qaTesting": "QA-ohjelmistotestaus",
      "digital.agenticWorkflows": "Agenttiset työnkulut",
      "digital.websiteAudit": "Verkkosivuauditointi",
      "digital.platformSaas": "Alusta ja SaaS",
      "digital.howItWorks": "Kuinka se toimii",
      "digital.audit": "Auditointi",
      "digital.strategy": "Strategia",
      "digital.build": "Rakennus",
      "digital.grow": "Kasvu",
      "digital.freeAudit": "Tilaa ilmainen verkkosivuauditointi",

      "about.eyebrow": "Tietoa Luxivalista · Helsinki, Suomi",
      "about.title": "Rakennettu tarkkuudelle. Huippuosaamisen ajamana.",
      "about.subtitle": "Luxival on monialabrändi, joka yhdistää luksuskuljetukset, verkkokehityksen, QA-ohjelmistotestauksen ja agenttisen työnkulun suunnittelun.",
      "about.career": "Urahistoria",
      "about.careerSubtitle": "Kokemus puhuu puolestaan",
      "about.skills": "Taidot ja työkalut",
      "about.skillsSubtitle": "Mita tuomme jokaiseen toimeksiantoon",
      "about.contactCta": "Kerro meille, mita rakennat.",
      "about.contactDesc": "Olipa kyseessa kuljetusvaraus, verkkosivusto, QA-toimeksianto tai tekoälyjärjestelmä — lahetä meille tiivistelmä ja vastaamme yhden arkipäivän kuluessa.",

      "contact.eyebrow": "Yhteydenotto · Luxival Helsinki",
      "contact.title": "Aloitetaan keskustelu.",
      "contact.subtitle": "Kuljetusvaraus, projektikuvaus tai QA-auditointi — vastaamme yhden arkipäivän kuluessa.",
      "contact.reachUs": "Tavoita meidät suoraan",
      "contact.sendInquiry": "Lahetä kysely",
      "contact.inquiryDesc": "Kuljetusvaraus, projektikuvaus tai yleinen kysymys — palaamme asiaan yhden arkipäivän kuluessa.",
      "contact.newsletter": "Uutiskirje",
      "contact.newsletterDesc": "Päivityksiä premium-lanseerauksista, SEO-strategiasta ja kuljetustarjouksista.",
      "contact.serviceInterest": "Palvelukiinnostus"
    },
    sv: {
      "nav.home": "Hem",
      "nav.about": "Om oss",
      "nav.digital": "Digitalt",
      "nav.tourism": "Resor",
      "nav.transfers": "Transfer",
      "nav.portfolio": "Portfolio",
      "nav.contact": "Kontakt",
      "nav.qa": "QA",
      "nav.booking": "Boka",
      "nav.pattern": "Monster",
      "nav.platform": "Plattform",
      "nav.blog": "Blogg",
      "hero.title": "Helsingfors premiumbyra for transfer och digitala tjanster",
      "hero.subtitle": "Flygplatstransfer, webbdesign, SEO och programvarutestning fran Helsingfors.",
      "hero.eyebrow": "Lyxresor · Helsingfors",
      "hero.bookConsultation": "Boka konsultation",
      "cta.book": "Boka nu",
      "cta.quote": "Begär offert",
      "cta.learnMore": "Las mer →",
      "cta.getStarted": "Kom igang",
      "cta.bookRide": "Boka resa →",
      "cta.requestRide": "Begar resa →",
      "cta.exploreServices": "Utforska tjanster",
      "cta.viewCase": "Se fallstudie →",
      "cta.readStory": "Las var historia",
      "cta.sendInquiry": "Skicka forfragan",
      "cta.estimateFare": "Berakna pris",
      "cta.bookNow": "Boka nu",
      "cta.bookTransfer": "Boka transfer",
      "cta.seePortfolio": "Se portfolio",
      "cta.getFreeAudit": "Fa gratis granskning",
      "cta.confirmBooking": "Bekrafta bokning",
      "cta.getInTouch": "Kontakta oss",
      "cta.viewServices": "Se tjanster",
      "cta.subscribe": "Prenumerera",
      "footer.copyright": "Luxival © 2026 · Premium digitala upplevelser och transportupplevelser",
      "footer.privacy": "Integritetspolicy",
      "footer.terms": "Anvandarvillkor",
      "footer.contactTitle": "Kontakta Luxival",
      "footer.connectTitle": "Folj oss",
      "footer.tagline": "Lyxresor · Webbutveckling · SEO-tjanster · QA-testning",

      "section.travel": "Resor och transport",
      "section.tracking": "Folj din resa i realtid",
      "section.digital": "Digitala tjanster och webbdesign",
      "section.portfolio": "Portfolio och projekt",
      "section.socialVideo": "Folj berattelsen i rorelse",
      "section.stats": "Statistik",
      "section.founder": "Om Luxival",

      "card.jet.title": "Privatjet",
      "card.jet.desc": "Filmisk ankomst — privatflyg med mottagning vid landningsbanan och prioriterad klarering fran Helsingfors-Vanda.",
      "card.luggage.title": "Bagage",
      "card.luggage.desc": "Forstaklassig bagagehantering — fran flygplanet till din svitdorr, hanterat med precision och omsorg.",
      "card.arrival.title": "Ankomst",
      "card.arrival.desc": "Chaufforsservice med GPS-sparning, ETA-uppdateringar och chaufforsinformation fran landning till dorren.",

      "tracking.desc": "Kunder far GPS-sparning i realtid, ETA-uppdateringar och chaufforsinformation — fran landning till dorren i ett somlost flode.",

      "digital.p1": "Luxivals digitala enhet levererar konverteringsfokuserad webbutveckling, SEO-tjanster, QA-programvarutestning och UGC-upplevelser.",
      "digital.p2": "Vi kombinerar premium visuellt hantverk med sokforst-strategi sa att ditt varumarke rankas, konverterar och kanns som lyxkategorin det tillhor.",
      "digital.p3": "Fran Helsingfors till global rackvidd — om det har en digital narvaro, arkitekterar vi den.",

      "stat.transfers": "Genomforda transferer",
      "stat.satisfaction": "Kundnojdhet",
      "stat.audits": "Webbgranskningar",
      "stat.support": "Timmars support",

      "social.title": "Social video",
      "social.desc": "Korta videor, bakom kulisserna-ogonblick, digitala lanseringar och varumärkesuppdateringar pa vara sociala kanaler.",
      "social.tiktok": "Korta videor, liveforksäljning, reseogonblick och kreativa varumärkesexperiment.",
      "social.instagram": "Reels, stories, visuella uppdateringar och dagliga Luxival-ogonblick.",
      "social.linkedin": "Affärsuppdateringar, digitala tjanster, QA och foretagsnyheter.",
      "social.facebook": "Gemenskapsuppdateringar, reseinlagg och tjänstemeddelanden.",
      "social.pinterest": "Reseinspiration, designreferenser och visuella samlingar.",
      "social.youtube": "Langre videor, forklaringar och tidlost varumärkesinnehall.",

      "founder.tag": "Grundare och direktor",
      "founder.eyebrow": "Om Luxival",
      "founder.heading": "Byggt pa precision.<br>Drivet av excellens.",
      "founder.quote": "\"Jag byggde Luxival for att overbrygga klyftan mellan premiumflygtransfer och digitala tjanster i varldsklass — for att varje kontaktpunkt fortjanar samma besatta uppmärksamhet pa detaljer.\"",
      "founder.bio": "Baserat i Helsingfors, Finland — Luxival kombinerar 5+ ars digital expertis med djup kunskap om Helsingfors-Vanda flygplatskorridoren — for internationella resenarer, foretag och varumärken som vagrar kompromissa.",

      "form.title": "Snabbforfragan — ingen forpliktelse",
      "form.name": "Ditt namn",
      "form.email": "E-postadress",
      "form.service": "Jag behover…",
      "form.serviceAirport": "Flygplatstransfer",
      "form.serviceRide": "Privat resa / stadsvandring",
      "form.serviceWeb": "Webbdesign / SEO",
      "form.serviceQa": "QA-programvarutestning",
      "form.serviceOther": "Nagot annat",
      "form.date": "Datum / projektstart",
      "form.submit": "Skicka snabbforfragan →",
      "form.phone": "Telefon",
      "form.message": "Beratta om din resa eller ditt projekt",
      "form.pickup": "Upphämtningsplats",
      "form.dropoff": "Avlamningsplats",
      "form.website": "Din webbadress",
      "form.flightNumber": "Flygnummer (valfritt)",
      "form.notes": "Anteckningar",
      "form.rideTime": "Resetid",
      "form.transferType": "Transfertyp",

      "proof.transfers": "Genomforda transferer",
      "proof.satisfaction": "Kundnojdhet",
      "proof.audits": "Webbgranskningar",

      "meta.home.title": "Luxival | Helsingfors premiumchauffors- och webbdesignbyra",
      "meta.home.desc": "Luxival — Helsingfors premiumtransfertjanst och webbdesignbyra. Flygplatstransferer, SEO, QA-programvarutestning och agentstyrda arbetsfloden.",

      "tourism.eyebrow": "Resor och transport · Helsingfors",
      "tourism.title": "Premiumflygplatstransfer och Finlandsresupplevelse.",
      "tourism.subtitle": "Somlosa Helsingfors-Vanda upphämtningar, privata resor, boendesokning och sasongsbunden turplanering — allt i en lyxupplevelse.",
      "tourism.seasons": "Res genom kalendern",
      "tourism.winter": "Vinter",
      "tourism.spring": "Var",
      "tourism.summer": "Sommar",
      "tourism.autumn": "Host",
      "tourism.services": "Dedikerade transporttjanster",
      "tourism.airport": "Flygplatstransfer",
      "tourism.privateRides": "Privata resor och skraddarsydda turer",
      "tourism.hotel": "Hotell- och boendesokning",
      "tourism.pickup": "Privat flygplatsupphämtning",
      "tourism.cityToCity": "Stad till stad",
      "tourism.planning": "Turismplanering",
      "tourism.destinations": "Utvalda destinationer och upplevelser",
      "tourism.map": "Utvalda platser pa kartan",
      "tourism.events": "Helsingfors-evenemang",
      "tourism.accommodation": "Boendesokning",
      "tourism.fareEstimate": "Berakna ditt pris",
      "tourism.bookDetails": "Skicka dina bokningsuppgifter",
      "tourism.bookCta": "Boka din premiumtransfer.",
      "tourism.bookSubtitle": "Fran landningsbanan till dorren — varje meter forberedd, varje detalj orkestrerad.",
      "tourism.faq": "Vanliga fragor",

      "transfers.eyebrow": "Premiumtransfer · Helsingfors",
      "transfers.title": "Helsingfors finaste chaufforsservice",
      "transfers.subtitle": "Flygplatsupphämtningar, privata stadsresor och exklusiva kryssningstransferer — med GPS-sparning fran landning till din dorr.",
      "transfers.choose": "Valj din transfer",
      "transfers.airport": "Flygplatstransfer",
      "transfers.privatePickup": "Privat upphämtning",
      "transfers.cityRides": "Stadsresor och turer",
      "transfers.cruise": "Privat kryssningstransfer",
      "transfers.calcFare": "Berakna ditt pris",
      "transfers.bookTransfer": "Boka transfer",

      "digital.eyebrow": "Digitala tjanster · Helsingfors",
      "digital.title": "Webbdesign och digitala tjanster som konverterar",
      "digital.subtitle": "ISTQB-certifierad kvalitet, agentiskt arbetsflode, SEO-forst — fran Helsingfors till hela varlden. Vi gor din webbplats lonsam.",
      "digital.whatWeBuild": "Vad vi bygger",
      "digital.webDesign": "Webbdesign och utveckling",
      "digital.seo": "SEO-strategi",
      "digital.qaTesting": "QA-programvarutestning",
      "digital.agenticWorkflows": "Agentiska arbetsfloden",
      "digital.websiteAudit": "Webbplatsgranskning",
      "digital.platformSaas": "Plattform och SaaS",
      "digital.howItWorks": "Hur det fungerar",
      "digital.audit": "Granskning",
      "digital.strategy": "Strategi",
      "digital.build": "Bygg",
      "digital.grow": "Vax",
      "digital.freeAudit": "Fa din gratis webbplatsgranskning",

      "about.eyebrow": "Om Luxival · Helsingfors, Finland",
      "about.title": "Byggt pa precision. Drivet av excellens.",
      "about.subtitle": "Luxival ar ett multidisciplinart premiumvarumärke som forenar lyxtransporter, webbutveckling, QA-programvarutestning och agentisk arbetsflödesdesign.",
      "about.career": "Karriarhistorik",
      "about.careerSubtitle": "Erfarenhet som talar for sig sjalv",
      "about.skills": "Fardigheter och verktyg",
      "about.skillsSubtitle": "Vad vi bidrar med i varje uppdrag",
      "about.contactCta": "Beratta vad du bygger.",
      "about.contactDesc": "Oavsett om det gäller en transferbokning, en webbplats, ett QA-uppdrag eller ett AI-agentsystem — skicka oss en sammanfattning sa svarar vi inom en arbetsdag.",

      "contact.eyebrow": "Kontakt · Luxival Helsingfors",
      "contact.title": "Lat oss borja ett samtal.",
      "contact.subtitle": "For en transferbokning, ett projektunderlag eller en QA-granskning — vi svarar inom en arbetsdag.",
      "contact.reachUs": "Na oss direkt",
      "contact.sendInquiry": "Skicka forfragan",
      "contact.inquiryDesc": "Transferbokning, projektunderlag eller allmän fraga — vi aterkommer inom en arbetsdag.",
      "contact.newsletter": "Nyhetsbrev",
      "contact.newsletterDesc": "Uppdateringar om premiumlanseringar, SEO-strategi och transfererbjudanden.",
      "contact.serviceInterest": "Tjänsteintresse"
    },
    de: {
      "nav.home": "Start",
      "nav.about": "Uber uns",
      "nav.digital": "Digital",
      "nav.tourism": "Reisen",
      "nav.transfers": "Transfers",
      "nav.portfolio": "Portfolio",
      "nav.contact": "Kontakt",
      "nav.qa": "QA",
      "nav.booking": "Buchen",
      "nav.pattern": "Schnittmuster",
      "nav.platform": "Plattform",
      "nav.blog": "Blog",
      "hero.title": "Helsinkis Premium-Agentur fur Chauffeur- und Digitalservices",
      "hero.subtitle": "Flughafentransfers, Webdesign, SEO und Softwaretests aus Helsinki.",
      "hero.eyebrow": "Luxusreisen · Helsinki",
      "hero.bookConsultation": "Beratung buchen",
      "cta.book": "Jetzt buchen",
      "cta.quote": "Angebot anfragen",
      "cta.learnMore": "Mehr erfahren →",
      "cta.getStarted": "Loslegen",
      "cta.bookRide": "Fahrt buchen →",
      "cta.requestRide": "Fahrt anfragen →",
      "cta.exploreServices": "Services entdecken",
      "cta.viewCase": "Fallstudie ansehen →",
      "cta.readStory": "Unsere Geschichte lesen",
      "cta.sendInquiry": "Anfrage senden",
      "cta.estimateFare": "Preis berechnen",
      "cta.bookNow": "Jetzt buchen",
      "cta.bookTransfer": "Transfer buchen",
      "cta.seePortfolio": "Portfolio ansehen",
      "cta.getFreeAudit": "Kostenloses Audit anfordern",
      "cta.confirmBooking": "Buchung bestatigen",
      "cta.getInTouch": "Kontakt aufnehmen",
      "cta.viewServices": "Services ansehen",
      "cta.subscribe": "Abonnieren",
      "footer.copyright": "Luxival © 2026 · Premium-Erlebnisse fur Digitales und Transport",
      "footer.privacy": "Datenschutzrichtlinie",
      "footer.terms": "Nutzungsbedingungen",
      "footer.contactTitle": "Luxival kontaktieren",
      "footer.connectTitle": "Verbinden",
      "footer.tagline": "Luxusreisen · Webentwicklung · SEO-Dienste · QA-Tests",

      "section.travel": "Reisen und Transport",
      "section.tracking": "Verfolgen Sie Ihre Fahrt in Echtzeit",
      "section.digital": "Digitale Dienste und Webdesign",
      "section.portfolio": "Portfolio und Projekte",
      "section.socialVideo": "Folgen Sie der Geschichte in Bewegung",
      "section.stats": "Statistiken",
      "section.founder": "Uber Luxival",

      "card.jet.title": "Privatjet",
      "card.jet.desc": "Filmreife Ankunft — Privatcharter mit Empfang am Rollfeld und Priority-Abfertigung ab Helsinki-Vantaa.",
      "card.luggage.title": "Gepack",
      "card.luggage.desc": "Erstklassiger Gepackservice — vom Frachtraum bis zu Ihrer Suite, mit Prazision und Sorgfalt gehandhabt.",
      "card.arrival.title": "Ankunft",
      "card.arrival.desc": "Chauffeurservice mit GPS-Tracking, ETA-Updates und Fahrerdaten von der Landung bis zur Haustur.",

      "tracking.desc": "Kunden erhalten Echtzeit-GPS-Tracking, ETA-Updates und Fahrerdaten — von der Landung bis zur Haustur in einem nahtlosen Ablauf.",

      "digital.p1": "Luxivals digitale Abteilung liefert konversionsstarke Webentwicklung, SEO-Services, QA-Softwaretests und UGC-Erlebnisse.",
      "digital.p2": "Wir verbinden Premium-Visuelles mit Suchmaschinen-Strategie, damit Ihre Marke rankt, konvertiert und sich wie die Luxuskategorie anfühlt.",
      "digital.p3": "Von Helsinki bis weltweit — wenn es eine digitale Prasenz hat, gestalten wir sie.",

      "stat.transfers": "Durchgefuhrte Transfers",
      "stat.satisfaction": "Kundenzufriedenheit",
      "stat.audits": "Website-Audits",
      "stat.support": "Stunden Support",

      "social.title": "Social Video",
      "social.desc": "Kurzvideos, Reisemomente hinter den Kulissen, digitale Launches und Marken-Updates auf unseren Social-Kanalen.",
      "social.tiktok": "Kurzvideos, Live-Selling, Reisemomente und kreative Markenexperimente.",
      "social.instagram": "Reels, Stories, visuelle Updates und tagliche Luxival-Momente.",
      "social.linkedin": "Geschafts-Updates, digitale Dienste, QA und Unternehmensnachrichten.",
      "social.facebook": "Community-Updates, Reisebeitrage und Service-Ankundigungen.",
      "social.pinterest": "Reiseinspiration, Designreferenzen und visuelle Sammlungen.",
      "social.youtube": "Langere Videos, Erklarungen und zeitloses Markeninhalt.",

      "founder.tag": "Grunder und Direktor",
      "founder.eyebrow": "Uber Luxival",
      "founder.heading": "Auf Prazision gebaut.<br>Von Exzellenz angetrieben.",
      "founder.quote": "\"Ich habe Luxival gegründet, um die Lücke zwischen Premium-Flughafentransport und erstklassigen digitalen Diensten zu schliessen — denn jeder Berührungspunkt verdient die gleiche obsessive Aufmerksamkeit fur Details.\"",
      "founder.bio": "Mit Sitz in Helsinki, Finnland — Luxival vereint uber 5 Jahre digitale Expertise mit tiefem Wissen uber den Helsinki-Vantaa-Flughafenkorridor — fur internationale Reisende, Unternehmen und Marken, die keine Kompromisse eingehen.",

      "form.title": "Schnellanfrage — unverbindlich",
      "form.name": "Ihr Name",
      "form.email": "E-Mail-Adresse",
      "form.service": "Ich brauche…",
      "form.serviceAirport": "Flughafentransfer",
      "form.serviceRide": "Privatfahrt / Stadtrundfahrt",
      "form.serviceWeb": "Webdesign / SEO",
      "form.serviceQa": "QA-Softwaretest",
      "form.serviceOther": "Etwas anderes",
      "form.date": "Datum / Projektstart",
      "form.submit": "Schnellanfrage senden →",
      "form.phone": "Telefon",
      "form.message": "Erzahlen Sie uns von Ihrer Reise oder Ihrem Projekt",
      "form.pickup": "Abholort",
      "form.dropoff": "Zielort",
      "form.website": "Ihre Website-URL",
      "form.flightNumber": "Flugnummer (optional)",
      "form.notes": "Anmerkungen",
      "form.rideTime": "Fahrzeit",
      "form.transferType": "Transfertyp",

      "proof.transfers": "Transfers durchgefuhrt",
      "proof.satisfaction": "Kundenzufriedenheit",
      "proof.audits": "Website-Audits",

      "meta.home.title": "Luxival | Helsinkis Premium-Chauffeur- und Webdesign-Agentur",
      "meta.home.desc": "Luxival — Helsinkis Premium-Chauffeurservice und Webdesign-Agentur. Flughafentransfers, SEO, QA-Softwaretests und agentische Workflow-Strategie.",

      "tourism.eyebrow": "Reisen und Transport · Helsinki",
      "tourism.title": "Premium-Flughafentransfer und Finnland-Reiseerlebnis.",
      "tourism.subtitle": "Nahtlose Helsinki-Vantaa-Abholungen, Privatfahrten, Unterkunftssuche und saisonale Tourenplanung — alles in einem Luxuserlebnis.",
      "tourism.seasons": "Reisen Sie durch den Kalender",
      "tourism.winter": "Winter",
      "tourism.spring": "Fruhling",
      "tourism.summer": "Sommer",
      "tourism.autumn": "Herbst",
      "tourism.services": "Dedizierte Transportdienste",
      "tourism.airport": "Flughafentransfer",
      "tourism.privateRides": "Privatfahrten und massgeschneiderte Touren",
      "tourism.hotel": "Hotel- und Unterkunftssuche",
      "tourism.pickup": "Private Flughafenabholung",
      "tourism.cityToCity": "Stadt zu Stadt",
      "tourism.planning": "Tourismusplanung",
      "tourism.destinations": "Kuratierte Ziele und Erlebnisse",
      "tourism.map": "Kuratierte Orte auf der Karte",
      "tourism.events": "Helsinki-Veranstaltungen",
      "tourism.accommodation": "Unterkunftssuche",
      "tourism.fareEstimate": "Preis berechnen",
      "tourism.bookDetails": "Buchungsdetails senden",
      "tourism.bookCta": "Buchen Sie Ihren Premium-Transfer.",
      "tourism.bookSubtitle": "Vom Rollfeld bis zur Haustur — jeder Meter vorbereitet, jedes Detail orchestriert.",
      "tourism.faq": "Haufig gestellte Fragen",

      "transfers.eyebrow": "Premium-Transfers · Helsinki",
      "transfers.title": "Helsinkis feinster Chauffeurservice",
      "transfers.subtitle": "Flughafenabholungen, private Stadtfahrten und exklusive Kreuzfahrttransfers — mit GPS-Tracking von der Landung bis zu Ihrer Tur.",
      "transfers.choose": "Wahlen Sie Ihren Transfer",
      "transfers.airport": "Flughafentransfer",
      "transfers.privatePickup": "Private Abholung",
      "transfers.cityRides": "Stadtfahrten und Touren",
      "transfers.cruise": "Privater Kreuzfahrttransfer",
      "transfers.calcFare": "Preis berechnen",
      "transfers.bookTransfer": "Transfer buchen",

      "digital.eyebrow": "Digitale Dienste · Helsinki",
      "digital.title": "Webdesign und digitale Dienste, die konvertieren",
      "digital.subtitle": "ISTQB-zertifizierte Qualitat, agentische Workflow-Strategie, SEO-first — von Helsinki weltweit. Wir machen Ihre Website profitabel.",
      "digital.whatWeBuild": "Was wir bauen",
      "digital.webDesign": "Webdesign und Entwicklung",
      "digital.seo": "SEO-Strategie",
      "digital.qaTesting": "QA-Softwaretest",
      "digital.agenticWorkflows": "Agentische Workflows",
      "digital.websiteAudit": "Website-Audit",
      "digital.platformSaas": "Plattform und SaaS",
      "digital.howItWorks": "So funktioniert es",
      "digital.audit": "Audit",
      "digital.strategy": "Strategie",
      "digital.build": "Umsetzung",
      "digital.grow": "Wachstum",
      "digital.freeAudit": "Kostenloses Website-Audit anfordern",

      "about.eyebrow": "Uber Luxival · Helsinki, Finnland",
      "about.title": "Auf Prazision gebaut. Von Exzellenz angetrieben.",
      "about.subtitle": "Luxival ist eine multidisziplinare Premium-Marke, die Luxustransport, Webentwicklung, QA-Softwaretests und agentisches Workflow-Design vereint.",
      "about.career": "Karriereverlauf",
      "about.careerSubtitle": "Erfahrung, die fur sich spricht",
      "about.skills": "Fahigkeiten und Tools",
      "about.skillsSubtitle": "Was wir in jedes Engagement einbringen",
      "about.contactCta": "Sagen Sie uns, was Sie bauen.",
      "about.contactDesc": "Ob Transferbuchung, Website, QA-Auftrag oder KI-Agentensystem — senden Sie uns ein Briefing und wir antworten innerhalb eines Werktags.",

      "contact.eyebrow": "Kontakt · Luxival Helsinki",
      "contact.title": "Lassen Sie uns ins Gesprach kommen.",
      "contact.subtitle": "Fur eine Transferbuchung, ein Projektbriefing oder ein QA-Audit — wir antworten innerhalb eines Werktags.",
      "contact.reachUs": "Erreichen Sie uns direkt",
      "contact.sendInquiry": "Anfrage senden",
      "contact.inquiryDesc": "Transferbuchung, Projektbriefing oder allgemeine Frage — wir melden uns innerhalb eines Werktags.",
      "contact.newsletter": "Newsletter",
      "contact.newsletterDesc": "Updates zu Premium-Launches, SEO-Strategie und Transferangeboten.",
      "contact.serviceInterest": "Serviceinteresse"
    },
    fr: {
      "nav.home": "Accueil",
      "nav.about": "A propos",
      "nav.digital": "Digital",
      "nav.tourism": "Voyage",
      "nav.transfers": "Transferts",
      "nav.portfolio": "Portfolio",
      "nav.contact": "Contact",
      "nav.qa": "QA",
      "nav.booking": "Reserver",
      "nav.pattern": "Patrons",
      "nav.platform": "Plateforme",
      "nav.blog": "Blog",
      "hero.title": "L'agence premium d'Helsinki pour chauffeurs et services digitaux",
      "hero.subtitle": "Transferts aeroport, design web, SEO et tests logiciels depuis Helsinki.",
      "hero.eyebrow": "Voyage de luxe · Helsinki",
      "hero.bookConsultation": "Reserver une consultation",
      "cta.book": "Reserver",
      "cta.quote": "Demander un devis",
      "cta.learnMore": "En savoir plus →",
      "cta.getStarted": "Commencer",
      "cta.bookRide": "Reserver un trajet →",
      "cta.requestRide": "Demander un trajet →",
      "cta.exploreServices": "Decouvrir les services",
      "cta.viewCase": "Voir l'etude de cas →",
      "cta.readStory": "Lire notre histoire",
      "cta.sendInquiry": "Envoyer une demande",
      "cta.estimateFare": "Estimer le tarif",
      "cta.bookNow": "Reserver maintenant",
      "cta.bookTransfer": "Reserver un transfert",
      "cta.seePortfolio": "Voir le portfolio",
      "cta.getFreeAudit": "Obtenir un audit gratuit",
      "cta.confirmBooking": "Confirmer la reservation",
      "cta.getInTouch": "Nous contacter",
      "cta.viewServices": "Voir les services",
      "cta.subscribe": "S'abonner",
      "footer.copyright": "Luxival © 2026 · Experiences premium digitales et de transport",
      "footer.privacy": "Politique de confidentialite",
      "footer.terms": "Conditions d'utilisation",
      "footer.contactTitle": "Contacter Luxival",
      "footer.connectTitle": "Suivez-nous",
      "footer.tagline": "Voyage de luxe · Developpement web · Services SEO · Tests QA",

      "section.travel": "Voyage et transport",
      "section.tracking": "Suivez votre trajet en temps reel",
      "section.digital": "Services digitaux et design web",
      "section.portfolio": "Portfolio et projets",
      "section.socialVideo": "Suivez l'histoire en mouvement",
      "section.stats": "Statistiques",
      "section.founder": "A propos de Luxival",

      "card.jet.title": "Jet prive",
      "card.jet.desc": "Arrivee cinematographique — vol prive avec accueil sur le tarmac et traitement prioritaire depuis Helsinki-Vantaa.",
      "card.luggage.title": "Bagages",
      "card.luggage.desc": "Service de bagages premium — de la soute a votre suite, gere avec precision et soin.",
      "card.arrival.title": "Arrivee",
      "card.arrival.desc": "Service chauffeur avec suivi GPS, mises a jour ETA et details du chauffeur de l'atterrissage a votre porte.",

      "tracking.desc": "Les clients recoivent un suivi GPS en temps reel, des mises a jour ETA et les details du chauffeur — de l'atterrissage a votre porte en un flux continu.",

      "digital.p1": "La division digitale de Luxival fournit du developpement web axe conversion, des services SEO, des tests logiciels QA et des experiences UGC.",
      "digital.p2": "Nous combinons un visuel premium avec une strategie search-first pour que votre marque se classe, convertisse et ressemble a la categorie luxe qu'elle merite.",
      "digital.p3": "D'Helsinki au monde entier — si cela a une presence digitale, nous l'architecturons.",

      "stat.transfers": "Transferts effectues",
      "stat.satisfaction": "Satisfaction client",
      "stat.audits": "Audits de sites web",
      "stat.support": "Heures de support",

      "social.title": "Video sociale",
      "social.desc": "Courtes videos, moments de voyage en coulisses, lancements digitaux et mises a jour de marque sur nos reseaux sociaux.",
      "social.tiktok": "Courtes videos, vente en direct, moments de voyage et experiences creatives de marque.",
      "social.instagram": "Reels, stories, mises a jour visuelles et moments quotidiens Luxival.",
      "social.linkedin": "Mises a jour commerciales, services digitaux, QA et actualites d'entreprise.",
      "social.facebook": "Mises a jour communautaires, publications de voyage et annonces de services.",
      "social.pinterest": "Inspiration voyage, references design et collections visuelles.",
      "social.youtube": "Videos plus longues, explications et contenu de marque intemporel.",

      "founder.tag": "Fondateur et directeur",
      "founder.eyebrow": "A propos de Luxival",
      "founder.heading": "Bati sur la precision.<br>Anime par l'excellence.",
      "founder.quote": "\"J'ai cree Luxival pour combler le fosse entre le transport aeroportuaire premium et les services digitaux de classe mondiale — car chaque point de contact merite la meme attention obsessionnelle aux details.\"",
      "founder.bio": "Base a Helsinki, Finlande — Luxival combine plus de 5 ans d'expertise digitale avec une connaissance approfondie du corridor de l'aeroport Helsinki-Vantaa — au service des voyageurs internationaux, des entreprises et des marques qui refusent les compromis.",

      "form.title": "Demande rapide — sans engagement",
      "form.name": "Votre nom",
      "form.email": "Adresse e-mail",
      "form.service": "J'ai besoin de…",
      "form.serviceAirport": "Transfert aeroport",
      "form.serviceRide": "Trajet prive / visite de ville",
      "form.serviceWeb": "Design web / SEO",
      "form.serviceQa": "Tests logiciels QA",
      "form.serviceOther": "Autre chose",
      "form.date": "Date / debut du projet",
      "form.submit": "Envoyer la demande rapide →",
      "form.phone": "Telephone",
      "form.message": "Parlez-nous de votre voyage ou projet",
      "form.pickup": "Lieu de prise en charge",
      "form.dropoff": "Lieu de depot",
      "form.website": "URL de votre site web",
      "form.flightNumber": "Numero de vol (optionnel)",
      "form.notes": "Notes",
      "form.rideTime": "Heure du trajet",
      "form.transferType": "Type de transfert",

      "proof.transfers": "Transferts effectues",
      "proof.satisfaction": "Satisfaction client",
      "proof.audits": "Audits de sites web",

      "meta.home.title": "Luxival | Agence premium de chauffeur et design web a Helsinki",
      "meta.home.desc": "Luxival — service de chauffeur premium et agence de design web a Helsinki. Transferts aeroport, SEO, tests logiciels QA et strategie de workflows agentiques.",

      "tourism.eyebrow": "Voyage et transport · Helsinki",
      "tourism.title": "Transfert aeroportuaire premium et experience de voyage en Finlande.",
      "tourism.subtitle": "Prises en charge Helsinki-Vantaa sans couture, trajets prives, recherche d'hebergement et planification saisonniere — le tout dans une experience de luxe.",
      "tourism.seasons": "Voyagez au fil du calendrier",
      "tourism.winter": "Hiver",
      "tourism.spring": "Printemps",
      "tourism.summer": "Ete",
      "tourism.autumn": "Automne",
      "tourism.services": "Services de transport dedies",
      "tourism.airport": "Transfert aeroport",
      "tourism.privateRides": "Trajets prives et visites sur mesure",
      "tourism.hotel": "Recherche d'hotel et d'hebergement",
      "tourism.pickup": "Prise en charge privee a l'aeroport",
      "tourism.cityToCity": "Ville a ville",
      "tourism.planning": "Planification touristique",
      "tourism.destinations": "Destinations et experiences selectionnees",
      "tourism.map": "Lieux selectionnes sur la carte",
      "tourism.events": "Evenements a Helsinki",
      "tourism.accommodation": "Recherche d'hebergement",
      "tourism.fareEstimate": "Estimez votre tarif",
      "tourism.bookDetails": "Envoyez vos details de reservation",
      "tourism.bookCta": "Reservez votre transfert premium.",
      "tourism.bookSubtitle": "Du tarmac a votre porte — chaque metre anticipe, chaque detail orchestre.",
      "tourism.faq": "Questions frequentes",

      "transfers.eyebrow": "Transferts premium · Helsinki",
      "transfers.title": "Le plus fin service de chauffeur d'Helsinki",
      "transfers.subtitle": "Prises en charge aeroport, trajets prives en ville et transferts de croisiere exclusifs — avec suivi GPS de l'atterrissage a votre porte.",
      "transfers.choose": "Choisissez votre transfert",
      "transfers.airport": "Transfert aeroport",
      "transfers.privatePickup": "Prise en charge privee",
      "transfers.cityRides": "Trajets en ville et visites",
      "transfers.cruise": "Transfert de croisiere prive",
      "transfers.calcFare": "Calculer votre tarif",
      "transfers.bookTransfer": "Reserver un transfert",

      "digital.eyebrow": "Services digitaux · Helsinki",
      "digital.title": "Design web et services digitaux qui convertissent",
      "digital.subtitle": "Qualite certifiee ISTQB, strategie de workflow agentique, SEO-first — d'Helsinki au monde entier. Nous rendons votre site rentable.",
      "digital.whatWeBuild": "Ce que nous construisons",
      "digital.webDesign": "Design web et developpement",
      "digital.seo": "Strategie SEO",
      "digital.qaTesting": "Tests logiciels QA",
      "digital.agenticWorkflows": "Workflows agentiques",
      "digital.websiteAudit": "Audit de site web",
      "digital.platformSaas": "Plateforme et SaaS",
      "digital.howItWorks": "Comment ca marche",
      "digital.audit": "Audit",
      "digital.strategy": "Strategie",
      "digital.build": "Construction",
      "digital.grow": "Croissance",
      "digital.freeAudit": "Obtenez votre audit de site web gratuit",

      "about.eyebrow": "A propos de Luxival · Helsinki, Finlande",
      "about.title": "Bati sur la precision. Anime par l'excellence.",
      "about.subtitle": "Luxival est une marque premium multidisciplinaire unissant transport de luxe, developpement web, tests logiciels QA et design de workflows agentiques.",
      "about.career": "Parcours professionnel",
      "about.careerSubtitle": "Une experience qui parle d'elle-meme",
      "about.skills": "Competences et outils",
      "about.skillsSubtitle": "Ce que nous apportons a chaque mission",
      "about.contactCta": "Dites-nous ce que vous construisez.",
      "about.contactDesc": "Reservation de transfert, site web, mission QA ou systeme d'agent IA — envoyez-nous un brief et nous repondrons sous un jour ouvrable.",

      "contact.eyebrow": "Contact · Luxival Helsinki",
      "contact.title": "Entamons la conversation.",
      "contact.subtitle": "Pour une reservation de transfert, un brief de projet ou un audit QA — nous repondons sous un jour ouvrable.",
      "contact.reachUs": "Contactez-nous directement",
      "contact.sendInquiry": "Envoyer une demande",
      "contact.inquiryDesc": "Reservation de transfert, brief de projet ou question generale — nous vous recontactons sous un jour ouvrable.",
      "contact.newsletter": "Newsletter",
      "contact.newsletterDesc": "Mises a jour sur les lancements premium, la strategie SEO et les offres de transfert.",
      "contact.serviceInterest": "Service souhaite"
    },
    it: {
      "nav.home": "Home",
      "nav.about": "Chi siamo",
      "nav.digital": "Digitale",
      "nav.tourism": "Viaggi",
      "nav.transfers": "Transfer",
      "nav.portfolio": "Portfolio",
      "nav.contact": "Contatti",
      "nav.qa": "QA",
      "nav.booking": "Prenota",
      "nav.pattern": "Modelli",
      "nav.platform": "Piattaforma",
      "nav.blog": "Blog",
      "hero.title": "L'agenzia premium di Helsinki per chauffeur e servizi digitali",
      "hero.subtitle": "Transfer aeroportuali, web design, SEO e test software da Helsinki.",
      "hero.eyebrow": "Viaggi di lusso · Helsinki",
      "hero.bookConsultation": "Prenota una consulenza",
      "cta.book": "Prenota ora",
      "cta.quote": "Richiedi un preventivo",
      "cta.learnMore": "Scopri di piu →",
      "cta.getStarted": "Inizia",
      "cta.bookRide": "Prenota un viaggio →",
      "cta.requestRide": "Richiedi un viaggio →",
      "cta.exploreServices": "Esplora i servizi",
      "cta.viewCase": "Vedi caso studio →",
      "cta.readStory": "Leggi la nostra storia",
      "cta.sendInquiry": "Invia richiesta",
      "cta.estimateFare": "Stima il prezzo",
      "cta.bookNow": "Prenota ora",
      "cta.bookTransfer": "Prenota transfer",
      "cta.seePortfolio": "Vedi portfolio",
      "cta.getFreeAudit": "Richiedi audit gratuito",
      "cta.confirmBooking": "Conferma prenotazione",
      "cta.getInTouch": "Contattaci",
      "cta.viewServices": "Vedi servizi",
      "cta.subscribe": "Iscriviti",
      "footer.copyright": "Luxival © 2026 · Esperienze premium digitali e di trasporto",
      "footer.privacy": "Informativa sulla privacy",
      "footer.terms": "Termini di servizio",
      "footer.contactTitle": "Contatta Luxival",
      "footer.connectTitle": "Seguici",
      "footer.tagline": "Viaggi di lusso · Sviluppo web · Servizi SEO · Test QA",

      "section.travel": "Viaggi e trasporti",
      "section.tracking": "Traccia il tuo viaggio in tempo reale",
      "section.digital": "Servizi digitali e web design",
      "section.portfolio": "Portfolio e progetti",
      "section.socialVideo": "Segui la storia in movimento",
      "section.stats": "Statistiche",
      "section.founder": "Chi e Luxival",

      "card.jet.title": "Jet privato",
      "card.jet.desc": "Arrivo cinematografico — volo charter privato con accoglienza in pista e priorità di sdoganamento da Helsinki-Vantaa.",
      "card.luggage.title": "Bagagli",
      "card.luggage.desc": "Servizio bagagli premium — dalla stiva dell'aereo alla porta della tua suite, gestito con precisione e cura.",
      "card.arrival.title": "Arrivo",
      "card.arrival.desc": "Servizio chauffeur con tracciamento GPS, aggiornamenti ETA e dettagli dell'autista dall'atterraggio alla tua porta.",

      "tracking.desc": "I clienti ricevono tracciamento GPS in tempo reale, aggiornamenti ETA e dettagli dell'autista — dall'atterraggio alla porta in un flusso continuo.",

      "digital.p1": "La divisione digitale di Luxival offre sviluppo web orientato alla conversione, servizi SEO, test software QA ed esperienze UGC.",
      "digital.p2": "Combiniamo un visual premium con una strategia search-first affinche il tuo brand si posizioni, converta e trasmetta il lusso che merita.",
      "digital.p3": "Da Helsinki al mondo — se ha una presenza digitale, noi la progettiamo.",

      "stat.transfers": "Transfer completati",
      "stat.satisfaction": "Soddisfazione clienti",
      "stat.audits": "Audit di siti web",
      "stat.support": "Ore di supporto",

      "social.title": "Video social",
      "social.desc": "Video brevi, momenti di viaggio dietro le quinte, lanci digitali e aggiornamenti del brand sui nostri canali social.",
      "social.tiktok": "Video brevi, vendita live, momenti di viaggio ed esperimenti creativi del brand.",
      "social.instagram": "Reels, storie, aggiornamenti visivi e momenti quotidiani Luxival.",
      "social.linkedin": "Aggiornamenti aziendali, servizi digitali, QA e notizie dell'azienda.",
      "social.facebook": "Aggiornamenti della community, post di viaggio e annunci di servizi.",
      "social.pinterest": "Ispirazione di viaggio, riferimenti di design e collezioni visive.",
      "social.youtube": "Video piu lunghi, spiegazioni e contenuti del brand senza tempo.",

      "founder.tag": "Fondatore e direttore",
      "founder.eyebrow": "Chi e Luxival",
      "founder.heading": "Costruito sulla precisione.<br>Guidato dall'eccellenza.",
      "founder.quote": "\"Ho creato Luxival per colmare il divario tra i transfer aeroportuali premium e i servizi digitali di livello mondiale — perche ogni punto di contatto merita la stessa ossessiva attenzione ai dettagli.\"",
      "founder.bio": "Con sede a Helsinki, Finlandia — Luxival combina oltre 5 anni di competenza digitale con una profonda conoscenza del corridoio aeroportuale Helsinki-Vantaa — al servizio di viaggiatori internazionali, aziende e brand che non accettano compromessi.",

      "form.title": "Richiesta rapida — senza impegno",
      "form.name": "Il tuo nome",
      "form.email": "Indirizzo e-mail",
      "form.service": "Ho bisogno di…",
      "form.serviceAirport": "Transfer aeroportuale",
      "form.serviceRide": "Viaggio privato / tour della citta",
      "form.serviceWeb": "Web design / SEO",
      "form.serviceQa": "Test software QA",
      "form.serviceOther": "Qualcos'altro",
      "form.date": "Data / inizio progetto",
      "form.submit": "Invia richiesta rapida →",
      "form.phone": "Telefono",
      "form.message": "Raccontaci del tuo viaggio o progetto",
      "form.pickup": "Luogo di ritiro",
      "form.dropoff": "Luogo di consegna",
      "form.website": "URL del tuo sito web",
      "form.flightNumber": "Numero di volo (opzionale)",
      "form.notes": "Note",
      "form.rideTime": "Orario del viaggio",
      "form.transferType": "Tipo di transfer",

      "proof.transfers": "Transfer completati",
      "proof.satisfaction": "Soddisfazione clienti",
      "proof.audits": "Audit di siti web",

      "meta.home.title": "Luxival | Agenzia premium di chauffeur e web design a Helsinki",
      "meta.home.desc": "Luxival — servizio chauffeur premium e agenzia di web design a Helsinki. Transfer aeroportuali, SEO, test software QA e strategia di workflow agentici.",

      "tourism.eyebrow": "Viaggi e trasporti · Helsinki",
      "tourism.title": "Transfer aeroportuale premium ed esperienza di viaggio in Finlandia.",
      "tourism.subtitle": "Ritiri Helsinki-Vantaa senza intoppi, viaggi privati, ricerca alloggi e pianificazione stagionale — tutto in un'esperienza di lusso.",
      "tourism.seasons": "Viaggia attraverso il calendario",
      "tourism.winter": "Inverno",
      "tourism.spring": "Primavera",
      "tourism.summer": "Estate",
      "tourism.autumn": "Autunno",
      "tourism.services": "Servizi di trasporto dedicati",
      "tourism.airport": "Transfer aeroportuale",
      "tourism.privateRides": "Viaggi privati e tour personalizzati",
      "tourism.hotel": "Ricerca hotel e alloggi",
      "tourism.pickup": "Ritiro privato in aeroporto",
      "tourism.cityToCity": "Da citta a citta",
      "tourism.planning": "Pianificazione turistica",
      "tourism.destinations": "Destinazioni ed esperienze selezionate",
      "tourism.map": "Luoghi selezionati sulla mappa",
      "tourism.events": "Eventi a Helsinki",
      "tourism.accommodation": "Ricerca alloggi",
      "tourism.fareEstimate": "Stima il tuo prezzo",
      "tourism.bookDetails": "Invia i dettagli della prenotazione",
      "tourism.bookCta": "Prenota il tuo transfer premium.",
      "tourism.bookSubtitle": "Dalla pista alla porta — ogni metro preparato, ogni dettaglio orchestrato.",
      "tourism.faq": "Domande frequenti",

      "transfers.eyebrow": "Transfer premium · Helsinki",
      "transfers.title": "Il piu raffinato servizio chauffeur di Helsinki",
      "transfers.subtitle": "Ritiri aeroportuali, viaggi privati in citta e transfer crociera esclusivi — con tracciamento GPS dall'atterraggio alla tua porta.",
      "transfers.choose": "Scegli il tuo transfer",
      "transfers.airport": "Transfer aeroportuale",
      "transfers.privatePickup": "Ritiro privato",
      "transfers.cityRides": "Viaggi in citta e tour",
      "transfers.cruise": "Transfer crociera privato",
      "transfers.calcFare": "Calcola il tuo prezzo",
      "transfers.bookTransfer": "Prenota transfer",

      "digital.eyebrow": "Servizi digitali · Helsinki",
      "digital.title": "Web design e servizi digitali che convertono",
      "digital.subtitle": "Qualita certificata ISTQB, strategia di workflow agentici, SEO-first — da Helsinki al mondo. Rendiamo il tuo sito redditizio.",
      "digital.whatWeBuild": "Cosa costruiamo",
      "digital.webDesign": "Web design e sviluppo",
      "digital.seo": "Strategia SEO",
      "digital.qaTesting": "Test software QA",
      "digital.agenticWorkflows": "Workflow agentici",
      "digital.websiteAudit": "Audit del sito web",
      "digital.platformSaas": "Piattaforma e SaaS",
      "digital.howItWorks": "Come funziona",
      "digital.audit": "Audit",
      "digital.strategy": "Strategia",
      "digital.build": "Costruzione",
      "digital.grow": "Crescita",
      "digital.freeAudit": "Richiedi il tuo audit gratuito del sito web",

      "about.eyebrow": "Chi e Luxival · Helsinki, Finlandia",
      "about.title": "Costruito sulla precisione. Guidato dall'eccellenza.",
      "about.subtitle": "Luxival e un brand premium multidisciplinare che unisce trasporto di lusso, sviluppo web, test software QA e design di workflow agentici.",
      "about.career": "Percorso professionale",
      "about.careerSubtitle": "Un'esperienza che parla da se",
      "about.skills": "Competenze e strumenti",
      "about.skillsSubtitle": "Cosa portiamo in ogni incarico",
      "about.contactCta": "Dicci cosa stai costruendo.",
      "about.contactDesc": "Prenotazione transfer, sito web, incarico QA o sistema di agenti IA — inviaci un brief e rispondiamo entro un giorno lavorativo.",

      "contact.eyebrow": "Contatti · Luxival Helsinki",
      "contact.title": "Iniziamo una conversazione.",
      "contact.subtitle": "Per una prenotazione transfer, un brief di progetto o un audit QA — rispondiamo entro un giorno lavorativo.",
      "contact.reachUs": "Contattaci direttamente",
      "contact.sendInquiry": "Invia richiesta",
      "contact.inquiryDesc": "Prenotazione transfer, brief di progetto o domanda generale — ti ricontattiamo entro un giorno lavorativo.",
      "contact.newsletter": "Newsletter",
      "contact.newsletterDesc": "Aggiornamenti su lanci premium, strategia SEO e offerte transfer.",
      "contact.serviceInterest": "Servizio di interesse"
    }
  };

  function getPreferredLang() {
    var params = new URLSearchParams(window.location.search);
    var queryLang = params.get('lang');
    if (queryLang && SUPPORTED_LANGS.indexOf(queryLang) !== -1) return queryLang;
    var saved = localStorage.getItem('luxival-lang');
    if (saved && SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
    var browserLang = (navigator.language || '').split('-')[0];
    if (SUPPORTED_LANGS.indexOf(browserLang) !== -1) return browserLang;
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) return;
    localStorage.setItem('luxival-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
    loadTranslations(lang);
  }

  function loadTranslations(lang) {
    if (lang === DEFAULT_LANG) {
      document.querySelectorAll('[data-i18n]').forEach(function(el) {
        if (el.dataset.i18nOriginal) el.innerHTML = el.dataset.i18nOriginal;
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
        if (el.dataset.i18nPlaceholderOriginal) el.placeholder = el.dataset.i18nPlaceholderOriginal;
      });
      updateMeta(null);
      return;
    }
    if (BUNDLED_TRANSLATIONS[lang]) {
      applyTranslations(BUNDLED_TRANSLATIONS[lang]);
      return;
    }
    fetch(TRANSLATIONS_URL + lang + '.json')
      .then(function(r) { return r.json(); })
      .then(applyTranslations)
      .catch(function() {});
  }

  function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.dataset.i18n;
      if (!el.dataset.i18nOriginal) el.dataset.i18nOriginal = el.innerHTML;
      if (translations[key]) el.innerHTML = translations[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (!el.dataset.i18nPlaceholderOriginal) el.dataset.i18nPlaceholderOriginal = el.placeholder;
      if (translations[key]) el.placeholder = translations[key];
    });
    updateMeta(translations);
  }

  function updateMeta(translations) {
    var page = document.body.dataset.page || 'home';
    var titleKey = 'meta.' + page + '.title';
    var descKey = 'meta.' + page + '.desc';
    if (translations && translations[titleKey]) {
      document.title = translations[titleKey];
    } else if (!translations) {
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) document.title = ogTitle.content;
    }
    var descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      if (translations && translations[descKey]) {
        descMeta.content = translations[descKey];
      }
    }
  }

  function closeMobileNav() {
    var burger = document.querySelector('.nav-burger');
    var links = document.querySelector('.nav-links');
    if (!burger || !links) return;
    links.classList.remove('open');
    links.style.display = '';
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  function enhanceMobileNav() {
    var burger = document.querySelector('.nav-burger');
    var links = document.querySelector('.nav-links');
    if (!burger || !links) return;

    burger.addEventListener('click', function() {
      window.setTimeout(function() {
        var isOpen = links.classList.contains('open') || burger.classList.contains('open') || window.getComputedStyle(links).display === 'flex';
        document.body.classList.toggle('nav-open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
      }, 0);
    });

    links.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', closeMobileNav);
    });

    document.addEventListener('click', function(event) {
      if (!links.classList.contains('open')) return;
      if (burger.contains(event.target) || links.contains(event.target)) return;
      closeMobileNav();
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') closeMobileNav();
    });
  }

  function createLanguageSwitcher() {
    if (document.getElementById('lang-select')) return;
    var switcher = document.createElement('div');
    switcher.className = 'lang-switcher';
    switcher.innerHTML = '<select id="lang-select" aria-label="Select language">' +
      SUPPORTED_LANGS.map(function(l) {
        var names = {en:'English',fi:'Suomi',sv:'Svenska',de:'Deutsch',fr:'Francais',it:'Italiano'};
        return '<option value="' + l + '">' + (names[l] || l) + '</option>';
      }).join('') + '</select>';

    var nav = document.querySelector('nav');
    if (nav) {
      switcher.style.cssText = 'margin-left:auto;margin-right:1rem;';
      var burger = nav.querySelector('.nav-burger');
      if (burger) nav.insertBefore(switcher, burger);
      else nav.appendChild(switcher);
    }

    var select = switcher.querySelector('select');
    select.value = getPreferredLang();
    select.addEventListener('change', function() {
      setLang(this.value);
      closeMobileNav();
    });
  }

  var style = document.createElement('style');
  style.textContent = '#lang-select{background:rgba(255,255,255,.05);border:1px solid rgba(201,169,106,.2);color:#C9A96A;padding:.4rem .6rem;border-radius:2px;font-size:.72rem;letter-spacing:1px;cursor:pointer;font-family:inherit}#lang-select:focus{outline:none;border-color:#C9A96A}#lang-select option{background:#11131A;color:#E8EBF2}@media(max-width:768px){.lang-switcher{margin-left:auto!important;margin-right:.5rem!important}#lang-select{max-width:6.8rem}}';
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', function() {
    createLanguageSwitcher();
    enhanceMobileNav();
    setLang(getPreferredLang());
  });

  var GT_CONSENT_KEY = 'luxival-gt-consent';
  var GT_EXCLUDED_PAGES = ['privacy', 'terms', 'contact', 'booking'];

  function isGtAllowed() {
    var page = (document.body.dataset.page || '').toLowerCase();
    return GT_EXCLUDED_PAGES.indexOf(page) === -1;
  }

  function loadGoogleTranslate() {
    if (document.getElementById('gt-script')) return;
    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: SUPPORTED_LANGS.join(','),
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'gt-element');
    };
    var s = document.createElement('script');
    s.id = 'gt-script';
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(s);
  }

  function initGtConsent() {
    if (!isGtAllowed()) return;
    if (localStorage.getItem(GT_CONSENT_KEY) === 'true') {
      loadGoogleTranslate();
      return;
    }
    var banner = document.createElement('div');
    banner.id = 'gt-consent';
    banner.innerHTML = '<span>Enable automatic translation for this page?</span><button id="gt-accept">Enable</button><button id="gt-dismiss">No thanks</button>';
    var bannerStyle = document.createElement('style');
    bannerStyle.textContent = '#gt-consent{position:fixed;bottom:5rem;left:50%;transform:translateX(-50%);background:#11131A;border:1px solid rgba(201,169,106,.3);border-radius:4px;padding:.8rem 1.2rem;display:flex;align-items:center;gap:.8rem;z-index:300;font-size:.8rem;color:#E8EBF2;box-shadow:0 8px 32px rgba(0,0,0,.4)}#gt-consent button{padding:.4rem .8rem;border-radius:2px;border:none;cursor:pointer;font-size:.75rem;letter-spacing:1px;text-transform:uppercase;font-family:inherit}#gt-accept{background:#C9A96A;color:#0A0B0F}#gt-dismiss{background:transparent;color:#a5adbf;border:1px solid rgba(255,255,255,.1)}';
    document.head.appendChild(bannerStyle);
    document.body.appendChild(banner);
    document.getElementById('gt-accept').addEventListener('click', function() {
      localStorage.setItem(GT_CONSENT_KEY, 'true');
      banner.remove();
      loadGoogleTranslate();
    });
    document.getElementById('gt-dismiss').addEventListener('click', function() {
      localStorage.setItem(GT_CONSENT_KEY, 'false');
      banner.remove();
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    var el = document.createElement('div');
    el.id = 'gt-element';
    el.style.cssText = 'display:none';
    document.body.appendChild(el);
    var page = (document.body.dataset.page || '').toLowerCase();
    if (page === 'blog' || document.querySelector('.post-body')) {
      initGtConsent();
    }
  });

  window.luxivalI18n = { setLang: setLang, getLang: getPreferredLang, closeMobileNav: closeMobileNav, enableGoogleTranslate: initGtConsent };
})();
