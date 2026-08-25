import { Router } from 'express';
import { asyncHandler } from '../../core/http/asyncHandler.js';
import { requirePermission } from '../../core/rbac/index.js';
import { requireAuth } from '../../core/auth/auth-middleware.js';
import { SitesController } from './sites.controller.js';

export const siteRoutes = Router();

siteRoutes.use(requireAuth);

siteRoutes.get(
  '/',
  requirePermission('sites.view'),
  asyncHandler(SitesController.list),
);

siteRoutes.post(
  '/',
  requirePermission('sites.manage'),
  asyncHandler(SitesController.create),
);

siteRoutes.post(
  '/import',
  requirePermission('sites.manage'),
  asyncHandler(SitesController.bulkImport),
);

siteRoutes.get(
  '/availability',
  requirePermission('sites.view'),
  asyncHandler(SitesController.searchAvailability),
);

siteRoutes.get(
  '/:id/calendar',
  requirePermission('sites.view'),
  asyncHandler(SitesController.getCalendar),
);

siteRoutes.get(
  '/:id',
  requirePermission('sites.view'),
  asyncHandler(SitesController.get),
);

siteRoutes.patch(
  '/:id',
  requirePermission('sites.manage'),
  asyncHandler(SitesController.update),
);
