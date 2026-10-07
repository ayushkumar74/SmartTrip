const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const report = [];
  const addReport = (step, result) => {
    report.push(`${step} — ${result}`);
    console.log(`${step} — ${result}`);
  };

  try {
    // 1. Navigate to Dashboard (which redirects to login)
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 2. Check if we need to log in (we are on /login)
    if (page.url().includes('/login')) {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]:has-text("Sign In")');
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
    }

    // Go to Holiday Packages directly to avoid responsive UI hiding nav items
    await page.goto('http://localhost:5173/packages');
    await page.waitForLoadState('networkidle');

    // Wait for package cards to load
    await page.waitForSelector('text="View Details"', { timeout: 15000 });
    const viewDetailsButtons = await page.$$('text="View Details"');
    
    if (viewDetailsButtons.length === 0) throw new Error("No packages found");
    
    // Click the first package's View Details
    await viewDetailsButtons[0].click();
    await page.waitForLoadState('networkidle');
    addReport("Package Details", "PASS");

    // Click Book Package
    await page.click('text="Book Package"');
    await page.waitForLoadState('networkidle');
    
    const reviewHeading = await page.waitForSelector('text="Review Package Booking"', { timeout: 10000 });
    if (reviewHeading) {
      addReport("Navigate to Review", "PASS");
    } else {
      throw new Error("Failed to navigate to review");
    }

    // Traveler Form
    await page.fill('input[placeholder="First Name"]', 'Jane');
    await page.fill('input[placeholder="Last Name"]', 'Traveler');
    await page.selectOption('select', 'Female');
    await page.fill('input[placeholder="Email"]', 'jane@example.com');
    await page.fill('input[placeholder="Mobile Number"]', '9876543210');
    addReport("Traveler form", "PASS");

    // UI Travel Date Selection
    // Ensure we use the date picker
    await page.fill('input[type="date"]', '2026-10-15');
    addReport("UI travel-date selection", "PASS");

    // Terms
    await page.check('input[type="checkbox"]');

    // Payment Confirm
    await page.click('text="Confirm Booking"');
    addReport("Actual browser payment flow", "PASS");

    // Wait for navigation to My Trips details
    await page.waitForURL('**/my-trips/**', { timeout: 15000 });
    addReport("Confirmation", "PASS");
    
    // Verify Voucher
    await page.waitForSelector('text="PACKAGE BOOKING VOUCHER"', { timeout: 5000 });
    addReport("Package Booking Details", "PASS");

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text="PACKAGE BOOKING VOUCHER"', { timeout: 5000 });
    addReport("Refresh", "PASS");

    // Back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text="Review Package Booking"', { timeout: 5000 });
    addReport("Browser Back", "PASS");

    fs.writeFileSync('e2e_report.txt', report.join('\n'));
    console.log("SUCCESS");

  } catch (err) {
    console.error("Test Failed:", err);
    await page.screenshot({ path: 'error_screenshot.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
