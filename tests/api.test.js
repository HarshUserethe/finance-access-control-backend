/**
 * Integration Tests
 * -------------------
 * Uses supertest to exercise the API end-to-end.
 */

const request = require('supertest');
const app = require('../src/app');

let adminToken;
let analystToken;
let viewerToken;
let createdRecordId;
let createdUserId;

// ════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════

describe('Auth Endpoints', () => {
  test('POST /api/auth/login — admin login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@finance.com', password: 'Admin@123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    adminToken = res.body.data.token;
  });

  test('POST /api/auth/login — analyst login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'analyst@finance.com', password: 'Analyst@123' });

    expect(res.statusCode).toBe(200);
    analystToken = res.body.data.token;
  });

  test('POST /api/auth/login — viewer login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@finance.com', password: 'Viewer@123' });

    expect(res.statusCode).toBe(200);
    viewerToken = res.body.data.token;
  });

  test('POST /api/auth/login — invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@finance.com', password: 'wrong' });

    expect(res.statusCode).toBe(401);
  });

  test('POST /api/auth/login — inactive user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inactive@finance.com', password: 'Inactive@123' });

    expect(res.statusCode).toBe(403);
  });

  test('POST /api/auth/register — new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@finance.com',
      password: 'Test@123',
      role: 'viewer',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.email).toBe('test@finance.com');
    createdUserId = res.body.data.user.id;
  });

  test('POST /api/auth/register — duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dup User',
      email: 'admin@finance.com',
      password: 'Test@123',
    });

    expect(res.statusCode).toBe(409);
  });

  test('POST /api/auth/register — validation error', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad' });

    expect(res.statusCode).toBe(400);
  });

  test('GET /api/auth/me — authenticated', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe('admin@finance.com');
  });

  test('GET /api/auth/me — no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});

// ════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════

describe('User Endpoints (Admin)', () => {
  test('GET /api/users — list users', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test('GET /api/users — filter by role', async () => {
    const res = await request(app)
      .get('/api/users?role=admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    res.body.data.forEach((u) => expect(u.role).toBe('admin'));
  });

  test('GET /api/users — search', async () => {
    const res = await request(app)
      .get('/api/users?search=admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/users/:id — get single user', async () => {
    const res = await request(app)
      .get('/api/users/usr_001')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.id).toBe('usr_001');
  });

  test('GET /api/users/:id — not found', async () => {
    const res = await request(app)
      .get('/api/users/nonexistent')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });

  test('PATCH /api/users/:id — update user status', async () => {
    const res = await request(app)
      .patch('/api/users/usr_002')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Jane Analyst Updated' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.name).toBe('Jane Analyst Updated');
  });

  test('GET /api/users — viewer denied', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(403);
  });
});

// ════════════════════════════════════════════════════
// RECORDS
// ════════════════════════════════════════════════════

describe('Record Endpoints', () => {
  test('POST /api/records — admin creates record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 1500,
        type: 'income',
        category: 'freelance',
        date: '2025-03-28',
        description: 'Test income entry',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.record.amount).toBe(1500);
    createdRecordId = res.body.data.record.id;
  });

  test('POST /api/records — viewer denied', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        amount: 100,
        type: 'expense',
        category: 'food',
        date: '2025-03-28',
      });

    expect(res.statusCode).toBe(403);
  });

  test('POST /api/records — validation error', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: -500, type: 'invalid' });

    expect(res.statusCode).toBe(400);
  });

  test('GET /api/records — list all records', async () => {
    const res = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test('GET /api/records — filter by type', async () => {
    const res = await request(app)
      .get('/api/records?type=income')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    res.body.data.forEach((r) => expect(r.type).toBe('income'));
  });

  test('GET /api/records — filter by category', async () => {
    const res = await request(app)
      .get('/api/records?category=rent')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    res.body.data.forEach((r) => expect(r.category).toBe('rent'));
  });

  test('GET /api/records — date range filter', async () => {
    const res = await request(app)
      .get('/api/records?startDate=2025-02-01&endDate=2025-02-28')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/records — search', async () => {
    const res = await request(app)
      .get('/api/records?search=salary')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/records — pagination', async () => {
    const res = await request(app)
      .get('/api/records?page=1&limit=3')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
    expect(res.body.totalPages).toBeDefined();
  });

  test('GET /api/records/:id — get single record', async () => {
    const res = await request(app)
      .get('/api/records/rec_001')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.record.id).toBe('rec_001');
  });

  test('PUT /api/records/:id — admin updates record', async () => {
    const res = await request(app)
      .put(`/api/records/${createdRecordId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 2000, description: 'Updated test entry' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.record.amount).toBe(2000);
  });

  test('PUT /api/records/:id — analyst denied', async () => {
    const res = await request(app)
      .put('/api/records/rec_001')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ amount: 9999 });

    expect(res.statusCode).toBe(403);
  });

  test('DELETE /api/records/:id — admin soft-deletes', async () => {
    const res = await request(app)
      .delete(`/api/records/${createdRecordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);
  });

  test('GET /api/records/:id — deleted record not found', async () => {
    const res = await request(app)
      .get(`/api/records/${createdRecordId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});

// ════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════

describe('Dashboard Endpoints', () => {
  test('GET /api/dashboard/summary — viewer can access', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalIncome).toBeDefined();
    expect(res.body.data.totalExpenses).toBeDefined();
    expect(res.body.data.netBalance).toBeDefined();
  });

  test('GET /api/dashboard/category-summary', async () => {
    const res = await request(app)
      .get('/api/dashboard/category-summary')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((c) => {
      expect(c.category).toBeDefined();
      expect(c.income).toBeDefined();
      expect(c.expense).toBeDefined();
    });
  });

  test('GET /api/dashboard/trends — analyst can access', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/dashboard/trends — viewer denied', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('GET /api/dashboard/trends/weekly — admin can access', async () => {
    const res = await request(app)
      .get('/api/dashboard/trends/weekly')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/dashboard/recent-activity', async () => {
    const res = await request(app)
      .get('/api/dashboard/recent-activity?limit=5')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });
});

// ════════════════════════════════════════════════════
// MISC
// ════════════════════════════════════════════════════

describe('Miscellaneous', () => {
  test('GET /api/health — health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Finance API is running');
  });

  test('GET /api/nonexistent — 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  test('POST /api/auth/logout — invalidates token', async () => {
    // Login to get a fresh token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@finance.com', password: 'Viewer@123' });

    const tempToken = loginRes.body.data.token;

    // Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${tempToken}`);

    expect(logoutRes.statusCode).toBe(200);

    // Use the same token — should fail
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tempToken}`);

    expect(meRes.statusCode).toBe(401);
  });
});
