import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'Operator' | 'Reviewer' | 'Administrator';
  accountType: 'INDIVIDUAL' | 'ORGANIZATION';
  isEmailVerified: boolean;
  accountStatus: 'PENDING' | 'ACTIVE' | 'DISABLED';
  otpHash?: string;
  otpExpiry?: Date;
  otpAttempts: number;
  invitationTokenHash?: string;
  invitationExpiry?: Date;
  // Google OAuth fields (safe defaults — won't break existing users)
  authProvider: 'local' | 'google';
  googleId?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    // Not required for Google OAuth users — they have no password
    passwordHash: { type: String, default: '' },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['Operator', 'Reviewer', 'Administrator'],
      default: 'Operator',
    },
    accountType: {
      type: String,
      enum: ['INDIVIDUAL', 'ORGANIZATION'],
      default: 'INDIVIDUAL',
    },
    isEmailVerified: { type: Boolean, default: true }, // Default true so existing users aren't broken
    accountStatus: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'DISABLED'],
      default: 'ACTIVE',
    },
    otpHash: { type: String },
    otpExpiry: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    invitationTokenHash: { type: String },
    invitationExpiry: { type: Date },
    // OAuth provider — 'local' for email/password, 'google' for Google OAuth
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    // Sparse index: only indexed when set, allows multiple null values
    googleId: { type: String, sparse: true },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
