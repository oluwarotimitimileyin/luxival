-- Supabase table definitions for Luxival website forms and uploads
-- Run this in Supabase SQL editor or via the Supabase CLI.

-- 1) Contact inquiries / chat leads
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  service_interest text,
  message text NOT NULL,
  source text,
  status text DEFAULT 'new',
  metadata jsonb
);

-- 2) Ride request submissions
CREATE TABLE IF NOT EXISTS ride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text,
  pickup_location text NOT NULL,
  destination text NOT NULL,
  ride_time time,
  service_type text NOT NULL,
  estimated_distance_km numeric,
  estimated_price numeric,
  preferred_date date,
  airline text,
  flight_number text,
  notes text,
  airport_surcharge boolean DEFAULT false,
  busy_hour boolean DEFAULT false,
  status text DEFAULT 'pending',
  source text
);

-- 3) Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL UNIQUE,
  name text,
  source text,
  consent boolean DEFAULT true,
  status text DEFAULT 'subscribed'
);

-- 4) Uploaded asset metadata (optional/for future upload flow)
CREATE TABLE IF NOT EXISTS uploaded_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  bucket text NOT NULL,
  path text NOT NULL,
  url text,
  uploaded_by text,
  metadata jsonb
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON ride_requests (status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers (status);

-- ─────────────────────────────────────────────
-- RLS Policies
-- Public visitors need INSERT only (to submit forms).
-- SELECT is blocked for anon — admin reads data via the service-role key
-- which bypasses RLS entirely, so no SELECT policy is needed here.
-- ─────────────────────────────────────────────

-- contact_inquiries
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can submit contact inquiries"
  ON contact_inquiries FOR INSERT
  WITH CHECK (true);

-- ride_requests
ALTER TABLE ride_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can submit ride requests"
  ON ride_requests FOR INSERT
  WITH CHECK (true);

-- newsletter_subscribers
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- uploaded_assets: no public access — service role only
ALTER TABLE uploaded_assets ENABLE ROW LEVEL SECURITY;
-- (no policies = zero access for anon; service role bypasses RLS)
