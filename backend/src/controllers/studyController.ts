import { Request, Response, NextFunction } from 'express';
import { Subject, StudySession } from '../models/Subject.js';
import { createSubjectSchema, updateSubjectSchema, createStudySessionSchema } from '../validators/studyValidator.js';
import { AppError } from '../middleware/errorHandler.js';

// Subjects
export async function listSubjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subjects = await Subject.find({ userId: req.user!.userId }).sort({ name: 1 });
    res.json(subjects);
  } catch (error) { next(error); }
}

export async function createSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createSubjectSchema.parse(req.body);
    const subject = await Subject.create({ ...data, userId: req.user!.userId });
    res.status(201).json(subject);
  } catch (error) { next(error); }
}

export async function updateSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateSubjectSchema.parse(req.body);
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      data,
      { new: true, runValidators: true },
    );
    if (!subject) throw new AppError('Matéria não encontrada', 404);
    res.json(subject);
  } catch (error) { next(error); }
}

export async function deleteSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!subject) throw new AppError('Matéria não encontrada', 404);
    await StudySession.deleteMany({ subjectId: req.params.id });
    res.status(204).send();
  } catch (error) { next(error); }
}

// Study Sessions
export async function listSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { start, end } = req.query;
    const query: any = { userId: req.user!.userId };
    if (start) query.date = { ...query.date, $gte: new Date(start as string) };
    if (end) query.date = { ...query.date, $lte: new Date(end as string) };
    const sessions = await StudySession.find(query).sort({ date: -1 });
    res.json(sessions);
  } catch (error) { next(error); }
}

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createStudySessionSchema.parse(req.body);
    const subject = await Subject.findOne({ _id: data.subjectId, userId: req.user!.userId });
    if (!subject) throw new AppError('Matéria não encontrada', 404);
    const session = await StudySession.create({
      ...data,
      date: new Date(data.date),
      userId: req.user!.userId,
    });
    res.status(201).json(session);
  } catch (error) { next(error); }
}

export async function deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!session) throw new AppError('Sessão não encontrada', 404);
    res.status(204).send();
  } catch (error) { next(error); }
}
