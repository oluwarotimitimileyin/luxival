// Supabase client helper for Luxival
// This uses the public Supabase config from js/config.js.

const config = window.LuxivalConfig || {};
const SUPABASE_URL = config.SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = config.SUPABASE_PUBLISHABLE_KEY || '';
const PROJECT_IMAGES_BUCKET = 'project-images';
const CUSTOMER_DOCUMENTS_BUCKET = 'customer-documents';
const RIDE_UPLOADS_BUCKET = 'ride-uploads';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function submitContactInquiry(payload) {
  return supabase.from('contact_inquiries').insert([payload]);
}

async function submitRideRequest(payload) {
  return supabase.from('ride_requests').insert([payload]);
}

async function subscribeNewsletter(payload) {
  return supabase.from('newsletter_subscribers').insert([payload]);
}

async function submitChatLead(payload) {
  return supabase.from('contact_inquiries').insert([payload]);
}

async function uploadPublicProjectImage(file, destinationPath) {
  return supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(destinationPath, file, { cacheControl: '3600', upsert: false });
}

async function createPrivateSignedUrl(bucket, path, expiresIn = 60) {
  return supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
}

async function uploadPrivateAsset(bucket, path, file) {
  return supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false });
}

async function insertUploadedAsset(record) {
  return supabase.from('uploaded_assets').insert([record]);
}

async function fetchContactInquiries(limit = 50) {
  return supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false }).limit(limit);
}

async function fetchRideRequests(limit = 50) {
  return supabase.from('ride_requests').select('*').order('created_at', { ascending: false }).limit(limit);
}

async function fetchNewsletterSubscribers(limit = 50) {
  return supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }).limit(limit);
}

window.LuxivalSupabase = {
  submitContactInquiry,
  submitRideRequest,
  subscribeNewsletter,
  submitChatLead,
  uploadPublicProjectImage,
  uploadPrivateAsset,
  createPrivateSignedUrl,
  insertUploadedAsset,
  fetchContactInquiries,
  fetchRideRequests,
  fetchNewsletterSubscribers,
};
