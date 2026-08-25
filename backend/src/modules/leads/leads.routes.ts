import { Router } from 'express';
import { asyncHandler } from '../../core/http/asyncHandler.js';
import { requirePermission } from '../../core/rbac/index.js';
import { requireAuth } from '../../core/auth/auth-middleware.js';
import { LeadsController } from './leads.controller.js';

export const leadRoutes = Router();

leadRoutes.use(requireAuth);

leadRoutes.get(
  '/',
  requirePermission('leads.view'),
  asyncHandler(LeadsController.list),
);

leadRoutes.post(
  '/',
  requirePermission('leads.create'),
  asyncHandler(LeadsController.create),
);

leadRoutes.get(
  '/:id',
  requirePermission('leads.view'),
  asyncHandler(LeadsController.get),
);

leadRoutes.patch(
  '/:id',
  requirePermission('leads.update'),
  asyncHandler(LeadsController.update),
);

leadRoutes.post(
  '/:id/claim',
  requirePermission('leads.claim'),
  asyncHandler(LeadsController.claim),
);

leadRoutes.patch(
  '/:id/qualify',
  requirePermission('leads.update'),
  asyncHandler(LeadsController.qualify),
);
