import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { Case } from '../models/Case.js';
import { Institution } from '../models/Institution.js';
import { Bureau } from '../models/Bureau.js';
import { OverlapGroup } from '../models/OverlapGroup.js';

export const generateReportData = async (type, options = {}) => {
  const now = new Date();

  switch (type) {
    case 'bureau': {
      // Workload by bureau and status
      const data = await Case.aggregate([
        {
          $lookup: {
            from: 'bureaus',
            localField: 'currentBureau',
            foreignField: '_id',
            as: 'bureauInfo',
          },
        },
        { $unwind: { path: '$bureauInfo', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: {
              bureauName: '$bureauInfo.name',
              bureauCode: '$bureauInfo.code',
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.bureauCode',
            name: { $first: '$_id.bureauName' },
            statuses: {
              $push: { status: '$_id.status', count: '$count' },
            },
            total: { $sum: '$count' },
          },
        },
        { $sort: { total: -1 } },
      ]);
      return data;
    }

    case 'region': {
      // Region-wise case counts
      const data = await Case.aggregate([
        {
          $lookup: {
            from: 'institutions',
            localField: 'institution',
            foreignField: '_id',
            as: 'instInfo',
          },
        },
        { $unwind: { path: '$instInfo', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ['$instInfo.region', 'Unknown Region'] },
            totalCases: { $sum: 1 },
            pendingCases: {
              $sum: { $cond: [{ $in: ['$status', ['pending', 'under_process']] }, 1, 0] },
            },
            disposedCases: {
              $sum: { $cond: [{ $eq: ['$status', 'disposed'] }, 1, 0] },
            },
            escalatedCases: {
              $sum: { $cond: [{ $eq: ['$status', 'escalated'] }, 1, 0] },
            },
          },
        },
        { $sort: { totalCases: -1 } },
      ]);
      return data;
    }

    case 'ageing': {
      // Buckets: 0-15, 16-30, 31-60, 60+
      const openCases = await Case.find({
        status: { $in: ['pending', 'under_process', 'transferred', 'escalated'] },
      }).select('caseId rawInstitutionName category receivedDate status expectedDisposalDate');

      const buckets = {
        '0-15 days': 0,
        '16-30 days': 0,
        '31-60 days': 0,
        '60+ days': 0,
      };

      const detailedList = openCases.map((c) => {
        const days = Math.floor((now.getTime() - new Date(c.receivedDate).getTime()) / (1000 * 60 * 60 * 24));
        let bucket = '60+ days';
        if (days <= 15) bucket = '0-15 days';
        else if (days <= 30) bucket = '16-30 days';
        else if (days <= 60) bucket = '31-60 days';

        buckets[bucket]++;
        return {
          caseId: c.caseId,
          institution: c.rawInstitutionName,
          category: c.category,
          status: c.status,
          ageInDays: days,
          bucket,
        };
      });

      return {
        summary: Object.entries(buckets).map(([name, count]) => ({ name, count })),
        cases: detailedList,
      };
    }

    case 'disposal-rate': {
      // Overall and by category disposal rate
      const totalReceived = await Case.countDocuments();
      const totalDisposed = await Case.countDocuments({ status: 'disposed' });
      const overallRate = totalReceived > 0 ? ((totalDisposed / totalReceived) * 100).toFixed(1) : 0;

      const byCategory = await Case.aggregate([
        {
          $group: {
            _id: '$category',
            received: { $sum: 1 },
            disposed: {
              $sum: { $cond: [{ $eq: ['$status', 'disposed'] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            category: '$_id',
            received: 1,
            disposed: 1,
            rate: {
              $cond: [
                { $gt: ['$received', 0] },
                { $multiply: [{ $divide: ['$disposed', '$received'] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { received: -1 } },
      ]);

      return {
        totalReceived,
        totalDisposed,
        overallRate: `${overallRate}%`,
        byCategory,
      };
    }

    case 'overlaps': {
      const groups = await OverlapGroup.find()
        .populate('institution')
        .populate({
          path: 'cases',
          populate: { path: 'currentBureau' },
        })
        .populate('resolvedBy', 'name email');

      return groups;
    }

    case 'institution': {
      const list = await Institution.find().limit(50);
      const results = [];
      for (const inst of list) {
        const totalCases = await Case.countDocuments({ institution: inst._id });
        const openCases = await Case.countDocuments({
          institution: inst._id,
          status: { $in: ['pending', 'under_process', 'transferred', 'escalated'] },
        });
        const hasOverlap = await OverlapGroup.exists({
          institution: inst._id,
          status: 'open',
        });
        results.push({
          aictePermanentId: inst.aictePermanentId,
          name: inst.name,
          city: inst.city,
          state: inst.state,
          region: inst.region,
          totalCases,
          openCases,
          hasOverlap: Boolean(hasOverlap),
        });
      }
      return results;
    }

    default:
      return { message: `Report type '${type}' generated`, timestamp: new Date() };
  }
};

/**
 * Format report data to CSV
 */
export const formatReportCSV = (type, data) => {
  let items = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (data.cases) {
    items = data.cases;
  } else if (data.byCategory) {
    items = data.byCategory;
  } else if (data.summary) {
    items = data.summary;
  } else {
    items = [data];
  }

  const parser = new Parser({ flatten: true });
  return parser.parse(items);
};

/**
 * Format report data to PDF stream
 */
export const formatReportPDF = (type, data, res) => {
  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  // Header
  doc.fontSize(20).text('AICTE Complaint Monitoring System', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).text(`Report: ${type.toUpperCase()}`, { align: 'center' });
  doc.fontSize(10).fillColor('gray').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(1);
  doc.fillColor('black');

  doc.fontSize(11).text(JSON.stringify(data, null, 2), {
    width: 500,
    align: 'left',
  });

  doc.end();
};
