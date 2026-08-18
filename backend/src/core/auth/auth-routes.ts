import { Router } from 'express';

import { asyncHandler } from '../http/asyncHandler.js';
import { requirePermission } from '../rbac/index.js';
import { AuthController } from './auth-controller.js';
import { requireAuth } from './auth-middleware.js';

const router = Router();

// --- Public: the two-step login flow -----------------------------------------
router.post('/login', asyncHandler(AuthController.login));
router.post('/verify-otp', asyncHandler(AuthController.verifyOtp));
router.post('/resend-otp', asyncHandler(AuthController.resendOtp));
router.post('/refresh', asyncHandler(AuthController.refresh));

// --- Authenticated ------------------------------------------------------------
router.post('/logout', requireAuth, asyncHandler(AuthController.logout));
router.get('/me', requireAuth, asyncHandler(AuthController.me));

// --- Admin --------------------------------------------------------------------
// Users are created by an administrator, not by self-signup. `npm run seed`
// bootstraps the first accounts.
router.post(
  '/register',
  requireAuth,
  requirePermission('users.create'),
  asyncHandler(AuthController.register),
);

export default router;
