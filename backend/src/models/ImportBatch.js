import mongoose from 'mongoose';

const ImportBatchSchema = new mongoose.Schema(
  {
    sourceSystem: { type: String, required: true },
    filename: { type: String, required: true },
    totalRows: { type: Number, default: 0 },
    successRows: { type: Number, default: 0 },
    failedRows: { type: Number, default: 0 },
    errorReportPath: { type: String },
    errors: { type: Array, default: [] },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false }, suppressReservedKeysWarning: true }
);

export const ImportBatch = mongoose.model('ImportBatch', ImportBatchSchema);
