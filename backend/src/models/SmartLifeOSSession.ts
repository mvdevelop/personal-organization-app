import mongoose, { Schema, type Document } from 'mongoose';
import { toJSONTransform } from '../utils/toJSON.js';

export interface ISmartLifeOSSession extends Document {
  userId: mongoose.Types.ObjectId
  focusedOn: 'task' | 'goal' | 'habit' | 'study'
  entityId: mongoose.Types.ObjectId // Reference to task, goal, etc
  entityTitle: string // Denormalized for quick display
  plannedDuration: number // minutes
  actualDuration?: number
  completed: boolean
  startedAt: Date
  completedAt?: Date
  notes?: string
  xpEarned?: number
  createdAt: Date
  updatedAt: Date
}

const smartLifeOSSessionSchema = new Schema<ISmartLifeOSSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    focusedOn: {
      type: String,
      enum: ['task', 'goal', 'habit', 'study'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    entityTitle: {
      type: String,
      required: true,
      maxlength: 200,
    },
    plannedDuration: {
      type: Number,
      required: true,
      min: 1,
      max: 1440, // max 1 day
    },
    actualDuration: Number,
    completed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    notes: {
      type: String,
      maxlength: 2000,
    },
    xpEarned: Number,
  },
  {
    timestamps: true,
    toJSON: { transform: toJSONTransform },
  },
);

// Indexes for quick queries
smartLifeOSSessionSchema.index({ userId: 1, startedAt: -1 });
smartLifeOSSessionSchema.index({ userId: 1, completed: 1 });
smartLifeOSSessionSchema.index({ userId: 1, focusedOn: 1, startedAt: -1 });

export const SmartLifeOSSession = mongoose.model<ISmartLifeOSSession>(
  'SmartLifeOSSession',
  smartLifeOSSessionSchema,
);
