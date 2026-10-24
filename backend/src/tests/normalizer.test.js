import test from 'node:test';
import assert from 'node:assert';
import {
  normalizeInstitutionName,
  normalizeCity,
  normalizeStatus,
  normalizeCategory,
} from '../services/normalizer.js';

test('Normalizer: expands abbreviations and trims filler words', () => {
  const raw1 = 'Apex Inst of Tech & Mgmt';
  assert.strictEqual(
    normalizeInstitutionName(raw1),
    'apex institute technology management'
  );

  const raw2 = 'The College of Engg and Poly';
  assert.strictEqual(
    normalizeInstitutionName(raw2),
    'college engineering polytechnic'
  );

  const raw3 = 'Univ Inst of Pharmaceutical Sciences';
  assert.strictEqual(
    normalizeInstitutionName(raw3),
    'university institute pharmaceutical sciences'
  );
});

test('Normalizer: city normalization', () => {
  assert.strictEqual(normalizeCity('New Delhi'), 'newdelhi');
  assert.strictEqual(normalizeCity('Bengaluru-Urban'), 'bengaluruurban');
  assert.strictEqual(normalizeCity('Pune '), 'pune');
});

test('Normalizer: status mapping', () => {
  assert.strictEqual(normalizeStatus('OPEN'), 'pending');
  assert.strictEqual(normalizeStatus('in_progress'), 'under_process');
  assert.strictEqual(normalizeStatus('Closed'), 'disposed');
  assert.strictEqual(normalizeStatus('escalate'), 'escalated');
});

test('Normalizer: category mapping', () => {
  assert.strictEqual(normalizeCategory('Excess Capitation Fees'), 'Fee Issues');
  assert.strictEqual(normalizeCategory('Lack of Assistant Professors'), 'Faculty Shortage');
  assert.strictEqual(normalizeCategory('Forged Land Document'), 'Fake Documents');
  assert.strictEqual(normalizeCategory('Hostel Ragging Complaint'), 'Harassment');
});
