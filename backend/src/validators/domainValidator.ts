import { z } from 'zod';
import { DEFAULT_DOMAINS } from '../models/Domain.js';

export const createDomainSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  icon: z.string().default('circle'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#3b82f6'),
  order: z.number().default(0),
});

export const updateDomainSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  order: z.number().optional(),
});

export async function seedDefaultDomains(userId: string): Promise<void> {
  const { Domain } = await import('../models/Domain.js');
  for (const d of DEFAULT_DOMAINS) {
    await Domain.findOneAndUpdate(
      { userId, slug: d.slug },
      { ...d, userId },
      { upsert: true, new: true },
    );
  }
}
