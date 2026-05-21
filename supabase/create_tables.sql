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

-- 4) TikTok agency applications
CREATE TABLE IF NOT EXISTS tiktok_agency_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  creator_name text NOT NULL,
  tiktok_handle text,
  email text NOT NULL,
  phone text,
  niche text,
  follower_range text,
  message text,
  source text,
  status text DEFAULT 'new',
  notify_emails text[],
  metadata jsonb,
  full_name text,
  tiktok_username text,
  phone_number text,
  creator_email text,
  user_email text
);

-- 5) Site reviews / testimonials
CREATE TABLE IF NOT EXISTS site_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewer_name text NOT NULL,
  review_text text NOT NULL,
  source text,
  service_area text,
  avatar_url text,
  rating integer DEFAULT 5,
  published boolean DEFAULT false,
  published_at timestamptz
);

-- 6) Site content (CMS key-value pairs)
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  page_key text NOT NULL,
  content_key text NOT NULL,
  label text,
  content_value text,
  updated_by text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (page_key, content_key)
);

-- 7) Uploaded asset metadata
CREATE TABLE IF NOT EXISTS uploaded_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  bucket text NOT NULL,
  path text NOT NULL,
  file_name text,
  content_type text,
  size_bytes bigint,
  uploaded_by text,
  public_url text,
  url text,
  metadata jsonb
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON ride_requests (status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers (status);
CREATE INDEX IF NOT EXISTS idx_tiktok_applications_status ON tiktok_agency_applications (status);
CREATE INDEX IF NOT EXISTS idx_site_reviews_published ON site_reviews (published);
CREATE INDEX IF NOT EXISTS idx_site_content_page_key ON site_content (page_key);

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

-- tiktok_agency_applications
ALTER TABLE tiktok_agency_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can submit tiktok applications"
  ON tiktok_agency_applications FOR INSERT
  WITH CHECK (true);

-- site_reviews: public can read published reviews
ALTER TABLE site_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published reviews"
  ON site_reviews FOR SELECT
  USING (published = true);

-- site_content: public can read
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site content"
  ON site_content FOR SELECT
  USING (true);

-- uploaded_assets: no public access — service role only
ALTER TABLE uploaded_assets ENABLE ROW LEVEL SECURITY;
-- (no policies = zero access for anon; service role bypasses RLS)

-- ─────────────────────────────────────────────
-- Storage Buckets
-- Run these in Supabase SQL editor or create via Dashboard > Storage
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-documents', 'customer-documents', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('ride-uploads', 'ride-uploads', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Auth users upload project images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users upload customer documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'customer-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users upload ride files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ride-uploads' AND auth.role() = 'authenticated');
