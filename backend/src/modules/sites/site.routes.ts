import { Router } from "express";
import { requireAuth } from "../../core/auth/auth-middleware.js";
import { requirePermission } from "../../core/rbac/index.js";

import {
  createSite,
  getSites,
  getSite,
  updateSite,
  importSites,
} from "./site.controller.js";

const router = Router();

router.use(requireAuth);

/*
  GET /api/sites
  Filters:
  ?city=Mumbai
  ?type=Airport
  ?status=Active
*/
router.get(
  "/",
  requirePermission("sites.view"),
  getSites
);

/*
  GET /api/sites/:id
*/
router.get(
  "/:id",
  requirePermission("sites.view"),
  getSite
);

/*
  POST /api/sites
*/
router.post(
  "/",
  requirePermission("sites.manage"),
  createSite
);

/*
  PATCH /api/sites/:id
*/
router.patch(
  "/:id",
  requirePermission("sites.manage"),
  updateSite
);

/*
  POST /api/sites/import
*/
router.post(
  "/import",
  requirePermission("sites.manage"),
  importSites
);

export default router;