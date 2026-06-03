const http = require("http");
const https = require("https");

const DEFAULT_URLS = [
  "http://luxival.com/",
  "https://luxival.com/",
  "http://www.luxival.com/",
  "https://www.luxival.com/index.html",
  "https://www.luxival.com/hub.html",
  "https://www.luxival.com/services/ai-agents.html",
  "https://www.luxival.com/blog/ugc-ai-video-creation-brand-campaigns/",
  "https://www.luxival.com/blog/what-is-istqb-certification/"
];

const urls = process.argv.slice(2);
const targets = urls.length ? urls : DEFAULT_URLS;

function request(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    const req = client.request(url, { method: "HEAD" }, (res) => {
      res.resume();
      resolve({
        status: res.statusCode,
        location: res.headers.location
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error(`Timed out: ${url}`));
    });
    req.end();
  });
}

function resolveLocation(currentUrl, location) {
  return new URL(location, currentUrl).toString();
}

async function trace(originalUrl) {
  let currentUrl = originalUrl;
  let redirects = 0;

  for (let hop = 0; hop < 10; hop += 1) {
    const res = await request(currentUrl);
    if (![301, 302, 303, 307, 308].includes(res.status)) {
      return {
        originalUrl,
        finalUrl: currentUrl,
        status: res.status,
        redirects,
        ok: res.status === 200
      };
    }

    if (!res.location) {
      return {
        originalUrl,
        finalUrl: currentUrl,
        status: res.status,
        redirects,
        ok: false
      };
    }

    currentUrl = resolveLocation(currentUrl, res.location);
    redirects += 1;
  }

  return {
    originalUrl,
    finalUrl: currentUrl,
    status: "too_many_redirects",
    redirects,
    ok: false
  };
}

(async () => {
  const rows = [];
  for (const target of targets) {
    rows.push(await trace(target));
  }
  console.table(rows);

  const failed = rows.filter((row) => !row.ok);
  if (failed.length) {
    process.exitCode = 1;
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
