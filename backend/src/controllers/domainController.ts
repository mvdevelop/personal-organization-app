import { Request, Response, NextFunction } from 'express';
import { Domain, DEFAULT_DOMAINS } from '../models/Domain.js';
import { createDomainSchema, updateDomainSchema, seedDefaultDomains } from '../validators/domainValidator.js';
import { AppError } from '../middleware/errorHandler.js';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const domains = await Domain.find({ userId: req.user!.userId }).sort({ order: 1 });
    res.json(domains);
  } catch (error) { next(error); }
}

export async function seed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await seedDefaultDomains(req.user!.userId);
    const domains = await Domain.find({ userId: req.user!.userId }).sort({ order: 1 });
    res.json(domains);
  } catch (error) { next(error); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createDomainSchema.parse(req.body);
    const domain = await Domain.create({ ...data, userId: req.user!.userId });
    res.status(201).json(domain);
  } catch (error) {
    if ((error as any).name === 'ZodError') {
      res.status(400).json({ error: 'Dados inválidos', details: (error as any).errors });
      return;
    }
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateDomainSchema.parse(req.body);
    const domain = await Domain.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      data,
      { new: true, runValidators: true },
    );
    if (!domain) throw new AppError('Domínio não encontrado', 404);
    res.json(domain);
  } catch (error) {
    if (error instanceof AppError) { res.status(error.statusCode).json({ error: error.message }); return; }
    if ((error as any).name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos', details: (error as any).errors }); return; }
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const domain = await Domain.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId, predefined: false });
    if (!domain) throw new AppError('Domínio não encontrado ou não pode ser removido', 404);
    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) { res.status(error.statusCode).json({ error: error.message }); return; }
    next(error);
  }
}
