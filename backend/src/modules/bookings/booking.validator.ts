import { z } from "zod";

export const createBookingSchema = z
  .object({
    siteId: z.string().min(1),
    campaignId: z.string().min(1),
    quotationId: z.string().optional(),

    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine(
    (data) => data.to >= data.from,
    {
      message:
        "End date must be after or equal to start date",
      path: ["to"],
    },
  );

export const availabilityQuerySchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine(
    (data) => data.to >= data.from,
    {
      message:
        "End date must be after or equal to start date",
      path: ["to"],
    },
  );