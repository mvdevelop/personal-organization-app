import { Request, Response, NextFunction } from 'express';
import { Note } from '../models/Note.js';
import { createNoteSchema, updateNoteSchema } from '../validators/noteValidator.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         color:
 *           type: string
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateNoteInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         color:
 *           type: string
 *     UpdateNoteInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         color:
 *           type: string
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     tags:
 *       - Notas
 *     summary: Listar notas do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notes = await Note.find({ userId: req.user!.userId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/notes:
 *   post:
 *     tags:
 *       - Notas
 *     summary: Criar nova nota
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNoteInput'
 *     responses:
 *       201:
 *         description: Nota criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Dados inválidos
 */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createNoteSchema.parse(req.body);
    const note = await Note.create({
      ...data,
      userId: req.user!.userId,
    });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     tags:
 *       - Notas
 *     summary: Atualizar nota
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
 *             $ref: '#/components/schemas/UpdateNoteInput'
 *     responses:
 *       200:
 *         description: Nota atualizada
 *       404:
 *         description: Nota não encontrada
 */
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateNoteSchema.parse(req.body);
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      data,
      { new: true, runValidators: true },
    );

    if (!note) {
      throw new AppError('Nota não encontrada', 404);
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
}

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     tags:
 *       - Notas
 *     summary: Deletar nota
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
 *         description: Nota deletada
 *       404:
 *         description: Nota não encontrada
 */
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });

    if (!note) {
      throw new AppError('Nota não encontrada', 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
