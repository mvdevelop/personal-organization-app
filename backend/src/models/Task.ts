import mongoose, { Schema, type Document } from 'mongoose';

export interface ITask extends Document {
  title: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate: Date | null
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Descrição deve ter no máximo 1000 caracteres'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

taskSchema.index({ userId: 1, createdAt: -1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
