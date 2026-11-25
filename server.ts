import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createTaskForUser,
  deleteTaskForUser,
  listTasksForUser,
  toggleTaskForUser,
  updateTaskForUser,
} from './src/db/tasks.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import type { TaskCategory, TaskFormData } from './src/types/task.ts';
import { validateTaskInput } from './src/utils/taskLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function resolveAuthenticatedUser(req: AuthRequest) {
  const uid = req.user?.uid;
  if (!uid) {
    throw new Error('Unauthorized');
  }
  const email = typeof req.user?.email === 'string' ? req.user.email : '';
  const displayName = typeof req.user?.name === 'string' ? req.user.name : '';
  return getOrCreateUser(uid, email, displayName);
}

function parseTaskPayload(body: unknown): TaskFormData {
  const record =
    body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  return {
    title: typeof record.title === 'string' ? record.title : '',
    description: typeof record.description === 'string' ? record.description : '',
    category: (typeof record.category === 'string'
      ? record.category
      : 'Personal') as TaskCategory,
    dueDate: typeof record.dueDate === 'string' ? record.dueDate : '',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  // Authenticated CRUD API routes backed by PostgreSQL
  app.get('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
    try {
      const dbUser = await resolveAuthenticatedUser(req);
      const userTasks = await listTasksForUser(dbUser.id);
      return res.json({ tasks: userTasks });
    } catch (error) {
      console.error('GET /api/tasks failed:', error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Failed to load tasks.',
      });
    }
  });

  app.post('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
    try {
      const payload = parseTaskPayload(req.body);
      const validation = validateTaskInput(payload);
      if (!validation.isValid) {
        return res.status(400).json({
          error:
            validation.errors.title ||
            validation.errors.description ||
            'Invalid task input.',
          errors: validation.errors,
        });
      }

      const dbUser = await resolveAuthenticatedUser(req);
      const created = await createTaskForUser(dbUser.id, validation.sanitized);
      return res.status(201).json({ task: created });
    } catch (error) {
      console.error('POST /api/tasks failed:', error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Failed to create task.',
      });
    }
  });

  app.put('/api/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const taskId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
      if (!taskId || taskId.length > 100) {
        return res.status(400).json({ error: 'Invalid task ID.' });
      }

      const payload = parseTaskPayload(req.body);
      const validation = validateTaskInput(payload);
      if (!validation.isValid) {
        return res.status(400).json({
          error:
            validation.errors.title ||
            validation.errors.description ||
            'Invalid task input.',
          errors: validation.errors,
        });
      }

      const dbUser = await resolveAuthenticatedUser(req);
      const updated = await updateTaskForUser(
        dbUser.id,
        taskId,
        validation.sanitized,
      );
      if (!updated) {
        return res.status(404).json({ error: 'Task not found.' });
      }

      return res.json({ task: updated });
    } catch (error) {
      console.error('PUT /api/tasks/:id failed:', error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Failed to update task.',
      });
    }
  });

  app.patch(
    '/api/tasks/:id/toggle',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const taskId =
          typeof req.params.id === 'string' ? req.params.id.trim() : '';
        if (!taskId || taskId.length > 100) {
          return res.status(400).json({ error: 'Invalid task ID.' });
        }

        const dbUser = await resolveAuthenticatedUser(req);
        const updated = await toggleTaskForUser(dbUser.id, taskId);
        if (!updated) {
          return res.status(404).json({ error: 'Task not found.' });
        }

        return res.json({ task: updated });
      } catch (error) {
        console.error('PATCH /api/tasks/:id/toggle failed:', error);
        return res.status(500).json({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to update task status.',
        });
      }
    },
  );

  app.delete('/api/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const taskId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
      if (!taskId || taskId.length > 100) {
        return res.status(400).json({ error: 'Invalid task ID.' });
      }

      const dbUser = await resolveAuthenticatedUser(req);
      const deleted = await deleteTaskForUser(dbUser.id, taskId);
      if (!deleted) {
        return res.status(404).json({ error: 'Task not found.' });
      }

      return res.json({ deleted: true, id: taskId });
    } catch (error) {
      console.error('DELETE /api/tasks/:id failed:', error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Failed to delete task.',
      });
    }
  });

  // Unknown API endpoints return JSON 404
  app.use('/api', (_req, res) => {
    return res.status(404).json({ error: 'API endpoint not found.' });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
