import { Router } from "express";

import {
  createSite,
  getSites,
  getSite,
  updateSite,
  importSites,
} from "./site.controller.js";

const router = Router();

/*
  GET /api/sites
  Filters:
  ?city=Mumbai
  ?type=Airport
  ?status=Active
*/
router.get(
  "/",
  getSites
);

/*
  GET /api/sites/:id
*/
router.get(
  "/:id",
  getSite
);

/*
  POST /api/sites
*/
router.post(
  "/",
  createSite
);

/*
  PATCH /api/sites/:id
*/
router.patch(
  "/:id",
  updateSite
);

/*
  POST /api/sites/import
*/
router.post(
  "/import",
  importSites
);

export default router;