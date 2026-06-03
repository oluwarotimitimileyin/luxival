#!/usr/bin/env node
/**
 * Google indexing helper for Luxival.
 *
 * Modes:
 *  - Single URL:   node scripts/auto-index.js --url https://www.luxival.com/blog/my-post/
 *  - Sitemap batch: node scripts/auto-index.js --from-sitemap --limit 10
 *  - Full sitemap batches: node scripts/auto-index.js --all-from-sitemap --batch-size 20 --retry-failures 1
 *  - Sitemap notify: node scripts/auto-index.js --notify-sitemap
 *
 * Env vars:
 *  - GOOGLE_SERVICE_ACCOUNT_JSON (preferred for Indexing API calls)
 *  - GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REFRESH_TOKEN (fallback auth)
 *  - GOOGLE_INDEXING_SITEMAP_URL (optional, default: https://www.luxival.com/sitemap.xml)
 *  - GOOGLE_INDEXING_BATCH_SIZE (optional, default: 10)
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DELAY_MS = 500;

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function toNonNegativeInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const text = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const equalIndex = line.indexOf('=');
    if (equalIndex <= 0) continue;

    const key = line.slice(0, equalIndex).trim();
    let value = line.slice(equalIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getDefaultSitemapUrl() {
  return process.env.GOOGLE_INDEXING_SITEMAP_URL || 'https://www.luxival.com/sitemap.xml';
}

function getDefaultBatchSize() {
  const value = Number(process.env.GOOGLE_INDEXING_BATCH_SIZE || 10);
  return Number.isFinite(value) && value > 0 ? value : 10;
}

function parseArgs(argv) {
  const defaultSitemapUrl = getDefaultSitemapUrl();
  const defaultBatchSize = getDefaultBatchSize();

  const args = {
    url: null,
    type: 'URL_UPDATED',
    fromSitemap: false,
    allFromSitemap: false,
    notifySitemap: false,
    generateOauthToken: false,
    sitemapUrl: defaultSitemapUrl,
    limit: defaultBatchSize,
    offset: 0,
    batchSize: 20,
    retryFailures: 1,
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--url') args.url = argv[++i];
    else if (token === '--type') args.type = argv[++i] || 'URL_UPDATED';
    else if (token === '--from-sitemap') args.fromSitemap = true;
    else if (token === '--all-from-sitemap') args.allFromSitemap = true;
    else if (token === '--notify-sitemap') args.notifySitemap = true;
    else if (token === '--generate-oauth-token') args.generateOauthToken = true;
    else if (token === '--sitemap') args.sitemapUrl = argv[++i] || defaultSitemapUrl;
    else if (token === '--limit') args.limit = Number(argv[++i] || defaultBatchSize);
    else if (token === '--offset') args.offset = Number(argv[++i] || 0);
    else if (token === '--batch-size') args.batchSize = Number(argv[++i] || 20);
    else if (token === '--retry-failures') args.retryFailures = Number(argv[++i] || 1);
    else if (token === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  if (args.allFromSitemap) args.fromSitemap = true;

  args.limit = toPositiveInt(args.limit, defaultBatchSize);
  args.offset = toNonNegativeInt(args.offset, 0);
  args.batchSize = toPositiveInt(args.batchSize, 20);
  args.retryFailures = toNonNegativeInt(args.retryFailures, 1);

  if (args.type !== 'URL_UPDATED' && args.type !== 'URL_DELETED') {
    console.error('❌ --type must be URL_UPDATED or URL_DELETED');
    process.exit(1);
  }

  return args;
}

function printHelp() {
  console.log('Luxival Google Indexing helper');
  console.log('Usage:');
  console.log('  node scripts/auto-index.js --url <absoluteUrl> [--type URL_UPDATED|URL_DELETED]');
  console.log('  node scripts/auto-index.js --from-sitemap [--sitemap <url>] [--limit <n>] [--offset <n>]');
  console.log('  node scripts/auto-index.js --all-from-sitemap [--sitemap <url>] [--batch-size <n>] [--retry-failures <n>] [--offset <n>]');
  console.log('  node scripts/auto-index.js --notify-sitemap [--sitemap <url>]');
  console.log('  node scripts/auto-index.js --generate-oauth-token   (one-time setup: gets refresh token via browser)');
  console.log('\nAuth options (choose one):');
  console.log('  - GOOGLE_SERVICE_ACCOUNT_JSON');
  console.log('  - GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET + GOOGLE_OAUTH_REFRESH_TOKEN');
}

// ── OAuth browser-based token generation (one-time setup) ──
async function generateOauthRefreshToken() {
  const http = require('http');
  const { execSync } = require('child_process');

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env.local first.');
    process.exit(1);
  }

  const redirectUri = 'http://localhost:9876/oauth';
  const scope = 'https://www.googleapis.com/auth/indexing';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

  console.log('\n🔑 OAuth Token Generator');
  console.log('══════════════════════════════════');
  console.log('Opening browser for Google authorization...');
  console.log('Sign in with your Search Console owner account (sarakuvam@gmail.com)');
  console.log('\nIf browser does not open, manually visit:');
  console.log(authUrl);
  console.log();

  // Try to open browser
  try { execSync(`open "${authUrl}"`); } catch {}

  // Local server to catch the redirect
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url, 'http://localhost:9876');
      const code = reqUrl.searchParams.get('code');
      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body><h2>✅ Authorization successful! You can close this tab.</h2></body></html>');
        server.close();
        resolve(code);
      } else {
        res.writeHead(400);
        res.end('Missing code');
      }
    });
    server.listen(9876, () => console.log('⏳ Waiting for browser authorization on port 9876...'));
    server.on('error', reject);
    setTimeout(() => { server.close(); reject(new Error('Timeout: no auth code received within 120s')); }, 120000);
  });

  // Exchange code for tokens
  const tokenResult = await new Promise((resolve, reject) => {
    const postData = [
      `code=${encodeURIComponent(code)}`,
      `client_id=${encodeURIComponent(clientId)}`,
      `client_secret=${encodeURIComponent(clientSecret)}`,
      `redirect_uri=${encodeURIComponent(redirectUri)}`,
      'grant_type=authorization_code'
    ].join('&');

    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  if (!tokenResult.refresh_token) {
    console.error('❌ No refresh_token in response:', JSON.stringify(tokenResult, null, 2));
    process.exit(1);
  }

  console.log('\n✅ Success! Add these to your .env.local:');
  console.log('══════════════════════════════════');
  console.log(`GOOGLE_OAUTH_CLIENT_ID=${clientId}`);
  console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${clientSecret}`);
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokenResult.refresh_token}`);
  console.log('══════════════════════════════════');
  console.log('\nThen run: npm run index:all');
}

// ── Get service account credentials ───────────────────────
function getServiceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    return null;
  }
  try {
    // Support both raw JSON string and base64-encoded
    const decoded = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);

    if (!parsed.client_email || !parsed.private_key) {
      console.error('❌ GOOGLE_SERVICE_ACCOUNT_JSON is not a valid service account key JSON.');
      console.error('   It must include client_email and private_key fields.');
      process.exit(1);
    }

    return parsed;
  } catch (e) {
    console.error('❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e.message);
    process.exit(1);
  }
}

function getOAuthRefreshCredentials() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  return { clientId, clientSecret, refreshToken };
}

// ── Fetch sitemap and extract URLs ────────────────────────
function fetchSitemap(url, redirectCount = 0) {
  const MAX_REDIRECTS = 5;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode)) {
        if (redirectCount >= MAX_REDIRECTS) {
          reject(new Error(`Sitemap redirect loop detected (>${MAX_REDIRECTS})`));
          return;
        }

        const location = res.headers.location;
        if (!location) {
          reject(new Error(`Sitemap redirect [${res.statusCode}] missing Location header`));
          return;
        }

        const nextUrl = new URL(location, url).toString();
        fetchSitemap(nextUrl, redirectCount + 1).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Sitemap fetch failed with status ${res.statusCode}`));
        return;
      }
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

    try {
      const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), credentials.private_key)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
      const jwt = `${signingInput}.${signature}`;

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
          if (parsed.access_token) {
            resolve(parsed.access_token);
          } else {
            reject(new Error(`Token error: ${body}`));
          }
        });
      });
      req.write(postData);
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

function getAccessTokenFromRefreshToken(credentials) {
  return new Promise((resolve, reject) => {
    const postData = [
      `client_id=${encodeURIComponent(credentials.clientId)}`,
      `client_secret=${encodeURIComponent(credentials.clientSecret)}`,
      `refresh_token=${encodeURIComponent(credentials.refreshToken)}`,
      'grant_type=refresh_token'
    ].join('&');

    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.access_token) {
            resolve(parsed.access_token);
            return;
          }
          reject(new Error(`OAuth refresh token error: ${body}`));
        } catch (e) {
          reject(new Error(`OAuth refresh token parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ── Submit a single URL to Indexing API ───────────────────
function submitUrl(url, token, type) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ url, type });
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
        console.log(`  ${ok ? '✅' : '⚠️ '} [${res.statusCode}] ${type} ${url}`);
        let errorMessage = '';
        if (!ok && data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed?.error?.message) {
              errorMessage = parsed.error.message;
            }
          } catch {
            errorMessage = data.trim();
          }
        }

        if (errorMessage) {
          console.log(`     ↳ ${errorMessage}`);
        }

        resolve({ url, status: res.statusCode, ok, errorMessage });
      });
    });
    req.on('error', (e) => {
      console.log(`  ❌ ${url} — ${e.message}`);
      resolve({ url, status: 0, ok: false, errorMessage: e.message });
    });
    req.write(body);
    req.end();
  });
}

// ── Sleep helper ──────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function submitTargets(targets, token, type) {
  let submitted = 0;
  let failed = 0;
  const failedUrls = [];
  const failureReasons = new Map();

  for (let i = 0; i < targets.length; i++) {
    const result = await submitUrl(targets[i], token, type);
    if (result.ok) {
      submitted++;
    } else {
      failed++;
      failedUrls.push(targets[i]);

      const status = result.status || 0;
      const reason = result.errorMessage || 'No error details provided';
      const key = `${status}:${reason}`;
      failureReasons.set(key, (failureReasons.get(key) || 0) + 1);
    }

    if (i < targets.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  return { submitted, failed, failedUrls, failureReasons };
}

function mergeFailureReasons(targetMap, sourceMap) {
  for (const [key, count] of sourceMap.entries()) {
    targetMap.set(key, (targetMap.get(key) || 0) + count);
  }
}

function printFailureSummary(failureReasons) {
  if (failureReasons.size === 0) return;

  console.log('\n⚠️  Failure reason summary:');
  for (const [key, count] of failureReasons.entries()) {
    const splitIndex = key.indexOf(':');
    const status = key.slice(0, splitIndex);
    const reason = key.slice(splitIndex + 1);
    console.log(`   - [${status}] ${count} URL(s): ${reason}`);
  }
}

function notifySitemap(sitemapUrl) {
  return new Promise((resolve, reject) => {
    const endpoint = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    https.get(endpoint, (res) => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
        resolve({ ok: true, status: res.statusCode, deprecated: false });
      } else if (res.statusCode === 404) {
        resolve({ ok: true, status: res.statusCode, deprecated: true });
      } else {
        reject(new Error(`Sitemap ping failed with status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  loadEnvFile();
  const args = parseArgs(process.argv.slice(2));

  if (args.generateOauthToken) {
    await generateOauthRefreshToken();
    return;
  }

  if (!args.url && !args.fromSitemap && !args.notifySitemap) {
    printHelp();
    process.exit(0);
  }

  console.log('🔍 Luxival Auto-Indexer');
  console.log('══════════════════════════════════');

  if (args.notifySitemap) {
    console.log(`📡 Notifying Google about sitemap: ${args.sitemapUrl}`);
    const result = await notifySitemap(args.sitemapUrl);
    if (result.deprecated) {
      console.log(`⚠️  Google sitemap ping endpoint returned [${result.status}] (deprecated behavior).`);
      console.log('   Use Google Search Console sitemap submission as the primary method.');
    } else {
      console.log(`✅ Sitemap ping accepted [${result.status}]`);
    }
  }

  if (!args.url && !args.fromSitemap) {
    console.log('\nDone.');
    return;
  }

  const serviceAccountCredentials = getServiceAccountCredentials();
  const oauthRefreshCredentials = getOAuthRefreshCredentials();

  if (!serviceAccountCredentials && !oauthRefreshCredentials) {
    console.error('❌ No indexing auth credentials found.');
    console.error('   Provide GOOGLE_SERVICE_ACCOUNT_JSON');
    console.error('   or GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET + GOOGLE_OAUTH_REFRESH_TOKEN.');
    process.exit(1);
  }

  if (serviceAccountCredentials) {
    console.log(`✅ Service account: ${serviceAccountCredentials.client_email}`);
  } else {
    console.log('✅ Auth mode: OAuth refresh token (owner account)');
  }

  console.log('ℹ️  Note: Google Indexing API is officially intended for specific page types');
  console.log('   (for example JobPosting and BroadcastEvent with structured data).');
  console.log('   For general pages/blog posts, sitemap + Search Console are still important.\n');

  let targets = [];
  let totalSitemapUrls = 0;
  if (args.url) {
    targets = [args.url];
  } else if (args.fromSitemap) {
    console.log(`📡 Fetching sitemap: ${args.sitemapUrl}`);
    const urls = await fetchSitemap(args.sitemapUrl);
    totalSitemapUrls = urls.length;
    console.log(`   Found ${urls.length} URLs\n`);

    if (args.allFromSitemap) {
      targets = urls.slice(args.offset);
    } else {
      targets = urls.slice(args.offset, args.offset + args.limit);
    }
  }

  console.log('🔑 Getting access token...');
  const token = serviceAccountCredentials
    ? await getAccessToken(serviceAccountCredentials)
    : await getAccessTokenFromRefreshToken(oauthRefreshCredentials);
  console.log('   Token acquired\n');

  let submitted = 0;
  let failed = 0;
  const failureReasons = new Map();

  if (args.allFromSitemap) {
    console.log(`📤 Submitting ${targets.length} URL(s) in sitemap batches of ${args.batchSize}...\n`);

    let processed = 0;
    let batchNumber = 0;

    for (let start = 0; start < targets.length; start += args.batchSize) {
      batchNumber++;
      const batch = targets.slice(start, start + args.batchSize);
      const absoluteStart = args.offset + start;
      const absoluteEnd = absoluteStart + batch.length - 1;
      console.log(`📦 Batch ${batchNumber}: URL index ${absoluteStart}-${absoluteEnd} (${batch.length} URL(s))`);

      const batchResult = await submitTargets(batch, token, args.type);
      submitted += batchResult.submitted;
      failed += batchResult.failed;
      mergeFailureReasons(failureReasons, batchResult.failureReasons);
      processed += batch.length;

      if (batchResult.failedUrls.length > 0 && args.retryFailures > 0) {
        console.log(`   🔁 Retrying ${batchResult.failedUrls.length} failed URL(s), up to ${args.retryFailures} pass(es)...`);
        let retryTargets = batchResult.failedUrls;

        for (let pass = 1; pass <= args.retryFailures && retryTargets.length > 0; pass++) {
          console.log(`   ↻ Retry pass ${pass}`);
          await sleep(DELAY_MS);
          const retryResult = await submitTargets(retryTargets, token, args.type);
          submitted += retryResult.submitted;
          failed -= retryResult.submitted;
          mergeFailureReasons(failureReasons, retryResult.failureReasons);
          retryTargets = retryResult.failedUrls;
        }

        if (retryTargets.length > 0) {
          console.log(`   ⚠️  Unresolved in this batch: ${retryTargets.length} URL(s)`);
        } else {
          console.log('   ✅ All failed URLs recovered after retries.');
        }
      }

      console.log(`   📊 Progress: ${processed}/${targets.length} URL(s) processed\n`);
    }
  } else {
    console.log(`📤 Submitting ${targets.length} URL(s) to Google Indexing API:\n`);
    const result = await submitTargets(targets, token, args.type);
    submitted = result.submitted;
    failed = result.failed;
    mergeFailureReasons(failureReasons, result.failureReasons);
  }

  console.log('\n══════════════════════════════════');
  console.log(`✅ Submitted: ${submitted}  ⚠️  Failed: ${failed}`);
  printFailureSummary(failureReasons);
  if (args.fromSitemap) {
    if (args.allFromSitemap) {
      console.log(`ℹ️  Processed from sitemap offset ${args.offset}. Total sitemap URLs found: ${totalSitemapUrls}.`);
      console.log(`ℹ️  Batch size: ${args.batchSize}. Retry passes per batch: ${args.retryFailures}.`);
    } else {
      console.log(`ℹ️  Range used: offset ${args.offset}, limit ${args.limit} URL(s) from sitemap.`);
    }
  }
  console.log('\nDone. Google will crawl submitted pages within 24–48 hours.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
