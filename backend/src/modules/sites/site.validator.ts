import { z } from "zod";

import {
  SiteStatus,
  SiteType,
} from "./site.model.js";

export const createSiteSchema = z.object({
  city: z
    .string()
    .trim()
    .min(2, "City is required"),

  type: z.nativeEnum(SiteType),

  address: z
    .string()
    .trim()
    .optional(),

  gps: z.object({
    lat: z
      .number()
      .min(-90, "Invalid latitude")
      .max(90, "Invalid latitude"),

    lng: z
      .number()
      .min(-180, "Invalid longitude")
      .max(180, "Invalid longitude"),
  }),

  sizeWidth: z
    .number()
    .positive("Width must be greater than 0"),

  sizeHeight: z
    .number()
    .positive("Height must be greater than 0"),

  baseCostPerDay: z
    .number()
    .int("Cost must be an integer")
    .nonnegative("Cost cannot be negative"),

  vendorId: z
    .string()
    .nullable()
    .optional(),

  status: z.nativeEnum(SiteStatus).optional(),

  photos: z
    .array(z.string())
    .optional(),
});

export const updateSiteSchema =
  createSiteSchema.partial();

export const siteQuerySchema = z.object({
  city: z.string().optional(),

  type: z.nativeEnum(SiteType).optional(),

  status: z.nativeEnum(SiteStatus).optional(),

  search: z
    .string()
    .optional(),
});

export type CreateSiteInput =
  z.infer<typeof createSiteSchema>;

export type UpdateSiteInput =
  z.infer<typeof updateSiteSchema>;