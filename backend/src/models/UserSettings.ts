import mongoose, { Schema, type Document } from 'mongoose';
import { toJSONTransform } from '../utils/toJSON.js';

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId
  openRouterApiKey?: string
  openRouterModel: string
  createdAt: Date
  updatedAt: Date
}

const userSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    openRouterApiKey: {
      type: String,
      default: null,
      // Não expor a API key em nenhuma resposta
    },
    openRouterModel: {
      type: String,
      default: 'gpt-4o-mini',
    },
  },
  {
    timestamps: true,
    toJSON: { transform: toJSONTransform },
  },
);

// Índice composto para garantir unicidade por usuário
userSettingsSchema.index({ userId: 1 });

export const UserSettings = mongoose.model<IUserSettings>('UserSettings', userSettingsSchema);
