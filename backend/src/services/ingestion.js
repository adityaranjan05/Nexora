import { Case } from '../models/Case.js';
import { CaseAction } from '../models/CaseAction.js';
import { Bureau } from '../models/Bureau.js';
import { SlaRule } from '../models/SlaRule.js';
import { normalizeCategory, normalizeStatus, normalizeDate } from './normalizer.js';
import { matchInstitution } from './matcher.js';
import { checkInstitutionOverlap } from './overlap.js';

let caseCounter = 1000;

export const generateCaseId = async (sourceSystem = 'AICTE') => {
  const year = new Date().getFullYear();
  const count = await Case.countDocuments();
  const nextNum = String(count + 1 + Math.floor(Math.random() * 10)).padStart(5, '0');
  return `AICTE-${sourceSystem.toUpperCase().slice(0, 4)}-${year}-${nextNum}`;
};

/**
 * Ingest an array of normalized case items.
 */
export const ingestCases = async (rawCases, uploadedBy = null) => {
  let createdCount = 0;
  let updatedCount = 0;
  let failedCount = 0;
  const errors = [];
  const processedInstitutions = new Set();

  // Cache bureaus
  const bureaus = await Bureau.find();
  const bureauByCode = new Map(bureaus.map((b) => [b.code.toUpperCase(), b]));
  const defaultBureau = bureaus[0] || null;

  // Cache SLA rules
  const slaRules = await SlaRule.find();
  const slaByCategory = new Map(slaRules.map((r) => [r.category, r]));

  for (let i = 0; i < rawCases.length; i++) {
    const item = rawCases[i];
    try {
      if (!item.rawInstitutionName || !item.description) {
        failedCount++;
        errors.push({
          row: i + 1,
          reference: item.sourceCaseRef || 'UNKNOWN',
          reason: 'Missing institution name or complaint description',
        });
        continue;
      }

      const category = normalizeCategory(item.category);
      const status = normalizeStatus(item.status);
      const receivedDate = normalizeDate(item.receivedDate);

      // Institution matching
      const matchResult = await matchInstitution({
        aictePermanentId: item.aictePermanentId,
        rawInstitutionName: item.rawInstitutionName,
        rawCity: item.rawCity,
        rawDistrict: item.rawDistrict,
        rawState: item.rawState,
        rawPincode: item.rawPincode,
      });

      // SLA expected disposal calculation
      const sla = slaByCategory.get(category) || { daysToDispose: 30 };
      const expectedDisposalDate = new Date(receivedDate.getTime() + sla.daysToDispose * 24 * 60 * 60 * 1000);

      // Determine bureau
      let bureau = bureauByCode.get((item.sourceSystem || '').toUpperCase());
      if (!bureau) bureau = defaultBureau;

      // Check if existing case by sourceSystem + sourceCaseRef
      let existingCase = null;
      if (item.sourceCaseRef) {
        existingCase = await Case.findOne({
          sourceSystem: item.sourceSystem,
          sourceCaseRef: item.sourceCaseRef,
        });
      }

      if (existingCase) {
        // Record audit if status changed
        const statusChanged = existingCase.status !== status;
        const bureauChanged = bureau && existingCase.currentBureau?.toString() !== bureau._id.toString();

        existingCase.status = status;
        if (bureau) existingCase.currentBureau = bureau._id;
        if (matchResult.institution) {
          existingCase.institution = matchResult.institution._id;
          existingCase.matchStatus = matchResult.matchStatus;
          existingCase.matchScore = matchResult.matchScore;
        }
        existingCase.lastActionText = item.lastActionText || 'Case details updated during sync';
        existingCase.lastActionDate = new Date();
        await existingCase.save();

        if (statusChanged || bureauChanged) {
          await CaseAction.create({
            case: existingCase._id,
            actionType: statusChanged ? 'action_taken' : 'transferred',
            fromBureau: bureauChanged ? existingCase.currentBureau : undefined,
            toBureau: bureauChanged ? bureau._id : undefined,
            remarks: `Automated sync update: Status set to ${status}.`,
            timestamp: new Date(),
          });
        }

        updatedCount++;
        if (existingCase.institution) {
          processedInstitutions.add(existingCase.institution.toString());
        }
      } else {
        const caseId = await generateCaseId(item.sourceSystem || 'AICTE');
        const newCase = await Case.create({
          caseId,
          sourceSystem: item.sourceSystem || 'MANUAL',
          sourceCaseRef: item.sourceCaseRef || caseId,
          institution: matchResult.institution ? matchResult.institution._id : undefined,
          rawInstitutionName: item.rawInstitutionName,
          rawAddress: item.rawAddress || '',
          rawCity: item.rawCity || '',
          rawState: item.rawState || '',
          rawPincode: item.rawPincode || '',
          matchStatus: matchResult.matchStatus,
          matchScore: matchResult.matchScore,
          category,
          description: item.description,
          complainantType: item.complainantType || 'Student',
          receivedDate,
          status,
          currentBureau: bureau ? bureau._id : undefined,
          lastActionText: item.lastActionText || 'Case ingested into central monitoring',
          lastActionDate: new Date(),
          nextActionText: 'Awaiting bureau officer allocation/review',
          expectedDisposalDate,
        });

        // Audit action
        await CaseAction.create({
          case: newCase._id,
          actionType: 'received',
          performedBy: uploadedBy || undefined,
          toBureau: bureau ? bureau._id : undefined,
          remarks: `Initial ingestion from ${item.sourceSystem || 'system'}. Match status: ${matchResult.matchStatus} (${matchResult.matchScore}%).`,
          timestamp: new Date(),
        });

        createdCount++;
        if (newCase.institution) {
          processedInstitutions.add(newCase.institution.toString());
        }
      }
    } catch (err) {
      failedCount++;
      errors.push({
        row: i + 1,
        reference: item.sourceCaseRef || 'UNKNOWN',
        reason: err.message,
      });
    }
  }

  // Trigger overlap checks for all affected institutions
  for (const instId of processedInstitutions) {
    try {
      await checkInstitutionOverlap(instId);
    } catch (overlapErr) {
      console.warn(`[Overlap] Error checking overlap for ${instId}:`, overlapErr.message);
    }
  }

  return {
    total: rawCases.length,
    created: createdCount,
    updated: updatedCount,
    failed: failedCount,
    errors,
  };
};
