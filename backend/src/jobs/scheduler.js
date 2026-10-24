import cron from 'node-cron';
import { runSlaChecks } from '../services/sla.js';
import { fetchRbCases } from '../services/connectors/rbConnector.js';
import { fetchPgrcCases } from '../services/connectors/pgrcConnector.js';
import { ingestCases } from '../services/ingestion.js';
import { SyncLog } from '../models/SyncLog.js';

export const startScheduler = () => {
  // Run SLA checks daily at 08:00
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Running daily SLA check at 08:00...');
    try {
      const stats = await runSlaChecks();
      console.log('[Scheduler] SLA check complete:', stats);
    } catch (err) {
      console.error('[Scheduler] SLA check failed:', err.message);
    }
  });

  // Periodic automatic sync every 15 minutes (or 1 hour in dev)
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Scheduler] Running scheduled connectors sync...');
    try {
      const log = await SyncLog.create({
        sourceSystem: 'SCHEDULED_ALL',
        startedAt: new Date(),
      });

      const rbCases = await fetchRbCases();
      const pgrcCases = await fetchPgrcCases();
      const all = [...rbCases, ...pgrcCases];

      const res = await ingestCases(all);
      await runSlaChecks();

      log.finishedAt = new Date();
      log.recordsFetched = all.length;
      log.recordsCreated = res.created;
      log.recordsUpdated = res.updated;
      if (res.errors.length) {
        log.errors = res.errors.map((e) => `Row ${e.row}: ${e.reason}`);
      }
      await log.save();
      console.log('[Scheduler] Scheduled sync complete. Fetched:', all.length);
    } catch (err) {
      console.error('[Scheduler] Scheduled sync error:', err.message);
    }
  });

  console.log('[Scheduler] Cron jobs initialized (daily SLA at 08:00, periodic sync every 15 min).');
};
