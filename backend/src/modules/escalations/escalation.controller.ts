import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  listEscalations,
  listTaskEscalations,
} from "./escalation.service.js";

export async function getEscalations(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data =
      await listEscalations();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskEscalations(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const taskId = Array.isArray(
      req.params.id,
    )
      ? req.params.id[0]
      : req.params.id;

    const data =
      await listTaskEscalations(
        taskId,
      );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}