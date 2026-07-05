import { DEFAULT_DOMAINS } from '../models/Domain.js';

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
