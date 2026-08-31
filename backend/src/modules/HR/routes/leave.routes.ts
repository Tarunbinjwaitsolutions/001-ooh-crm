import { Router } from 'express';
import { requireAuth } from '../../../core/auth/auth-middleware.js';
import { requirePermission } from '../../../core/rbac/index.js';
import * as controller from '../controller/leave.controller.js';

export const leaveRoutes = Router();

leaveRoutes.use(requireAuth);

leaveRoutes.get('/types', requirePermission('leave.self'), controller.getLeaveTypes);
leaveRoutes.post('/types', requirePermission('leave.manage'), controller.createLeaveType);

leaveRoutes.get('/balance', requirePermission('leave.self'), controller.getBalance);

leaveRoutes.post('/apply', requirePermission('leave.self'), controller.applyLeave);
leaveRoutes.get('/me', requirePermission('leave.self'), controller.getMyRequests);

leaveRoutes.get('/team', requirePermission('leave.manage'), controller.getTeamRequests);
leaveRoutes.post('/:id/approve', requirePermission('leave.manage'), controller.approveLeave);
leaveRoutes.post('/:id/reject', requirePermission('leave.manage'), controller.rejectLeave);
