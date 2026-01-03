import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'login', 'logout'],
      required: true,
    },
    entityType: {
      type: String,
      enum: [
        'product',
        'order',
        'transaction',
        'user',
        'supplier',
        'category',
        'warehouse',
      ],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    changes: { type: mongoose.Schema.Types.Mixed },
    // TODO: Add reference to User model
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

export default AuditLog;
