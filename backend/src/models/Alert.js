import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema(
  {
    alertType: {
      type: String,
      required: true,
      enum: ['overlap', 'pending_reminder', 'due_soon', 'breach', 'escalation'],
      index: true,
    },
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', index: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', index: true },
    overlapGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'OverlapGroup', index: true },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
      index: true,
    },
    resolvedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const Alert = mongoose.model('Alert', AlertSchema);
