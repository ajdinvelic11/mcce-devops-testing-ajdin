const { test, expect } = require('@playwright/test');

test('GET /api/members returns seeded members', async ({ request }) => {
  const response = await request.get('/api/members');

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(Array.isArray(body)).toBeTruthy();
  expect(body.length).toBeGreaterThan(50);
});

test('GET /api/loans returns seeded loans', async ({ request }) => {
  const response = await request.get('/api/loans');

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(Array.isArray(body)).toBeTruthy();
  expect(body.length).toBeGreaterThan(50);
});

test('GET /api/reservations returns seeded reservations', async ({ request }) => {
  const response = await request.get('/api/reservations');

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(Array.isArray(body)).toBeTruthy();
  expect(body.length).toBeGreaterThan(50);
});

test('POST /api/members rejects missing name', async ({ request }) => {
  const response = await request.post('/api/members', {
    data: {
      email: `missing.name.${Date.now()}@example.com`,
    },
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);
});

test('POST /api/members rejects missing email', async ({ request }) => {
  const response = await request.post('/api/members', {
    data: {
      name: 'Missing Email Member',
    },
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);
});

test('POST /api/loans rejects unknown member', async ({ request }) => {
  const response = await request.post('/api/loans', {
    data: {
      bookId: 1,
      memberId: 999999,
    },
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);
});

test('POST /api/loans rejects unknown book', async ({ request }) => {
  const memberResponse = await request.post('/api/members', {
    data: {
      name: 'Unknown Book Test Member',
      email: `unknown.book.${Date.now()}@example.com`,
    },
  });

  expect(memberResponse.status()).toBe(201);

  const member = await memberResponse.json();

  const response = await request.post('/api/loans', {
    data: {
      bookId: 999999,
      memberId: member.id,
    },
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);
});