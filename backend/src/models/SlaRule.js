import mongoose from 'mongoose';

const SlaRuleSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, index: true },
    bureau: { type: mongoose.Schema.Types.ObjectId, ref: 'Bureau' },
    daysToDispose: { type: Number, required: true, default: 30 },
    reminderAfterDays: { type: Number, required: true, default: 7 },
    dueSoonDays: { type: Number, required: true, default: 3 },
    escalateAfterDaysOverdue: { type: Number, required: true, default: 7 },
  },
  { timestamps: true }
);

export const SlaRule = mongoose.model('SlaRule', SlaRuleSchema);
