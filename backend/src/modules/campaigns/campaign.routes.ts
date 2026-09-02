import { Router } from "express";

import {
  createCampaignController,
  createCampaignFromQuotationController,
  getCampaignController,
  listCampaignsController,
  updateCampaignStatusController,
} from "./campaign.controller.js";

const router = Router();

/*
 * GET /api/campaigns
 *
 * Filters:
 * ?status=Draft
 * ?city=Indore
 * ?manager=<id>
 * ?startDate=2026-08-01
 * ?endDate=2026-08-31
 */
router.get(
  "/",
  listCampaignsController,
);

/*
 * GET /api/campaigns/:id
 */
router.get(
  "/:id",
  getCampaignController,
);

/*
 * POST /api/campaigns
 */
router.post(
  "/",
  createCampaignController,
);

/*
 * PATCH /api/campaigns/:id/status
 *
 * Body:
 * {
 *   "status": "Approved"
 * }
 */
router.patch(
  "/:id/status",
  updateCampaignStatusController,
);

/*
 * B3 -> D1
 *
 * Create campaign when quotation is accepted.
 *
 * Body:
 * {
 *   "quotationId": "..."
 * }
 *
 * This route is optional if B3 directly imports
 * createFromQuotation() as a service method.
 */
router.post(
  "/from-quotation",
  createCampaignFromQuotationController,
);

export default router;