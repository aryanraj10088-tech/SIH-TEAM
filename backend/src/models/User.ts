import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'Operator' | 'Reviewer' | 'Administrator';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['Operator', 'Reviewer', 'Administrator'],
      default: 'Operator',
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
