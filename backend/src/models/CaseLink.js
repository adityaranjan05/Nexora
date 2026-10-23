import mongoose from 'mongoose';

const CaseLinkSchema = new mongoose.Schema(
  {
    caseA: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    caseB: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    linkType: {
      type: String,
      enum: ['related', 'duplicate'],
      default: 'related',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const CaseLink = mongoose.model('CaseLink', CaseLinkSchema);
