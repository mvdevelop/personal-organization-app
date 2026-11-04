import mongoose, { Schema, type Document } from 'mongoose';

export interface IAIAudit extends Document {
  userId: mongoose.Types.ObjectId
  provider: string
  modelName: string // Renamed to avoid conflict with mongoose.model()
  /** Raw prompt sent to AI (without API keys) */
  prompt: string
  /** Raw response from AI */
  response: string
  /** Parsed actions proposed by AI */
  actions: {
    type: string
    description: string
    data?: Record<string, unknown>
  }[]
  /** User decision: approved, rejected, partial */
  decision: 'approved' | 'rejected' | 'partial' | 'pending'
  /** Which actions user actually approved */
  approvedActions?: number[]
  /** Error message if execution failed */
  executionError?: string
  /** Tokens consumed */
  tokensUsed: number
  createdAt: Date
  updatedAt: Date
}

const aiAuditSchema = new Schema<IAIAudit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    modelName: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
      maxlength: 50000,
    },
    response: {
      type: String,
      required: true,
      maxlength: 50000,
    },
    actions: [
      {
        type: { type: String, required: true },
        description: { type: String, required: true },
        data: { type: Schema.Types.Mixed, optional: true },
      },
    ],
    decision: {
      type: String,
      enum: ['approved', 'rejected', 'partial', 'pending'],
      default: 'pending',
    },
    approvedActions: [Number],
    executionError: String,
    tokensUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for user audit history and recent decisions
aiAuditSchema.index({ userId: 1, createdAt: -1 });
aiAuditSchema.index({ userId: 1, decision: 1 });

export const AIAudit = mongoose.model<IAIAudit>('AIAudit', aiAuditSchema);
