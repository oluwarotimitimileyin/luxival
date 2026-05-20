import { test, expect } from '@playwright/test';

test('Portfolio - ESG Compliance Auditor demo loads correctly', async ({ page }) => {
  // Navigate to portfolio
  await page.goto('http://localhost:8080/portfolio/', { waitUntil: 'networkidle' });
  
  console.log('✓ Portfolio page loaded');
  
  // Check if page title is correct
  const title = await page.title();
  console.log(`Page title: ${title}`);
  
  // Scroll to ESG demo section
  const esgDemo = page.locator('#esg-demo');
  await esgDemo.scrollIntoViewIfNeeded();
  console.log('✓ Scrolled to ESG demo section');
  
  // Check if ESG demo section is visible
  const isVisible = await esgDemo.isVisible();
  console.log(`ESG demo visible: ${isVisible}`);
  
  // Find the iframe
  const iframe = page.locator('iframe[src*="esg-compliance-auditor"]');
  const iframeCount = await iframe.count();
  console.log(`Found ${iframeCount} ESG iframe(s)`);
  
  if (iframeCount > 0) {
    // Get iframe src
    const src = await iframe.first().getAttribute('src');
    console.log(`Iframe src: ${src}`);
    
    // Check if iframe has correct attributes
    const sandbox = await iframe.first().getAttribute('sandbox');
    console.log(`Sandbox attributes: ${sandbox}`);
    
    // Wait a bit for iframe to load
    await page.waitForTimeout(2000);
    
    // Try to access iframe content
    try {
      const frameHandle = await iframe.first().elementHandle();
      const frame = await frameHandle.contentFrame();
      
      if (frame) {
        console.log('✓ Iframe content frame accessible');
        
        // Check for any errors in the iframe
        const bodyContent = await frame.content();
        console.log(`Iframe body preview (first 200 chars): ${bodyContent.substring(0, 200)}`);
      } else {
        console.log('✗ Unable to access iframe content frame (cross-origin?)');
      }
    } catch (err) {
      console.log(`✗ Error accessing iframe: ${err.message}`);
    }
  } else {
    console.log('✗ No ESG iframe found');
  }
  
  // Check for JavaScript errors in the page
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🔴 Console error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    console.log(`🔴 Page error: ${err.message}`);
  });
  
  // Wait for any deferred errors
  await page.waitForTimeout(1000);
});

test('ESG demo iframe direct load test', async ({ page }) => {
  // Test direct iframe URL
  const iframeUrl = 'http://localhost:8080/portfolio/esg-compliance-auditor/frontend/dist/';
  await page.goto(iframeUrl, { waitUntil: 'networkidle' });
  
  console.log(`✓ Direct iframe URL loaded: ${iframeUrl}`);
  
  const title = await page.title();
  console.log(`Iframe page title: ${title}`);
  
  // Check for React/main app element
  const appRoot = page.locator('#root, [data-react-root], .app, main');
  const count = await appRoot.count();
  console.log(`Found ${count} potential app root element(s)`);
  
  // Look for buttons or interactive elements
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log(`Found ${buttonCount} button(s)`);
  
  // Check page content
  const bodyText = await page.innerText('body');
  const lines = bodyText.split('\n').slice(0, 5);
  console.log(`First few lines of content:\n${lines.join('\n')}`);
});
