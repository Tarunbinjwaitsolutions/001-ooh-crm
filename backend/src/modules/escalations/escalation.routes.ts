import { Router } from "express";

import {
  getEscalations,
  getTaskEscalations,
} from "./escalation.controller.js";

const router = Router();

router.get(
  "/escalations",
  getEscalations,
);

router.get(
  "/tasks/:id/escalations",
  getTaskEscalations,
);

export default router;