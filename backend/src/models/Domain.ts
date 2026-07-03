import mongoose, { Schema, type Document } from 'mongoose';

export interface IDomain extends Document {
  name: string
  slug: string
  icon: string
  color: string
  userId?: mongoose.Types.ObjectId
  predefined: boolean
  order: number
}

const domainSchema = new Schema<IDomain>(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    icon: { type: String, default: 'circle' },
    color: { type: String, default: '#3b82f6', match: [/^#[0-9a-fA-F]{6}$/, 'Cor inválida'] },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    predefined: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
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

domainSchema.index({ userId: 1, slug: 1 }, { unique: true })

export const Domain = mongoose.model<IDomain>('Domain', domainSchema)

export const DEFAULT_DOMAINS = [
  { name: 'Estudos', slug: 'estudos', icon: 'book-open', color: '#3b82f6', predefined: true, order: 1 },
  { name: 'Trabalho', slug: 'trabalho', icon: 'briefcase', color: '#8b5cf6', predefined: true, order: 2 },
  { name: 'Musculação', slug: 'musculacao', icon: 'dumbbell', color: '#ef4444', predefined: true, order: 3 },
  { name: 'Música', slug: 'musica', icon: 'music', color: '#f59e0b', predefined: true, order: 4 },
  { name: 'Leitura', slug: 'leitura', icon: 'book', color: '#10b981', predefined: true, order: 5 },
  { name: 'Casa', slug: 'casa', icon: 'home', color: '#ec4899', predefined: true, order: 6 },
  { name: 'Finanças', slug: 'financas', icon: 'dollar-sign', color: '#14b8a6', predefined: true, order: 7 },
  { name: 'Lazer', slug: 'lazer', icon: 'coffee', color: '#f97316', predefined: true, order: 8 },
  { name: 'Saúde', slug: 'saude', icon: 'heart', color: '#e11d48', predefined: true, order: 9 },
]
