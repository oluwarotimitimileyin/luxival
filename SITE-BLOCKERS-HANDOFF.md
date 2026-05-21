z# Luxival Site Blockers Handoff

Use this file as the working brief for fixing the site. It is written so another chat can pick up the repository and know what to do without re-discovering the same context.

## Current Verified State

- The main Luxival site builds successfully with `npm run build`.
- Portfolio integration for the four product apps is complete and Playwright passes locally.
- The current verified portfolio apps are:
  - `businesslauncher`
  - `growth-architect`
  - `ugc-studio-ai`
  - `vortex-ai-platform`
- The portfolio showcase page now links to those apps and the new landing pages are in place.

## What To Fix First

Treat the items below as the real launch blockers. Do not start with polish work while these are still open.

### 1. Supabase and form plumbing

Fix these together because the forms depend on each other.

- Replace the placeholder Supabase public key in `js/config.js` with the real publishable key.
- Add or verify the required `.env.local` values for local development only.
- Create the required tables and storage buckets in Supabase.
- Apply RLS policies so public forms can insert but private data is not exposed.
- Test the contact, newsletter, ride request, audit, and chat-related flows end to end after the database work is complete.

Expected result:
- Contact and booking forms submit successfully.
- Upload paths work.
- No sensitive data is exposed to anon users.

### 2. Missing launch pages and legal pages

- Make sure `privacy.html` exists and contains real policy content.
- Make sure `terms.html` exists and contains real terms content.
- Verify all CTA links on the site point to the correct working pages.

Expected result:
- No legal-page 404s.
- No CTA dead ends.

### 3. Root SEO and crawlability basics

- Ensure `robots.txt` is present at the site root and is included in build output.
- Verify `sitemap.xml` is current and includes the live canonical pages.
- Check every page for a unique title and meta description.
- Check Open Graph and Twitter metadata on the main pages.

Expected result:
- Search engines can crawl the site.
- Canonical pages are discoverable and non-duplicate.

### 4. Visual assets and brand assets

- Replace placeholder imagery with real photography.
- Add a real logo SVG.
- Add a favicon.
- Audit alt text after the real assets are in place.

Expected result:
- The site looks premium rather than placeholder-driven.
- No broken image references remain.

### 5. Deployment and environment setup

- Push the repository to GitHub if it is not already remote.
- Configure Vercel deployment.
- Add the production environment variables in Vercel.
- Confirm the production domain and HTTPS are working.

Expected result:
- Production deploy succeeds.
- The live domain serves the site over HTTPS.

### 6. Admin security

- Add authentication to `admin.html`.
- Do not leave the admin view publicly accessible without auth.

Expected result:
- Admin access is restricted.
- Lead and admin data is not exposed to casual visitors.

## High Priority Follow-Up Work

After the launch blockers are handled, move to these items.

### Content

- Replace placeholder founder copy on `about.html`.
- Add at least two real portfolio case studies.
- Improve homepage hero copy.
- Add testimonials or other trust signals.
- Polish service-page copy.

### Design

- Review mobile responsiveness across the site.
- Fix any broken icon references.
- Improve loading states in the admin views.
- Tighten spacing, imagery, and hierarchy where needed.

### QA

- Test navigation across desktop and mobile.
- Test all forms on real production endpoints.
- Run cross-browser checks.
- Check for console errors on all major pages.
- Verify keyboard navigation and contrast.

## Portfolio Notes

The portfolio app integration is already implemented and should be preserved unless a future change breaks it.

Relevant working files:

- `portfolio.html`
- `businesslauncher.html`
- `growth-architect.html`
- `growth-architect-backend.html`
- `ugc-studio-ai.html`
- `vortex-ai-platform.html`
- `.eleventy.js`
- `tests/portfolio-apps.spec.js`

Do not delete or rewrite this work unless there is a specific regression to fix.

## Known Backlog Items Worth Preserving

These items already exist in the backlog and should remain prioritized in the same general order.

- `DEV-01` through `DEV-05` are launch blockers around Supabase, env vars, and data safety.
- `DEV-06` through `DEV-13` are launch-critical for crawlability, deployment, and admin security.
- `CON-01` through `CON-08` are important for credibility but should follow the blockers above.
- `QA-01` through `QA-14` should be completed before launch sign-off.
- `LCH-01` through `LCH-10` are the actual go-live checklist.

## Recommended Execution Order For Another Chat

1. Verify the repo state and confirm the current build passes.
2. Fix Supabase config, tables, buckets, and RLS.
3. Populate legal pages and SEO essentials.
4. Add or replace real assets and brand elements.
5. Secure the admin page.
6. Re-run form and navigation tests.
7. Validate production deployment and domain setup.
8. Only after launch blockers are done, improve copy, visuals, and lower-priority UX work.

## Validation Commands

Use these commands after each major fix cycle.

```bash
npm run build
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 npx playwright test tests/portfolio-apps.spec.js
```

For form and backend work, run the relevant app-specific or API checks as soon as the environment variables and database are ready.

## Important Constraint

Do not spend time polishing unrelated sections while the launch blockers remain open. The site should be treated as a launch-prep project first, not a design-only pass.