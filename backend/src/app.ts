import cors from 'cors';
import express, { Request, Response } from 'express';

import { config } from './config/index.js';
import './core/context.js';
import { auditMiddleware } from './core/audit/index.js';
import authRoutes from './core/auth/auth-routes.js';
import fileRoutes from './core/files/files-routes.js';
import { errorHandler, notFoundHandler } from './core/http/error-middleware.js';
import notificationRoutes from './core/notifications/notifications-routes.js';
import employeeRoutes from './modules/employees/employees.routes.js';

const app = express();

app.use(
  cors({
    origin: config.cors.origins.includes('*') ? true : config.cors.origins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * Global audit log. Mounted before the routes so it can hook the response, but
 * it reads `req.ctx` at finish time — by which point requireAuth has run.
 * Every successful create/update/delete is recorded without module authors
 * doing anything.
 */
if (config.audit.enabled) {
  app.use(auditMiddleware);
}

// Health check — used by the deployment and by the frontend to detect a dead API.
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    env: config.nodeEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// --- Core ---------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);

// --- Modules ------------------------------------------------------------------
// G1 — the reference module. Copy its structure.
app.use('/api/employees', employeeRoutes);
// Mount your module router here, e.g.
//   app.use('/api/leads', leadRoutes);

// 404 then the central error handler — both must stay last.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
