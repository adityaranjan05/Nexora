import mongoose from 'mongoose';

const InstitutionSchema = new mongoose.Schema(
  {
    aictePermanentId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    normalizedName: { type: String, required: true, index: true },
    address: { type: String, default: '' },
    city: { type: String, required: true, index: true },
    district: { type: String, default: '' },
    state: { type: String, required: true, index: true },
    pincode: { type: String, default: '', index: true },
    region: { type: String, required: true, index: true },
    institutionType: { type: String, default: 'Engineering & Technology' },
  },
  { timestamps: true }
);

// Indexes per SPEC section 6
InstitutionSchema.index({ normalizedName: 1, region: 1, aictePermanentId: 1 });
InstitutionSchema.index({ name: 'text', normalizedName: 'text', city: 'text' });

export const Institution = mongoose.model('Institution', InstitutionSchema);
