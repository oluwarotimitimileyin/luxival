# Supabase Integration Architecture for Luxival

## 1. Recommended Bucket Structure

### Public media
- `project-images`
  - Purpose: store portfolio and public project visuals
  - Access: public
  - Use case: website image galleries, portfolio preview cards, service hero images

### Private media
- `customer-documents`
  - Purpose: customer-uploaded documents, proposals, reference files
  - Access: private
  - Use case: sensitive documents uploaded with inquiries or ride requests

- `ride-uploads`
  - Purpose: ride-specific uploads such as itinerary PDFs, passenger lists, travel documents
  - Access: private
  - Use case: secure attachments for booking confirmation and logistics

## 2. Database Schema

### contact_inquiries
- `id` UUID primary key
- `created_at` timestamp with timezone default now
- `name` text
- `email` text
- `phone` text
- `company` text
- `message` text
- `service_interest` text (e.g. Website Design, SEO, Taxi Booking)
- `source` text (e.g. website, tourism page, newsletter)
- `status` text default `new`
- `assigned_to` text nullable
- `crm_contact_id` uuid nullable
- `metadata` jsonb nullable

### ride_requests
- `id` UUID primary key
- `created_at` timestamp with timezone default now
- `customer_name` text
- `email` text
- `phone` text
- `pickup_location` text
- `destination` text
- `service_type` text
- `distance_km` numeric
- `preferred_date` timestamp with timezone nullable
- `notes` text
- `airport_surcharge` boolean default false
- `busy_hour` boolean default false
- `status` text default `pending`
- `assigned_driver` text nullable
- `asset_id` uuid nullable
- `metadata` jsonb nullable

### newsletter_subscribers
- `id` UUID primary key
- `created_at` timestamp with timezone default now
- `email` text unique
- `name` text nullable
- `source` text default `website`
- `consent` boolean default true
- `status` text default `subscribed`
- `last_engaged_at` timestamp with timezone nullable
- `preferences` jsonb nullable

### crm_contacts
- `id` UUID primary key
- `created_at` timestamp with timezone default now
- `name` text
- `email` text
- `phone` text nullable
- `company` text nullable
- `source` text nullable
- `lead_status` text default `new`
- `last_contacted_at` timestamp with timezone nullable
- `owner` text nullable
- `tags` text[] nullable
- `notes` text nullable
- `metadata` jsonb nullable

### uploaded_assets
- `id` UUID primary key
- `created_at` timestamp with timezone default now
- `bucket` text
- `path` text
- `file_name` text
- `mime_type` text
- `size` bigint
- `public` boolean default false
- `related_table` text nullable
- `related_id` uuid nullable
- `uploader_email` text nullable
- `metadata` jsonb nullable

## 3. Environment Variables

### Public front-end variables
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_ANON_KEY` — public anonymous key for safe browser access
- `SUPABASE_PROJECT_IMAGES_BUCKET` — `project-images`
- `SUPABASE_CUSTOMER_DOCUMENTS_BUCKET` — `customer-documents`
- `SUPABASE_RIDE_UPLOADS_BUCKET` — `ride-uploads`

### Server-side variables (private)
- `SUPABASE_SERVICE_ROLE_KEY` — service role key for admin and upload token generation
- `SUPABASE_ADMIN_EMAIL` — admin contact for notifications (optional)

> Never place `SUPABASE_SERVICE_ROLE_KEY` in front-end code.

## 4. Form Flow

### Contact form
1. User fills name, email, phone, message, service interest.
2. Front-end sends data to Supabase via `contact_inquiries` insert.
3. Optionally create or update `crm_contacts` with contact details.
4. Show a confirmation message.
5. Optionally trigger an admin notification through a serverless function.

### Service inquiry form
- Same flow as contact form, but with `service_interest` and `source` set to page-specific values.

### Taxi / ride request form
1. User fills ride details: pickup, destination, service type, distance estimate, date, contact info.
2. Optional file upload can be attached as a signed private upload.
3. Insert row into `ride_requests`.
4. Save an asset record in `uploaded_assets` if a file is uploaded.
5. Display booking confirmation message.

### Newsletter signup form
1. User enters email and optional name.
2. Insert into `newsletter_subscribers`.
3. Use `status` and `consent` for future marketing workflows.
4. Optionally send a follow-up notification or automation trigger.

## 5. Safest Vercel + Supabase Architecture

### Recommended approach
- Use Supabase in the browser only for public, front-end-friendly actions.
- Create Vercel serverless functions for sensitive tasks:
  - generating signed upload URLs
  - inserting private asset metadata
  - reading admin-only tables
  - sending notifications
- Store `SUPABASE_ANON_KEY` in Vercel as an environment variable for front-end use.
- Store `SUPABASE_SERVICE_ROLE_KEY` in Vercel secrets and only use it in serverless functions.

### Admin / security
- Use Supabase Auth for admin users in a separate admin app or a protected page.
- Use RLS policies on tables to allow:
  - anonymous inserts into `contact_inquiries`, `ride_requests`, `newsletter_subscribers`
  - authenticated insert into `uploaded_assets` for uploads
  - no anonymous select on private tables
- Use server-side functions for private bucket operations and sensitive data access.

## 6. Developer Output / Recommended Structure

### Supabase project structure
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
- Policies:
  - anonymous insert on public-facing inquiry tables
  - authenticated access for upload metadata
  - admin-only select/update via service or auth

### Vercel deployment notes
- Add environment variables in Vercel:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - bucket names as needed
- Build should include a small JS client file that reads the public values.
- Protect server-side endpoints with Vercel function routes.

## 7. Next steps
- Create Supabase tables and storage buckets in the Supabase dashboard.
- Add RLS policies for anonymous inserts and private storage access.
- Build the front-end form integration and upload flow.
- Create a small admin dashboard or use Supabase Studio for lead management.
- Keep `SUPABASE_SERVICE_ROLE_KEY` private and limited to server use.
