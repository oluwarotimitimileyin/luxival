#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const KEY = "d9d37bb8494f42f8bb761f971c9232c6";
const HOST = "www.luxival.com";

function extractUrls(xml) {
  const urls = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

async function submitToIndexNow(urls) {
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  });

  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body,
  });
  return res;
}

async function main() {
  const xml = fs.readFileSync(path.join(__dirname, "..", "sitemap.xml"), "utf8");
  const urls = extractUrls(xml);
  
  console.log(`Found ${urls.length} URLs in sitemap.xml`);
  
  const res = await submitToIndexNow(urls);
  console.log(`IndexNow response: ${res.status} ${res.statusText}`);
  
  if (res.status === 200 || res.status === 202) {
    console.log(`✓ Submitted ${urls.length} URLs to Bing, Yandex, Seznam & Naver via IndexNow`);
  } else {
    const text = await res.text();
    console.error("IndexNow error:", text);
    console.log("\n📌 Next steps to verify site ownership:");
    console.log(`  1. Confirm key file exists: https://${HOST}/${KEY}.txt`);
    console.log(`  2. Register at https://www.bing.com/webmasters`);
    console.log(`  3. Add and verify https://${HOST}`);
    console.log(`  4. After verification, re-run: npm run indexnow`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
