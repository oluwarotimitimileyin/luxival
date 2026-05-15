// api/auto-content.js
// Vercel serverless function — triggered daily at 08:00 UTC by Vercel Cron.
// 1. Fetches a trending Helsinki place from Google Places API (v1 New)
// 2. Sends it to Claude Haiku to generate a blog post
// 3. Writes the post + hotspot record to Supabase via service role key

// ─── Env vars (set in Vercel project settings) ────────────────────────────
const GOOGLE_API_KEY       = process.env.GOOGLE_PLACES_API_KEY;
const ANTHROPIC_API_KEY    = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL         = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET          = process.env.CRON_SECRET; // optional guard

// ─── Google Places: fetch a trending Helsinki spot ────────────────────────

async function fetchHelsinkiSpot() {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.rating',
        'places.userRatingCount',
        'places.editorialSummary',
      ].join(','),
    },
    body: JSON.stringify({
      textQuery: 'popular attractions Helsinki Finland',
      maxResultCount: 10,
      languageCode: 'en',
    }),
  });

  if (!res.ok) throw new Error(`Google Places API error: ${res.status} ${await res.text()}`);
  const { places = [] } = await res.json();
  if (places.length === 0) throw new Error('Google Places returned no results');

  // Pick a random entry from the top 10 so posts vary each day
  return places[Math.floor(Math.random() * places.length)];
}

// ─── Claude: generate blog post from place details ────────────────────────

async function generateBlogPost(place) {
  const name    = place.displayName?.text || 'Helsinki Attraction';
  const address = place.formattedAddress || 'Helsinki, Finland';
  const rating  = place.rating
    ? `${place.rating}/5 (${place.userRatingCount?.toLocaleString()} reviews)`
    : 'Highly rated';
  const summary = place.editorialSummary?.text || '';

  const userPrompt = `You are a travel writer for Luxival, a premium Helsinki-based services company.

Write a short, engaging blog post about "${name}" in Helsinki.

Place details:
- Location: ${address}
- Rating: ${rating}
${summary ? `- Editorial summary: ${summary}` : ''}

Requirements:
- The title must NOT contain dashes. Use commas or colons instead.
- Write a 2-sentence excerpt that acts as a teaser.
- Write 3-4 paragraphs (body content): why visitors love it, what to expect, one practical tip.
- Tone: premium but approachable. No corporate jargon.

Respond ONLY with this JSON structure and nothing else:
{
  "title": "...",
  "excerpt": "...",
  "content": "..."
}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  const rawText = json.content?.[0]?.text || '';

  // Extract JSON block from Claude response
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Could not parse Claude response: ${rawText.slice(0, 200)}`);
  return JSON.parse(match[0]);
}

// ─── Supabase: write blog post and hotspot record ─────────────────────────

async function saveToSupabase(post, place) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Prefer': 'return=representation',
  };

  // Build a unique, URL-safe slug
  const slug = post.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    + '-' + Date.now();

  // Insert blog post
  const blogRes = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title:        post.title,
      slug,
      excerpt:      post.excerpt,
      content:      post.content,
      category:     'helsinki',
      source:       'auto-ai',
      published:    true,
      published_at: new Date().toISOString(),
      author:       'Luxival AI',
    }),
  });

  if (!blogRes.ok) {
    const detail = await blogRes.text();
    throw new Error(`blog_posts insert failed: ${detail}`);
  }

  const [savedPost] = await blogRes.json();

  // Insert or update helsinki_hotspot record
  const placeId   = place.id || null;
  const placeName = place.displayName?.text || 'Helsinki Attraction';

  if (placeId) {
    const hotspotRes = await fetch(`${SUPABASE_URL}/rest/v1/helsinki_hotspots`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        place_name:   placeName,
        place_id:     placeId,
        address:      place.formattedAddress || '',
        rating:       place.rating    ?? null,
        review_count: place.userRatingCount ?? null,
        maps_url:     `https://www.google.com/maps/place/?q=place_id:${placeId}`,
        blog_post_id: savedPost?.id ?? null,
      }),
    });
    if (!hotspotRes.ok) {
      // Non-fatal: log but don't throw
      console.warn('[auto-content] hotspot upsert warning:', await hotspotRes.text());
    }
  }

  return savedPost;
}

// ─── Vercel handler ───────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // Guard: allow Vercel Cron (sends CRON_SECRET as Bearer token) or skip if not set
  if (CRON_SECRET) {
    const auth = req.headers['authorization'] || '';
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // Only allow GET (Vercel Cron) and POST (manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate env vars
  const missing = ['GOOGLE_PLACES_API_KEY', 'ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    .filter(k => !process.env[k]);
  if (missing.length > 0) {
    return res.status(500).json({ error: `Missing env vars: ${missing.join(', ')}` });
  }

  try {
    const place = await fetchHelsinkiSpot();
    const post  = await generateBlogPost(place);
    const saved = await saveToSupabase(post, place);

    return res.status(200).json({
      success: true,
      post:    { id: saved?.id, title: saved?.title, slug: saved?.slug },
      place:   place.displayName?.text,
    });
  } catch (err) {
    console.error('[auto-content] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
