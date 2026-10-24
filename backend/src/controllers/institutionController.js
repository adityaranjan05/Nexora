import { Institution } from '../models/Institution.js';
import { Case } from '../models/Case.js';
import { OverlapGroup } from '../models/OverlapGroup.js';
import { escapeRegex } from '../utils/escapeRegex.js';

export const getInstitutions = async (req, res, next) => {
  try {
    const { q, region, state, limit = 50 } = req.query;
    const query = {};

    if (q) {
      const escaped = escapeRegex(q);
      query.$or = [
        { name: new RegExp(escaped, 'i') },
        { aictePermanentId: new RegExp(escaped, 'i') },
        { city: new RegExp(escaped, 'i') },
      ];
    }
    if (region) query.region = region;
    if (state) query.state = state;

    const institutions = await Institution.find(query).limit(parseInt(limit, 10)).sort({ name: 1 });
    res.json({ success: true, data: institutions });
  } catch (error) {
    next(error);
  }
};

export const getInstitutionById = async (req, res, next) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found' });
    }

    const cases = await Case.find({ institution: institution._id })
      .populate('currentBureau')
      .populate('assignedOfficer', 'name email')
      .sort({ receivedDate: -1 });

    const overlap = await OverlapGroup.findOne({
      institution: institution._id,
      status: 'open',
    }).populate('cases');

    // Bureau distribution of complaints
    const bureauDistribution = {};
    cases.forEach((c) => {
      const bName = c.currentBureau?.name || 'Unassigned';
      bureauDistribution[bName] = (bureauDistribution[bName] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        institution,
        cases,
        totalCases: cases.length,
        openCases: cases.filter((c) => ['pending', 'under_process', 'needs_info', 'transferred', 'escalated'].includes(c.status)).length,
        disposedCases: cases.filter((c) => c.status === 'disposed').length,
        bureauDistribution,
        activeOverlap: overlap,
      },
    });
  } catch (error) {
    next(error);
  }
};
