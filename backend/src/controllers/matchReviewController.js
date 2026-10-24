import { Case } from '../models/Case.js';
import { Institution } from '../models/Institution.js';
import { CaseAction } from '../models/CaseAction.js';
import { matchInstitution } from '../services/matcher.js';
import { checkInstitutionOverlap } from '../services/overlap.js';

export const getMatchReviewQueue = async (req, res, next) => {
  try {
    const cases = await Case.find({
      matchStatus: { $in: ['review', 'unmatched'] },
    })
      .populate('currentBureau', 'code name')
      .sort({ createdAt: -1 })
      .limit(50);

    // Compute suggestion list for each review case
    const enriched = await Promise.all(
      cases.map(async (c) => {
        const matchResult = await matchInstitution({
          aictePermanentId: c.sourceCaseRef,
          rawInstitutionName: c.rawInstitutionName,
          rawCity: c.rawCity,
          rawState: c.rawState,
          rawPincode: c.rawPincode,
        });

        // Top 5 general candidates if no match candidates returned
        let candidates = matchResult.candidates || [];
        if (candidates.length === 0) {
          const general = await Institution.find().limit(5);
          candidates = general.map((inst) => ({ institution: inst, score: 50 }));
        }

        return {
          case: c,
          currentScore: c.matchScore,
          matchStatus: c.matchStatus,
          suggestions: candidates,
        };
      })
    );

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const confirmMatch = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { institutionId, remarks } = req.body;

    if (!institutionId) {
      return res.status(400).json({ success: false, message: 'institutionId is required' });
    }

    const c = await Case.findById(caseId);
    if (!c) return res.status(404).json({ success: false, message: 'Case not found' });

    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found' });
    }

    c.institution = institution._id;
    c.matchStatus = 'matched';
    c.matchScore = 100;
    c.lastActionText = `Institution manually matched and confirmed: ${institution.name}`;
    c.lastActionDate = new Date();
    await c.save();

    await CaseAction.create({
      case: c._id,
      actionType: 'remark',
      performedBy: req.user._id,
      remarks: `Manual Institution Match: Confirmed link to ${institution.name} (ID: ${institution.aictePermanentId}). ${remarks || ''}`,
      timestamp: new Date(),
    });

    // Check overlap for confirmed institution
    await checkInstitutionOverlap(institution._id);

    res.json({
      success: true,
      message: `Case ${c.caseId} successfully matched to ${institution.name}`,
      data: c,
    });
  } catch (error) {
    next(error);
  }
};
