import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';

import app from '../app.js';
import {
  User,
  Bureau,
  Institution,
  Case,
  SlaRule,
  OverlapGroup,
} from '../models/index.js';

let mongoServer;
let authToken = '';

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const passwordHash = await bcrypt.hash('Password@123', 8);

  const bureau = await Bureau.create({
    code: 'RB',
    name: 'Regulatory Bureau',
    type: 'bureau',
  });

  const inst = await Institution.create({
    name: 'National College of Engineering',
    normalizedName: 'national college of engineering',
    aictePermanentId: '1-10000002',
    city: 'Chennai',
    state: 'Tamil Nadu',
    region: 'Southern',
  });

  await User.create({
    name: 'Admin User',
    email: 'admin@aicte.gov.in',
    passwordHash,
    role: 'super_admin',
    bureau: bureau._id,
  });

  const now = new Date();
  const testCase = await Case.create({
    caseId: 'AICTE-RB-2026-88001',
    sourceSystem: 'RB',
    sourceCaseRef: 'RB-REF-88001',
    institution: inst._id,
    rawInstitutionName: inst.name,
    category: 'Fee Issues',
    description: 'Sample grievance for testing dashboard',
    receivedDate: now,
    expectedDisposalDate: new Date(now.getTime() + 30 * 86400000),
    status: 'disposed',
    currentBureau: bureau._id,
  });

  await OverlapGroup.create({
    institution: inst._id,
    cases: [testCase._id],
    status: 'open',
    severity: 'medium',
  });

  await SlaRule.create({
    category: 'Fee Issues',
    daysToDispose: 30,
    reminderAfterDays: 7,
    dueSoonDays: 3,
    escalateAfterDaysOverdue: 7,
  });
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
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
    .send({ email: 'admin@aicte.gov.in', password: 'Password@123', portal: 'officer' });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.token);
  assert.strictEqual(res.body.user.role, 'super_admin');
  authToken = res.body.token;
});

test('Auth: Login with invalid password returns 401', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@aicte.gov.in', password: 'WrongPassword', portal: 'officer' });

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

test('Dashboard: GET /api/officer/dashboard/summary returns KPI counts', async () => {
  const res = await request(app)
    .get('/api/officer/dashboard/summary')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.totalReceived >= 1);
  assert.ok(res.body.data.activeOverlaps >= 1);
});

test('Dashboard: GET /api/officer/dashboard/bureau-workload returns breakdown', async () => {
  const res = await request(app)
    .get('/api/officer/dashboard/bureau-workload')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 1);
});

test('Cases: GET /api/officer/cases returns cases with filters', async () => {
  const res = await request(app)
    .get('/api/officer/cases?limit=10&page=1')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.data.length >= 1);
  assert.ok(res.body.pagination.total >= 1);
});

test('Cases: Filter cases by status', async () => {
  const res = await request(app)
    .get('/api/officer/cases?status=disposed')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  res.body.data.forEach((c) => {
    assert.strictEqual(c.status, 'disposed');
  });
});

test('Overlaps: GET /api/officer/overlaps returns active cross-bureau overlap groups', async () => {
  const res = await request(app)
    .get('/api/officer/overlaps?status=open')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 1);
});

test('Reports: GET /api/officer/reports/bureau (JSON and CSV export)', async () => {
  const jsonRes = await request(app)
    .get('/api/officer/reports/bureau?format=json')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(jsonRes.status, 200);
  assert.ok(Array.isArray(jsonRes.body.data));

  const csvRes = await request(app)
    .get('/api/officer/reports/bureau?format=csv')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(csvRes.status, 200);
  assert.ok(csvRes.headers['content-type'].includes('text/csv'));
});

test('Admin: GET and PUT /api/officer/admin/sla-rules', async () => {
  const getRes = await request(app)
    .get('/api/officer/admin/sla-rules')
    .set('Authorization', `Bearer ${authToken}`);

  assert.strictEqual(getRes.status, 200);
  assert.ok(Array.isArray(getRes.body.data));

  const putRes = await request(app)
    .put('/api/officer/admin/sla-rules')
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
