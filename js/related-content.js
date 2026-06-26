(function () {
  const posts = {
    airportTransfer: [
      {
        title: "Helsinki Airport Transfer: What to Expect When You Arrive in Finland",
        description: "A practical arrival guide for Helsinki Vantaa, airport options, and private transfer planning.",
        url: "/blog/helsinki-airport-transfer-guide/"
      },
      {
        title: "Helsinki Airport Transfer Questions Answered",
        description: "Common questions travellers ask before booking an airport transfer in Finland.",
        url: "/blog/helsinki-airport-transfer-questions-answered/"
      },
      {
        title: "Helsinki Night Transfers: Safe Late Arrival Transport",
        description: "What to know when landing late, travelling after dark, or arranging a quiet night pickup.",
        url: "/blog/helsinki-night-transfers/"
      }
    ],
    privateRides: [
      {
        title: "Private Chauffeur in Helsinki for Business Travel",
        description: "How private chauffeur service helps executives, teams, and visitors move with confidence.",
        url: "/blog/private-chauffeur-helsinki-business/"
      },
      {
        title: "Special Occasion Transport in Helsinki",
        description: "A guide to planning smooth private transport for events, dinners, and important moments.",
        url: "/blog/special-occasion-transport-helsinki/"
      },
      {
        title: "Is a Helsinki Private City Tour Worth It?",
        description: "How private guided transport changes the way visitors experience Helsinki.",
        url: "/blog/helsinki-private-city-tour-worth-it/"
      }
    ],
    finlandTravel: [
      {
        title: "Finland Tourism Questions: What People Ask Before Planning a Trip",
        description: "The essential questions travellers ask before choosing dates, routes, and experiences.",
        url: "/blog/finland-tourism-planning-questions/"
      },
      {
        title: "Planning Your Finland Winter Trip",
        description: "What to pack, where to go, and how to move around Finland in winter.",
        url: "/blog/finland-winter-trip-guide/"
      },
      {
        title: "Finnish Lapland Luxury Winter Experiences",
        description: "What premium Lapland planning includes, from private guides to aurora cabins.",
        url: "/blog/finnish-lapland-luxury-winter-experiences/"
      }
    ],
    cityTravel: [
      {
        title: "Helsinki to Tallinn Ferry Day Trip",
        description: "How to plan a smooth cross-border day trip from Helsinki to Tallinn.",
        url: "/blog/helsinki-to-tallinn-ferry-day-trip/"
      },
      {
        title: "Summer Finland Lakeland Guide",
        description: "A practical guide to lakes, routes, and seasonal travel beyond Helsinki.",
        url: "/blog/summer-finland-lakeland-guide/"
      },
      {
        title: "Finland Tourism Questions",
        description: "Helpful answers for visitors comparing cities, seasons, and trip styles.",
        url: "/blog/finland-tourism-planning-questions/"
      }
    ],
    webDesign: [
      {
        title: "What Finnish Small Businesses Ask About Web Design",
        description: "Real questions about web design costs, timelines, SEO, and what makes a site work.",
        url: "/blog/web-design-finland-small-business-questions/"
      },
      {
        title: "5 Web Design Mistakes That Kill Your Conversion Rate",
        description: "Common design choices that quietly stop visitors from becoming customers.",
        url: "/blog/web-design-mistakes-conversion/"
      },
      {
        title: "Why Your Small Business Website Is Losing Customers",
        description: "The practical reasons visitors leave early and how to fix them.",
        url: "/blog/website-losing-customers-how-to-fix/"
      }
    ],
    aiAgents: [
      {
        title: "What Are AI Agents and How Can They Automate Your Business?",
        description: "A plain-English guide to what AI agents do and where they create business value.",
        url: "/blog/ai-agents-business-automation-questions/"
      },
      {
        title: "Agentic Workflow Design: A Practical Beginner's Guide",
        description: "How agentic workflows combine business process, context, and autonomous action.",
        url: "/blog/agentic-workflow-beginners-guide/"
      },
      {
        title: "Why Businesses Need Visibility, Strategy, and Automation",
        description: "Why modern digital work needs more than a static website.",
        url: "/blog/why-businesses-need-visibility-strategy-automation/"
      }
    ],
    softwareTesting: [
      {
        title: "Software Testing and QA Questions Businesses Ask",
        description: "Answers for teams considering QA support, test coverage, and release confidence.",
        url: "/blog/software-testing-qa-business-questions/"
      },
      {
        title: "What Is ISTQB Certification and Why It Matters",
        description: "Why structured testing knowledge matters when you hire QA help.",
        url: "/blog/what-is-istqb-certification/"
      },
      {
        title: "How Agentic QA Transforms Software Release Confidence",
        description: "How automation agents gather signals while humans keep control of release decisions.",
        url: "/blog/agentic-qa-release-confidence/"
      }
    ],
    tiktokAgency: [
      {
        title: "TikTok Agency, Live Selling, and UGC",
        description: "How TikTok Live and UGC-style content can create direct sales momentum.",
        url: "/blog/tiktok-agency-live-selling-ugc/"
      },
      {
        title: "What Is UGC Video Creation and How Can AI Help?",
        description: "How brands can use UGC-style videos without a traditional production crew.",
        url: "/blog/ugc-ai-video-creation-brand-campaigns/"
      },
      {
        title: "Automated Lead Generation for Web Design Clients",
        description: "A practical look at content, automation, and lead flow for service businesses.",
        url: "/blog/how-i-built-an-automated-lead-generation-system-for-web-design-clients/"
      }
    ],
    sewingPattern: [
      {
        title: "Custom Suit Measurements and Sewing Patterns",
        description: "How precise measurement and pattern work create better bespoke clothing outcomes.",
        url: "/blog/sewing-pattern-custom-suit-measurements/"
      },
      {
        title: "Why Businesses Need Visibility, Strategy, and Automation",
        description: "A useful companion for small brands turning craft into a visible offer.",
        url: "/blog/why-businesses-need-visibility-strategy-automation/"
      }
    ],
    projectDesign: [
      {
        title: "Why Businesses Need Visibility, Strategy, and Automation",
        description: "How disciplined planning helps complex services become easier to understand and buy.",
        url: "/blog/why-businesses-need-visibility-strategy-automation/"
      },
      {
        title: "Website Audit: What It Is and Why You Need One",
        description: "A useful diagnostic mindset for improving any technical or customer-facing service.",
        url: "/blog/website-audit-what-it-is-why-you-need-it/"
      },
      {
        title: "Agentic Workflow Design: A Practical Beginner's Guide",
        description: "A practical framework for turning repeated project steps into clear workflows.",
        url: "/blog/agentic-workflow-beginners-guide/"
      }
    ]
  };

  const relatedByService = {
    "/services/airport-transfer": {
      eyebrow: "Airport planning",
      heading: "Read before your Helsinki airport transfer",
      intro: "These guides answer the arrival questions travellers usually have before booking a private pickup from Helsinki Vantaa Airport.",
      posts: posts.airportTransfer
    },
    "/services/private-pickup": {
      eyebrow: "Arrival support",
      heading: "Guides for a smoother private pickup",
      intro: "Use these articles to plan what happens after landing, from flight tracking to late-night arrivals and luggage-friendly transfers.",
      posts: posts.airportTransfer
    },
    "/services/private-rides": {
      eyebrow: "Private journey ideas",
      heading: "Plan a better private ride in Helsinki",
      intro: "These articles show how private rides work for business travel, special occasions, and custom Helsinki city experiences.",
      posts: posts.privateRides
    },
    "/services/city-to-city": {
      eyebrow: "Route planning",
      heading: "Ideas for longer private routes in Finland",
      intro: "Explore guides for travellers comparing Finnish cities, seasonal routes, and cross-border day trips before choosing a transfer.",
      posts: posts.cityTravel
    },
    "/services/hotel-sourcing": {
      eyebrow: "Stay planning",
      heading: "Travel guides for choosing the right stay",
      intro: "These Finland travel articles help you match hotel sourcing with season, destination, itinerary style, and guest expectations.",
      posts: posts.finlandTravel
    },
    "/services/web-design": {
      eyebrow: "Website strategy",
      heading: "Read before rebuilding your website",
      intro: "These guides focus on conversion, SEO, and practical website decisions for Finnish small businesses that need better leads.",
      posts: posts.webDesign
    },
    "/services/ai-agents": {
      eyebrow: "Automation strategy",
      heading: "Understand AI agents before you build",
      intro: "Use these articles to connect agentic workflow ideas with real business automation, content systems, and lead operations.",
      posts: posts.aiAgents
    },
    "/services/software-testing": {
      eyebrow: "QA planning",
      heading: "Guides for stronger release confidence",
      intro: "These articles explain test coverage, QA structure, and agent-assisted testing for teams that need fewer release surprises.",
      posts: posts.softwareTesting
    },
    "/services/tiktok-agency": {
      eyebrow: "TikTok growth",
      heading: "Read before planning TikTok campaigns",
      intro: "These guides connect live selling, UGC content, AI-assisted production, and lead generation into one campaign strategy.",
      posts: posts.tiktokAgency
    },
    "/services/sewing-pattern": {
      eyebrow: "Pattern precision",
      heading: "Guides for custom sewing pattern work",
      intro: "These articles support bespoke garment planning, measurement quality, and the business side of making craft easier to buy.",
      posts: posts.sewingPattern
    },
    "/services/mechanical-design": {
      eyebrow: "Engineering workflow",
      heading: "Read before scoping mechanical design work",
      intro: "These guides help technical buyers think about project clarity, documentation, diagnostics, and repeatable engineering workflows.",
      posts: posts.projectDesign
    },
    "/services/electrical-design": {
      eyebrow: "System planning",
      heading: "Read before scoping electrical design work",
      intro: "These guides support clear requirements, safer documentation habits, and structured planning for technical design projects.",
      posts: posts.projectDesign
    }
  };

  const path = window.location.pathname.replace(/\/$/, "");
  const related = relatedByService[path];
  if (!related || !related.posts || document.querySelector("[data-related-content]")) return;

  const style = document.createElement("style");
  style.textContent = `
    .related-content{padding:5rem 0;background:rgba(255,255,255,.015);border-top:1px solid rgba(201,169,106,.08);border-bottom:1px solid rgba(201,169,106,.08)}
    .related-content .related-head{max-width:620px;margin-bottom:2rem}
    .related-content .related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}
    .related-content .related-card{display:flex;flex-direction:column;min-height:100%;background:var(--card,#11131A);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:1.35rem;transition:border-color .2s,transform .2s}
    .related-content .related-card:hover{border-color:var(--gold,#C9A96A);transform:translateY(-2px)}
    .related-content .related-card h3{color:var(--text,#E8EBF2);font-size:1rem;line-height:1.35;margin:0 0 .55rem}
    .related-content .related-card p{font-size:.88rem;opacity:.64;margin:0 0 1rem}
    .related-content .related-card span{margin-top:auto;color:var(--gold,#C9A96A);font-size:.72rem;letter-spacing:1.4px;text-transform:uppercase}
    @media(max-width:900px){.related-content .related-grid{grid-template-columns:1fr}.related-content{padding:3.5rem 0}}
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "related-content";
  section.setAttribute("data-related-content", "");
  section.innerHTML = `
    <div class="container">
      <div class="related-head">
        <span class="eyebrow">${related.eyebrow}</span>
        <h2>${related.heading}</h2>
        <p>${related.intro}</p>
      </div>
      <div class="related-grid">
        ${related.posts.map((post) => `
          <a class="related-card" href="${post.url}">
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <span>Read article</span>
          </a>
        `).join("")}
      </div>
    </div>
  `;

  const anchor = document.querySelector(".cta-band") || document.querySelector("footer");
  if (anchor && anchor.parentNode) {
    anchor.parentNode.insertBefore(section, anchor);
  }
})();
