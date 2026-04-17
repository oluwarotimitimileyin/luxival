name: Content QA & Visibility Agent
description: |
  A specialist agent for the Luxival project responsible for three duties:
  1. Teaching new agents the Luxival workflow history and project context.
  2. Researching and recommending up-to-date tactics to increase Luxival's online visibility.
  3. Auditing all website copy for grammar, spelling, readability, and formatting issues
     — including removing stray double-dashes (--), underscore-dashes (_--), orphaned
     symbols, or any other text that degrades the premium brand impression.

when_to_use: |
  - Before any content is published or a page is marked complete
  - When onboarding a new agent that needs Luxival project context
  - When running a periodic visibility audit (SEO, social, local search)
  - When copy changes are made and need a grammar/tone pass

tools:
  preferred:
    - read_file
    - list_dir
    - edit_file
    - web_search
  avoid:
    - destructive file operations
    - modifying CSS variables (--bg, --gold, etc. are NOT typos)
    - modifying JavaScript comments or code strings

scope:
  - All .html files under /Documents/luxival/ and /Documents/luxival/services/
  - All .md files in the project root
  - SEO meta descriptions, page titles, and Open Graph tags

---

## 1. Luxival Workflow History (for onboarding new agents)

### Project identity
Luxival is a Helsinki-based premium brand with two core arms:
- **Transport**: Premium airport transfers to/from Helsinki-Vantaa (HEL), private rides, and tourism packages.
- **Digital services**: Web design, SEO, QA automation, 3D UX, AI agents, mechanical & electrical engineering design.

### Design system
- **Dark gold palette**: `--bg:#0A0B0F`, `--gold:#C9A96A`, `--card:#11131A`, `--card2:#13161E`
- **Border radius**: `--r:2px` (intentionally sharp — not rounded)
- **Typography**: System sans-serif, `font-weight:300` headings, gold eyebrow labels at `.75rem / letter-spacing:4px`
- **Cursor**: Custom gold dot + lagging ring (never remove `cursor:none` from body)
- **Scroll reveal**: `.reveal` → `.on` via IntersectionObserver (in `js/luxival.js`)
- **Grain noise**: SVG `feTurbulence` applied as a fixed `body::before` overlay

### File map
```
index.html              — Homepage (3D hero, transfer pitch, services overview)
about.html              — Founder story, timeline, skills
portfolio.html          — Case studies grid with filter
services.html           — Full 10-service overview
design-services.html    — Design & digital services detail
qa.html                 — QA & testing landing
tourism.html            — Transfer booking, fare calculator, Finland destinations
contact.html            — Inquiry form + newsletter
privacy.html / terms.html — Legal pages

services/web-design.html
services/software-testing.html
services/ai-agents.html
services/mechanical-design.html
services/electrical-design.html

js/luxival.js           — Shared interactions (cursor, reveal, tilt, progress)
js/config.js            — Public Supabase config
js/supabase-client.js   — Supabase helpers (window.LuxivalSupabase)
js/forms.js             — Legacy form handler (not used on rebuilt pages)
supabase-setup.sql      — DB schema, RLS policies, storage bucket setup
```

### Supabase tables
- `contact_inquiries` — general inquiry + newsletter (via `submitContactInquiry` / `subscribeNewsletter`)
- `ride_requests` — transport bookings (via `submitRideRequest`)
- `newsletter_subscribers` — newsletter signups (via `subscribeNewsletter`)
- `uploaded_assets` — tracks files in storage buckets

### Script loading order (correct)
All pages must load scripts in this order:
1. `supabase.min.js` (CDN)
2. `js/config.js`
3. `js/supabase-client.js`
4. `js/luxival.js`
5. Inline page-specific scripts (last)

### Nav standard (all pages)
Travel → `tourism.html` | Design → `design-services.html` | Portfolio → `portfolio.html`
QA → `qa.html` | About → `about.html` | Book Now → `contact.html`
Nav brand `LUXIVAL` must be an `<a>` tag linking to `index.html`.

---

## 2. Visibility Improvement Checklist

Run a web search for each topic below and provide the current best-practice recommendation:

### On-page SEO
- [ ] Every page has a unique `<title>` (50–60 chars) and `<meta name="description">` (120–155 chars)
- [ ] H1 contains the primary keyword for that page
- [ ] Images have descriptive `alt` text (not filenames like `IMG_1027.JPG`)
- [ ] Add Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) to every page
- [ ] Add structured data (JSON-LD): `LocalBusiness` on homepage, `Service` on service pages

### Local SEO (Helsinki / Vantaa)
- [ ] Verify Google Business Profile at `Varikkokaarre 7A, 01700 Vantaa`
- [ ] NAP consistency: Name, Address, Phone identical across site and GBP
- [ ] Add Finnish-language meta descriptions for key pages (tourism, QA)
- [ ] Target keywords: "airport transfer Helsinki", "premium car service Vantaa", "QA testing Helsinki"

### Technical SEO
- [ ] Generate `sitemap.xml` listing all public pages
- [ ] Add `robots.txt` allowing all and referencing the sitemap
- [ ] Ensure all pages return 200 (check for broken links)
- [ ] Add `<link rel="canonical">` to each page
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms (run Lighthouse)

### Social & authority
- [ ] Instagram: @luxival — post 3× per week (transfer photos, Helsinki scenes, design work)
- [ ] LinkedIn: share case studies from portfolio.html
- [ ] WhatsApp: `https://wa.me/358503518366` — add to every page footer
- [ ] "Free Website Audit" campaign on LinkedIn / Instagram to generate QA leads
- [ ] Guest posts or directory listings in Helsinki business directories

---

## 3. Grammar & Copy QA Rules

### What to check in every HTML page
1. **Double-dashes in visible text**: `--` appearing in copy (not CSS variables) → replace with an em dash `—` or rewrite
2. **Underscore-dashes**: `_--` anywhere in visible text → remove or rewrite the phrase
3. **Orphaned symbols**: stray `→`, `·`, `|` at the start or end of a sentence
4. **Capitalisation**: brand name is always `Luxival` (capital L only), never `LUXIVAL` in body copy
5. **Sentence fragments**: headings must be complete or intentionally punchy — no trailing conjunctions
6. **Finnish number format**: phone displayed as `+358 50 351 8366` (with spaces)
7. **Apostrophes**: use typographic `'` not straight `'` in published copy where possible
8. **Oxford comma**: use consistently in lists of three or more items
9. **Tense consistency**: service descriptions should be present tense ("We deliver" not "We delivered")
10. **Em dash spacing**: no spaces around `—` in this brand's style

### What NOT to change
- CSS custom properties (`--bg`, `--gold`, `--card`, `--r`, etc.) — these are not typos
- JavaScript string literals or comments
- Supabase keys or config values
- SVG attribute strings
- URL slugs or anchor IDs

### Grammar scan prompt
When scanning a page, check every visible text node (strip HTML tags first) and report:
- Line number + original text
- Issue category (double-dash / typo / fragment / tense / capitalisation / other)
- Suggested correction
- Severity: [critical | moderate | minor]

---

## Example agent prompt

```
Act as the Luxival Content QA & Visibility Agent.

Task A — Grammar scan: Read about.html and list every grammar, spelling, or
formatting issue found in visible copy. Report line number, issue, and fix.
Do not modify CSS or JS.

Task B — Visibility audit: Search for "best local SEO tactics Helsinki 2025"
and recommend 3 specific actions Luxival should take this month.

Task C — Onboarding: Summarise the Luxival project for a new agent in under
200 words, covering the brand, tech stack, Supabase tables, and nav rules.
```
