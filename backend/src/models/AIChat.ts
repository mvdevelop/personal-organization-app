import mongoose, { Schema, type Document } from 'mongoose';

export interface IAIChat extends Document {
  userId: mongoose.Types.ObjectId
  messages: { role: 'system' | 'user' | 'assistant'; content: string; timestamp: Date }[]
  createdAt: Date
  updatedAt: Date
}

const aiChatSchema = new Schema<IAIChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    messages: [
      {
        role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export const AIChat = mongoose.model<IAIChat>('AIChat', aiChatSchema);
