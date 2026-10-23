import { OverlapGroup } from '../models/OverlapGroup.js';
import { CaseAction } from '../models/CaseAction.js';

export const getOverlaps = async (req, res, next) => {
  try {
    const { status = 'open' } = req.query;
    const query = {};
    if (status) query.status = status;

    const overlaps = await OverlapGroup.find(query)
      .populate('institution')
      .populate({
        path: 'cases',
        populate: [
          { path: 'currentBureau', select: 'name code' },
          { path: 'assignedOfficer', select: 'name email' },
        ],
      })
      .populate('resolvedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: overlaps });
  } catch (error) {
    next(error);
  }
};

export const getOverlapById = async (req, res, next) => {
  try {
    const overlap = await OverlapGroup.findById(req.params.id)
      .populate('institution')
      .populate({
        path: 'cases',
        populate: [
          { path: 'currentBureau' },
          { path: 'assignedOfficer', select: 'name email role' },
        ],
      })
      .populate('resolvedBy', 'name email');

    if (!overlap) {
      return res.status(404).json({ success: false, message: 'Overlap group not found' });
    }

    res.json({ success: true, data: overlap });
  } catch (error) {
    next(error);
  }
};

export const resolveOverlap = async (req, res, next) => {
  try {
    const { status = 'coordinated', remarks } = req.body;
    if (!['coordinated', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be coordinated or dismissed' });
    }

    const overlap = await OverlapGroup.findById(req.params.id).populate('cases');
    if (!overlap) {
      return res.status(404).json({ success: false, message: 'Overlap group not found' });
    }

    overlap.status = status;
    overlap.resolutionRemarks = remarks || `Marked as ${status} by ${req.user.name}`;
    overlap.resolvedBy = req.user._id;
    overlap.resolvedAt = new Date();
    await overlap.save();

    // Log resolution in each case audit trail
    for (const c of overlap.cases) {
      await CaseAction.create({
        case: c._id,
        actionType: 'remark',
        performedBy: req.user._id,
        performedByBureau: req.user.bureau?._id,
        remarks: `Overlap Group resolution (${status}): ${remarks || 'Coordination established'}`,
        timestamp: new Date(),
      });
    }

    res.json({ success: true, message: `Overlap group marked as ${status}`, data: overlap });
  } catch (error) {
    next(error);
  }
};
