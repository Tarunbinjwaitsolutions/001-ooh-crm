import { z } from "zod";

export const updateTaskSchema = z.object({
  status: z
    .enum([
      "Pending",
      "InProgress",
      "Completed",
    ])
    .optional(),

  assignedTo: z
    .string()
    .trim()
    .min(1)
    .optional(),
});

export const createTaskTemplateSchema =
  z.object({
    type: z.enum([
      "Printing",
      "Installation",
      "Verification",
      "Removal",
      "Custom",
    ]),

    title: z.string().trim().min(1),

    offsetDays: z.number().int(),

    proofRequired: z.boolean().optional(),

    role: z.string().trim().optional(),

    active: z.boolean().optional(),
  });