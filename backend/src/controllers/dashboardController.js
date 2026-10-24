import { Case } from '../models/Case.js';
import { OverlapGroup } from '../models/OverlapGroup.js';
import { Bureau } from '../models/Bureau.js';
import { Institution } from '../models/Institution.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();

    // Regional officer filter if applicable
    const filter = {};
    if (req.user?.role === 'regional_officer' && req.user?.region) {
      const institutionsInRegion = await Institution.find({ region: req.user.region }).select('_id');
      filter.institution = { $in: institutionsInRegion.map((i) => i._id) };
    }

    const [
      totalReceived,
      pending,
      underProcess,
      disposed,
      transferred,
      escalated,
      beyondTimeline,
      activeOverlaps,
    ] = await Promise.all([
      Case.countDocuments(filter),
      Case.countDocuments({ ...filter, status: 'pending' }),
      Case.countDocuments({ ...filter, status: 'under_process' }),
      Case.countDocuments({ ...filter, status: 'disposed' }),
      Case.countDocuments({ ...filter, status: 'transferred' }),
      Case.countDocuments({ ...filter, status: 'escalated' }),
      Case.countDocuments({
        ...filter,
        status: { $in: ['pending', 'under_process', 'transferred', 'escalated'] },
        expectedDisposalDate: { $lt: now },
      }),
      OverlapGroup.countDocuments({ status: 'open' }),
    ]);

    const disposalRate = totalReceived > 0 ? ((disposed / totalReceived) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalReceived,
        pending,
        underProcess,
        disposed,
        transferred,
        escalated,
        beyondTimeline,
        activeOverlaps,
        disposalRate: `${disposalRate}%`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBureauWorkload = async (req, res, next) => {
  try {
    const bureaus = await Bureau.find().select('name code type');
    const cases = await Case.find().populate('currentBureau', 'code name');

    const workload = bureaus.map((b) => {
      const bureauCases = cases.filter(
        (c) => c.currentBureau && c.currentBureau._id.toString() === b._id.toString()
      );

      const statusMap = {
        pending: 0,
        under_process: 0,
        disposed: 0,
        transferred: 0,
        escalated: 0,
      };

      bureauCases.forEach((c) => {
        if (statusMap[c.status] !== undefined) {
          statusMap[c.status]++;
        }
      });

      return {
        id: b._id,
        code: b.code,
        name: b.name,
        type: b.type,
        total: bureauCases.length,
        ...statusMap,
      };
    });

    res.json({ success: true, data: workload });
  } catch (error) {
    next(error);
  }
};

export const getInstitutionStatus = async (req, res, next) => {
  try {
    const topInstitutions = await Case.aggregate([
      { $match: { institution: { $ne: null } } },
      {
        $group: {
          _id: '$institution',
          totalCases: { $sum: 1 },
          openCases: {
            $sum: {
              $cond: [{ $in: ['$status', ['pending', 'under_process', 'transferred', 'escalated']] }, 1, 0],
            },
          },
          disposedCases: {
            $sum: { $cond: [{ $eq: ['$status', 'disposed'] }, 1, 0] },
          },
        },
      },
      { $sort: { totalCases: -1 } },
      { $limit: 15 },
      {
        $lookup: {
          from: 'institutions',
          localField: '_id',
          foreignField: '_id',
          as: 'details',
        },
      },
      { $unwind: '$details' },
    ]);

    // Check overlap status for each
    const results = await Promise.all(
      topInstitutions.map(async (item) => {
        const overlap = await OverlapGroup.findOne({
          institution: item._id,
          status: 'open',
        });
        return {
          id: item._id,
          name: item.details.name,
          aicteId: item.details.aictePermanentId,
          region: item.details.region,
          city: item.details.city,
          state: item.details.state,
          totalCases: item.totalCases,
          openCases: item.openCases,
          disposedCases: item.disposedCases,
          hasOverlap: Boolean(overlap),
          overlapSeverity: overlap ? overlap.severity : null,
        };
      })
    );

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
