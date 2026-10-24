import Fuse from 'fuse.js';
import { Institution } from '../models/Institution.js';
import { normalizeInstitutionName, normalizeCity } from './normalizer.js';

export const MATCH_THRESHOLDS = {
  AUTO_MATCH: 90,
  REVIEW_QUEUE: 75,
};

/**
 * Match a raw incoming complaint record to an AICTE Master Institution.
 * @param {Object} input
 * @param {string} [input.aictePermanentId]
 * @param {string} input.rawInstitutionName
 * @param {string} [input.rawCity]
 * @param {string} [input.rawDistrict]
 * @param {string} [input.rawState]
 * @param {string} [input.rawPincode]
 * @returns {Promise<{ institution: Object|null, matchStatus: 'matched'|'review'|'unmatched', matchScore: number, candidates?: Array }>}
 */
export const matchInstitution = async (input) => {
  const {
    aictePermanentId,
    rawInstitutionName,
    rawCity,
    rawDistrict,
    rawState,
    rawPincode,
  } = input;

  // 1. Exact AICTE Permanent ID match
  if (aictePermanentId) {
    const trimmedId = aictePermanentId.trim();
    const instById = await Institution.findOne({ aictePermanentId: trimmedId });
    if (instById) {
      return {
        institution: instById,
        matchStatus: 'matched',
        matchScore: 100,
      };
    }
  }

  const normName = normalizeInstitutionName(rawInstitutionName);
  const normCity = normalizeCity(rawCity);

  if (!normName) {
    return {
      institution: null,
      matchStatus: 'unmatched',
      matchScore: 0,
    };
  }

  // 2. Exact normalised name + city match
  if (normCity) {
    const candidatesByName = await Institution.find({ normalizedName: normName });
    const exactCityMatch = candidatesByName.find(
      (inst) => normalizeCity(inst.city) === normCity
    );
    if (exactCityMatch) {
      return {
        institution: exactCityMatch,
        matchStatus: 'matched',
        matchScore: 98,
      };
    }
  }

  // 3. Fuzzy match using Fuse.js restricted to state/district/city if available
  // Filter master institutions by state/region if specified to reduce noise
  let query = {};
  if (rawState) {
    query.state = new RegExp(`^${rawState.trim()}$`, 'i');
  }

  let candidates = await Institution.find(query);
  if (candidates.length === 0) {
    candidates = await Institution.find();
  }

  const fuse = new Fuse(candidates, {
    keys: ['normalizedName', 'name'],
    includeScore: true,
    threshold: 0.45, // Fuse score 0 = perfect match, 1 = mismatch
  });

  const results = fuse.search(normName);

  if (results && results.length > 0) {
    const best = results[0];
    const item = best.item;
    // Base score: 100 - (fuseScore * 100)
    let score = Math.round((1 - best.score) * 100);

    // City bonus
    if (rawCity && normalizeCity(item.city) === normCity) {
      score = Math.min(100, score + 8);
    }

    // Pincode bonus per SPEC
    if (rawPincode && item.pincode && rawPincode.trim() === item.pincode.trim()) {
      score = Math.min(100, score + 5);
    }

    // Prepare candidate list for review queue
    const topCandidates = results.slice(0, 5).map((r) => ({
      institution: r.item,
      score: Math.round((1 - r.score) * 100),
    }));

    if (score >= MATCH_THRESHOLDS.AUTO_MATCH) {
      return {
        institution: item,
        matchStatus: 'matched',
        matchScore: score,
        candidates: topCandidates,
      };
    } else if (score >= MATCH_THRESHOLDS.REVIEW_QUEUE) {
      return {
        institution: item, // Suggested top candidate
        matchStatus: 'review',
        matchScore: score,
        candidates: topCandidates,
      };
    }
  }

  return {
    institution: null,
    matchStatus: 'unmatched',
    matchScore: 0,
    candidates: [],
  };
};
