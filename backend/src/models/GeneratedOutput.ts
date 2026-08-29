import mongoose, { Document, Schema } from 'mongoose';

export interface IVersion {
  content: any;
  editedBy: mongoose.Types.ObjectId;
  editedAt: Date;
  note?: string;
}

export interface IComment {
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IGeneratedOutput extends Document {
  projectId: mongoose.Types.ObjectId;
  sourceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  format: string;
  content: any;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  versions: IVersion[];
  reviewerComments: IComment[];
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  approvalNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const versionSchema = new Schema<IVersion>({
  content: { type: Schema.Types.Mixed, required: true },
  editedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  editedAt: { type: Date, default: Date.now },
  note: { type: String }
});

const commentSchema = new Schema<IComment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const generatedOutputSchema = new Schema<IGeneratedOutput>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    sourceId: { type: Schema.Types.ObjectId, ref: 'Source', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    format: { type: String, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'DRAFT',
    },
    versions: [versionSchema],
    reviewerComments: [commentSchema],
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    approvalNote: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IGeneratedOutput>('GeneratedOutput', generatedOutputSchema);

