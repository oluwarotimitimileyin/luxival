# Luxival — Discovery Report
**Phase:** Discovery
**Task:** 01 — Discovery and Research
**Date:** 2026-04-16
**Status:** Complete — awaiting owner sign-off before Task 02 begins

---

## 1. Business Mission and Brand Identity

**Company:** Luxival
**Legal address:** Varikkokaarre 7A, 01700 Vantaa, Finland
**Contact:** support@luxival.com | +358503518366
**WhatsApp:** https://wa.me/+358503518366
**Website:** https://luxival.com
**Supabase project:** zvwbwbnsfhsaueqddqza.supabase.co

### Mission
Luxival exists to deliver premium outcomes in two adjacent markets:

1. **Digital services** — web design, SEO, QA engineering, UX conversion funnels, and 3D interactive experiences for Helsinki-area businesses
2. **Airport transport** — reliable, professional private car transfers between Helsinki-Vantaa Airport (HEL) and destinations across the greater Helsinki region

### Brand voice
Premium, confident, minimal, Finnish-modern. The site should communicate that every detail has been considered — from the dark design system to the transparent pricing calculator to the structured lead qualification flow.

### Differentiators
1. **Dual-market model** — no direct Helsinki competitor currently combines premium digital services and premium airport transport under a single brand
2. **Transparent fare calculator** — real-time ride pricing is public and self-service; leading competitors such as Helsinki Limo operate on a quote-on-request model
3. **Modern dark design language** — purple-accent dark theme is distinct from the white/light designs used by most Finnish digital agencies
4. **QA credibility page** — dedicated QA section builds trust with technical decision-makers, which is uncommon in this segment
5. **3D interactive experiences** — differentiator in the Helsinki digital services market
6. **Vantaa location** — closer proximity to Helsinki-Vantaa Airport than most city-centre competitors

---

## 2. Target Audience

### Primary audience A: Helsinki businesses
- SMEs and growing companies in Helsinki and greater Uusimaa region
- Decision-makers needing web design, SEO, QA, or immersive digital experiences
- Organizations evaluating multiple agencies and comparing on credibility, modernity, and trust signals
- Key conversion path: services page → contact form → lead in Supabase CRM

### Primary audience B: International travelers
- Business travelers, executives, and leisure travelers arriving at or departing from Helsinki-Vantaa Airport (HEL)
- High expectations for reliability, comfort, and professionalism
- Booking behavior: often pre-books via website; price-sensitive on value, not on absolute cost
- Key conversion path: tourism page → pricing calculator → ride request form → lead in Supabase

### Secondary audience
- Corporate accounts needing recurring transport bookings
- Portfolio viewers (potential clients evaluating digital work quality)

---

## 3. Competitor Analysis

### Transport competitors

#### Blacklane (blacklane.com)
- **Positioning:** Global premium chauffeur brand, Helsinki listed as a key city
- **Strengths:** Fixed-rate pricing (no surge), upfront cost transparency, complimentary 60-minute wait time with flight tracking, app-first booking (iOS and Android), 4-step booking UX, international brand recognition
- **Weaknesses:** Global platform — no local Finnish personality, no digital services angle, premium price ceiling
- **Design:** Clean white and charcoal interface, minimal copy, strong CTAs
- **Luxival gap:** Luxival matches on pricing transparency. Luxival lacks an app and has no international brand presence yet.

#### Helsinki Limo (helsinkilimo.com)
- **Positioning:** Full-service Finnish limousine and executive transport company, Luxury Lifestyle Awards winner
- **Strengths:** Corporate portal with 24/7 booking and invoice tracking, premium in-vehicle amenities (Finnish spring water, Wi-Fi, iPads), fleet diversity (sedan to VIP bus), established brand in Finland
- **Weaknesses:** No public pricing — quote-on-request only, website design is dated, no digital services capability
- **Design:** Traditional corporate look, light background, stock photography
- **Luxival gap:** Luxival's transparent pricing and modern design are clear advantages. Helsinki Limo's corporate portal and fleet range are features Luxival does not yet have.

#### Noble Transfer (nobletransfer.com)
- **Positioning:** Premium airport transfer with meet-and-greet, international focus
- **Strengths:** Clear service descriptions, multi-city presence, meet-and-greet standard
- **Weaknesses:** Generic international brand, no local Finnish identity
- **Luxival gap:** Luxival has a stronger local identity.

#### Transfeero (transfeero.com)
- **Positioning:** Airport transfer specialists, flight tracking and kerbside service
- **Strengths:** Flight tracking, baggage assistance, chauffeur with signage
- **Weaknesses:** Aggregator model — not a single brand experience
- **Luxival gap:** Luxival can offer a more personal, curated brand experience.

#### Limos4 (limos4.com)
- **Positioning:** Affordable private chauffeured transfers with all-inclusive pricing
- **Strengths:** No hidden costs, all-inclusive quoted price (meet-and-greet, insurance, fuel, gratuities, taxes)
- **Weaknesses:** Budget-positioned, not premium; generic design
- **Luxival gap:** Luxival is premium-positioned with superior design and a calculator-first pricing UX.

---

### Digital agency competitors

#### Sisu Digital (sisudigital.fi)
- **Positioning:** Top Elementor/WordPress agency in Finland and Nordics
- **Strengths:** Transparent pricing (€4,000–€5,000 per project), clear process documentation, strong SEO rankings, client testimonials on Clutch
- **Weaknesses:** WordPress-only — no 3D, no QA services, limited service range
- **Design:** Clean, light, professional; no dark premium aesthetic
- **Luxival gap:** Luxival offers a broader technical service range (QA, 3D, UX funnels) and a more distinctive brand. Sisu Digital wins on volume of published reviews.

#### Hopkins Oy
- **Positioning:** One of Finland's leading digital marketing agencies — advertising, SEO, analytics, automation
- **Strengths:** Large team, established client roster, broad service range
- **Weaknesses:** Enterprise focus, likely less accessible to SMEs; no transport angle
- **Luxival gap:** Luxival can compete on boutique personalization and niche technical depth.

#### Engaio Digital
- **Positioning:** Growth-driven PPC, SEO, and analytics agency
- **Strengths:** Focus on measurable growth, data-driven
- **Weaknesses:** Narrow service scope — no design, no QA, no 3D
- **Luxival gap:** Luxival's broader capability stack is an advantage.

#### AWISEE
- **Positioning:** SEO and link-building specialist
- **Strengths:** Deep SEO specialization
- **Weaknesses:** Single-service focus
- **Luxival gap:** Luxival offers SEO as part of a full-service stack.

---

## 4. Design and UX Benchmarking

Based on 2026 luxury website design research, the following patterns define the premium segment:

| Pattern | Benchmark standard | Luxival current state |
|---|---|---|
| Dark mode | Expected default in 2026 | Implemented — dark theme with --bg #07090f |
| Color restraint | 2–3 colors max | Implemented — bg, surface, accent, text |
| Glassmorphism | Widely used for premium feel | Not yet applied |
| Animated hero | Standard for premium brands | Implemented |
| Upfront pricing | Strong conversion differentiator | Implemented — calculator on tourism.html |
| Social proof / reviews | Prominently displayed | Missing — no testimonials or review schema |
| Case study portfolio | Required for agency credibility | Missing — placeholder content only |
| Privacy and legal pages | Expected by browsers and regulators | Missing — no privacy.html or terms.html |
| robots.txt | SEO baseline | Missing |
| Analytics (GA4) | Post-launch monitoring baseline | Missing |
| Mobile-first booking flow | Critical for transport bookings | Present but not yet tested on device |

---

## 5. Scope Confirmation

The confirmed scope for Luxival v1 is:

### In scope
- 7 HTML pages (index, about, services, tourism, portfolio, qa, contact)
- Admin dashboard (admin.html)
- Supabase backend for lead capture (contact inquiries, ride requests, newsletter subscriptions, CRM contacts)
- Interactive: nav, pricing calculator, chat widget, 3D card tilt, showcase tabs
- SEO: meta tags, OG tags, sitemap.xml, robots.txt, Schema.org
- Legal: privacy.html, terms.html
- Deployment: Vercel with environment variables

### Out of scope for v1
- Native mobile app (competitor advantage to address in v2)
- Stripe payment processing (planned, not started — v2)
- Corporate account portal (Helsinki Limo feature — v2)
- Blog or content marketing section (post-launch)
- CMS integration (static site is intentional for v1)
- Multilingual support (English-first for v1; Finnish v2)

---

## 6. Constraints

1. **No frameworks** — vanilla HTML, CSS, JavaScript only. No npm, no build step.
2. **No secrets in browser** — SUPABASE_SERVICE_ROLE_KEY and STRIPE_SECRET_KEY must stay server-side.
3. **No design system changes** — all new UI uses existing CSS custom properties.
4. **Script load order fixed** — main.js → Supabase CDN → config.js → supabase-client.js → forms.js → chat-widget.js.
5. **Supabase anon key not yet live** — js/config.js still has placeholder; must be replaced before any form can submit.

---

## 7. Open Questions for Owner Sign-off

Before Task 02 begins, confirm the following:

- [ ] Is the scope definition above accurate and complete for v1?
- [ ] Should Finnish language support be considered for v1 or strictly v2?
- [ ] Are there specific case studies or portfolio projects to feature, or will portfolio remain placeholder for launch?
- [ ] Is the Supabase anon key ready to be added to js/config.js?
- [ ] Is the domain `luxival.com` already registered and DNS-accessible?
- [ ] Is a Vercel account set up for deployment?
- [ ] Are there brand guidelines, founder photos, or visual assets ready to replace current placeholders?

---

## 8. Checkpoint Status

- [x] Discovery report file created
- [ ] Project backlog documented (see project-backlog.md)
- [ ] Scope ambiguities resolved (pending owner sign-off)
- [ ] Owner sign-off received before Task 02 begins
