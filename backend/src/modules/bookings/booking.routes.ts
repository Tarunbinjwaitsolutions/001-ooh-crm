import { Router } from "express";

import {
  requireAuth,
} from "../../core/auth/auth-middleware.js";

import {
  requirePermission,
} from "../../core/rbac/index.js";

import {
  createBooking,
  siteAvailability,
  availableSites,
  releaseCampaignBookings,
} from "./booking.controller.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/sites/available",
  requirePermission("sites.view"),
  availableSites,
);

router.get(
  "/sites/:id/availability",
  requirePermission("sites.view"),
  siteAvailability,
);

router.post(
  "/bookings",
  requirePermission("bookings.manage"),
  createBooking,
);

router.delete(
  "/bookings/campaign/:campaignId",
  requirePermission("bookings.manage"),
  releaseCampaignBookings,
);

export default router;