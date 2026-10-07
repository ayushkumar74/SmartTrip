const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'demo@smarttrip.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Wait for the URL to change to dashboard, without waiting for 'load'
    await page.waitForURL('**/dashboard', { waitUntil: 'domcontentloaded' });
    console.log('Login successful.');

    console.log('Navigating to My Trips...');
    await page.goto('http://localhost:5173/my-trips', { waitUntil: 'domcontentloaded' });
    
    // Wait for trips to render
    await page.waitForSelector('text=Upcoming');
    
    const bookingLinks = await page.$$('a[href^="/bookings/"]');
    if (bookingLinks.length === 0) {
      console.log('No bookings found. Try to find a hotel or flight booking link.');
      await browser.close();
      return;
    }

    const href = await bookingLinks[0].getAttribute('href');
    console.log(`Navigating to booking: ${href}`);

    await page.goto(`http://localhost:5173${href}`, { waitUntil: 'domcontentloaded' });
    
    // Wait for "Cancel Booking" button
    const cancelBtn = await page.waitForSelector('button:has-text("Cancel Booking")', { timeout: 5000 }).catch(() => null);
    if (!cancelBtn) {
      console.log('Cancel Booking button not found. It might be already cancelled.');
      await browser.close();
      return;
    }

    // Accept any dialog
    page.on('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept();
    });

    console.log('Clicking Cancel Booking...');
    await cancelBtn.click();
    
    // Wait for a little bit to see what happens
    await page.waitForTimeout(2000);
    
    // Check if there is an error message
    const errorMsg = await page.$('.text-red-600');
    if (errorMsg) {
      console.log('Error message found:', await errorMsg.textContent());
    } else {
      const isCancelled = await page.$('text="CANCELLED"');
      if (isCancelled) {
        console.log('Status updated to CANCELLED successfully!');
      } else {
        console.log('Status did not update to CANCELLED. Still processing?');
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
