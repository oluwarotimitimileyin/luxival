#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const KEY = "6292d286853d4847b71d0f2b76c30dbc";
const HOST = "www.luxival.com";
const ENDPOINT = "https://api.indexnow.org/IndexNow";

function extractUrls(xml) {
  const urls = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

async function submit(urls) {
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  });

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body,
  });

  console.log(`IndexNow response: ${res.status} ${res.statusText}`);
  if (res.status === 200 || res.status === 202) {
    console.log(`Submitted ${urls.length} URLs to Bing, Yandex, Seznam & Naver via IndexNow`);
  } else {
    const text = await res.text();
    console.error("Error:", text);
    process.exit(1);
  }
}

async function main() {
  const xml = fs.readFileSync(path.join(__dirname, "..", "sitemap.xml"), "utf8");
  const urls = extractUrls(xml);
  console.log(`Found ${urls.length} URLs in sitemap.xml`);
  await submit(urls);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
