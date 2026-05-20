import { test, expect } from '@playwright/test';

test('ESG demo - check backend connectivity', async ({ page }) => {
  // Navigate directly to the iframe
  const iframeUrl = 'http://localhost:8080/portfolio/esg-compliance-auditor/frontend/dist/';
  await page.goto(iframeUrl, { waitUntil: 'domcontentloaded' });
  
  console.log('✓ ESG frontend loaded');
  
  // Capture network requests and errors
  const failedRequests = [];
  const successRequests = [];
  
  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push({
        url: response.url(),
        status: response.status()
      });
      console.log(`❌ Failed request: ${response.status()} ${response.url()}`);
    } else {
      successRequests.push(response.url());
    }
  });
  
  page.on('requestfailed', request => {
    console.log(`🔴 Request failed: ${request.url()}`);
    console.log(`   Failure: ${request.failure().errorText}`);
    failedRequests.push({
      url: request.url(),
      error: request.failure().errorText
    });
  });
  
  // Try to click a button or trigger API call
  const analyzeBtn = page.locator('button:has-text("Analyze"), button:has-text("Submit"), button:has-text("Upload"), button:contains("Analyze")').first();
  const buttonCount = await page.locator('button').count();
  console.log(`Found ${buttonCount} button(s) on page`);
  
  if (buttonCount > 0) {
    const buttons = await page.locator('button').allTextContents();
    console.log(`Button texts: ${buttons.join(', ')}`);
    
    // Click the first button
    const firstButton = page.locator('button').first();
    try {
      await firstButton.click();
      console.log('✓ Clicked first button');
      
      // Wait for any network activity
      await page.waitForTimeout(2000);
    } catch (err) {
      console.log(`Could not click button: ${err.message}`);
    }
  }
  
  // Wait a bit more for requests
  await page.waitForTimeout(1000);
  
  console.log(`\n📊 Request Summary:`);
  console.log(`   Successful: ${successRequests.length}`);
  console.log(`   Failed: ${failedRequests.length}`);
  
  if (failedRequests.length > 0) {
    console.log(`\n❌ Failed/errored requests:`);
    failedRequests.forEach(req => {
      console.log(`   - ${req.url || req.error}`);
    });
  }
  
  // Check for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log(`🔴 Console error: ${msg.text()}`);
    }
  });
  
  await page.waitForTimeout(500);
  
  if (errors.length === 0) {
    console.log('✓ No console errors detected');
  }
  
  // Check if backend is reachable
  try {
    const backendResponse = await page.request.get('http://localhost:5000/health', { timeout: 5000 });
    console.log(`✓ Backend health check: ${backendResponse.status()}`);
  } catch (err) {
    console.log(`❌ Backend unreachable: ${err.message}`);
    console.log('\n💡 FIX: Start the backend server with:');
    console.log('   cd _site/portfolio/esg-compliance-auditor/backend');
    console.log('   npm install');
    console.log('   node server.js');
  }
});
