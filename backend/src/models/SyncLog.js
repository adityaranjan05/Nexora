import mongoose from 'mongoose';

const SyncLogSchema = new mongoose.Schema(
  {
    sourceSystem: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
    recordsFetched: { type: Number, default: 0 },
    recordsCreated: { type: Number, default: 0 },
    recordsUpdated: { type: Number, default: 0 },
    errors: { type: [String], default: [] },
  },
  { timestamps: false, suppressReservedKeysWarning: true }
);

export const SyncLog = mongoose.model('SyncLog', SyncLogSchema);
