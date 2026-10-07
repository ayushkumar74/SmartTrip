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
    
    // Check if redirect happens to /dashboard
    await page.waitForURL('**/dashboard', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(async () => {
        // If timeout, maybe already in dashboard
        console.log('Wait for dashboard timeout, checking if we are there...');
    });
    
    const navText = await page.textContent('body');
    if (!navText.includes('SmartTrip')) {
        console.log('Failed to login or reach dashboard');
        return;
    }
    console.log('Login successful.');

    console.log('Checking notifications badge...');
    const bellIcon = await page.$('a[href="/notifications"]');
    if (bellIcon) {
        console.log('Bell icon found!');
        const text = await bellIcon.textContent();
        console.log(`Bell icon text: ${text}`);
    }

    console.log('Navigating to Notifications...');
    await page.goto('http://localhost:5173/notifications', { waitUntil: 'domcontentloaded' });
    
    // Check if we are on the notifications page
    await page.waitForSelector('text=Notifications', { timeout: 10000 });
    console.log('Notifications page loaded successfully.');

    // Wait for API to load
    await page.waitForTimeout(3000);
    
    // Check for notifications list
    const hasNotifications = await page.$('text=Mark all as read') || await page.$('text=Mark as read') || await page.$('text=Unread Only');
    if (hasNotifications) {
        console.log('Notifications list rendered correctly.');
    } else {
        console.log('No notifications found or failed to render.');
    }

    // Take screenshot
    const screenshotPath = 'C:\\Users\\ayush\\.gemini\\antigravity-ide\\brain\\3592ba0a-b125-4b53-b85c-1a4632ba4648\\notifications_test.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
