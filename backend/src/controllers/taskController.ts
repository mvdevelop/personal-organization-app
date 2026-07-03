import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task.js';
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidator.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         completed:
 *           type: boolean
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         dueDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateTaskInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         dueDate:
 *           type: string
 *           format: date
 *           nullable: true
 *     UpdateTaskInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         completed:
 *           type: boolean
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         dueDate:
 *           type: string
 *           format: date
 *           nullable: true
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags:
 *       - Tarefas
 *     summary: Listar tarefas do usuário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, active, completed]
 *         description: Filtrar tarefas
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por título ou descrição
 *     responses:
 *       200:
 *         description: Lista de tarefas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { filter, search } = req.query;

    const query: any = { userId };

    if (filter === 'active') query.completed = false;
    if (filter === 'completed') query.completed = true;

    if (search) {
      const searchRegex = { $regex: search as string, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags:
 *       - Tarefas
 *     summary: Criar nova tarefa
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskInput'
 *     responses:
 *       201:
 *         description: Tarefa criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Dados inválidos
 */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createTaskSchema.parse(req.body);
    const task = await Task.create({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      userId: req.user!.userId,
    });
    res.status(201).json(task);
  } catch (error) {
    if ((error as any).name === 'ZodError') {
      res.status(400).json({ error: 'Dados inválidos', details: (error as any).errors });
      return;
    }
    next(error);
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     tags:
 *       - Tarefas
 *     summary: Atualizar tarefa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskInput'
 *     responses:
 *       200:
 *         description: Tarefa atualizada
 *       404:
 *         description: Tarefa não encontrada
 */
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateTaskSchema.parse(req.body);
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { ...data, dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined },
      { new: true, runValidators: true },
    );

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }
    res.json(task);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    if ((error as any).name === 'ZodError') {
      res.status(400).json({ error: 'Dados inválidos', details: (error as any).errors });
      return;
    }
    next(error);
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     tags:
 *       - Tarefas
 *     summary: Deletar tarefa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tarefa deletada
 *       404:
 *         description: Tarefa não encontrada
 */
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }
    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
}

/**
 * @swagger
 * /api/tasks/{id}/toggle:
 *   patch:
 *     tags:
 *       - Tarefas
 *     summary: Alternar conclusão da tarefa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarefa atualizada
 *       404:
 *         description: Tarefa não encontrada
 */
export async function toggle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
}
