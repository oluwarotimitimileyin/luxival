# Luxival — Site Map and Information Architecture
**Phase:** Planning
**Task:** 02 — Define Information Architecture
**Date:** 2026-04-16
**Inputs:** discovery-report.md, project-backlog.md
**Status:** Complete — awaiting owner sign-off before Task 03 begins

---

## 1. Site Structure Overview

```
luxival.com/
├── index.html                 Home — hero, dual-service intro, services overview, trust signals, featured projects, CTA
├── services.html              Services — full digital and transport service catalog
├── tourism.html               Tourism & Transport — airport transfer details, pricing calculator, ride request form
├── portfolio.html             Portfolio — project showcase with category filter tabs
├── qa.html                    QA — testing credibility, methodology, audit offering
├── about.html                 About — founder story, mission, company identity
├── contact.html               Contact — inquiry form, business details, conversion
├── privacy.html               Privacy Policy — GDPR compliance (MISSING — must be created)
├── terms.html                 Terms of Service — legal baseline (MISSING — must be created)
├── 404.html                   Not Found — branded error page (NOT YET CREATED — recommended)
├── robots.txt                 Crawler instructions (MISSING — must be created)
├── sitemap.xml                XML sitemap (EXISTS — needs lastmod dates added)
└── admin.html                 Admin Dashboard — internal only, NOT in sitemap or public nav
```

---

## 2. Navigation Hierarchy

### Primary navigation (header)

| Position | Label | URL | Style | Notes |
|---|---|---|---|---|
| 1 | Home | index.html | Text link | Active state set with `aria-current="page"` on inner pages |
| 2 | Services | services.html | Text link | |
| 3 | Tourism | tourism.html | Text link | |
| 4 | Portfolio | portfolio.html | Text link | |
| 5 | QA | qa.html | Text link | |
| 6 | About | about.html | Text link | |
| 7 | Contact | contact.html | `button-secondary` | Visual CTA — always styled as button |

### Footer navigation

| Label | URL | Notes |
|---|---|---|
| About | about.html | |
| Contact | contact.html | |
| Privacy | privacy.html | Page does not exist yet — broken link on all pages |

### Navigation issues found (must be resolved before launch)

1. **Admin link is visible in public nav on index.html.** `admin.html` is linked with `class="button button-outline"` directly in the header nav. This exposes the admin URL to every visitor. It must be removed from public navigation immediately. Admin is accessed by direct URL only.
2. **admin.html nav is inconsistent.** It is missing the `QA` and `About` links that all other pages carry. The admin nav should either match the public nav (minus the Admin button) or be a minimal internal-only nav.
3. **footer nav is missing Terms link.** The footer currently has About, Contact, Privacy. It should also link to `terms.html` once created.
4. **Privacy link in footer is broken on all pages.** `privacy.html` does not exist. Until it is created, this is a broken link.
5. **Brand tagline missing on inner pages.** `index.html` shows the brand sub-heading "Premium digital & transport experiences" next to the logo. Inner pages omit this. This is intentional and acceptable.

---

## 3. Page Inventory

### Home — `index.html`
- **URL:** `https://luxival.com/`
- **Template:** Hero page
- **Purpose:** Introduce Luxival, split dual-service value proposition, drive traffic to Services and Tourism, capture email leads via chat widget
- **Primary keyword:** `premium digital services Helsinki airport transfer`
- **Content sections:** Hero, Dual-service intro, Services overview (4 cards), SEO lead engine feature, 3D immersive showcase, Trust stats banner, Featured projects, Final CTA
- **CTAs:** Book a consultation → contact.html | Request a ride → tourism.html | Explore all services → services.html | View portfolio → portfolio.html | Send an inquiry → contact.html
- **Schema.org:** Organization, LocalBusiness, WebSite — all present
- **OG tags:** Present — og:image references `/assets/og-home.jpg` (file does not exist yet)
- **Status:** Coded. Content is placeholder. Visual assets missing.

### Services — `services.html`
- **URL:** `https://luxival.com/services.html`
- **Template:** Service catalog page
- **Purpose:** Enumerate every digital and transport service; build credibility; convert to contact inquiry
- **Primary keyword:** `digital services Helsinki web design SEO QA`
- **Content sections:** Page hero, Digital services grid, Transport services, CTA
- **CTAs:** Ask about services → contact.html
- **Schema.org:** Service schema — not yet present, required for rich results
- **OG tags:** Needs audit
- **Status:** Coded. Content needs review and polish.

### Tourism & Transport — `tourism.html`
- **URL:** `https://luxival.com/tourism.html`
- **Template:** Interactive booking page
- **Purpose:** Explain transport offering, demonstrate transparent pricing via calculator, capture ride requests
- **Primary keyword:** `Helsinki airport transfer private car Vantaa`
- **Content sections:** Page hero, Service types (airport, city-to-city, tourism, custom), Pricing calculator, Ride request form, FAQ/trust signals
- **CTAs:** Submit booking inquiry → contact.html | Ride request form (submits to Supabase)
- **Schema.org:** Service schema for transport — not yet present
- **OG tags:** Needs audit
- **Status:** Coded. Pricing calculator implemented. Form submits to Supabase (blocked until anon key is live).

### Portfolio — `portfolio.html`
- **URL:** `https://luxival.com/portfolio.html`
- **Template:** Portfolio grid page
- **Purpose:** Demonstrate past work quality, build credibility with technical buyers, filter by category
- **Primary keyword:** `web design portfolio Helsinki QA UX 3D projects`
- **Content sections:** Page hero, Filter tabs (All / Digital / QA / 3D / Engineering), Project grid cards, CTA
- **CTAs:** Share your project → contact.html
- **Schema.org:** No schema yet — consider CreativeWork or ItemList
- **OG tags:** Needs audit
- **Status:** Coded. All portfolio content is placeholder. No real case studies.

### QA & Credibility — `qa.html`
- **URL:** `https://luxival.com/qa.html`
- **Template:** Credibility/specialty page
- **Purpose:** Establish QA expertise, speak to technical decision-makers, convert to audit request
- **Primary keyword:** `web QA testing Helsinki website quality audit`
- **Content sections:** Page hero, QA methodology, Service details, CTA
- **CTAs:** Request a QA audit → contact.html
- **Schema.org:** Service schema — not yet present
- **OG tags:** Needs audit
- **Status:** Coded. Content needs review for technical depth.

### About — `about.html`
- **URL:** `https://luxival.com/about.html`
- **Template:** About/founder page
- **Purpose:** Build personal trust, tell founder story, explain the dual-service business model origin
- **Primary keyword:** `about Luxival Helsinki digital agency founder`
- **Content sections:** Page hero, Founder story, Mission statement, Multidisciplinary background, CTA
- **CTAs:** Connect with Luxival → contact.html
- **Schema.org:** Person schema for founder — not yet present
- **OG tags:** Needs audit
- **Status:** Coded. All copy is placeholder. Needs real founder content.

### Contact — `contact.html`
- **URL:** `https://luxival.com/contact.html`
- **Template:** Form conversion page
- **Purpose:** Primary lead capture endpoint — inquiry form, business details, conversion
- **Primary keyword:** `contact Luxival Helsinki digital services inquiry`
- **Content sections:** Page hero, Inquiry form, Business address and contact details
- **CTAs:** Submit form (to Supabase)
- **Schema.org:** None required beyond existing LocalBusiness on index
- **OG tags:** Needs audit
- **Status:** Coded. Form submits to Supabase (blocked until anon key is live).

### Privacy Policy — `privacy.html` *(MISSING)*
- **URL:** `https://luxival.com/privacy.html`
- **Template:** Legal page
- **Purpose:** GDPR compliance; required before collecting any personal data via forms
- **Content:** Data collected, how it is used, retention period, user rights, contact for data requests
- **Navigation:** Linked in footer of all pages (currently broken link)
- **Status:** Does not exist. Must be created before launch.

### Terms of Service — `terms.html` *(MISSING)*
- **URL:** `https://luxival.com/terms.html`
- **Template:** Legal page
- **Purpose:** Define service terms for digital clients and transport customers
- **Content:** Service scope, payment terms, cancellation policy, limitation of liability
- **Navigation:** Should be added to footer nav
- **Status:** Does not exist. Must be created before launch.

### 404 Error Page — `404.html` *(RECOMMENDED)*
- **URL:** Auto-served by Vercel on missing pages
- **Template:** Error page
- **Purpose:** Retain visitors who land on a broken URL; redirect to key pages
- **Content:** Branded error message, links back to Home, Services, Tourism, Contact
- **Status:** Does not exist. Recommended before launch.

### Admin Dashboard — `admin.html` *(INTERNAL ONLY)*
- **URL:** `https://luxival.com/admin.html`
- **Template:** Internal dashboard
- **Purpose:** Review and manage Supabase leads, ride requests, newsletter subscribers
- **Navigation:** NOT in public nav, NOT in sitemap.xml, NOT in footer
- **Security issue:** Currently linked in public nav on index.html — must be removed
- **Status:** Coded. No authentication. Anyone with the URL can view all leads.

---

## 4. URL Structure

Current URLs use `.html` extensions (e.g., `services.html`). This is valid for a static site deployed on Vercel. Vercel's default behaviour serves these correctly.

**Recommendation:** Configure Vercel to enable clean URLs (without `.html`) via `vercel.json` once deployed. This improves SEO and user experience. Example:

```json
{
  "cleanUrls": true
}
```

With clean URLs active, `https://luxival.com/services.html` becomes `https://luxival.com/services`. All internal links remain as `services.html` — Vercel handles the redirect automatically.

---

## 5. User Journey Flows

### Journey A — Digital services buyer
```
Google search: "Helsinki web design agency"
→ index.html (organic or paid)
→ services.html (Explore all services CTA)
→ portfolio.html (View portfolio CTA or nav)
→ contact.html (Ask about services CTA)
→ Supabase: contact_inquiries record created
→ Admin notified → follow-up call
```

### Journey B — Airport transfer booker
```
Google search: "Helsinki airport transfer private car"
→ tourism.html (organic — primary keyword target)
→ Pricing calculator interaction (fare estimated)
→ Ride request form submit
→ Supabase: ride_requests record created
→ Admin notified → booking confirmed via email/WhatsApp
```

### Journey C — Chat widget lead
```
Any page → floating chat widget opens
→ Step 1: name → Step 2: email → Step 3: service interest → Step 4: message → Step 5: confirm
→ Supabase: contact_inquiries record created
→ Admin reviews in admin.html
```

### Journey D — Newsletter subscriber
```
Any page footer / contact page
→ Newsletter signup form
→ Supabase: newsletter_subscribers record created
→ Future email marketing campaigns
```

---

## 6. Page Templates

Five distinct templates cover all current and planned pages:

### Template 1: Hero page
**Used by:** index.html
**Structure:**
- Full-viewport hero (headline, sub-copy, two CTAs, hero visual card)
- Multiple alternating `section` blocks with `section-dark` / default backgrounds
- Trust signals row
- Final gradient CTA section
- Footer with nav

### Template 2: Interior content page
**Used by:** services.html, qa.html, about.html
**Structure:**
- Page hero (short — `section-dark`, eyebrow, h1, sub-copy, one CTA)
- 2–4 content sections (feature grids, article cards, copy blocks)
- Bottom CTA section linking to contact.html
- Footer with nav

### Template 3: Interactive booking page
**Used by:** tourism.html
**Structure:**
- Page hero
- Service type cards
- Pricing calculator (JS-powered, real-time fare update)
- Ride request form (Supabase insert)
- Trust signals
- Footer with nav

### Template 4: Portfolio grid page
**Used by:** portfolio.html
**Structure:**
- Page hero
- Filter button row (All / Digital / QA / 3D / Engineering)
- Responsive project card grid (filter controlled by JS)
- Bottom CTA
- Footer with nav

### Template 5: Form conversion page
**Used by:** contact.html, privacy.html (adapted), terms.html (adapted)
**Structure:**
- Page hero
- Form or legal content block
- Business details / contact block (contact.html only)
- Footer with nav

### Template 6: Internal dashboard (admin only)
**Used by:** admin.html
**Structure:**
- Internal header (no public nav link)
- Tabbed table views (leads, ride requests, newsletter)
- No footer CTA

---

## 7. SEO Alignment Per Page

| Page | Title | Meta Description | Unique Topic | URL Clean | Schema Needed |
|---|---|---|---|---|---|
| index.html | ✓ Present | ✓ Present | ✓ Homepage | ✓ / | Organization, LocalBusiness, WebSite — present |
| services.html | ✓ Present but short | ✓ Present | ✓ Service catalog | services | Service schema — missing |
| tourism.html | ✓ Present | ✓ Present | ✓ Transport booking | tourism | Service (transport) — missing |
| portfolio.html | ✓ Present but short | ✓ Present | ✓ Work showcase | portfolio | ItemList or CreativeWork — missing |
| qa.html | ✓ Present | ✓ Present | ✓ QA specialty | qa | Service (QA) — missing |
| about.html | ✓ Present but short | ✓ Present | ✓ Founder/company | about | Person (founder) — missing |
| contact.html | ✓ Present but short | ✓ Present | ✓ Conversion/contact | contact | None required |
| privacy.html | ✗ Missing | ✗ Missing | ✗ Page missing | privacy | None required |
| terms.html | ✗ Missing | ✗ Missing | ✗ Page missing | terms | None required |

**Title tag improvements needed:**
- `services.html`: "Services | Luxival" → "Digital Services & Web Design Helsinki | Luxival"
- `portfolio.html`: "Portfolio | Luxival" → "Work & Portfolio | Web Design, QA, 3D | Luxival"
- `about.html`: "About Luxival" → "About Luxival | Premium Digital & Transport Agency, Helsinki"
- `contact.html`: "Contact | Luxival" → "Contact Luxival | Helsinki Digital Services & Airport Transfer"

---

## 8. sitemap.xml Gaps

Current `sitemap.xml` includes 7 pages (index through contact) with no `lastmod` dates and uses the wrong XML namespace (`https://` instead of `http://`).

Required updates:
1. Fix namespace: `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"` (http, not https)
2. Add `privacy.html` once created
3. Add `terms.html` once created
4. Add `<lastmod>` dates to all URLs
5. Add `<changefreq>` and `<priority>` hints
6. Exclude `admin.html` — it must never appear in the sitemap

---

## 9. Issues Requiring Action Before Task 03

| # | Issue | Severity | Backlog ID |
|---|---|---|---|
| 1 | Admin link in public nav on index.html (security + UX) | P0 | DEV-13 |
| 2 | privacy.html does not exist — broken footer link on all pages | P0 | DEV-07 |
| 3 | terms.html does not exist | P1 | DEV-08 |
| 4 | sitemap.xml has wrong XML namespace and missing lastmod | P1 | SEO-06 |
| 5 | Missing Schema.org markup on services, tourism, portfolio, qa, about | P1 | SEO-04/05 |
| 6 | Short/weak title tags on 4 inner pages | P1 | SEO-02 |
| 7 | og:image references /assets/og-home.jpg which does not exist | P1 | DES-01 |
| 8 | 404.html does not exist | P2 | — |
| 9 | Terms not linked in footer nav | P2 | DEV-08 |
| 10 | admin.html nav is inconsistent with all other pages | P2 | DEV-13 |

---

## 10. Checkpoint Status

- [x] Site map file created (this document)
- [x] All page templates identified and documented (6 templates)
- [x] URL structure documented and clean URL recommendation made
- [x] Navigation hierarchy mapped and inconsistencies flagged
- [x] User journeys documented (4 key flows)
- [x] SEO alignment verified per page — gaps documented
- [x] sitemap.xml gaps identified
- [ ] Owner sign-off received before Task 03 begins

---

## 11. Task 03 Input Requirements

Task 03 — Produce Wireframes and UX Prototypes — requires:
- This site map (done)
- Page template list (done — 6 templates documented above)
- Owner confirmation of navigation structure and page list
- Decision on whether 404.html should be added to v1 scope
