# AGENTS.md — Luxival Codebase Guide

## Project Overview
Luxival is a premium multi-service platform (Helsinki-based) offering:
- **Digital services** – web design, SEO, agentic workflows
- **Tourism & transport** – airport transfers, city rides, booking
- **Audit platform** – paid website audits with PDF reports

## Tech Stack
| Layer | Technology |
|---|---|
| Static site | [Eleventy (11ty)](https://www.11ty.dev/) — outputs to `_site/` |
| Frontend | Vanilla HTML + CSS (`css/styles.css`) + JS (`js/`) |
| Blog | Nunjucks templates in `blog/` (11ty collections) |
| Database | Supabase (PostgreSQL) |
| Backend API | FastAPI (Python) — `backend/` |
| Deployment (frontend) | Vercel — see [vercel.json](vercel.json) |
| Deployment (backend) | Fly.io `luxival-audit-api` — see [backend/fly.toml](backend/fly.toml) |
| Testing | Playwright — `tests/site-audit.spec.js` |

## Build & Dev Commands
```bash
npm run dev          # Eleventy dev server with live reload
npm run build        # Eleventy build + inject Google Maps key into _site/
npm run clean        # Remove _site/ output directory
npm run index        # Regenerate search index (scripts/auto-index.js)
npx playwright test  # Run Playwright tests (requires built _site or live URL)
```

Backend (Python):
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

## Key Architecture Decisions

### Environment & Config
- **Public runtime config** lives in `js/config.js` as `window.LuxivalConfig` (Supabase URL, anon key, WhatsApp URL). Safe to ship — anon key only.
- **Build-time injection**: `scripts/inject-env.js` replaces `YOUR_GOOGLE_MAPS_PUBLIC_KEY` placeholders in `_site/` HTML after Eleventy runs. Set `GOOGLE_MAPS_PUBLIC_KEY` in Vercel env vars.
- `.env.local` holds secrets for local dev only — never commit real keys.

### Frontend Patterns
- All pages are static `.html` files at the root; Vercel `cleanUrls: true` strips `.html` from URLs.
- Shared styles: `css/styles.css`. Shared JS modules: `js/main.js`, `js/luxival.js`, `js/forms.js`.
- Supabase calls go through `js/supabase-client.js` using `window.LuxivalConfig`.
- Fare calculator logic: `js/fare-calculator.js` + `api/get-fare.js` + `api/fare_calculator.py`.

### Backend API (`backend/`)
- FastAPI with rate limiting via `slowapi`. CORS origins read from `ALLOWED_ORIGINS` env var.
- In-memory payment/scan state — **replace with Redis before production scaling**.
- Endpoints: `POST /scan/free`, `POST /scan/premium`, `POST /webhook/sumup`, `GET /health`.
- See [backend/DEPLOY.md](backend/DEPLOY.md) for deployment notes.

### Chat API (`api/chat.js`)
- Multi-model AI chat: routes each query to the best model based on task type.
- **Supported providers** (configure via Vercel env vars):
  - `ANTHROPIC_API_KEY` — Claude Haiku (fast) / Claude Sonnet (strong) — primary for FAQ, general, technical
  - `OPENAI_API_KEY` — GPT-4o-mini (fast) / GPT-4o (strong) — primary for booking/order intake
  - `GEMINI_API_KEY` — Gemini 2.0 Flash (fast) / Gemini 2.5 Pro (strong) — primary for greetings, tourism
  - `MOONSHOT_API_KEY` — Moonshot v1 (Kimi) — available as fallback across all tasks
- **Task routing**: Classifies user message into greeting/faq/service_recommend/technical/booking/tourism/pricing/general, then tries the preferred model chain with automatic fallback.
- System prompt includes full service catalog and lead capture instructions (outputs `[LEAD:{...}]` blocks).
- Zero API keys configured → falls back to rule-based replies.

### Supabase Schema
Key tables: `contact_inquiries`, `ride_requests`, `newsletter_subscribers`.
Full schema: [supabase-architecture.md](supabase-architecture.md) | SQL: [supabase-setup.sql](supabase-setup.sql).

### Blog
- Posts live in `blog/posts/` as Nunjucks/Markdown with `blog` collection tag.
- Layout: `blog/_includes/`. Index: `blog/index.njk`.

## Testing
- `npx playwright test` runs `tests/site-audit.spec.js`.
- Config: [playwright.config.js](playwright.config.js) (headless, 1280×720, 2 workers, 60s timeout).
- Results saved to `tests/results.json`.

## Project Docs
- [website-architecture.md](website-architecture.md) — page-by-page structure
- [supabase-architecture.md](supabase-architecture.md) — DB schema & storage buckets
- [site-map.md](site-map.md) — full site map
- [project-backlog.md](project-backlog.md) — outstanding tasks
- [workflow-process.md](workflow-process.md) — development workflow

## Pitfalls
- Do **not** use the Supabase service-role key on the frontend — only the anon/publishable key.
- Google Maps key is injected at **build time** — changes to HTML templates in `_site/` are overwritten on every build.
- The `_site/` directory is build output — edit source files, not `_site/` directly.
- Backend in-memory stores (`verified_payments`, `scan_results`) are reset on process restart; use persistent storage for production.
