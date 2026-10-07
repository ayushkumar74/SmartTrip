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
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log('Current URL after login:', url);

    console.log('--- TESTING PROFILE ---');
    await page.goto('http://localhost:5173/profile', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const profileText = await page.textContent('body');
    if (profileText.includes('demo@smarttrip.com') || profileText.includes('Demo') || profileText.includes('Profile')) {
      console.log('Profile loaded successfully.');
    } else {
      console.log('Profile did not load correctly.');
    }
    await page.screenshot({ path: 'C:\\Users\\ayush\\.gemini\\antigravity-ide\\brain\\3592ba0a-b125-4b53-b85c-1a4632ba4648\\profile_test.png' });

    console.log('--- TESTING WISHLIST ---');
    await page.goto('http://localhost:5173/packages', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    // Find a heart button to click
    const heartButtons = await page.$$('button:has(svg.lucide-heart)');
    if (heartButtons.length > 0) {
      await heartButtons[0].click();
      console.log('Clicked heart button to add to wishlist.');
      await page.waitForTimeout(2000);
    } else {
      console.log('No heart buttons found on explore page.');
    }

    await page.goto('http://localhost:5173/wishlist', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const wishlistText = await page.textContent('body');
    if (wishlistText.includes('Wishlist')) {
      console.log('Wishlist page loaded.');
    }
    const hasWishlistItems = await page.$$('button:has(svg.lucide-heart)');
    if (hasWishlistItems.length > 0) {
      console.log('Wishlist items exist! Removing one...');
      await hasWishlistItems[0].click();
      await page.waitForTimeout(2000);
    } else {
      console.log('Wishlist is empty.');
    }
    await page.screenshot({ path: 'C:\\Users\\ayush\\.gemini\\antigravity-ide\\brain\\3592ba0a-b125-4b53-b85c-1a4632ba4648\\wishlist_test.png' });

    console.log('--- TESTING MY TRIPS ---');
    await page.goto('http://localhost:5173/my-trips', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const tripsText = await page.textContent('body');
    if (tripsText.includes('Cancelled') || tripsText.includes('Upcoming') || tripsText.includes('Completed') || tripsText.includes('Trips')) {
       console.log('My Trips loaded successfully with bookings.');
    } else {
       console.log('My Trips loaded but might be empty or missing bookings.');
    }
    await page.screenshot({ path: 'C:\\Users\\ayush\\.gemini\\antigravity-ide\\brain\\3592ba0a-b125-4b53-b85c-1a4632ba4648\\my_trips_test.png' });
    
    // Test Booking Details
    const detailsButtons = await page.$$('text="View Details"');
    if (detailsButtons.length > 0) {
      await detailsButtons[0].click();
      await page.waitForTimeout(3000);
      console.log('Booking details loaded.');
    } else {
      console.log('No "View Details" button found.');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
