import mongoose from 'mongoose';

const OverlapGroupSchema = new mongoose.Schema(
  {
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    cases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Case' }],
    status: {
      type: String,
      enum: ['open', 'coordinated', 'dismissed'],
      default: 'open',
      index: true,
    },
    severity: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
      index: true,
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolutionRemarks: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const OverlapGroup = mongoose.model('OverlapGroup', OverlapGroupSchema);
