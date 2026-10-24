import mongoose from 'mongoose';

const CaseActionSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    actionType: {
      type: String,
      required: true,
      enum: [
        'received',
        'assigned',
        'action_taken',
        'remark',
        'transferred',
        'escalated',
        'linked',
        'disposed',
        'rejected',
        'needs_info',
        'info_requested',
        'info_replied',
        'status_change',
      ],
    },
    fromStatus: { type: String },
    toStatus: { type: String },
    isPublic: { type: Boolean, default: true },
    fromBureau: { type: mongoose.Schema.Types.ObjectId, ref: 'Bureau' },
    toBureau: { type: mongoose.Schema.Types.ObjectId, ref: 'Bureau' },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedByBureau: { type: mongoose.Schema.Types.ObjectId, ref: 'Bureau' },
    remarks: { type: String, required: true },
    attachmentUrl: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const CaseAction = mongoose.model('CaseAction', CaseActionSchema);
