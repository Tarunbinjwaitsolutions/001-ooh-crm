import { z } from "zod";

export const taskIdParamSchema =
  z.object({
    id: z
      .string()
      .trim()
      .min(1, "Task id is required"),
  });