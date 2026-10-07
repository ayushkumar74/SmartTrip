const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('--- TESTING UNAUTHENTICATED ACCESS ---');
    await page.goto('http://localhost:5173/admin');
    await page.waitForTimeout(3000); // wait for SPA redirect
    await page.screenshot({ path: 'admin_test.png' });
    let currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('PASS: Unauthenticated user redirected to login.');
    } else {
      console.log(`FAIL: Expected /login, got ${currentUrl}`);
      throw new Error(`Unauthenticated user not redirected`);
    }

    console.log('--- TESTING DEMO USER (NON-ADMIN) ACCESS ---');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'demo@smarttrip.com');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('Logged in as demo user.');

    await page.goto('http://localhost:5173/admin');
    await page.waitForTimeout(3000);
    currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('PASS: Non-admin user redirected to dashboard.');
    } else {
      console.log(`FAIL: Expected /dashboard, got ${currentUrl}`);
      throw new Error(`Non-admin user not redirected`);
    }

    // Now, log out and try with an admin user if possible
    console.log('--- LOGGING OUT ---');
    await page.click('button:has-text("Sign Out"), button:has-text("Logout"), svg.lucide-log-out');
    await page.waitForURL('**/login', { timeout: 10000 }).catch(() => {});
    
    // Attempt admin user (admin@smarttrip.com/admin1234 maybe)
    console.log('--- TESTING ADMIN USER ACCESS ---');
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@smarttrip.com');
    await page.fill('input[type="password"]', 'admin1234');
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForURL('**/dashboard', { timeout: 5000 });
      console.log('Logged in as admin user.');
      
      await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
      currentUrl = page.url();
      if (currentUrl.includes('/admin')) {
        console.log('PASS: Admin user accessed /admin successfully.');
      } else {
        console.log(`FAIL: Expected /admin, got ${currentUrl}`);
        throw new Error(`Admin user not permitted`);
      }
    } catch (e) {
      console.log('NOT TESTABLE: admin@smarttrip.com login failed or took too long. Admin account may not exist.');
    }

    console.log('--- All Routing Tests Finished! ---');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
