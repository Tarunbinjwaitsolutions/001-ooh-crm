import { Router } from 'express';
import { asyncHandler } from '../../core/http/asyncHandler.js';
import { requirePermission } from '../../core/rbac/index.js';
import { requireAuth } from '../../core/auth/auth-middleware.js';
import { PurchaseOrdersController } from './purchase-orders.controller.js';

export const purchaseOrderRoutes = Router();

purchaseOrderRoutes.use(requireAuth);

purchaseOrderRoutes.get(
  '/',
  requirePermission('purchase_orders.view'),
  asyncHandler(PurchaseOrdersController.list),
);

purchaseOrderRoutes.post(
  '/',
  requirePermission('purchase_orders.manage'),
  asyncHandler(PurchaseOrdersController.create),
);

purchaseOrderRoutes.get(
  '/:id',
  requirePermission('purchase_orders.view'),
  asyncHandler(PurchaseOrdersController.get),
);

purchaseOrderRoutes.patch(
  '/:id/status',
  requirePermission('purchase_orders.manage'),
  asyncHandler(PurchaseOrdersController.updateStatus),
);

purchaseOrderRoutes.get(
  '/:id/pdf',
  requirePermission('purchase_orders.view'),
  asyncHandler(PurchaseOrdersController.downloadPDF),
);
