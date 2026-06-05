const { test, expect } = require('@playwright/test');

test('GET /api/books returns seeded books', async ({ request }) => {
  const response = await request.get('/api/books');

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(Array.isArray(body)).toBeTruthy();
  expect(body.length).toBeGreaterThan(50);
});

test('POST /api/members creates a new member', async ({ request }) => {
  const uniqueEmail = `ada.${Date.now()}@example.com`;

  const response = await request.post('/api/members', {
    data: {
      name: 'Ada Lovelace',
      email: uniqueEmail,
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();

  expect(body.name).toBe('Ada Lovelace');
  expect(body.email).toBe(uniqueEmail);
  expect(body.memberNumber).toMatch(/^M\d{4}$/);
});

test('POST /api/loans creates a new loan', async ({ request }) => {
  const memberResponse = await request.post('/api/members', {
    data: {
      name: 'Loan Test Member',
      email: `loan.${Date.now()}@example.com`,
    },
  });

  expect(memberResponse.status()).toBe(201);

  const member = await memberResponse.json();

  const loanResponse = await request.post('/api/loans', {
    data: {
      bookId: 1,
      memberId: member.id,
    },
  });

  expect(loanResponse.status()).toBe(201);

  const loan = await loanResponse.json();

  expect(loan.status).toBe('active');
  expect(loan.memberId).toBe(member.id);
  expect(loan.bookId).toBe(1);
});

test('POST /api/loans/:id/return returns a borrowed book', async ({ request }) => {
  const memberResponse = await request.post('/api/members', {
    data: {
      name: 'Return Test Member',
      email: `return.${Date.now()}@example.com`,
    },
  });

  expect(memberResponse.status()).toBe(201);

  const member = await memberResponse.json();

  const loanResponse = await request.post('/api/loans', {
    data: {
      bookId: 2,
      memberId: member.id,
    },
  });

  expect(loanResponse.status()).toBe(201);

  const loan = await loanResponse.json();

  const returnResponse = await request.post(`/api/loans/${loan.id}/return`);

  expect(returnResponse.status()).toBe(200);

  const returnedLoan = await returnResponse.json();

  expect(returnedLoan.status).toBe('returned');
  expect(returnedLoan.returnDate).not.toBeNull();
});

test('POST /api/loans rejects borrowing when no copies are available', async ({ request }) => {
  const memberResponse = await request.post('/api/members', {
    data: {
      name: 'Negative Test Member',
      email: `negative.${Date.now()}@example.com`,
    },
  });

  expect(memberResponse.status()).toBe(201);

  const member = await memberResponse.json();

  const response = await request.post('/api/loans', {
    data: {
      bookId: 31,
      memberId: member.id,
    },
  });

  expect(response.status()).toBe(409);

  const body = await response.json();

  expect(body.error).toContain('No copies available');
});