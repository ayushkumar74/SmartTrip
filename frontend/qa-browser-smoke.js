import { chromium } from 'playwright';

const NAVIGATION_TIMEOUT = 30000;
const UI_TIMEOUT = 15000;
const SHORT_UI_TIMEOUT = 5000;

(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.setDefaultTimeout(UI_TIMEOUT);
  page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);
  const errors = [];
  const consoleErrors = [];

  const isExpectedEnvironmentUrl = (url) => url.includes('/api/v1/auth/me') || url.includes('accounts.google.com') || url.includes('gstatic.com/_/gsi');

  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('requestfailed', (e) => {
    const failure = e.failure();
    const entry = 'REQUESTFAILED: ' + e.url() + ' :: ' + (failure ? failure.message : 'unknown');
    if (isExpectedEnvironmentUrl(e.url())) consoleErrors.push(entry);
    else errors.push(entry);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      const entry = `HTTP_${response.status()}: ${response.url()}`;
      if (isExpectedEnvironmentUrl(response.url()) && (response.status() === 401 || response.status() === 403)) consoleErrors.push(entry);
      else errors.push(entry);
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push('BROWSER_ERROR: ' + msg.text());
  });

  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT });
  await page.locator('#email').waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.locator('#email').fill('tester@example.com');
  await page.locator('#password').fill('Password123');
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: NAVIGATION_TIMEOUT });
  await page.locator('#flightFrom').waitFor({ state: 'visible', timeout: UI_TIMEOUT });

  // Dashboard airport/autocomplete + date checks
  await page.locator('#flightFrom').fill('PAT');
  await page.locator('#flightFrom').dispatchEvent('input');
  await page.getByText('Jay Prakash Narayan International Airport').waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByText('Patna, India').waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByText('PAT', { exact: true }).waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.locator('#flightFrom').fill('PAT');
  await page.getByText('Jay Prakash Narayan International Airport').click({ force: true });
  const fromValue = (await page.locator('#flightFrom').inputValue()).trim().toUpperCase();

  await page.locator('#flightTo').fill('DEL');
  await page.locator('#flightTo').dispatchEvent('input');
  await page.getByText('Indira Gandhi International Airport').waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByText('New Delhi, India').waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByText('DEL', { exact: true }).waitFor({ state: 'visible', timeout: UI_TIMEOUT });

  await page.locator('#flightTo').fill('BOM');
  await page.locator('#flightTo').dispatchEvent('input');
  await page.getByText('Chhatrapati Shivaji Maharaj International Airport').waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByText('Mumbai, India').waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByText('BOM', { exact: true }).waitFor({ state: 'visible', timeout: UI_TIMEOUT });

  await page.locator('#flightDep').click();
  await page.getByText('Round Trip').click();
  await page.locator('#flightDep').fill('2030-01-15');
  await page.locator('#flightRet').fill('2030-01-16');
  await page.locator('#flightRet').dispatchEvent('change');
  const depVisible = (await page.locator('#flightDep').evaluate((el) => el.value));

  await page.locator('#flightRet').fill('2030-01-14');
  await page.locator('#flightRet').dispatchEvent('change');
  const retVisible = (await page.locator('#flightRet').evaluate((el) => el.value));

  await page.locator('#flightRet').fill('2030-01-20');

  await page.getByText('Search Flights').click();
  await page.waitForURL('**/flights?*', { timeout: NAVIGATION_TIMEOUT });
  const urlAfterFlights = page.url();

  // Explore page
  await page.goto('http://localhost:5173/explore', { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT });
  await page.getByRole('heading', { name: 'Explore Destinations' }).waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.locator('h2').filter({ hasText: 'Curated Destinations' }).or(page.getByText('No destinations found')).first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });

  // Click each travel style category and ensure filtering works by results label
  const icons = await page.$$('[class*="rounded-2xl p-6"]');
  await page.getByText('Beach Escapes').click();
  await page.getByText('Results for "Beach Escapes"').or(page.getByText('No destinations found')).first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByRole('button', { name: 'Clear Search' }).first().click();

  await page.getByText('Mountain Adventures').click();
  await page.getByText('Results for "Mountain Adventures"').or(page.getByText('No destinations found')).first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByRole('button', { name: 'Clear Search' }).first().click();

  await page.getByText('Romantic Getaways').click();
  await page.getByText('Results for "Romantic Getaways"').or(page.getByText('No destinations found')).first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByRole('button', { name: 'Clear Search' }).first().click();

  await page.getByText('Cultural Experiences').click();
  await page.getByText('Results for "Cultural Experiences"').or(page.getByText('No destinations found')).first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByRole('button', { name: 'Clear Search' }).first().click();

  await page.getByText('Weekend Trips').click();
  await page.getByText('Results for "Weekend Trips"').or(page.getByText('No destinations found')).first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByRole('button', { name: 'Clear Search' }).first().click();

  // Hotels page
  await page.goto('http://localhost:5173/hotels?in=2030-01-15&out=2030-01-18', { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT });
  await page.getByText('Taj Lake Palace').waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByText('Select Room').first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByText('Free Cancellation').first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });

  // Footer links
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT });
  await page.locator('footer').scrollIntoViewIfNeeded();
  const footerLinks = {
    'About Us': '/about',
    'Careers': '/careers',
    'Press': '/press',
    'Investor Relations': '/investor-relations',
    'Manage Bookings': '/manage-bookings',
    'Help Center': '/help-center',
    'Cancellation Policy': '/cancellation-policy',
    'Privacy Policy': '/privacy',
    'Terms of Service': '/terms',
  };

  for (const [text, route] of Object.entries(footerLinks)) {
    const link = page.getByRole('link', { name: text });
    await link.waitFor({ state: 'visible', timeout: UI_TIMEOUT });
    if (!await link.isVisible()) errors.push('FOOTER_LINK_NOT_VISIBLE: ' + text);
    await link.click();
    await page.waitForURL('**' + route, { timeout: NAVIGATION_TIMEOUT });
    await page.getByRole('heading', { name: text }).waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  }

  // UI/UX light/dark checks
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT });
  await page.getByText('From', { exact: true }).waitFor({ state: 'visible', timeout: SHORT_UI_TIMEOUT });
  await page.getByText('To', { exact: true }).waitFor({ state: 'visible', timeout: SHORT_UI_TIMEOUT });

  await page.goto('http://localhost:5173/settings', { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT });
  await page.getByRole('heading', { name: 'Settings' }).waitFor({ state: 'visible', timeout: UI_TIMEOUT });
  await page.getByRole('heading', { name: 'Appearance & Theme' }).waitFor({ state: 'visible', timeout: UI_TIMEOUT });

  await page.getByRole('button', { name: 'dark', exact: true }).click();

  console.log('RESULTS');
  console.log('fromValue=' + fromValue);
  console.log('depVisible=' + depVisible);
  console.log('retVisible=' + retVisible);
  console.log('flightUrl=' + urlAfterFlights);
  console.log('errors=' + errors.join('\n'));
  console.log('expectedEnvironmentWarnings=' + consoleErrors.join('\n'));

  await browser.close();
  if (errors.length > 0) {
    throw new Error(`Browser smoke captured ${errors.length} error(s)`);
  }
})();
