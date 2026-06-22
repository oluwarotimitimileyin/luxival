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

create table if not exists blog_posts (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  title          text not null,
  slug           text not null unique,
  excerpt        text,
  content        text,
  category       text default 'blog',
  tags           text[] default '{}',
  featured_image text,
  published      boolean default false,
  published_at   timestamptz,
  author         text
);

create table if not exists site_reviews (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  reviewer_name text not null,
  review_text   text not null,
  source        text,
  service_area  text,
  avatar_url    text,
  rating        integer not null default 5,
  published     boolean default false,
  published_at  timestamptz
);

create table if not exists site_content (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  page_key     text not null,
  content_key  text not null,
  label        text,
  content_value text not null,
  updated_by   text,
  unique (page_key, content_key)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

create or replace function public.luxival_is_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'rotimikun@gmail.com',
    'olakunleshopeju@luxival.com',
    'support@luxival.com'
  );
$$;

alter table contact_inquiries     enable row level security;
alter table ride_requests         enable row level security;
alter table newsletter_subscribers enable row level security;
alter table tiktok_agency_applications enable row level security;
alter table uploaded_assets        enable row level security;
alter table blog_posts             enable row level security;
alter table site_reviews           enable row level security;
alter table site_content           enable row level security;

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
  for select to authenticated using (public.luxival_is_admin());

drop policy if exists "auth_select_rides" on ride_requests;
create policy "auth_select_rides" on ride_requests
  for select to authenticated using (public.luxival_is_admin());

drop policy if exists "auth_select_newsletter" on newsletter_subscribers;
create policy "auth_select_newsletter" on newsletter_subscribers
  for select to authenticated using (public.luxival_is_admin());

drop policy if exists "auth_select_tiktok_agency" on tiktok_agency_applications;
create policy "auth_select_tiktok_agency" on tiktok_agency_applications
  for select to authenticated using (public.luxival_is_admin());

drop policy if exists "auth_select_assets" on uploaded_assets;
create policy "auth_select_assets" on uploaded_assets
  for select to authenticated using (public.luxival_is_admin());

drop policy if exists "auth_insert_assets" on uploaded_assets;
create policy "auth_insert_assets" on uploaded_assets
  for insert to authenticated with check (public.luxival_is_admin());

drop policy if exists "auth_select_blog_posts" on blog_posts;
create policy "auth_select_blog_posts" on blog_posts
  for select to authenticated using (public.luxival_is_admin());

drop policy if exists "auth_insert_blog_posts" on blog_posts;
create policy "auth_insert_blog_posts" on blog_posts
  for insert to authenticated with check (public.luxival_is_admin());

drop policy if exists "auth_update_blog_posts" on blog_posts;
create policy "auth_update_blog_posts" on blog_posts
  for update to authenticated using (public.luxival_is_admin()) with check (public.luxival_is_admin());

drop policy if exists "auth_delete_blog_posts" on blog_posts;
create policy "auth_delete_blog_posts" on blog_posts
  for delete to authenticated using (public.luxival_is_admin());

drop policy if exists "public_select_blog_posts" on blog_posts;
create policy "public_select_blog_posts" on blog_posts
  for select to anon using (published = true);

drop policy if exists "auth_select_site_reviews" on site_reviews;
create policy "auth_select_site_reviews" on site_reviews
  for select to authenticated using (public.luxival_is_admin());

drop policy if exists "auth_insert_site_reviews" on site_reviews;
create policy "auth_insert_site_reviews" on site_reviews
  for insert to authenticated with check (public.luxival_is_admin());

drop policy if exists "auth_update_site_reviews" on site_reviews;
create policy "auth_update_site_reviews" on site_reviews
  for update to authenticated using (public.luxival_is_admin()) with check (public.luxival_is_admin());

drop policy if exists "auth_delete_site_reviews" on site_reviews;
create policy "auth_delete_site_reviews" on site_reviews
  for delete to authenticated using (public.luxival_is_admin());

drop policy if exists "public_select_site_reviews" on site_reviews;
create policy "public_select_site_reviews" on site_reviews
  for select to anon using (published = true);

drop policy if exists "auth_select_site_content" on site_content;
create policy "auth_select_site_content" on site_content
  for select to authenticated using (public.luxival_is_admin());

drop policy if exists "auth_insert_site_content" on site_content;
create policy "auth_insert_site_content" on site_content
  for insert to authenticated with check (public.luxival_is_admin());

drop policy if exists "auth_update_site_content" on site_content;
create policy "auth_update_site_content" on site_content
  for update to authenticated using (public.luxival_is_admin()) with check (public.luxival_is_admin());

drop policy if exists "auth_delete_site_content" on site_content;
create policy "auth_delete_site_content" on site_content
  for delete to authenticated using (public.luxival_is_admin());

drop policy if exists "public_select_site_content" on site_content;
create policy "public_select_site_content" on site_content
  for select to anon using (true);

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
  with check (bucket_id = 'project-images' and public.luxival_is_admin());

-- Authenticated upload to customer-documents (private)
drop policy if exists "auth_upload_customer_docs" on storage.objects;
create policy "auth_upload_customer_docs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'customer-documents' and public.luxival_is_admin());

-- Authenticated read for customer-documents (signed URLs only)
drop policy if exists "auth_read_customer_docs" on storage.objects;
create policy "auth_read_customer_docs" on storage.objects
  for select to authenticated
  using (bucket_id = 'customer-documents' and public.luxival_is_admin());

-- Authenticated upload/read for ride-uploads
drop policy if exists "auth_upload_ride_uploads" on storage.objects;
create policy "auth_upload_ride_uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ride-uploads' and public.luxival_is_admin());

drop policy if exists "auth_read_ride_uploads" on storage.objects;
create policy "auth_read_ride_uploads" on storage.objects
  for select to authenticated
  using (bucket_id = 'ride-uploads' and public.luxival_is_admin());

-- ============================================================
-- CHAT PERSISTENCE
-- ============================================================

create table if not exists chat_sessions (
  id            uuid primary key default gen_random_uuid(),
  page_origin   text,
  user_agent    text,
  message_count integer default 0,
  lead_captured boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists chat_messages (
  id           bigint generated always as identity primary key,
  session_id   uuid not null references chat_sessions(id) on delete cascade,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null,
  metadata     jsonb,
  created_at   timestamptz default now()
);

create index if not exists idx_chat_messages_session_time
  on chat_messages (session_id, created_at);

alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;

drop policy if exists "anon_insert_chat_sessions" on chat_sessions;
create policy "anon_insert_chat_sessions" on chat_sessions
  for insert to anon with check (true);

drop policy if exists "anon_select_chat_sessions" on chat_sessions;
drop policy if exists "public_select_chat_sessions" on chat_sessions;

drop policy if exists "anon_insert_chat_messages" on chat_messages;
create policy "anon_insert_chat_messages" on chat_messages
  for insert to anon with check (true);

drop policy if exists "anon_select_chat_messages" on chat_messages;
drop policy if exists "public_select_chat_messages" on chat_messages;

-- Admin (authenticated) access
drop policy if exists "auth_select_chat_sessions" on chat_sessions;
create policy "auth_select_chat_sessions" on chat_sessions
  for select to authenticated using (public.luxival_is_admin());

drop policy if exists "auth_select_chat_messages" on chat_messages;
create policy "auth_select_chat_messages" on chat_messages
  for select to authenticated using (public.luxival_is_admin());

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
create index if not exists idx_blog_posts_slug on blog_posts (slug);
create index if not exists idx_blog_posts_published on blog_posts (published);
create index if not exists idx_site_reviews_published on site_reviews (published);
create index if not exists idx_site_content_page_key on site_content (page_key);
