import { Request, Response, NextFunction } from 'express';
import { UserStats, levelProgress } from '../models/UserStats.js';
import { Achievement } from '../models/Achievement.js';
import { recalculateAllStats } from '../services/gamificationService.js';

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      stats = await UserStats.create({ userId });
    }

    const progress = levelProgress(stats.xp);
    const allAchievements = await Achievement.find().lean();
    const achievementsWithStatus = allAchievements.map((ach) => {
      const unlocked = stats!.unlockedAchievements.find((u) => u.slug === ach.slug);
      return {
        slug: ach.slug,
        title: ach.title,
        description: ach.description,
        icon: ach.icon,
        category: ach.category,
        xpReward: ach.xpReward,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt || null,
      };
    });

    res.json({
      ...progress,
      totalXp: stats.xp,
      unlockedAchievements: achievementsWithStatus,
      counters: stats.counters,
    });
  } catch (error) {
    next(error);
  }
}

export async function recalculate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await recalculateAllStats(req.user!.userId);
    const stats = await UserStats.findOne({ userId: req.user!.userId });
    res.json({ message: 'Estatísticas recalculadas', stats });
  } catch (error) {
    next(error);
  }
}

export async function getAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const allAchievements = await Achievement.find().sort({ category: 1 }).lean();
    const userStats = await UserStats.findOne({ userId: req.user!.userId });
    const unlocked = userStats?.unlockedAchievements || [];

    const result = allAchievements.map((ach) => ({
      ...ach,
      unlocked: !!unlocked.find((u) => u.slug === ach.slug),
      unlockedAt: unlocked.find((u) => u.slug === ach.slug)?.unlockedAt || null,
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
}
