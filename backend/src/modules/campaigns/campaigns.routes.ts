import { Router } from 'express';
import { asyncHandler } from '../../core/http/asyncHandler.js';
import { requireAuth } from '../../core/auth/auth-middleware.js';
import { CampaignsController } from './campaigns.controller.js';
// We allow any authenticated user to view campaigns to create POs
// But we won't implement a full campaigns module right now

export const campaignRoutes = Router();

campaignRoutes.use(requireAuth);

campaignRoutes.get('/', asyncHandler(CampaignsController.list));
campaignRoutes.post('/', asyncHandler(CampaignsController.create));
