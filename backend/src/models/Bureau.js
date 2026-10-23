import mongoose from 'mongoose';

const BureauSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['bureau', 'cell', 'regional_office'],
    },
    region: { type: String },
  },
  { timestamps: true }
);

export const Bureau = mongoose.model('Bureau', BureauSchema);
