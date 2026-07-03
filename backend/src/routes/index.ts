import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as taskController from '../controllers/taskController.js';
import * as noteController from '../controllers/noteController.js';

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// ===== Auth =====
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.me);

// ===== Tasks =====
router.get('/tasks', authMiddleware, taskController.list);
router.post('/tasks', authMiddleware, taskController.create);
router.put('/tasks/:id', authMiddleware, taskController.update);
router.delete('/tasks/:id', authMiddleware, taskController.remove);
router.patch('/tasks/:id/toggle', authMiddleware, taskController.toggle);

// ===== Notes =====
router.get('/notes', authMiddleware, noteController.list);
router.post('/notes', authMiddleware, noteController.create);
router.put('/notes/:id', authMiddleware, noteController.update);
router.delete('/notes/:id', authMiddleware, noteController.remove);

export default router;
