const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to app...");
  await page.goto('http://localhost:5173');

  // Click login if needed
  try {
    await page.waitForSelector('button:has-text("Log In as Demo User")', { timeout: 3000 });
    await page.click('button:has-text("Log In as Demo User")');
    console.log("Logged in as Demo User.");
  } catch (e) {
    console.log("Already logged in or no button.");
  }

  // Go to packages
  console.log("Going to packages...");
  await page.goto('http://localhost:5173/packages');
  
  // Wait for a package card and click it
  await page.waitForSelector('h3:has-text("Magical Maldives Escape")', { timeout: 5000 });
  await page.click('button:has-text("View Details")');

  // Wait for package details
  console.log("On package details, booking...");
  await page.waitForSelector('button:has-text("Book Package")', { timeout: 5000 });
  await page.click('button:has-text("Book Package")');

  // On review page
  console.log("On review page, filling form...");
  await page.waitForSelector('h1:has-text("Review Package Booking")', { timeout: 5000 });

  // Fill date
  await page.evaluate(() => {
    document.querySelector('input[type="date"]').value = '2026-10-15';
    // Trigger React onChange
    const event = new Event('input', { bubbles: true });
    document.querySelector('input[type="date"]').dispatchEvent(event);
    const event2 = new Event('change', { bubbles: true });
    document.querySelector('input[type="date"]').dispatchEvent(event2);
  });

  // Select Gender
  await page.selectOption('select', 'Male');
  
  // Fill Mobile
  await page.fill('input[placeholder="Mobile Number"]', '9876543210');
  
  // Agree terms
  await page.check('input[type="checkbox"]');

  // Submit
  console.log("Submitting booking...");
  await page.click('button:has-text("Confirm Booking")');

  // Wait for redirection to My Trips details page
  console.log("Waiting for redirection...");
  await page.waitForURL('**/my-trips/*', { timeout: 10000 });
  console.log("Redirected to:", page.url());

  // Check if Package Booking Voucher is present
  await page.waitForSelector('text=PACKAGE BOOKING VOUCHER', { timeout: 5000 });
  console.log("Package Booking Voucher rendered successfully!");

  // Go to My Trips
  console.log("Checking My Trips list...");
  await page.goto('http://localhost:5173/my-trips');
  await page.waitForSelector('text=Magical Maldives Escape', { timeout: 5000 });
  console.log("Package card found in My Trips list successfully!");

  await browser.close();
  console.log("E2E Test Passed!");
})();
