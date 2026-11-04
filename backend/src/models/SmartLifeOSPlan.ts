import mongoose, { Schema, type Document } from 'mongoose';
import { toJSONTransform } from '../utils/toJSON.js';

export interface ISmartLifeOSPlan extends Document {
  userId: mongoose.Types.ObjectId
  date: Date // Which day is this plan for
  aiGenerated: boolean
  actions: Array<{
    sequence: number
    type: 'task' | 'habit' | 'study' | 'review'
    entityId: mongoose.Types.ObjectId
    entityTitle: string
    estimatedDuration: number // minutes
    scheduledTime?: Date
    completed: boolean
  }>
  userFeedback?: 'accepted' | 'edited' | 'rejected'
  completionRate?: number // % of actions completed
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const smartLifeOSPlanSchema = new Schema<ISmartLifeOSPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    aiGenerated: {
      type: Boolean,
      default: true,
    },
    actions: [
      {
        sequence: { type: Number, required: true },
        type: {
          type: String,
          enum: ['task', 'habit', 'study', 'review'],
          required: true,
        },
        entityId: Schema.Types.ObjectId,
        entityTitle: { type: String, required: true, maxlength: 200 },
        estimatedDuration: { type: Number, required: true, min: 5 },
        scheduledTime: Date,
        completed: { type: Boolean, default: false },
      },
    ],
    userFeedback: {
      type: String,
      enum: ['accepted', 'edited', 'rejected'],
    },
    completionRate: Number,
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: { transform: toJSONTransform },
  },
);

// Indexes for quick queries
smartLifeOSPlanSchema.index({ userId: 1, date: -1 });
smartLifeOSPlanSchema.index({ userId: 1, date: 1 }); // For today's plan lookup

export const SmartLifeOSPlan = mongoose.model<ISmartLifeOSPlan>(
  'SmartLifeOSPlan',
  smartLifeOSPlanSchema,
);
