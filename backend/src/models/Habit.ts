import mongoose, { Schema, type Document } from 'mongoose';
import { toJSONTransform } from '../utils/toJSON.js';

export interface IHabit extends Document {
  title: string
  description: string
  frequency: 'daily' | 'weekly'
  daysOfWeek: number[]
  domainId?: mongoose.Types.ObjectId
  color: string
  reminderTime?: string
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const habitSchema = new Schema<IHabit>(
  {
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      maxlength: [100, 'Título deve ter no máximo 100 caracteres'],
    },
    description: { type: String, default: '', maxlength: 500 },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    daysOfWeek: {
      type: [Number],
      default: [1, 2, 3, 4, 5], // seg-sex
    },
    domainId: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      default: null,
    },
    color: {
      type: String,
      default: '#3b82f6',
      match: [/^#[0-9a-fA-F]{6}$/, 'Cor inválida'],
    },
    reminderTime: { type: String, default: null },
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

habitSchema.index({ userId: 1, title: 1 })

export const Habit = mongoose.model<IHabit>('Habit', habitSchema)

export interface IHabitLog extends Document {
  habitId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  date: Date
  completed: boolean
  note: string
}

const habitLogSchema = new Schema<IHabitLog>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: true },
    note: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: { transform: toJSONTransform },
  },
)

habitLogSchema.index({ habitId: 1, date: -1 }, { unique: true })
habitLogSchema.index({ userId: 1, date: -1 })

export const HabitLog = mongoose.model<IHabitLog>('HabitLog', habitLogSchema)
