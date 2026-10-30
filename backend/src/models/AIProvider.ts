import mongoose, { Schema, type Document } from 'mongoose';
import { toJSONTransform } from '../utils/toJSON.js';

export type AIProviderType = 'openrouter' | 'openai' | 'anthropic' | 'google'

export interface IAIProvider extends Document {
  userId: mongoose.Types.ObjectId
  providers: {
    type: AIProviderType
    apiKey: string // encrypted at rest
    model: string
    isEnabled: boolean
    isDefault: boolean
  }[]
  // Configurable system context for the AI — editable by user
  systemPrompt?: string
  maxTokens: number
  temperature: number
  createdAt: Date
  updatedAt: Date
}

const aiProviderSchema = new Schema<IAIProvider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    providers: [
      {
        type: {
          type: String,
          enum: ['openrouter', 'openai', 'anthropic', 'google'],
          required: true,
        },
        apiKey: {
          type: String,
          required: true,
          select: false, // never include in queries by default
        },
        model: {
          type: String,
          default: 'gpt-4o-mini',
        },
        isEnabled: {
          type: Boolean,
          default: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    systemPrompt: {
      type: String,
      default: `Você é um assistente pessoal integrado a um aplicativo de organização.
Você ajuda o usuário a organizar tarefas, criar planos de estudo, sugerir hábitos,
dar dicas de produtividade, motivar e auxiliar em decisões do dia a dia.
Seja direto, prático e amigável. Responda em português brasileiro.
Quando aplicável, sugira ações que o usuário pode tomar no app.`,
    },
    maxTokens: {
      type: Number,
      default: 1024,
    },
    temperature: {
      type: Number,
      default: 0.7,
    },
  },
  { timestamps: true },
);

aiProviderSchema.index({ userId: 1 });

// Ensure only one default provider per user
aiProviderSchema.pre('save', function (next) {
  if (this.isModified('providers') && this.providers.some(p => p.isDefault)) {
    // Clear other defaults — handled in the service
  }
  next();
});

export const AIProvider = mongoose.model<IAIProvider>('AIProvider', aiProviderSchema);

// Helper to mask API keys for display
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '•'.repeat(8);
  const start = key.slice(0, 4);
  const end = key.slice(-4);
  const middle = '•'.repeat(Math.min(key.length - 8, 32));
  return `${start}${middle}${end}`;
}
