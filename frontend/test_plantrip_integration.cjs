const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('--- LOGGING IN ---');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'demo@smarttrip.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('Login successful.');

    console.log('--- TESTING PLAN TRIP ---');
    await page.goto('http://localhost:5173/plan', { waitUntil: 'domcontentloaded' });
    
    // Step 1
    await page.fill('input[placeholder="e.g. Paris, Tokyo, Bali..."]', 'Goa');
    await page.waitForTimeout(2000); // wait for suggestions
    await page.click('text=Goa'); // click suggestion
    await page.waitForTimeout(500);
    await page.click('button:has-text("Continue")');
    console.log('Step 1 complete');

    // Step 2
    // Set some dates
    await page.fill('input[type="date"]', '2026-10-10'); // This is a bit tricky, let's just click Continue if there are defaults.
    // wait, they are required. I'll use standard typing.
    const dateInputs = await page.$$('input[type="date"]');
    await dateInputs[0].fill('2026-10-10');
    await dateInputs[1].fill('2026-10-15');
    
    await page.click('button:has-text("Continue")');
    console.log('Step 2 complete');

    // Step 3
    // click some interests
    const buttons = await page.$$('button.rounded-xl.border-2.transition-all');
    if (buttons.length > 0) {
      await buttons[0].click();
    }
    await page.click('button:has-text("Continue")');
    console.log('Step 3 complete');

    // Step 4
    await page.waitForSelector('button:has-text("Save Trip")');
    await page.click('button:has-text("Save Trip")');
    
    await page.waitForSelector('text=Trip Saved Successfully', { timeout: 5000 });
    console.log('Trip saved successfully!');

    console.log('--- VERIFYING PERSISTENCE ---');
    await page.goto('http://localhost:5173/trips', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const tripFound = await page.isVisible('text=Trip to Goa');
    if (tripFound) {
      console.log('Persistence verified! Trip appears in My Trips.');
    } else {
      throw new Error('Trip not found in My Trips');
    }

    console.log('All Plan Trip E2E tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
