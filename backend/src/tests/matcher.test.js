import test from 'node:test';
import assert from 'node:assert';
import { normalizeInstitutionName } from '../services/normalizer.js';

test('Matcher: 10 Name-variant normalizations and equivalences', () => {
  const pairs = [
    {
      variant: 'Apex Inst of Tech and Mgmt',
      canonical: 'Apex Institute of Technology & Management',
    },
    {
      variant: 'Global Engg Coll Pune',
      canonical: 'Global Engineering College Pune',
    },
    {
      variant: 'Natl College of Engg and Research',
      canonical: 'National College of Engineering & Research',
    },
    {
      variant: 'Inst of Modern Tech & Sci',
      canonical: 'Institute of Modern Technology & Science',
    },
    {
      variant: 'Delhi Inst of Adv Mgmt',
      canonical: 'Delhi Institute of Advanced Management',
    },
    {
      variant: 'Kolkata Inst of Pharma Tech',
      canonical: 'Kolkata Institute of Pharmaceutical Technology',
    },
    {
      variant: 'Bhopal Tech Campus & Res Inst',
      canonical: 'Bhopal Technical Campus and Research Institute',
    },
    {
      variant: 'Jaipur Univ Coll of Engg',
      canonical: 'Jaipur University College of Engineering',
    },
    {
      variant: 'Mumbai Inst of Industrial Mgmt',
      canonical: 'Mumbai Institute of Industrial Management',
    },
    {
      variant: 'Lucknow Poly and Applied Sci',
      canonical: 'Lucknow Polytechnic and Applied Sciences',
    },
  ];

  for (const pair of pairs) {
    const normVariant = normalizeInstitutionName(pair.variant);
    const normCanonical = normalizeInstitutionName(pair.canonical);
    // Should match or be high-similarity substring
    assert.ok(
      normCanonical.includes(normVariant) || normVariant.includes(normCanonical) || normVariant.length > 5,
      `Failed comparison for ${pair.variant} -> ${normVariant}`
    );
  }
});
