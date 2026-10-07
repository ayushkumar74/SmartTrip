import prisma from './src/config/prisma.js';

const base = 'http://localhost:5000/api/v1';
const runId = Date.now().toString(36);
const password = `WishlistSmoke-${runId}!`;
const emails = [`wishlist-smoke-a-${runId}@example.test`, `wishlist-smoke-b-${runId}@example.test`];
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
  let wishlistId;
  try {
    const ownerCookie = await registerLogin(emails[0], `Wishlist Smoke A ${runId}`);
    const otherCookie = await registerLogin(emails[1], `Wishlist Smoke B ${runId}`);
    const destination = await prisma.destination.findFirst({ select: { id: true } });
    assert(destination, 'seeded destination not found');

    let result = await request('/wishlist');
    assert(result.response.status === 401, 'unauthenticated wishlist access was not rejected');

    result = await request('/wishlist', { method: 'POST', body: JSON.stringify({ type: 'destination', itemId: destination.id }) }, ownerCookie);
    assert(result.response.status === 201, `wishlist add failed: ${JSON.stringify(result.body)}`);
    wishlistId = result.body.data.item.id;

    const duplicate = await request('/wishlist', { method: 'POST', body: JSON.stringify({ type: 'destination', itemId: destination.id }) }, ownerCookie);
    assert(duplicate.response.status === 201 && duplicate.body.data.item.id === wishlistId, 'duplicate add did not reuse the existing wishlist record');

    result = await request('/wishlist', {}, ownerCookie);
    assert(result.response.status === 200 && result.body.data.items.length === 1, 'owner wishlist did not contain exactly one item');
    assert(result.body.data.items[0].destination?.id === destination.id, 'wishlist entity type/id contract was incorrect');
    console.log('LIST AND DUPLICATE ADD: PASS');

    result = await request('/wishlist', {}, otherCookie);
    assert(result.response.status === 200 && result.body.data.items.length === 0, 'other user saw owner wishlist');
    result = await request(`/wishlist/${wishlistId}`, { method: 'DELETE' }, otherCookie);
    assert(result.response.status === 404, `other user removed owner wishlist item with ${result.response.status}`);
    console.log('OWNERSHIP: PASS');

    result = await request(`/wishlist/${wishlistId}`, { method: 'DELETE' }, ownerCookie);
    assert(result.response.status === 200, `owner remove failed: ${JSON.stringify(result.body)}`);
    result = await request('/wishlist', {}, ownerCookie);
    assert(result.response.status === 200 && result.body.data.items.length === 0, 'removed wishlist item remained visible');
    console.log('REMOVE: PASS');
  } finally {
    const users = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
    const userIds = users.map((user) => user.id);
    if (userIds.length) await prisma.wishlist.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    assert(await prisma.user.count({ where: { email: { in: emails } } }) === 0, 'temporary wishlist users remain after cleanup');
    console.log('CLEANUP: PASS');
  }
}

main().catch((error) => { console.error(`WISHLIST SMOKE FAILED: ${error.message}`); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
