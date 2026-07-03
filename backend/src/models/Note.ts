import mongoose, { Schema, type Document } from 'mongoose';

export interface INote extends Document {
  title: string
  content: string
  color: string
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
      maxlength: [200, 'Título deve ter no máximo 200 caracteres'],
    },
    content: {
      type: String,
      default: '',
      maxlength: [10000, 'Conteúdo deve ter no máximo 10000 caracteres'],
    },
    color: {
      type: String,
      default: '#ffffff',
      match: [/^#[0-9a-fA-F]{6}$/, 'Cor deve ser um hex válido'],
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

noteSchema.index({ userId: 1, updatedAt: -1 });

export const Note = mongoose.model<INote>('Note', noteSchema);
