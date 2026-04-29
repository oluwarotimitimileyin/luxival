-- Luxival Supabase Setup
-- Run this once against your Supabase project via the SQL editor.
-- URL: https://app.supabase.com → SQL Editor

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists contact_inquiries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  name         text,
  email        text not null,
  phone        text,
  company      text,
  service_interest text,
  message      text,
  source       text default 'website',
  status       text default 'new',
  metadata     jsonb
);

create table if not exists ride_requests (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz default now(),
  customer_name        text,
  email                text not null,
  phone                text,
  pickup_location      text,
  destination          text,
  preferred_date       date,
  ride_time            text,
  service_type         text,
  estimated_distance_km numeric(8,2),
  estimated_price      numeric(8,2),
  flight_number        text,
  airline              text,
  notes                text,
  airport_surcharge    boolean default false,
  busy_hour            boolean default false,
  status               text default 'pending',
  source               text default 'tourism-page'
);

create table if not exists newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email      text not null unique,
  name       text,
  source     text default 'website',
  consent    boolean default true,
  status     text default 'subscribed'
);

create table if not exists tiktok_agency_applications (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz default now(),
  creator_name     text not null,
  tiktok_handle    text not null,
  email            text not null,
  phone            text not null,
  niche            text,
  follower_range   text,
  message          text,
  source           text default 'platform page',
  status           text default 'new',
  notify_emails    text[] not null default array['support@luxival.com', 'olakunleshopeju@luxival.com'],
  metadata         jsonb
);

alter table contact_inquiries
  add column if not exists company text,
  add column if not exists metadata jsonb;

alter table ride_requests
  add column if not exists customer_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists pickup_location text,
  add column if not exists destination text,
  add column if not exists preferred_date date,
  add column if not exists ride_time text,
  add column if not exists service_type text,
  add column if not exists estimated_distance_km numeric(8,2),
  add column if not exists estimated_price numeric(8,2),
  add column if not exists flight_number text,
  add column if not exists airline text,
  add column if not exists notes text,
  add column if not exists airport_surcharge boolean default false,
  add column if not exists busy_hour boolean default false,
  add column if not exists status text default 'pending',
  add column if not exists source text default 'tourism-page';

alter table tiktok_agency_applications
  add column if not exists creator_name text,
  add column if not exists tiktok_handle text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists niche text,
  add column if not exists follower_range text,
  add column if not exists message text,
  add column if not exists source text default 'platform page',
  add column if not exists status text default 'new',
  add column if not exists notify_emails text[] not null default array['support@luxival.com', 'olakunleshopeju@luxival.com'],
  add column if not exists metadata jsonb;

create table if not exists uploaded_assets (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  bucket       text not null,
  path         text not null,
  file_name    text,
  content_type text,
  size_bytes   bigint,
  uploaded_by  text,
  public_url   text
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table contact_inquiries     enable row level security;
alter table ride_requests         enable row level security;
alter table newsletter_subscribers enable row level security;
alter table tiktok_agency_applications enable row level security;
alter table uploaded_assets        enable row level security;

-- Public INSERT (anonymous website visitors can submit)
drop policy if exists "allow anon insert contact_inquiries" on contact_inquiries;
drop policy if exists "public_insert_inquiries" on contact_inquiries;
create policy "public_insert_inquiries" on contact_inquiries
  for insert to anon with check (true);

drop policy if exists "allow anon insert ride_requests" on ride_requests;
drop policy if exists "public_insert_rides" on ride_requests;
create policy "public_insert_rides" on ride_requests
  for insert to anon with check (true);

drop policy if exists "allow anon insert newsletter_subscribers" on newsletter_subscribers;
drop policy if exists "public_insert_newsletter" on newsletter_subscribers;
create policy "public_insert_newsletter" on newsletter_subscribers
  for insert to anon with check (true);

drop policy if exists "allow_public_tiktok_agency_insert" on tiktok_agency_applications;
drop policy if exists "public_insert_tiktok_agency" on tiktok_agency_applications;
create policy "public_insert_tiktok_agency" on tiktok_agency_applications
  for insert to anon with check (true);

-- Authenticated SELECT only (admin reads via dashboard or service role)
drop policy if exists "auth_select_inquiries" on contact_inquiries;
create policy "auth_select_inquiries" on contact_inquiries
  for select to authenticated using (true);

drop policy if exists "auth_select_rides" on ride_requests;
create policy "auth_select_rides" on ride_requests
  for select to authenticated using (true);

drop policy if exists "auth_select_newsletter" on newsletter_subscribers;
create policy "auth_select_newsletter" on newsletter_subscribers
  for select to authenticated using (true);

drop policy if exists "auth_select_tiktok_agency" on tiktok_agency_applications;
create policy "auth_select_tiktok_agency" on tiktok_agency_applications
  for select to authenticated using (true);

drop policy if exists "auth_select_assets" on uploaded_assets;
create policy "auth_select_assets" on uploaded_assets
  for select to authenticated using (true);

drop policy if exists "auth_insert_assets" on uploaded_assets;
create policy "auth_insert_assets" on uploaded_assets
  for insert to authenticated with check (true);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these via the Supabase Dashboard → Storage → New bucket,
-- OR use the management API. The SQL below uses the storage schema.

insert into storage.buckets (id, name, public)
values
  ('project-images',      'project-images',      true),
  ('customer-documents',  'customer-documents',   false),
  ('ride-uploads',        'ride-uploads',         false)
on conflict (id) do nothing;

-- Public read for project-images
drop policy if exists "public_read_project_images" on storage.objects;
create policy "public_read_project_images" on storage.objects
  for select to anon
  using (bucket_id = 'project-images');

-- Authenticated upload to project-images
drop policy if exists "auth_upload_project_images" on storage.objects;
create policy "auth_upload_project_images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'project-images');

-- Authenticated upload to customer-documents (private)
drop policy if exists "auth_upload_customer_docs" on storage.objects;
create policy "auth_upload_customer_docs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'customer-documents');

-- Authenticated read for customer-documents (signed URLs only)
drop policy if exists "auth_read_customer_docs" on storage.objects;
create policy "auth_read_customer_docs" on storage.objects
  for select to authenticated
  using (bucket_id = 'customer-documents');

-- Authenticated upload/read for ride-uploads
drop policy if exists "auth_upload_ride_uploads" on storage.objects;
create policy "auth_upload_ride_uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ride-uploads');

drop policy if exists "auth_read_ride_uploads" on storage.objects;
create policy "auth_read_ride_uploads" on storage.objects
  for select to authenticated
  using (bucket_id = 'ride-uploads');

-- ============================================================
-- INDEXES (performance)
-- ============================================================
create index if not exists idx_inquiries_email  on contact_inquiries (email);
create index if not exists idx_inquiries_status on contact_inquiries (status);
create index if not exists idx_rides_email      on ride_requests (email);
create index if not exists idx_rides_status     on ride_requests (status);
create index if not exists idx_nl_email         on newsletter_subscribers (email);
create index if not exists idx_tiktok_agency_email on tiktok_agency_applications (email);
create index if not exists idx_tiktok_agency_status on tiktok_agency_applications (status);
