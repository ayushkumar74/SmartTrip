const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'demo@smarttrip.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard', { waitUntil: 'domcontentloaded' });
    console.log('Login successful.');

    console.log('Navigating to My Trips...');
    await page.goto('http://localhost:5173/my-trips', { waitUntil: 'domcontentloaded' });
    
    await page.waitForSelector('text=Upcoming');
    
    const bookingLinks = await page.$$('a[href^="/bookings/"]');
    if (bookingLinks.length === 0) {
      console.log('No bookings found to cancel. Exiting.');
      await browser.close();
      return;
    }

    const href = await bookingLinks[0].getAttribute('href');
    console.log(`Navigating to booking: ${href}`);

    await page.goto(`http://localhost:5173${href}`, { waitUntil: 'domcontentloaded' });
    
    // Check if Cancel Booking button exists
    const cancelBtn = await page.waitForSelector('button:has-text("Cancel Booking")', { timeout: 5000 }).catch(() => null);
    
    if (cancelBtn) {
        // Accept any dialog
        page.on('dialog', async dialog => {
          console.log(`Dialog message: ${dialog.message()}`);
          await dialog.accept();
        });

        console.log('Clicking Cancel Booking...');
        await cancelBtn.click();
        
        await page.waitForTimeout(3000); // Wait for the cancel API to complete
    } else {
        console.log('Cancel Booking button not found. Assuming already cancelled.');
    }

    // Take screenshot
    const screenshotPath = 'C:\\Users\\ayush\\.gemini\\antigravity-ide\\brain\\3592ba0a-b125-4b53-b85c-1a4632ba4648\\final_cancel_test.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);

    // Verify refund visibility
    const isCancelled = await page.$('text="CANCELLED"');
    if (isCancelled) console.log('Status is CANCELLED.');

    const isRefunded = await page.$('text="SUCCEEDED"');
    if (isRefunded) console.log('Refund status is SUCCEEDED.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
