
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    bureau: { type: mongoose.Schema.Types.ObjectId, ref: 'Bureau' },
    region: { type: String },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
    role: {
      type: String,
      required: true,
      enum: [
        'super_admin',
        'senior_management',
        'bureau_officer',
        'regional_officer',
        'data_operator',
        'student',
      ],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
