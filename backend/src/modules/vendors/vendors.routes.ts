import { Router } from 'express';
import { asyncHandler } from '../../core/http/asyncHandler.js';
import { requirePermission } from '../../core/rbac/index.js';
import { requireAuth } from '../../core/auth/auth-middleware.js';
import { VendorsController } from './vendors.controller.js';

export const vendorRoutes = Router();

vendorRoutes.use(requireAuth);

vendorRoutes.get(
  '/',
  requirePermission('vendors.view'),
  asyncHandler(VendorsController.list),
);

vendorRoutes.post(
  '/',
  requirePermission('vendors.manage'),
  asyncHandler(VendorsController.create),
);

vendorRoutes.get(
  '/:id',
  requirePermission('vendors.view'),
  asyncHandler(VendorsController.get),
);

vendorRoutes.patch(
  '/:id',
  requirePermission('vendors.manage'),
  asyncHandler(VendorsController.update),
);
