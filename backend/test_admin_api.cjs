const fetch = require('node-fetch');

(async () => {
  try {
    console.log('--- TESTING ADMIN API ROLE PROTECTION ---');
    
    // Login as Demo user
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@smarttrip.com', password: 'demo1234' })
    });
    
    const loginData = await loginRes.json();
    const setCookie = loginRes.headers.raw()['set-cookie'];
    if (!setCookie) {
      throw new Error('No Set-Cookie header found in login response');
    }
    const cookieString = setCookie.map(c => c.split(';')[0]).join('; ');
    console.log('Logged in as demo user, cookie retrieved.');

    // Attempt to access admin dashboard
    const adminRes = await fetch('http://localhost:5000/api/v1/admin/dashboard', {
      headers: { 'Cookie': cookieString }
    });

    if (adminRes.status === 403) {
      console.log('PASS: Non-admin user blocked from admin dashboard (403 Forbidden)');
    } else {
      console.log(`FAIL: Non-admin user got status ${adminRes.status}`);
      throw new Error(`Expected 403, got ${adminRes.status}`);
    }

    console.log('--- All Admin API tests passed! ---');
  } catch (err) {
    console.error('Test failed:', err);
  }
})();
