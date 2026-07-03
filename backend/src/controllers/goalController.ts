import { Request, Response, NextFunction } from 'express';
import { Goal } from '../models/Goal.js';
import { createGoalSchema, updateGoalSchema } from '../validators/goalValidator.js';
import { AppError } from '../middleware/errorHandler.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, type } = req.query;
    const query: any = { userId: req.user!.userId };
    if (status) query.status = status;
    if (type) query.type = type;
    const goals = await Goal.find(query).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createGoalSchema.parse(req.body);
    const goal = await Goal.create({
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : null,
      milestones: data.milestones?.map((m: any) => ({
        ...m,
        date: m.date ? new Date(m.date) : null,
      })) || [],
      userId: req.user!.userId,
    });
    res.status(201).json(goal);
  } catch (error) {
    if ((error as any).name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos', details: (error as any).errors }); return; }
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateGoalSchema.parse(req.body);
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      {
        ...data,
        deadline: data.deadline !== undefined ? (data.deadline ? new Date(data.deadline) : null) : undefined,
      },
      { new: true, runValidators: true },
    );
    if (!goal) throw new AppError('Meta não encontrada', 404);
    res.json(goal);
  } catch (error) {
    if (error instanceof AppError) { res.status(error.statusCode).json({ error: error.message }); return; }
    if ((error as any).name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos', details: (error as any).errors }); return; }
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!goal) throw new AppError('Meta não encontrada', 404);
    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) { res.status(error.statusCode).json({ error: error.message }); return; }
    next(error);
  }
}
