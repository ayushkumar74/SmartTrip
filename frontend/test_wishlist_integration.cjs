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

    console.log('--- TESTING EXPLORE WISHLIST ---');
    await page.goto('http://localhost:5173/explore', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000); // let destinations load
    let heartButtons = await page.$$('button:has(svg.lucide-heart)');
    if (heartButtons.length > 0) {
      await heartButtons[0].click();
      console.log('Clicked heart button to add destination to wishlist.');
      await page.waitForTimeout(2000);
    } else {
      throw new Error('No heart buttons found on explore page.');
    }

    await page.goto('http://localhost:5173/wishlist', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    let wishlistItems = await page.$$('button:has(svg.lucide-heart)');
    if (wishlistItems.length > 0) {
      console.log('Destination successfully appeared in wishlist! Removing it...');
      await wishlistItems[0].click();
      await page.waitForTimeout(2000);
    } else {
      throw new Error('Destination did not appear in wishlist.');
    }

    console.log('--- TESTING HOTEL WISHLIST ---');
    await page.goto('http://localhost:5173/hotels?search=Goa&in=2026-12-01&out=2026-12-05&adults=2', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000); // let hotels search complete
    heartButtons = await page.$$('button:has(svg.lucide-heart)');
    if (heartButtons.length > 0) {
      await heartButtons[0].click();
      console.log('Clicked heart button to add hotel to wishlist.');
      await page.waitForTimeout(2000);
    } else {
      throw new Error('No heart buttons found on hotels page.');
    }

    await page.goto('http://localhost:5173/wishlist', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    wishlistItems = await page.$$('button:has(svg.lucide-heart)');
    if (wishlistItems.length > 0) {
      console.log('Hotel successfully appeared in wishlist! Removing it...');
      await wishlistItems[0].click();
      await page.waitForTimeout(2000);
    } else {
      throw new Error('Hotel did not appear in wishlist.');
    }

    console.log('--- TESTING PACKAGE WISHLIST ---');
    await page.goto('http://localhost:5173/packages', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000); // let packages load
    heartButtons = await page.$$('button:has(svg.lucide-heart)');
    if (heartButtons.length > 0) {
      // Test duplicate protection
      console.log('Testing duplicate protection (rapid clicks)...');
      await heartButtons[0].click();
      await heartButtons[0].click();
      await heartButtons[0].click();
      console.log('Clicked heart button multiple times to add package to wishlist.');
      await page.waitForTimeout(2000);
    } else {
      throw new Error('No heart buttons found on packages page.');
    }

    await page.goto('http://localhost:5173/wishlist', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    wishlistItems = await page.$$('button:has(svg.lucide-heart)');
    if (wishlistItems.length === 1) {
      console.log('Package successfully appeared in wishlist exactly ONCE (duplicate protection passed)! Removing it...');
      await wishlistItems[0].click();
      await page.waitForTimeout(2000);
    } else if (wishlistItems.length > 1) {
      throw new Error('Duplicate wishlist items created!');
    } else {
      throw new Error('Package did not appear in wishlist.');
    }

    console.log('All wishlist E2E tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
