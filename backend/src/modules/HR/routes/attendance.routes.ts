import { Router } from 'express';
import { requireAuth } from '../../../core/auth/auth-middleware.js';
import * as controller from '../controller/attendance.controller.js';

export const attendanceRoutes = Router();

// Routes for Attendance
attendanceRoutes.use(requireAuth);

attendanceRoutes.post('/check-in', controller.checkIn);
attendanceRoutes.post('/check-out', controller.checkOut);
attendanceRoutes.get('/me', controller.getMine);
attendanceRoutes.get('/team', controller.getTeam);
