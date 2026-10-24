import { Case } from '../models/Case.js';
import { CaseAction } from '../models/CaseAction.js';
import { CaseLink } from '../models/CaseLink.js';
import { Institution } from '../models/Institution.js';
import { Bureau } from '../models/Bureau.js';
import { OverlapGroup } from '../models/OverlapGroup.js';
import { checkInstitutionOverlap } from '../services/overlap.js';

export const getCases = async (req, res, next) => {
  try {
    const {
      q,
      institution,
      aicteId,
      caseId,
      bureau,
      region,
      category,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Role-based restrictions
    if (req.user.role === 'regional_officer' && req.user.region) {
      const insts = await Institution.find({ region: req.user.region }).select('_id');
      query.institution = { $in: insts.map((i) => i._id) };
    }

    // Keyword search (q matches caseId or rawInstitutionName or description)
    if (q) {
      query.$or = [
        { caseId: new RegExp(q, 'i') },
        { rawInstitutionName: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
      ];
    }

    if (caseId) query.caseId = new RegExp(caseId, 'i');
    if (category) query.category = category;
    if (status) query.status = status;
    if (bureau) query.currentBureau = bureau;

    if (institution) {
      query.rawInstitutionName = new RegExp(institution, 'i');
    }

    if (aicteId || region) {
      const instFilter = {};
      if (aicteId) instFilter.aictePermanentId = new RegExp(aicteId, 'i');
      if (region) instFilter.region = region;
      const matchedInsts = await Institution.find(instFilter).select('_id');
      query.institution = { $in: matchedInsts.map((i) => i._id) };
    }

    if (dateFrom || dateTo) {
      query.receivedDate = {};
      if (dateFrom) query.receivedDate.$gte = new Date(dateFrom);
      if (dateTo) query.receivedDate.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Case.countDocuments(query);

    const cases = await Case.find(query)
      .populate('institution')
      .populate('currentBureau', 'code name type')
      .populate('assignedOfficer', 'name email role')
      .sort({ receivedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Annotate cases with overlap status
    const annotatedCases = await Promise.all(
      cases.map(async (c) => {
        let hasOverlap = false;
        let overlapSeverity = null;
        if (c.institution) {
          const overlap = await OverlapGroup.findOne({
            institution: c.institution._id,
            status: 'open',
          });
          if (overlap) {
            hasOverlap = true;
            overlapSeverity = overlap.severity;
          }
        }

        const now = new Date();
        const isOverdue = c.expectedDisposalDate && new Date(c.expectedDisposalDate) < now && c.status !== 'disposed';
        const isDueSoon =
          c.expectedDisposalDate &&
          new Date(c.expectedDisposalDate) >= now &&
          new Date(c.expectedDisposalDate).getTime() - now.getTime() <= 3 * 24 * 60 * 60 * 1000 &&
          c.status !== 'disposed';

        return {
          ...c.toObject(),
          hasOverlap,
          overlapSeverity,
          isOverdue,
          isDueSoon,
        };
      })
    );

    res.json({
      success: true,
      data: annotatedCases,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCaseById = async (req, res, next) => {
  try {
    const c = await Case.findById(req.params.id)
      .populate('institution')
      .populate('currentBureau')
      .populate('assignedOfficer', 'name email role');

    if (!c) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Find links
    const links = await CaseLink.find({
      $or: [{ caseA: c._id }, { caseB: c._id }],
    })
      .populate('caseA')
      .populate('caseB')
      .populate('createdBy', 'name email');

    // Find overlap group
    let overlap = null;
    if (c.institution) {
      overlap = await OverlapGroup.findOne({
        institution: c.institution._id,
        status: 'open',
      }).populate({
        path: 'cases',
        populate: { path: 'currentBureau' },
      });
    }

    res.json({
      success: true,
      data: {
        ...c.toObject(),
        links,
        overlap,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCaseHistory = async (req, res, next) => {
  try {
    const actions = await CaseAction.find({ case: req.params.id })
      .populate('performedBy', 'name email role')
      .populate('fromBureau', 'code name')
      .populate('toBureau', 'code name')
      .populate('performedByBureau', 'code name')
      .sort({ timestamp: 1 });

    res.json({ success: true, data: actions });
  } catch (error) {
    next(error);
  }
};

export const updateCase = async (req, res, next) => {
  try {
    const { status, assignedOfficer, nextActionText, expectedDisposalDate, remarks } = req.body;

    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Case not found' });

    const previousStatus = c.status;

    if (status) c.status = status;
    if (assignedOfficer) c.assignedOfficer = assignedOfficer;
    if (nextActionText) c.nextActionText = nextActionText;
    if (expectedDisposalDate) c.expectedDisposalDate = new Date(expectedDisposalDate);
    if (status === 'disposed') c.disposedDate = new Date();

    c.lastActionText = remarks || `Case status updated to ${status}`;
    c.lastActionDate = new Date();
    await c.save();

    await CaseAction.create({
      case: c._id,
      actionType: status === 'disposed' ? 'disposed' : 'action_taken',
      performedBy: req.user._id,
      performedByBureau: req.user.bureau?._id,
      remarks: remarks || `Status changed from ${previousStatus} to ${c.status}`,
      timestamp: new Date(),
    });

    if (c.institution) {
      await checkInstitutionOverlap(c.institution);
    }

    res.json({ success: true, data: c });
  } catch (error) {
    next(error);
  }
};

export const addCaseAction = async (req, res, next) => {
  try {
    const { actionType = 'remark', remarks, attachmentUrl } = req.body;
    if (!remarks) {
      return res.status(400).json({ success: false, message: 'Remarks are required' });
    }

    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Case not found' });

    const action = await CaseAction.create({
      case: c._id,
      actionType,
      performedBy: req.user._id,
      performedByBureau: req.user.bureau?._id,
      remarks,
      attachmentUrl,
      timestamp: new Date(),
    });

    c.lastActionText = remarks;
    c.lastActionDate = new Date();
    await c.save();

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
};

export const transferCase = async (req, res, next) => {
  try {
    const { targetBureauId, remarks } = req.body;
    if (!targetBureauId) {
      return res.status(400).json({ success: false, message: 'Target bureau ID required' });
    }

    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Case not found' });

    const fromBureau = c.currentBureau;
    const toBureau = await Bureau.findById(targetBureauId);
    if (!toBureau) return res.status(404).json({ success: false, message: 'Target bureau not found' });

    c.currentBureau = toBureau._id;
    c.status = 'transferred';
    c.lastActionText = `Transferred to ${toBureau.name}: ${remarks || 'Case transfer'}`;
    c.lastActionDate = new Date();
    await c.save();

    await CaseAction.create({
      case: c._id,
      actionType: 'transferred',
      fromBureau,
      toBureau: toBureau._id,
      performedBy: req.user._id,
      performedByBureau: req.user.bureau?._id,
      remarks: remarks || `Transferred to ${toBureau.name}`,
      timestamp: new Date(),
    });

    if (c.institution) {
      await checkInstitutionOverlap(c.institution);
    }

    res.json({ success: true, message: `Case transferred to ${toBureau.name}`, data: c });
  } catch (error) {
    next(error);
  }
};

export const escalateCase = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const c = await Case.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Case not found' });

    c.status = 'escalated';
    c.lastActionText = `Case escalated: ${remarks || 'Critical timeline overdue'}`;
    c.lastActionDate = new Date();
    await c.save();

    await CaseAction.create({
      case: c._id,
      actionType: 'escalated',
      performedBy: req.user._id,
      performedByBureau: req.user.bureau?._id,
      remarks: remarks || 'Case escalated to Senior Management',
      timestamp: new Date(),
    });

    if (c.institution) {
      await checkInstitutionOverlap(c.institution);
    }

    res.json({ success: true, message: 'Case escalated to Senior Management', data: c });
  } catch (error) {
    next(error);
  }
};

export const linkCases = async (req, res, next) => {
  try {
    const { caseAId, caseBId, linkType = 'related', remarks } = req.body;
    if (!caseAId || !caseBId) {
      return res.status(400).json({ success: false, message: 'Both caseA and caseB IDs are required' });
    }

    const [caseA, caseB] = await Promise.all([Case.findById(caseAId), Case.findById(caseBId)]);
    if (!caseA || !caseB) {
      return res.status(404).json({ success: false, message: 'One or both cases not found' });
    }

    const link = await CaseLink.create({
      caseA: caseA._id,
      caseB: caseB._id,
      linkType,
      createdBy: req.user._id,
    });

    await Promise.all([
      CaseAction.create({
        case: caseA._id,
        actionType: 'linked',
        performedBy: req.user._id,
        remarks: `Linked with case ${caseB.caseId} (${linkType}). ${remarks || ''}`,
      }),
      CaseAction.create({
        case: caseB._id,
        actionType: 'linked',
        performedBy: req.user._id,
        remarks: `Linked with case ${caseA.caseId} (${linkType}). ${remarks || ''}`,
      }),
    ]);

    res.status(201).json({ success: true, message: 'Cases linked successfully', data: link });
  } catch (error) {
    next(error);
  }
};
