import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStorageMode, initializeTaskStorage } from './server/store.ts';
import { tasksRouter } from './server/routes/tasks.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await initializeTaskStorage();

  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      storage: getStorageMode(),
    });
  });

  app.use('/api', tasksRouter);

  // Unknown API route handler
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Centralized Express error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Malformed JSON request body.' });
      return;
    }
    const message = err instanceof Error ? err.message : 'An unexpected server error occurred.';
    console.error('Server error:', message);
    res.status(500).json({ error: 'Unable to complete request. Please try again.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Task Manager server running on http://localhost:${PORT}`);
  });
}

startServer();
