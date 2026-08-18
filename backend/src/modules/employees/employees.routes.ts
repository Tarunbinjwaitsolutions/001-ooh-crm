import { Router } from 'express';

import { requireAuth } from '../../core/auth/auth-middleware.js';
import { asyncHandler } from '../../core/http/asyncHandler.js';
import { requirePermission } from '../../core/rbac/index.js';
import { EmployeesController } from './employees.controller.js';

/**
 * REFERENCE MODULE — routes.
 *
 * Every route declares a permission. No exceptions, including read-only ones.
 * Note the ordering: literal paths (`/me`, `/manager-options`) are registered
 * before `/:id`, otherwise Express matches "me" as an id.
 */
const router = Router();

router.use(requireAuth);

router.get('/me', requirePermission('employees.self'), asyncHandler(EmployeesController.me));

router.get(
  '/manager-options',
  requirePermission('employees.view'),
  asyncHandler(EmployeesController.managerOptions),
);

router.get('/', requirePermission('employees.view'), asyncHandler(EmployeesController.list));

router.post('/', requirePermission('employees.manage'), asyncHandler(EmployeesController.create));

router.get('/:id', requirePermission('employees.view'), asyncHandler(EmployeesController.getById));

router.get(
  '/:id/reports',
  requirePermission('employees.view'),
  asyncHandler(EmployeesController.directReports),
);

router.patch(
  '/:id',
  requirePermission('employees.manage'),
  asyncHandler(EmployeesController.update),
);

router.delete(
  '/:id',
  requirePermission('employees.manage'),
  asyncHandler(EmployeesController.deactivate),
);

export default router;
