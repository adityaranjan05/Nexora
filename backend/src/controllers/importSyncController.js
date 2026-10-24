import multer from 'multer';
import { parseUploadFile } from '../services/connectors/csvConnector.js';
import { fetchRbCases } from '../services/connectors/rbConnector.js';
import { fetchPgrcCases } from '../services/connectors/pgrcConnector.js';
import { ingestCases } from '../services/ingestion.js';
import { ImportBatch } from '../models/ImportBatch.js';
import { SyncLog } from '../models/SyncLog.js';
import { runSlaChecks } from '../services/sla.js';

// Multer memory storage for uploads
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

export const uploadBulkFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV or Excel file.' });
    }

    const { sourceBureau = 'BULK_UPLOAD' } = req.body;
    const rawRecords = await parseUploadFile(req.file.buffer, req.file.originalname);

    const result = await ingestCases(
      rawRecords.map((r) => ({ ...r, sourceSystem: r.sourceSystem || sourceBureau })),
      req.user?._id
    );

    const batch = await ImportBatch.create({
      sourceSystem: sourceBureau,
      filename: req.file.originalname,
      totalRows: result.total,
      successRows: result.created + result.updated,
      failedRows: result.failed,
      errors: result.errors,
      uploadedBy: req.user?._id,
    });

    res.status(200).json({
      success: true,
      message: `Processed ${result.total} rows (${result.created} created, ${result.updated} updated, ${result.failed} failed)`,
      batchId: batch._id,
      summary: result,
    });
  } catch (error) {
    next(error);
  }
};

export const runManualSync = async (req, res, next) => {
  try {
    const startedAt = new Date();
    const log = await SyncLog.create({
      sourceSystem: 'MANUAL_RUN',
      startedAt,
    });

    // Fetch from RB and PGRC mock sources
    const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
    const [rbCases, pgrcCases] = await Promise.all([
      fetchRbCases(baseUrl),
      fetchPgrcCases(baseUrl),
    ]);

    const all = [...rbCases, ...pgrcCases];
    const result = await ingestCases(all, req.user?._id);

    // Run SLA checks after sync
    await runSlaChecks();

    log.finishedAt = new Date();
    log.recordsFetched = all.length;
    log.recordsCreated = result.created;
    log.recordsUpdated = result.updated;
    if (result.errors?.length) {
      log.errors = result.errors.map((e) => `Row ${e.row}: ${e.reason}`);
    }
    await log.save();

    res.json({
      success: true,
      message: 'Connectors synchronization completed successfully',
      fetched: all.length,
      created: result.created,
      updated: result.updated,
      failed: result.failed,
      logId: log._id,
    });
  } catch (error) {
    next(error);
  }
};
