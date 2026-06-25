import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const url = 'http://localhost:3000/portfolio/auraframe/frontend/dist/';

page.on('console', msg => {
  if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
});

try {
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  console.log('Status:', resp.status());
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  await page.screenshot({ path: '/tmp/auraframe-ui.png', fullPage: true });
  const body = await page.textContent('body');
  console.log('Body text (first 1500 chars):', body.substring(0, 1500));
} catch (e) {
  console.error('Error:', e.message);
}

await browser.close();
