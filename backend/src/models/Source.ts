import mongoose, { Document, Schema } from 'mongoose';

export interface ISource extends Document {
  projectId: mongoose.Types.ObjectId;
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  status: 'PENDING' | 'PROCESSED' | 'ERROR';
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sourceSchema = new Schema<ISource>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSED', 'ERROR'],
      default: 'PENDING',
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISource>('Source', sourceSchema);
