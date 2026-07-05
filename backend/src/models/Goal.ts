import mongoose, { Schema, type Document } from 'mongoose';
import { toJSONTransform } from '../utils/toJSON.js';

export interface IGoal extends Document {
  title: string
  description: string
  type: 'purchase' | 'travel' | 'learning' | 'health' | 'career' | 'custom'
  targetValue?: number
  currentValue: number
  deadline?: Date
  domainId?: mongoose.Types.ObjectId
  status: 'active' | 'completed' | 'cancelled'
  milestones: { title: string; completed: boolean; date?: Date }[]
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const goalSchema = new Schema<IGoal>(
  {
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    description: { type: String, default: '', maxlength: 2000 },
    type: {
      type: String,
      enum: ['purchase', 'travel', 'learning', 'health', 'career', 'custom'],
      default: 'custom',
    },
    targetValue: { type: Number, default: null },
    currentValue: { type: Number, default: 0 },
    deadline: { type: Date, default: null },
    domainId: { type: Schema.Types.ObjectId, ref: 'Domain', default: null },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    milestones: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        date: { type: Date, default: null },
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { transform: toJSONTransform },
  },
)

goalSchema.index({ userId: 1, status: 1 })
goalSchema.index({ userId: 1, deadline: 1 })
goalSchema.index({ userId: 1, createdAt: -1 })

export const Goal = mongoose.model<IGoal>('Goal', goalSchema)
