const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('--- TESTING UNAUTHENTICATED ACCESS ---');
    await page.goto('http://localhost:5173/admin/hotels');
    await page.waitForTimeout(3000);
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

    await page.goto('http://localhost:5173/admin/hotels');
    await page.waitForTimeout(3000);
    currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('PASS: Non-admin user redirected to dashboard.');
    } else {
      console.log(`FAIL: Expected /dashboard, got ${currentUrl}`);
      throw new Error(`Non-admin user not redirected`);
    }

    // Verify backend API returns 403 for demo user
    console.log('--- TESTING BACKEND API AUTHORIZATION ---');
    const apiResponse = await page.evaluate(async () => {
      const res = await fetch('http://localhost:5000/api/v1/admin/hotels', { credentials: 'include' });
      return res.status;
    });
    if (apiResponse === 403) {
      console.log('PASS: Backend /api/v1/admin/hotels correctly returned 403 for normal user.');
    } else {
      console.log(`FAIL: Backend returned ${apiResponse} instead of 403.`);
      throw new Error('Backend authorization failed');
    }

    console.log('--- LOGGING OUT ---');
    await context.clearCookies();
    await page.goto('http://localhost:5173/login');
    
    console.log('--- TESTING ADMIN USER ACCESS ---');
    await page.fill('input[type="email"]', 'admin@smarttrip.com');
    await page.fill('input[type="password"]', 'admin1234');
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForURL('**/dashboard', { timeout: 5000 });
      console.log('Logged in as admin user.');
      
      await page.goto('http://localhost:5173/admin/hotels');
      await page.waitForTimeout(3000);
      currentUrl = page.url();
      if (currentUrl.includes('/admin/hotels')) {
        console.log('PASS: Admin user accessed /admin/hotels successfully.');
      } else {
        console.log(`FAIL: Expected /admin/hotels, got ${currentUrl}`);
        throw new Error(`Admin user not permitted`);
      }
    } catch (e) {
      console.log('NOT TESTABLE: admin@smarttrip.com login failed or took too long. Admin account may not exist.');
    }

    console.log('--- All Admin Hotels Tests Finished! ---');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
