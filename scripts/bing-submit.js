#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const API_KEY = "66555b119fd74f5ab8dd099651560d3a";
const SITE_URL = "https://www.luxival.com";
const ENDPOINT = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${API_KEY}`;

function extractUrls(xml) {
  const urls = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

async function submitBatch(urls) {
  const body = JSON.stringify({
    siteUrl: SITE_URL,
    urlList: urls,
  });

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body,
  });

  const data = await res.json();
  if (res.ok) {
    console.log(`Batch submitted: ${urls.length} URLs`);
  } else {
    console.error(`Error (${res.status}):`, JSON.stringify(data, null, 2));
  }
  return res.ok;
}

async function main() {
  const xml = fs.readFileSync(path.join(__dirname, "..", "sitemap.xml"), "utf8");
  const allUrls = extractUrls(xml);
  console.log(`Found ${allUrls.length} URLs in sitemap.xml`);

  const BATCH_SIZE = 500;
  let success = 0;
  for (let i = 0; i < allUrls.length; i += BATCH_SIZE) {
    const batch = allUrls.slice(i, i + BATCH_SIZE);
    const ok = await submitBatch(batch);
    if (ok) success += batch.length;
  }

  console.log(`\nDone: ${success}/${allUrls.length} URLs submitted to Bing`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
