import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { HttpError } from '../utils/errors.js';
import { safeEqual, signToken } from '../utils/security.js';

export function createRoutes({ employees, feedback, config }) {
  const router = Router();
  const limiter = createRateLimiter({ windowMs: config.loginWindowMs, max: config.loginMaxAttempts });
  const writeLimiter = createRateLimiter({ windowMs: config.loginWindowMs, max: config.writeMaxRequests });
  const employeeOnly = requireRole('employee', config.tokenSecret);
  const managerOnly = requireRole('manager', config.tokenSecret);

  router.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // ---- Funcionários ----
  router.post('/employees', writeLimiter, (req, res) => {
    res.status(201).json({ employee: employees.register(req.body) });
  });
  router.post('/auth/login', limiter, (req, res) => res.json(employees.login(req.body)));
  router.get('/employees/me', employeeOnly, (req, res) => {
    res.json({ employee: employees.getById(req.auth.sub) });
  });
  router.put('/employees/me/availability', employeeOnly, (req, res) => {
    res.json({ employee: employees.saveAvailability(req.auth.sub, req.body) });
  });

  // ---- Feedback ----
  router.get('/feedback', (_req, res) => res.json({ feedback: feedback.list() }));
  router.post('/feedback', writeLimiter, (req, res) => res.status(201).json({ feedback: feedback.create(req.body) }));

  // ---- Gestor ----
  router.post('/manager/login', limiter, (req, res) => {
    if (!config.managerPassword) {
      throw new HttpError(503, 'MANAGER_DISABLED', 'Acesso de gestor não está configurado no servidor.');
    }
    if (!safeEqual(String(req.body?.codigo ?? ''), config.managerPassword)) {
      throw new HttpError(401, 'INVALID_CODE', 'Código incorreto.');
    }
    res.json({ token: signToken({ role: 'manager' }, config.tokenSecret, config.managerTokenTtl) });
  });
  router.get('/manager/team', managerOnly, (_req, res) => res.json({ employees: employees.listTeam() }));

  return router;
}
