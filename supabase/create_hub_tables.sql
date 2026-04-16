-- Luxival Hub Tables
-- Run this in the Supabase SQL editor after create_tables.sql

-- ─────────────────────────────────────────────
-- Blog posts (manual + auto-generated via AI)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ DEFAULT now(),
  published_at   TIMESTAMPTZ,
  title          TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  excerpt        TEXT,
  content        TEXT,
  category       TEXT, -- 'helsinki' | 'services' | 'testing' | 'ai-agents' | 'events' | 'travel'
  tags           TEXT[],
  source         TEXT DEFAULT 'manual', -- 'manual' | 'auto-google' | 'auto-ai'
  featured_image TEXT,
  published      BOOLEAN DEFAULT false,
  view_count     INTEGER DEFAULT 0,
  author         TEXT DEFAULT 'Luxival'
);

-- ─────────────────────────────────────────────
-- Events (Luxival events + Helsinki city events)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ DEFAULT now(),
  title          TEXT NOT NULL,
  description    TEXT,
  event_date     TIMESTAMPTZ,
  end_date       TIMESTAMPTZ,
  location       TEXT,
  address        TEXT,
  category       TEXT, -- 'luxival' | 'helsinki' | 'citywide' | 'seasonal'
  source         TEXT DEFAULT 'manual',
  external_url   TEXT,
  featured_image TEXT,
  published      BOOLEAN DEFAULT false
);

-- ─────────────────────────────────────────────
-- Product listings (bookable services / digital products)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_listings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     TIMESTAMPTZ DEFAULT now(),
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT, -- 'mechanical' | 'electrical' | 'software' | 'web' | 'ai-agents' | 'transport'
  price          NUMERIC,
  currency       TEXT DEFAULT 'EUR',
  price_label    TEXT, -- e.g. 'from €499' | 'Quote on request'
  featured_image TEXT,
  booking_url    TEXT,
  detail_page    TEXT, -- relative URL to the service sub-page
  status         TEXT DEFAULT 'active', -- 'active' | 'coming-soon' | 'archived'
  featured       BOOLEAN DEFAULT false
);

-- ─────────────────────────────────────────────
-- Service suggestions (AI-powered recommendations)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_suggestions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ DEFAULT now(),
  title            TEXT NOT NULL,
  description      TEXT,
  service_category TEXT,
  target_audience  TEXT,
  cta_label        TEXT DEFAULT 'Learn more',
  cta_url          TEXT,
  published        BOOLEAN DEFAULT true
);

-- ─────────────────────────────────────────────
-- Helsinki hotspots (auto-fetched from Google Places)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS helsinki_hotspots (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fetched_at     TIMESTAMPTZ DEFAULT now(),
  place_name     TEXT NOT NULL,
  place_id       TEXT UNIQUE, -- Google Place ID
  category       TEXT, -- 'restaurant' | 'museum' | 'park' | 'event' | 'attraction'
  address        TEXT,
  rating         NUMERIC,
  review_count   INTEGER,
  photo_url      TEXT,
  maps_url       TEXT,
  blog_post_id   UUID REFERENCES blog_posts(id)
);

-- ─────────────────────────────────────────────
-- RLS Policies
-- ─────────────────────────────────────────────

-- Blog posts: public can read published posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published blog posts"
  ON blog_posts FOR SELECT
  USING (published = true);

-- Events: public can read published events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published events"
  ON events FOR SELECT
  USING (published = true);

-- Products: public can read active listings
ALTER TABLE product_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active products"
  ON product_listings FOR SELECT
  USING (status = 'active');

-- Service suggestions: public can read
ALTER TABLE service_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read service suggestions"
  ON service_suggestions FOR SELECT
  USING (published = true);

-- Hotspots: public can read
ALTER TABLE helsinki_hotspots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hotspots"
  ON helsinki_hotspots FOR SELECT
  USING (true);

-- ─────────────────────────────────────────────
-- Seed: initial product listings
-- ─────────────────────────────────────────────
INSERT INTO product_listings (name, description, category, price_label, detail_page, status, featured) VALUES
  ('Mechanical Engineering Design', 'CAD design, prototyping concepts, and technical documentation for mechanical systems.', 'mechanical', 'Quote on request', 'services/mechanical-design.html', 'active', true),
  ('Electrical Systems Design', 'Circuit design, PCB layout planning, and embedded system architecture.', 'electrical', 'Quote on request', 'services/electrical-design.html', 'active', true),
  ('Software Testing & QA', 'Full test automation, Playwright/Selenium frameworks, CI/CD pipeline QA integration.', 'software', 'from €499', 'services/software-testing.html', 'active', true),
  ('Web Design & Development', 'Premium responsive websites, landing pages, and conversion-focused digital experiences.', 'web', 'from €1,200', 'services/web-design.html', 'active', true),
  ('AI Agents Infrastructure', 'Custom autonomous AI agent systems, Claude API integrations, and agent orchestration.', 'ai-agents', 'from €800', 'services/ai-agents.html', 'active', true),
  ('Helsinki Airport Transfer', 'Premium private car transfer to and from Helsinki-Vantaa Airport.', 'transport', 'from €45', 'tourism.html', 'active', true);

-- ─────────────────────────────────────────────
-- Seed: initial service suggestions
-- ─────────────────────────────────────────────
INSERT INTO service_suggestions (title, description, service_category, target_audience, cta_label, cta_url) VALUES
  ('Does your website need a QA audit?', 'If your site has had bugs in production or failed during a product launch, a structured QA audit can prevent future incidents.', 'software', 'Startups and product teams', 'Book a free audit call', 'contact.html'),
  ('Need an AI agent to automate your workflow?', 'If you are spending hours on repetitive tasks, a custom Claude-powered agent can handle them autonomously.', 'ai-agents', 'Business owners and developers', 'Explore AI agents', 'services/ai-agents.html'),
  ('Planning a Helsinki visit?', 'Let Luxival handle your airport transfer so you arrive relaxed and on time — with live flight tracking included.', 'transport', 'International travellers', 'Book your ride', 'tourism.html');
