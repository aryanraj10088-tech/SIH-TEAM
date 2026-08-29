import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  entityType: 'GeneratedOutput' | 'Project' | 'Source' | 'User';
  entityId: mongoose.Types.ObjectId;
  action: string;
  performedBy: mongoose.Types.ObjectId;
  metadata?: any;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    entityType: {
      type: String,
      enum: ['GeneratedOutput', 'Project', 'Source', 'User'],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

