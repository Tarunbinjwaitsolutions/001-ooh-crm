import { Router } from "express";

import { requireAuth } from "../../core/auth/auth-middleware.js";
import { requirePermission } from "../../core/rbac/index.js";

import * as controller from "./vendor.controller.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  requirePermission("vendors.view"),
  controller.list,
);

router.get(
  "/filters",
  requirePermission("vendors.view"),
  controller.filters,
);

router.get(
  "/:id/sites",
  requirePermission("vendors.view"),
  controller.getSites,
);

router.get(
  "/:id",
  requirePermission("vendors.view"),
  controller.getById,
);

router.post(
  "/",
  requirePermission("vendors.manage"),
  controller.create,
);

router.patch(
  "/:id",
  requirePermission("vendors.manage"),
  controller.update,
);

router.patch(
  "/:id/deactivate",
  requirePermission("vendors.manage"),
  controller.deactivate,
);

export default router;