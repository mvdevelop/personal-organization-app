import { Request, Response, NextFunction } from 'express';
import { Habit, HabitLog } from '../models/Habit.js';
import { createHabitSchema, updateHabitSchema, createHabitLogSchema } from '../validators/habitValidator.js';
import { calculateAllStreaks } from '../services/streakService.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listHabits(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const habits = await Habit.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) { next(error); }
}

export async function createHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createHabitSchema.parse(req.body);
    const habit = await Habit.create({ ...data, userId: req.user!.userId });
    res.status(201).json(habit);
  } catch (error) { next(error); }
}

export async function updateHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateHabitSchema.parse(req.body);
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      data,
      { new: true, runValidators: true },
    );
    if (!habit) throw new AppError('Hábito não encontrado', 404);
    res.json(habit);
  } catch (error) { next(error); }
}

export async function deleteHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!habit) throw new AppError('Hábito não encontrado', 404);
    await HabitLog.deleteMany({ habitId: req.params.id });
    res.status(204).send();
  } catch (error) { next(error); }
}

// Habit Logs
export async function listLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { start, end } = req.query;
    const query: any = { userId: req.user!.userId };
    if (start) query.date = { ...query.date, $gte: new Date(start as string) };
    if (end) query.date = { ...query.date, $lte: new Date(end as string) };
    const logs = await HabitLog.find(query).sort({ date: -1 });
    res.json(logs);
  } catch (error) { next(error); }
}

export async function createLog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createHabitLogSchema.parse(req.body);
    const habit = await Habit.findOne({ _id: data.habitId, userId: req.user!.userId });
    if (!habit) throw new AppError('Hábito não encontrado', 404);
    const log = await HabitLog.findOneAndUpdate(
      { habitId: data.habitId, date: new Date(data.date) },
      { ...data, userId: req.user!.userId, date: new Date(data.date) },
      { upsert: true, new: true },
    );
    res.status(201).json(log);
  } catch (error) { next(error); }
}

export async function getStreaks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const streaks = await calculateAllStreaks(req.user!.userId);
    res.json(streaks);
  } catch (error) { next(error); }
}
