# Luxival Repeatable Development Workflow

This document defines a repeatable workflow for Luxival website development, Supabase integration, and safe Stripe preparation.

## 1. Project audit and setup

1. Clone the repo and open the workspace.
2. Confirm current project structure:
   - `index.html`
   - `about.html`
   - `services.html`
   - `tourism.html`
   - `portfolio.html`
   - `qa.html`
   - `contact.html`
   - `css/`
   - `js/`
   - `sitemap.xml`, `robots.txt`, `launch-checklist.md`
3. Confirm there is no runtime framework requiring build support.
   - This is currently a static HTML/CSS/JS site.
4. Create a `.env.local` file with placeholders for credentials.
5. Add `.env.local` to `.gitignore`.

## 2. Environment configuration

1. Create `.env.local` with the following placeholders:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. Never commit `.env.local` or secret values to Git.
3. Store public-only values in front-end config, secret values in server-side config.

## 3. Supabase integration workflow

1. Create Supabase tables and storage buckets in the dashboard:
   - Buckets:
     - `project-images` (public)
     - `customer-documents` (private)
     - `ride-uploads` (private)
   - Tables:
     - `contact_inquiries`
     - `ride_requests`
     - `newsletter_subscribers`
     - `crm_contacts`
     - `uploaded_assets`
2. Create RLS policies:
   - Allow anonymous inserts to inquiry and subscription tables.
   - Deny anonymous selects for private tables.
   - Authorize private bucket uploads via server-side signed URLs.
3. Add Supabase client code to `js/supabase-client.js`.
4. Wire forms to submit to Supabase safely using public keys only for inserts.
5. Build serverless endpoints for any private actions that require secure keys.

## 4. Cybersecurity review workflow

1. Add a cyber security review step before deployment.
2. Confirm `.env.local` is ignored and not committed to Git.
3. Verify only `NEXT_PUBLIC_...` variables are used in browser code.
4. Ensure `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` remain server-only.
5. Validate private storage buckets and form submission flows for sensitive file handling.

## 5. Stripe preparation workflow

1. Do not store Stripe secrets in frontend code.
2. Use Vercel serverless functions or a small backend layer for payment flows.
3. Create placeholder routes and notes for:
   - `/api/create-checkout-session`
   - `/api/stripe-webhook`
4. Keep client-side code limited to calling secure endpoints.
5. Keep webhooks and payment flow logic server-side only.

## 6. Deployment workflow

1. Commit changes and push to GitHub.
2. Deploy to Vercel or Netlify.
3. Add environment variables in the deployment provider:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Validate live site, HTTPS, and search engine readiness.

## 6. Repeatable checklist

- [ ] Audit current file structure
- [ ] Confirm static-only project
- [ ] Create `.env.local` placeholders
- [ ] Create `.gitignore` entry for `.env.local`
- [ ] Build Supabase integration files
- [ ] Wire forms to Supabase
- [ ] Plan serverless Stripe endpoints
- [ ] Deploy and verify environment variables
- [ ] Test live form submissions and payment hooks
- [ ] Review `launch-checklist.md`

## 7. Notes

- This workflow is designed for a static project that will gradually gain a safe backend layer.
- If the site grows beyond static pages, move to a true framework or lightweight backend for better scalability.
- Keep the architecture simple and incremental: static site + secure serverless endpoints.
