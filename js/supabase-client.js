// Supabase client helper for Luxival
// This uses the public Supabase config from js/config.js.

const config = window.LuxivalConfig || {};
const SUPABASE_URL = config.SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = config.SUPABASE_PUBLISHABLE_KEY || '';
const PROJECT_IMAGES_BUCKET = 'project-images';
const CUSTOMER_DOCUMENTS_BUCKET = 'customer-documents';
const RIDE_UPLOADS_BUCKET = 'ride-uploads';
const TIKTOK_LEGACY_COLUMNS_KEY = 'luxival_tiktok_legacy_required_columns';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

function getStoredTikTokLegacyColumns() {
  try {
    const raw = window.localStorage.getItem(TIKTOK_LEGACY_COLUMNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item === 'string' && item.length > 0);
  } catch (error) {
    return [];
  }
}

function storeTikTokLegacyColumns(columns) {
  try {
    const unique = Array.from(new Set(columns.filter((item) => typeof item === 'string' && item.length > 0)));
    window.localStorage.setItem(TIKTOK_LEGACY_COLUMNS_KEY, JSON.stringify(unique));
  } catch (error) {
    // Ignore storage failures and continue with runtime-only compatibility.
  }
}

async function submitContactInquiry(payload) {
  return supabaseClient.from('contact_inquiries').insert([payload]);
}

async function submitRideRequest(payload) {
  return supabaseClient.from('ride_requests').insert([payload]);
}

async function subscribeNewsletter(payload) {
  return supabaseClient.from('newsletter_subscribers').insert([payload]);
}

async function submitTikTokAgencyApplication(payload) {
  // Do not request returned rows for anon inserts; RLS grants insert but not select.
  const retryPayload = { ...payload };
  const learnedColumns = getStoredTikTokLegacyColumns();
  const legacyValueMap = {
    full_name: payload && payload.creator_name ? payload.creator_name : '',
    tiktok_username: payload && payload.tiktok_handle ? payload.tiktok_handle : '',
    phone_number: payload && payload.phone ? payload.phone : '',
    creator_email: payload && payload.email ? payload.email : '',
    user_email: payload && payload.email ? payload.email : '',
  };

  learnedColumns.forEach((column) => {
    if (
      !Object.prototype.hasOwnProperty.call(retryPayload, column) &&
      Object.prototype.hasOwnProperty.call(legacyValueMap, column)
    ) {
      retryPayload[column] = legacyValueMap[column];
    }
  });

  const newlyLearnedColumns = [];

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const result = await supabaseClient.from('tiktok_agency_applications').insert([retryPayload]);
    const error = result && result.error ? result.error : null;
    if (!error) {
      if (newlyLearnedColumns.length > 0) {
        storeTikTokLegacyColumns([...learnedColumns, ...newlyLearnedColumns]);
      }
      return result;
    }

    if (error.code !== '23502' || typeof error.message !== 'string') {
      return result;
    }

    const missingColumnMatch = error.message.match(/column "([^"]+)"/);
    if (!missingColumnMatch) {
      return result;
    }

    const missingColumn = missingColumnMatch[1];
    if (Object.prototype.hasOwnProperty.call(retryPayload, missingColumn)) {
      return result;
    }

    if (!Object.prototype.hasOwnProperty.call(legacyValueMap, missingColumn)) {
      return result;
    }

    retryPayload[missingColumn] = legacyValueMap[missingColumn];
    newlyLearnedColumns.push(missingColumn);
  }

  return supabaseClient.from('tiktok_agency_applications').insert([retryPayload]);
}

async function submitChatLead(payload) {
  return supabaseClient.from('contact_inquiries').insert([payload]);
}

async function uploadPublicProjectImage(file, destinationPath) {
  return supabaseClient.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(destinationPath, file, { cacheControl: '3600', upsert: false });
}

async function createPrivateSignedUrl(bucket, path, expiresIn = 60) {
  return supabaseClient.storage.from(bucket).createSignedUrl(path, expiresIn);
}

async function uploadPrivateAsset(bucket, path, file) {
  return supabaseClient.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false });
}

async function insertUploadedAsset(record) {
  return supabaseClient.from('uploaded_assets').insert([record]);
}

async function fetchContactInquiries(limit = 50) {
  return supabaseClient.from('contact_inquiries').select('*').order('created_at', { ascending: false }).limit(limit);
}

async function fetchRideRequests(limit = 50) {
  return supabaseClient.from('ride_requests').select('*').order('created_at', { ascending: false }).limit(limit);
}

async function fetchNewsletterSubscribers(limit = 50) {
  return supabaseClient.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }).limit(limit);
}

window.LuxivalSupabase = {
  submitContactInquiry,
  submitRideRequest,
  subscribeNewsletter,
  submitTikTokAgencyApplication,
  submitChatLead,
  uploadPublicProjectImage,
  uploadPrivateAsset,
  createPrivateSignedUrl,
  insertUploadedAsset,
  fetchContactInquiries,
  fetchRideRequests,
  fetchNewsletterSubscribers,
};
