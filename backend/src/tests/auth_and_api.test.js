import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';

let authToken = '';

test.before(async () => {
  await connectDB();
});

test.after(async () => {
  await disconnectDB();
});

test('Health check endpoint returns status ok', async () => {
  const res = await request(app).get('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'ok');
});

test('Mock endpoints return simulated external cases', async () => {
  const rbRes = await request(app).get('/mock/rb/cases');
  assert.strictEqual(rbRes.status, 200);
  assert.ok(Array.isArray(rbRes.body.cases));
  assert.ok(rbRes.body.cases.length > 0);

  const pgrcRes = await request(app).get('/mock/pgrc/cases');
  assert.strictEqual(pgrcRes.status, 200);
  assert.ok(Array.isArray(pgrcRes.body.grievances));
  assert.ok(pgrcRes.body.grievances.length > 0);
});

test('Auth: Login with valid credentials returns JWT token', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@aicte.gov.in', password: 'Password@123' });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.token);
  assert.strictEqual(res.body.user.role, 'super_admin');
  authToken = res.body.token;
});

test('Auth: Login with invalid password returns 401', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@aicte.gov.in', password: 'WrongPassword' });

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('Auth: GET /api/me returns current authenticated user', async () => {
  const res = await request(app)
    .get('/api/me')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.user.email, 'admin@aicte.gov.in');
});

test('Dashboard: GET /api/dashboard/summary returns KPI counts', async () => {
  const res = await request(app)
    .get('/api/dashboard/summary')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.totalReceived > 0);
  assert.ok(res.body.data.activeOverlaps > 0);
});

test('Dashboard: GET /api/dashboard/bureau-workload returns breakdown', async () => {
  const res = await request(app)
    .get('/api/dashboard/bureau-workload')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 6);
});

test('Cases: GET /api/cases returns paginated cases with filters', async () => {
  const res = await request(app)
    .get('/api/cases?limit=10&page=1')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.length, 10);
  assert.ok(res.body.pagination.total > 0);
});

test('Cases: Filter cases by status', async () => {
  const res = await request(app)
    .get('/api/cases?status=disposed')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  res.body.data.forEach((c) => {
    assert.strictEqual(c.status, 'disposed');
  });
});

test('Overlaps: GET /api/overlaps returns active cross-bureau overlap groups', async () => {
  const res = await request(app)
    .get('/api/overlaps?status=open')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);
});

test('Reports: GET /api/reports/bureau (JSON and CSV export)', async () => {
  const jsonRes = await request(app)
    .get('/api/reports/bureau?format=json')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(jsonRes.status, 200);
  assert.ok(Array.isArray(jsonRes.body.data));

  const csvRes = await request(app)
    .get('/api/reports/bureau?format=csv')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(csvRes.status, 200);
  assert.ok(csvRes.headers['content-type'].includes('text/csv'));
  assert.ok(csvRes.text.includes('_id'));
});

test('Admin: GET and PUT /api/admin/sla-rules', async () => {
  const getRes = await request(app)
    .get('/api/admin/sla-rules')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(getRes.status, 200);
  assert.ok(Array.isArray(getRes.body.data));

  const putRes = await request(app)
    .put('/api/admin/sla-rules')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      category: 'Fee Issues',
      daysToDispose: 28,
      reminderAfterDays: 7,
      dueSoonDays: 3,
      escalateAfterDaysOverdue: 7,
    });

  assert.strictEqual(putRes.status, 200);
  assert.strictEqual(putRes.body.data.daysToDispose, 28);
});
