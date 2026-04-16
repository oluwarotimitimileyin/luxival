# Luxival — Project Backlog
**Phase:** Discovery → Planning
**Created:** 2026-04-16
**Status:** Active — updated as tasks complete

Items are ordered by priority within each category.
Priority levels: **P0** = launch blocker | **P1** = high | **P2** = medium | **P3** = nice-to-have

---

## Development

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| DEV-01 | Add real Supabase anon key to js/config.js | P0 | Open | Placeholder `YOUR_REAL_PUBLISHABLE_KEY` must be replaced before any form works |
| DEV-02 | Create Supabase tables via create_tables.sql | P0 | Open | Run supabase/create_tables.sh against the dashboard project |
| DEV-03 | Create Supabase storage buckets (project-images, customer-documents, ride-uploads) | P0 | Open | Required before file uploads work |
| DEV-04 | Apply RLS policies (anon insert on public tables, deny anon select on private) | P0 | Open | Without RLS, all data is exposed |
| DEV-05 | Add .env.local with real credentials (not committed) | P0 | Open | .env.local exists but all values are placeholders |
| DEV-06 | Create robots.txt at site root | P1 | Open | Required for SEO; currently missing |
| DEV-07 | Create privacy.html | P1 | Open | Required before launch; missing |
| DEV-08 | Create terms.html | P1 | Open | Required before launch; missing |
| DEV-09 | Create assets/ directory and add real visual assets | P1 | Open | All image src attributes currently use placeholders |
| DEV-10 | Set up Vercel deployment and push repo to GitHub | P1 | Open | No deployment configured yet |
| DEV-11 | Set Vercel environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, etc.) | P1 | Open | Must be set before live forms work |
| DEV-12 | Test all forms end-to-end against live Supabase | P1 | Open | Cannot be done until DEV-01 through DEV-04 are complete |
| DEV-13 | Add admin authentication to admin.html | P1 | Open | Admin dashboard currently has no auth; anyone with the URL can view leads |
| DEV-14 | Plan Vercel serverless function for Stripe checkout | P2 | Open | `/api/create-checkout-session` placeholder route |
| DEV-15 | Plan Vercel serverless function for Stripe webhook | P2 | Open | `/api/stripe-webhook` placeholder route |
| DEV-16 | Wire Stripe publishable key to front-end (public key only) | P2 | Open | Not started; requires DEV-14 first |
| DEV-17 | Add glassmorphism card effect to service cards | P3 | Open | 2026 luxury design trend; non-blocking |
| DEV-18 | Add signed URL generation for private bucket uploads | P2 | Open | Needs serverless function; rides with attachments |

---

## Content

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| CON-01 | Replace placeholder founder copy on about.html | P1 | Open | Current copy is generic placeholder |
| CON-02 | Add at least 2 real portfolio case studies to portfolio.html | P1 | Open | Currently all placeholder content |
| CON-03 | Write and add privacy policy content to privacy.html | P1 | Open | Required before launch |
| CON-04 | Write and add terms of service content to terms.html | P1 | Open | Required before launch |
| CON-05 | Source or commission hero and service section images | P1 | Open | assets/ directory is missing |
| CON-06 | Add client testimonials or social proof section to index.html | P1 | Open | Missing; all transport and digital agency competitors display reviews |
| CON-07 | Finalize and polish homepage hero positioning copy | P1 | Open | Current copy is draft |
| CON-08 | Add alt text to all real images once assets are in place | P1 | Open | Prerequisite: CON-05 |
| CON-09 | Review and polish services page copy | P2 | Open | Review for accuracy and brand voice alignment |
| CON-10 | Add Finnish language version of key pages | P3 | Open | v2 scope; note in backlog for planning |

---

## SEO

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| SEO-01 | Create robots.txt | P0 | Open | Duplicate of DEV-06 — launch blocker for search engines |
| SEO-02 | Verify each page has a unique title and meta description | P1 | Open | Audit all 7 pages + admin |
| SEO-03 | Verify Open Graph and Twitter card tags on all pages | P1 | Open | index.html has Schema.org — check OG completeness |
| SEO-04 | Add Service schema markup to services.html | P1 | Open | Currently missing from inner pages |
| SEO-05 | Add BreadcrumbList schema to inner pages | P2 | Open | Good for rich results |
| SEO-06 | Update sitemap.xml with accurate lastmod dates | P1 | Open | sitemap.xml exists but dates may be stale |
| SEO-07 | Submit sitemap.xml to Google Search Console | P1 | Open | Cannot do until site is deployed and domain is verified |
| SEO-08 | Verify property in Google Search Console | P1 | Open | Requires live deployment |
| SEO-09 | Submit sitemap.xml to Bing Webmaster Tools | P2 | Open | Secondary priority after Google |
| SEO-10 | Set up Google Analytics 4 via Google Tag Manager | P2 | Open | GA4 not yet configured |
| SEO-11 | Set up conversion goals in GA4 (form submit, chat complete, calculator interaction) | P2 | Open | Requires SEO-10 first |
| SEO-12 | Research and confirm primary keyword per page | P1 | Open | Needed to validate meta descriptions and headings |

---

## Design

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| DES-01 | Source real photography for hero, services, and tourism sections | P1 | Open | Premium imagery is essential for luxury positioning |
| DES-02 | Create or source a Luxival logo (SVG format) | P1 | Open | No logo asset present |
| DES-03 | Add favicon | P1 | Open | No favicon referenced in HTML pages |
| DES-04 | Add loading/skeleton state to admin dashboard tables | P2 | Open | UX improvement for admin |
| DES-05 | Add glassmorphism effect to pricing calculator card | P3 | Open | 2026 luxury design trend; non-blocking |
| DES-06 | Audit mobile responsiveness across all 7 pages | P1 | Open | Not yet tested on real devices |
| DES-07 | Add smooth scroll behavior to all anchor links | P2 | Open | Small UX polish item |
| DES-08 | Review and fix any broken or missing icon references | P1 | Open | Audit icon usage in HTML |

---

## Testing (QA)

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| QA-01 | Test navigation across all pages (desktop and mobile) | P1 | Open | No cross-browser testing done yet |
| QA-02 | Test contact form — valid submit, missing fields, edge cases | P1 | Open | Requires live Supabase (DEV-01 through DEV-04) |
| QA-03 | Test ride request form — valid submit, calculator integration | P1 | Open | Same dependency as QA-02 |
| QA-04 | Test newsletter signup — valid email, duplicate email handling | P1 | Open | Same dependency as QA-02 |
| QA-05 | Test chat widget — all 5 steps, submit flow | P1 | Open | Verify step progression and lead capture |
| QA-06 | Test pricing calculator — all service types, airport surcharge, busy-hour logic | P1 | Open | Formula documented; no test coverage yet |
| QA-07 | Test portfolio filter buttons | P1 | Open | Verify filter interactions |
| QA-08 | Test 3D card tilt interaction on desktop | P2 | Open | Check on multiple screen sizes |
| QA-09 | Cross-browser test: Chrome, Firefox, Safari, Edge | P1 | Open | Not done |
| QA-10 | Mobile test: iOS Safari and Android Chrome | P1 | Open | Not done |
| QA-11 | Accessibility audit — contrast ratios, keyboard nav, ARIA labels | P2 | Open | Required before launch |
| QA-12 | Check for console errors on all pages | P1 | Open | Run DevTools on each page |
| QA-13 | Verify no secrets in any browser-facing file before deployment | P0 | Open | Security gate — must pass before every deploy |
| QA-14 | Verify .env.local is in .gitignore and not committed | P0 | Open | Already in .gitignore; confirm it stays that way |

---

## Launch

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| LCH-01 | Initialize Git repo and push to GitHub | P0 | Open | No remote repo yet; one local commit exists |
| LCH-02 | Deploy to Vercel with correct environment variables | P0 | Open | Requires LCH-01 |
| LCH-03 | Add luxival.com domain in Vercel settings | P0 | Open | DNS setup required |
| LCH-04 | Update DNS records at domain registrar (A record, CNAME for www) | P0 | Open | Requires LCH-03 |
| LCH-05 | Confirm HTTPS active on https://luxival.com and https://www.luxival.com | P0 | Open | Post-DNS verification |
| LCH-06 | Verify all pages load without errors on production URL | P0 | Open | Post-deployment smoke test |
| LCH-07 | Test all forms on production URL | P0 | Open | End-to-end production test |
| LCH-08 | Submit sitemap.xml to Google Search Console | P1 | Open | Requires live domain |
| LCH-09 | Verify Search Console property | P1 | Open | Domain verification |
| LCH-10 | Mark all launch-checklist.md items complete | P1 | Open | Final pre-launch gate |

---

## Backlog Summary

| Category | P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|---|
| Development | 5 | 8 | 4 | 1 | 18 |
| Content | 0 | 8 | 1 | 1 | 10 |
| SEO | 1 | 7 | 4 | 0 | 12 |
| Design | 0 | 5 | 2 | 1 | 8 |
| Testing | 2 | 9 | 3 | 0 | 14 |
| Launch | 6 | 4 | 0 | 0 | 10 |
| **Total** | **14** | **41** | **14** | **3** | **72** |

**Launch blockers (P0): 14 items**
**High priority (P1): 41 items**

---

## Next Task Input

Task 02 — Define Information Architecture — requires:
- This backlog (done)
- Discovery report (done)
- Owner confirmation of scope (pending sign-off)
