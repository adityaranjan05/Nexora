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
  CaseAction,
  SlaRule,
  OverlapGroup,
} from '../models/index.js';

let mongoServer;
let officerToken = '';
let bureauTokenRB = '';
let bureauTokenPGRC = '';
let studentTokenA = '';
let studentTokenB = '';

let bureauRB;
let bureauPGRC;
let userStudentA;
let userStudentB;
let testInstitution;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const passwordHash = await bcrypt.hash('Password@123', 8);

  // 1. Create Bureaus
  bureauRB = await Bureau.create({
    code: 'RB',
    name: 'Regulatory Bureau',
    type: 'bureau',
  });
  bureauPGRC = await Bureau.create({
    code: 'PGRC',
    name: 'Public Grievance Redressal Cell',
    type: 'cell',
  });

  // 2. Create Institution
  testInstitution = await Institution.create({
    name: 'Apex Institute of Technology & Management',
    normalizedName: 'apex institute of technology management',
    aictePermanentId: '1-10000001',
    city: 'Bengaluru',
    state: 'Karnataka',
    region: 'Southern',
  });

  // 3. Create Users
  const userOfficer = await User.create({
    name: 'Officer Admin',
    email: 'admin@aicte.gov.in',
    passwordHash,
    role: 'super_admin',
  });

  const userBureauRB = await User.create({
    name: 'RB Officer',
    email: 'officer.rb@aicte.gov.in',
    passwordHash,
    role: 'bureau_officer',
    bureau: bureauRB._id,
  });

  const userBureauPGRC = await User.create({
    name: 'PGRC Officer',
    email: 'officer.pgrc@aicte.gov.in',
    passwordHash,
    role: 'bureau_officer',
    bureau: bureauPGRC._id,
  });

  userStudentA = await User.create({
    name: 'Student Alice',
    email: 'student.alice@example.com',
    passwordHash,
    role: 'student',
  });

  userStudentB = await User.create({
    name: 'Student Bob',
    email: 'student.bob@example.com',
    passwordHash,
    role: 'student',
  });

  // 4. Log in to get tokens for each
  const resOfficer = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@aicte.gov.in', password: 'Password@123', portal: 'officer' });
  officerToken = resOfficer.body.token;

  const resBureauRB = await request(app)
    .post('/api/auth/login')
    .send({ email: 'officer.rb@aicte.gov.in', password: 'Password@123', portal: 'bureau' });
  bureauTokenRB = resBureauRB.body.token;

  const resBureauPGRC = await request(app)
    .post('/api/auth/login')
    .send({ email: 'officer.pgrc@aicte.gov.in', password: 'Password@123', portal: 'bureau' });
  bureauTokenPGRC = resBureauPGRC.body.token;

  const resStudentA = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student.alice@example.com', password: 'Password@123', portal: 'student' });
  studentTokenA = resStudentA.body.token;

  const resStudentB = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student.bob@example.com', password: 'Password@123', portal: 'student' });
  studentTokenB = resStudentB.body.token;
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// ============================================================================
// TEST 1: Login with a wrong portal -> 403
// ============================================================================
test('1. Login with a wrong portal returns 403 without revealing password correctness', async () => {
  // Try logging student into officer portal
  const res1 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student.alice@example.com', password: 'Password@123', portal: 'officer' });

  assert.strictEqual(res1.status, 403);
  assert.strictEqual(res1.body.success, false);
  assert.match(res1.body.message, /not registered for the Officer portal/i);

  // Try logging officer into student portal
  const res2 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@aicte.gov.in', password: 'Password@123', portal: 'student' });

  assert.strictEqual(res2.status, 403);
  assert.strictEqual(res2.body.success, false);
  assert.match(res2.body.message, /not registered for the Student portal/i);

  // Try logging bureau officer into officer portal
  const res3 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'officer.rb@aicte.gov.in', password: 'Password@123', portal: 'officer' });

  assert.strictEqual(res3.status, 403);
  assert.strictEqual(res3.body.success, false);
});

// ============================================================================
// TEST 2: Student cannot call /api/officer/* or /api/bureau/*
// ============================================================================
test('2. Student cannot call /api/officer/* or /api/bureau/*', async () => {
  const resOfficer = await request(app)
    .get('/api/officer/cases')
    .set('Authorization', `Bearer ${studentTokenA}`);

  assert.strictEqual(resOfficer.status, 403);
  assert.strictEqual(resOfficer.body.success, false);
  assert.match(resOfficer.body.message, /restricted to the officer portal/i);

  const resBureau = await request(app)
    .get('/api/bureau/cases')
    .set('Authorization', `Bearer ${studentTokenA}`);

  assert.strictEqual(resBureau.status, 403);
  assert.strictEqual(resBureau.body.success, false);
  assert.match(resBureau.body.message, /restricted to the bureau portal/i);
});

// ============================================================================
// TEST 3: Student cannot read another student's case (404/403)
// ============================================================================
test("3. Student cannot read another student's case (404/403)", async () => {
  // Create complaint for Student A
  const caseA = await Case.create({
    caseId: 'AICTE-STU-2026-90001',
    sourceSystem: 'STUDENT_PORTAL',
    sourceCaseRef: 'STU-REF-90001',
    rawInstitutionName: testInstitution.name,
    institution: testInstitution._id,
    category: 'Fee Issues',
    description: 'Complaint filed by Alice',
    complainantType: 'Student',
    receivedDate: new Date(),
    expectedDisposalDate: new Date(Date.now() + 30 * 86400000),
    status: 'pending',
    submittedBy: userStudentA._id,
  });

  // Student A can read her own complaint
  const resAlice = await request(app)
    .get(`/api/student/cases/${caseA._id}`)
    .set('Authorization', `Bearer ${studentTokenA}`);
  assert.strictEqual(resAlice.status, 200);
  assert.strictEqual(resAlice.body.data.caseId, 'AICTE-STU-2026-90001');

  // Student B attempts to read Student A's complaint
  const resBob = await request(app)
    .get(`/api/student/cases/${caseA._id}`)
    .set('Authorization', `Bearer ${studentTokenB}`);

  assert.ok(resBob.status === 404 || resBob.status === 403);
  assert.strictEqual(resBob.body.success, false);
});

// ============================================================================
// TEST 4: Bureau user cannot read, update or transfer another bureau's case
// ============================================================================
test("4. Bureau user cannot read, update or transfer another bureau's case", async () => {
  // Case assigned to PGRC
  const pgrcCase = await Case.create({
    caseId: 'AICTE-PGRC-2026-90002',
    sourceSystem: 'PGRC',
    sourceCaseRef: 'PGRC-REF-90002',
    rawInstitutionName: testInstitution.name,
    institution: testInstitution._id,
    category: 'Faculty Shortage',
    description: 'Complaint in PGRC bureau',
    complainantType: 'Student',
    receivedDate: new Date(),
    expectedDisposalDate: new Date(Date.now() + 30 * 86400000),
    status: 'under_process',
    currentBureau: bureauPGRC._id,
  });

  // RB Officer attempts to read PGRC case
  const resRead = await request(app)
    .get(`/api/bureau/cases/${pgrcCase._id}`)
    .set('Authorization', `Bearer ${bureauTokenRB}`);
  assert.strictEqual(resRead.status, 403);
  assert.strictEqual(resRead.body.success, false);

  // RB Officer attempts to update status of PGRC case
  const resUpdate = await request(app)
    .patch(`/api/bureau/cases/${pgrcCase._id}/status`)
    .set('Authorization', `Bearer ${bureauTokenRB}`)
    .send({ status: 'under_process', remarks: 'Unauthorized status edit attempt' });
  assert.strictEqual(resUpdate.status, 403);
  assert.strictEqual(resUpdate.body.success, false);

  // RB Officer attempts to transfer PGRC case
  const resTransfer = await request(app)
    .post(`/api/bureau/cases/${pgrcCase._id}/transfer`)
    .set('Authorization', `Bearer ${bureauTokenRB}`)
    .send({ targetBureauId: bureauRB._id, remarks: 'Unauthorized transfer' });
  assert.strictEqual(resTransfer.status, 403);
  assert.strictEqual(resTransfer.body.success, false);
});

// ============================================================================
// TEST 5: Officer assigns case to a bureau -> bureau sees it, other bureau does not
// ============================================================================
test('5. Officer assigns case to a bureau; bureau sees it, another bureau does not', async () => {
  // Create unassigned case
  const unassignedCase = await Case.create({
    caseId: 'AICTE-STU-2026-90003',
    sourceSystem: 'STUDENT_PORTAL',
    sourceCaseRef: 'STU-REF-90003',
    rawInstitutionName: testInstitution.name,
    institution: testInstitution._id,
    category: 'Infrastructure',
    description: 'Unassigned student grievance',
    complainantType: 'Student',
    receivedDate: new Date(),
    expectedDisposalDate: new Date(Date.now() + 30 * 86400000),
    status: 'pending',
    currentBureau: undefined,
    submittedBy: userStudentA._id,
  });

  // Officer assigns case to RB bureau
  const resAssign = await request(app)
    .post(`/api/officer/cases/${unassignedCase._id}/assign`)
    .set('Authorization', `Bearer ${officerToken}`)
    .send({
      bureauId: bureauRB._id,
      remarks: 'Allocated to Regulatory Bureau for formal scrutiny',
    });

  assert.strictEqual(resAssign.status, 200);
  assert.strictEqual(resAssign.body.success, true);
  assert.strictEqual(resAssign.body.data.currentBureau._id.toString(), bureauRB._id.toString());
  assert.strictEqual(resAssign.body.data.status, 'pending');

  // RB Officer fetches my bureau cases -> case IS present
  const resRB = await request(app)
    .get('/api/bureau/cases')
    .set('Authorization', `Bearer ${bureauTokenRB}`);
  assert.strictEqual(resRB.status, 200);
  const foundInRB = resRB.body.data.some((c) => c._id.toString() === unassignedCase._id.toString());
  assert.strictEqual(foundInRB, true);

  // PGRC Officer fetches my bureau cases -> case is NOT present
  const resPGRC = await request(app)
    .get('/api/bureau/cases')
    .set('Authorization', `Bearer ${bureauTokenPGRC}`);
  assert.strictEqual(resPGRC.status, 200);
  const foundInPGRC = resPGRC.body.data.some((c) => c._id.toString() === unassignedCase._id.toString());
  assert.strictEqual(foundInPGRC, false);
});

// ============================================================================
// TEST 6: Bureau marks case Done -> Student sees status Closed & CaseAction recorded
// ============================================================================
test('6. Bureau marks a case Done -> student sees status Closed and CaseAction is recorded', async () => {
  // Case submitted by Alice assigned to RB
  const studentCase = await Case.create({
    caseId: 'AICTE-STU-2026-90004',
    sourceSystem: 'STUDENT_PORTAL',
    sourceCaseRef: 'STU-REF-90004',
    rawInstitutionName: testInstitution.name,
    institution: testInstitution._id,
    category: 'Fee Issues',
    description: 'Excess exam fee refund dispute',
    complainantType: 'Student',
    receivedDate: new Date(),
    expectedDisposalDate: new Date(Date.now() + 30 * 86400000),
    status: 'under_process',
    currentBureau: bureauRB._id,
    submittedBy: userStudentA._id,
  });

  // RB Officer marks case Done (disposed) with final remarks
  const resDone = await request(app)
    .patch(`/api/bureau/cases/${studentCase._id}/status`)
    .set('Authorization', `Bearer ${bureauTokenRB}`)
    .send({
      status: 'disposed',
      remarks: 'Institute conducted hearing and processed full refund to student. Matter resolved.',
    });

  assert.strictEqual(resDone.status, 200);
  assert.strictEqual(resDone.body.data.status, 'disposed');

  // Student fetches complaint detail
  const resStudent = await request(app)
    .get(`/api/student/cases/${studentCase._id}`)
    .set('Authorization', `Bearer ${studentTokenA}`);

  assert.strictEqual(resStudent.status, 200);
  assert.strictEqual(resStudent.body.data.status, 'disposed');

  // Verify CaseAction is recorded in timeline
  const actions = resStudent.body.data.timeline;
  assert.ok(Array.isArray(actions));
  const disposedAction = actions.find((a) => a.actionType === 'disposed');
  assert.ok(disposedAction, 'Disposed CaseAction should be present in public timeline');
  assert.match(disposedAction.remarks, /refund to student/i);
});

// ============================================================================
// TEST 7: Regex injection input returns safely (no ReDoS or crashes)
// ============================================================================
test('7. Regex injection input like "(a+)+$" returns safely without crashing or hanging', async () => {
  const maliciousQuery = '(a+)+$';

  const resCases = await request(app)
    .get(`/api/officer/cases?q=${encodeURIComponent(maliciousQuery)}`)
    .set('Authorization', `Bearer ${officerToken}`);

  assert.strictEqual(resCases.status, 200);
  assert.strictEqual(resCases.body.success, true);
  assert.ok(Array.isArray(resCases.body.data));

  const resInst = await request(app)
    .get(`/api/officer/institutions?q=${encodeURIComponent(maliciousQuery)}`)
    .set('Authorization', `Bearer ${officerToken}`);

  assert.strictEqual(resInst.status, 200);
  assert.strictEqual(resInst.body.success, true);
  assert.ok(Array.isArray(resInst.body.data));
});
