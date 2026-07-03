import mongoose, { Schema, type Document } from 'mongoose';

export interface ISubject extends Document {
  name: string
  category: 'faculdade' | 'concurso' | 'curso' | 'personal'
  color: string
  workload: number
  userId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const subjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    category: {
      type: String,
      enum: ['faculdade', 'concurso', 'curso', 'personal'],
      default: 'personal',
    },
    color: {
      type: String,
      default: '#3b82f6',
      match: [/^#[0-9a-fA-F]{6}$/, 'Cor inválida'],
    },
    workload: { type: Number, default: 0 },
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
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

subjectSchema.index({ userId: 1, name: 1 })

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema)

export interface IStudySession extends Document {
  subjectId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  duration: number
  content: string
  technique: 'pomodoro' | 'revisao' | 'exercicio' | 'leitura' | 'outro'
  date: Date
  createdAt: Date
  updatedAt: Date
}

const studySessionSchema = new Schema<IStudySession>(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duração é obrigatória'],
      min: [1, 'Duração mínima é 1 minuto'],
    },
    content: { type: String, default: '' },
    technique: {
      type: String,
      enum: ['pomodoro', 'revisao', 'exercicio', 'leitura', 'outro'],
      default: 'pomodoro',
    },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

studySessionSchema.index({ userId: 1, date: -1 })
studySessionSchema.index({ subjectId: 1, date: -1 })

export const StudySession = mongoose.model<IStudySession>('StudySession', studySessionSchema)
