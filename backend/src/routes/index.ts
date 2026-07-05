import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as taskController from '../controllers/taskController.js';
import * as noteController from '../controllers/noteController.js';
import * as domainController from '../controllers/domainController.js';
import * as habitController from '../controllers/habitController.js';
import * as goalController from '../controllers/goalController.js';
import * as studyController from '../controllers/studyController.js';
import * as aiController from '../controllers/aiController.js';
import * as dashboardController from '../controllers/dashboardController.js';
import * as gamificationController from '../controllers/gamificationController.js';

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
router.post('/auth/logout', authController.logout);
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

// ===== Domains =====
router.get('/domains', authMiddleware, domainController.list);
router.post('/domains/seed', authMiddleware, domainController.seed);
router.post('/domains', authMiddleware, domainController.create);
router.put('/domains/:id', authMiddleware, domainController.update);
router.delete('/domains/:id', authMiddleware, domainController.remove);

// ===== Habits =====
router.get('/habits', authMiddleware, habitController.listHabits);
router.post('/habits', authMiddleware, habitController.createHabit);
router.put('/habits/:id', authMiddleware, habitController.updateHabit);
router.delete('/habits/:id', authMiddleware, habitController.deleteHabit);
router.get('/habits/logs', authMiddleware, habitController.listLogs);
router.post('/habits/logs', authMiddleware, habitController.createLog);
router.get('/habits/streaks', authMiddleware, habitController.getStreaks);

// ===== Goals =====
router.get('/goals', authMiddleware, goalController.list);
router.post('/goals', authMiddleware, goalController.create);
router.put('/goals/:id', authMiddleware, goalController.update);
router.delete('/goals/:id', authMiddleware, goalController.remove);

// ===== Studies =====
router.get('/subjects', authMiddleware, studyController.listSubjects);
router.post('/subjects', authMiddleware, studyController.createSubject);
router.put('/subjects/:id', authMiddleware, studyController.updateSubject);
router.delete('/subjects/:id', authMiddleware, studyController.deleteSubject);
router.get('/study-sessions', authMiddleware, studyController.listSessions);
router.post('/study-sessions', authMiddleware, studyController.createSession);
router.delete('/study-sessions/:id', authMiddleware, studyController.deleteSession);

// ===== Dashboard =====
router.get('/dashboard', authMiddleware, dashboardController.getDashboardData);

// ===== Gamification =====
router.get('/gamification/stats', authMiddleware, gamificationController.getStats);
router.post('/gamification/recalculate', authMiddleware, gamificationController.recalculate);
router.get('/gamification/achievements', authMiddleware, gamificationController.getAchievements);

// ===== AI =====
router.post('/ai/chat', authMiddleware, aiController.chat);
router.get('/ai/history', authMiddleware, aiController.getHistory);
router.delete('/ai/history', authMiddleware, aiController.clearHistory);
router.get('/ai/daily-briefing', authMiddleware, aiController.dailyBriefing);
router.get('/ai/suggest-tasks', authMiddleware, aiController.suggestTasksEndpoint);

export default router;
