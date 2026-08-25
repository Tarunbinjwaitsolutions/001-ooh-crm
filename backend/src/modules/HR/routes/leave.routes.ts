import { Router } from 'express';
import { requireAuth } from '../../../core/auth/auth-middleware.js';
import * as controller from '../controller/leave.controller.js';

export const leaveRoutes = Router();

leaveRoutes.use(requireAuth);

leaveRoutes.get('/types', controller.getLeaveTypes);
leaveRoutes.post('/types', controller.createLeaveType);

leaveRoutes.get('/balance', controller.getBalance);

leaveRoutes.post('/apply', controller.applyLeave);
leaveRoutes.get('/me', controller.getMyRequests);

leaveRoutes.get('/team', controller.getTeamRequests);
leaveRoutes.post('/:id/approve', controller.approveLeave);
leaveRoutes.post('/:id/reject', controller.rejectLeave);
