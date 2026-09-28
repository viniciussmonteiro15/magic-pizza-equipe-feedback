import cors from 'cors';
import express from 'express';
import { createEmployeeRepository } from './repositories/employeeRepository.js';
import { createFeedbackRepository } from './repositories/feedbackRepository.js';
import { createEmployeeService } from './services/employeeService.js';
import { createFeedbackService } from './services/feedbackService.js';
import { createRoutes } from './routes/index.js';
import { HttpError } from './utils/errors.js';

export function createApp({ config, db }) {
  const employees = createEmployeeService({ repo: createEmployeeRepository(db), config });
  const feedback = createFeedbackService({ repo: createFeedbackRepository(db) });

  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);

  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '50kb' }));

  app.use('/api', createRoutes({ employees, feedback, config }));

  app.use((_req, _res, next) => next(new HttpError(404, 'NOT_FOUND', 'Rota não encontrada.')));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'JSON inválido.' } });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: { code: 'TOO_LARGE', message: 'Requisição grande demais.' } });
    }
    console.error(err);
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Erro interno do servidor.' } });
  });

  return app;
}
