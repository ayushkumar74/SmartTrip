import prisma from './src/config/prisma.js';

const base = 'http://localhost:5000/api/v1';
const runId = Date.now().toString(36);
const password = `PreferencesSmoke-${runId}!`;
const emails = [`preferences-smoke-a-${runId}@example.test`, `preferences-smoke-b-${runId}@example.test`];
const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function request(path, options = {}, cookie = '') {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (cookie) headers.Cookie = cookie;
  const response = await fetch(`${base}${path}`, { ...options, headers });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { response, body };
}

async function registerLogin(email, name) {
  let result = await request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  assert(result.response.status === 201, `register failed: ${JSON.stringify(result.body)}`);
  result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  assert(result.response.status === 200, `login failed: ${JSON.stringify(result.body)}`);
  return (result.response.headers.getSetCookie?.() || []).map((value) => value.split(';')[0]).join('; ');
}

async function main() {
  try {
    const ownerCookie = await registerLogin(emails[0], `Preferences Smoke A ${runId}`);
    const otherCookie = await registerLogin(emails[1], `Preferences Smoke B ${runId}`);

    let result = await request('/users/preferences');
    assert(result.response.status === 401, 'unauthenticated preferences access was not rejected');

    result = await request('/users/preferences', {}, ownerCookie);
    assert(result.response.status === 200, `preferences GET failed: ${JSON.stringify(result.body)}`);
    assert(result.body.data.preferences.bookingNotifications === true && result.body.data.preferences.paymentNotifications === true && result.body.data.preferences.tripNotifications === true, 'preference defaults were not preserved');

    result = await request('/users/preferences', { method: 'PATCH', body: JSON.stringify({ travelStyles: ['Beach', 'Adventure'], budgetLevel: 'Mid-range' }) }, ownerCookie);
    assert(result.response.status === 200, `travel preference update failed: ${JSON.stringify(result.body)}`);

    result = await request('/users/preferences', { method: 'PATCH', body: JSON.stringify({ bookingNotifications: false, paymentNotifications: false, tripNotifications: true }) }, ownerCookie);
    assert(result.response.status === 200, `notification preference update failed: ${JSON.stringify(result.body)}`);

    result = await request('/users/preferences', {}, ownerCookie);
    const preferences = result.body.data.preferences;
    assert(preferences.travelStyles.join(',') === 'Beach,Adventure' && preferences.budgetLevel === 'Mid-range', 'travel preferences did not persist');
    assert(preferences.bookingNotifications === false && preferences.paymentNotifications === false && preferences.tripNotifications === true, 'notification preferences did not persist');
    console.log('PREFERENCE PERSISTENCE: PASS');

    result = await request('/users/preferences', { method: 'PATCH', body: JSON.stringify({ travelStyles: ['Beach', 7] }) }, ownerCookie);
    assert(result.response.status === 400, 'invalid travelStyles was accepted');
    result = await request('/users/preferences', { method: 'PATCH', body: JSON.stringify({ bookingNotifications: 'false' }) }, ownerCookie);
    assert(result.response.status === 400, 'invalid notification preference was accepted');
    console.log('PREFERENCE VALIDATION: PASS');

    result = await request('/users/preferences', {}, otherCookie);
    assert(result.response.status === 200, 'second user preferences GET failed');
    assert(result.body.data.preferences.travelStyles.length === 0 && result.body.data.preferences.budgetLevel === null, 'user preferences were not isolated');
    console.log('OWNERSHIP ISOLATION: PASS');
  } finally {
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    assert(await prisma.user.count({ where: { email: { in: emails } } }) === 0, 'temporary preference users remain after cleanup');
    console.log('CLEANUP: PASS');
  }
}

main().catch((error) => { console.error(`PREFERENCES SMOKE FAILED: ${error.message}`); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
