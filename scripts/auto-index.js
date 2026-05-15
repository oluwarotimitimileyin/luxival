#!/usr/bin/env node
/**
 * auto-index.js
 * Reads sitemap.xml and submits all URLs to Google Indexing API.
 * Run after deploy: node scripts/auto-index.js
 * Or add to package.json build script.
 *
 * Requires: GOOGLE_SERVICE_ACCOUNT_JSON env var (base64-encoded service account key)
 */

const https = require('https');
const { execSync } = require('child_process');

// ── Config ────────────────────────────────────────────────
const SITEMAP_URL = 'https://luxival.com/sitemap.xml';
const BATCH_SIZE = 10; // Google Indexing API: 100 requests/day free tier
const DELAY_MS = 500;  // ms between requests to avoid rate limiting

// ── Get service account credentials ───────────────────────
function getCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT_JSON env var not set.');
    console.error('   See README in scripts/ for setup instructions.');
    process.exit(1);
  }
  try {
    // Support both raw JSON string and base64-encoded
    const decoded = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (e) {
    console.error('❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e.message);
    process.exit(1);
  }
}

// ── Fetch sitemap and extract URLs ────────────────────────
function fetchSitemap(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const urls = [...data.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
        resolve(urls);
      });
    }).on('error', reject);
  });
}

// ── Get Google OAuth2 access token from service account ───
function getAccessToken(credentials) {
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })).toString('base64url');

    const signingInput = `${header}.${payload}`;

    // Use openssl to sign (available on macOS/Linux/Vercel)
    try {
      const keyFile = '/tmp/gsa_key.pem';
      require('fs').writeFileSync(keyFile, credentials.private_key);
      const sig = execSync(`echo -n "${signingInput}" | openssl dgst -sha256 -sign ${keyFile} | openssl base64 -A`)
        .toString().trim().replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const jwt = `${signingInput}.${sig}`;

      const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
      const req = https.request({
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          const parsed = JSON.parse(body);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error(`Token error: ${body}`));
        });
      });
      req.write(postData);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

// ── Submit a single URL to Indexing API ───────────────────
function submitUrl(url, token) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ url, type: 'URL_UPDATED' });
    const req = https.request({
      hostname: 'indexing.googleapis.com',
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const ok = res.statusCode === 200;
        console.log(`  ${ok ? '✅' : '⚠️ '} [${res.statusCode}] ${url}`);
        resolve({ url, status: res.statusCode, ok });
      });
    });
    req.on('error', (e) => {
      console.log(`  ❌ ${url} — ${e.message}`);
      resolve({ url, status: 0, ok: false });
    });
    req.write(body);
    req.end();
  });
}

// ── Sleep helper ──────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log('🔍 Luxival Auto-Indexer');
  console.log('══════════════════════════════════');

  const credentials = getCredentials();
  console.log(`✅ Service account: ${credentials.client_email}`);

  console.log(`📡 Fetching sitemap: ${SITEMAP_URL}`);
  const urls = await fetchSitemap(SITEMAP_URL);
  console.log(`   Found ${urls.length} URLs\n`);

  console.log('🔑 Getting access token...');
  const token = await getAccessToken(credentials);
  console.log('   Token acquired\n');

  console.log(`📤 Submitting URLs to Google Indexing API (${BATCH_SIZE} at a time):\n`);

  let submitted = 0, failed = 0;
  const limit = Math.min(urls.length, BATCH_SIZE);

  for (let i = 0; i < limit; i++) {
    const result = await submitUrl(urls[i], token);
    if (result.ok) submitted++; else failed++;
    if (i < limit - 1) await sleep(DELAY_MS);
  }

  console.log('\n══════════════════════════════════');
  console.log(`✅ Submitted: ${submitted}  ⚠️  Failed: ${failed}`);
  if (urls.length > BATCH_SIZE) {
    console.log(`ℹ️  ${urls.length - BATCH_SIZE} URLs skipped (free tier: 100/day limit)`);
    console.log(`   Run again tomorrow to submit remaining URLs.`);
  }
  console.log('\nDone. Google will crawl submitted pages within 24–48 hours.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
