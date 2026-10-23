import { Case } from '../models/Case.js';
import { OverlapGroup } from '../models/OverlapGroup.js';
import { Bureau } from '../models/Bureau.js';
import { createOrUpdateAlert } from './alerts.js';

const OPEN_STATUSES = ['pending', 'under_process', 'transferred', 'escalated'];

const REGULATORY_KEYWORDS = [
  'show-cause',
  'show cause',
  'inspection',
  'withdrawal',
  'penal',
  'derecognition',
  'affiliation cancelled',
  'legal notice',
  'fir',
  'fraud',
  'forgery',
  'fake',
];

const isRegulatoryCase = (c) => {
  const text = `${c.category || ''} ${c.description || ''} ${c.lastActionText || ''}`.toLowerCase();
  return REGULATORY_KEYWORDS.some((kw) => text.includes(kw));
};

/**
 * Checks overlap status for an institution and creates/updates/closes OverlapGroup.
 */
export const checkInstitutionOverlap = async (institutionId) => {
  if (!institutionId) return null;

  // 1. Collect all open cases for the institution
  const openCases = await Case.find({
    institution: institutionId,
    status: { $in: OPEN_STATUSES },
  }).populate('currentBureau');

  // Group by distinct bureau ID
  const bureauMap = new Map();
  for (const c of openCases) {
    if (c.currentBureau) {
      const bId = c.currentBureau._id.toString();
      if (!bureauMap.has(bId)) {
        bureauMap.set(bId, []);
      }
      bureauMap.get(bId).push(c);
    }
  }

  const distinctBureausCount = bureauMap.size;

  // Find existing open OverlapGroup for this institution
  let group = await OverlapGroup.findOne({
    institution: institutionId,
    status: 'open',
  });

  // If cases belong to 2 or more different bureaus/cells:
  if (distinctBureausCount >= 2) {
    // Determine severity
    let regulatoryCount = 0;
    let grievanceCount = 0;

    for (const [, cases] of bureauMap) {
      const hasRegulatory = cases.some((c) => isRegulatoryCase(c));
      if (hasRegulatory) {
        regulatoryCount++;
      } else {
        grievanceCount++;
      }
    }

    let severity = 'low';
    if (regulatoryCount >= 2) {
      severity = 'high';
    } else if (regulatoryCount >= 1 && grievanceCount >= 1) {
      severity = 'medium';
    }

    const caseIds = openCases.map((c) => c._id);

    if (!group) {
      group = await OverlapGroup.create({
        institution: institutionId,
        cases: caseIds,
        status: 'open',
        severity,
      });
    } else {
      group.cases = caseIds;
      group.severity = severity;
      await group.save();
    }

    // Raise Alert: "Potential Overlapping Cases - Coordination Required"
    await createOrUpdateAlert({
      alertType: 'overlap',
      institutionId,
      overlapGroupId: group._id,
      message: `Potential Overlapping Cases - Coordination Required for institution with active cases across ${distinctBureausCount} bureaus.`,
      severity,
      targetRoles: ['senior_management', 'super_admin', 'bureau_officer'],
    });

    return group;
  } else {
    // If only one Bureau or none has open cases, auto-close the group if one was open
    if (group) {
      group.status = 'coordinated';
      group.resolutionRemarks = 'Automatically resolved: cases no longer active across multiple bureaus.';
      group.resolvedAt = new Date();
      await group.save();
    }
    return null;
  }
};
