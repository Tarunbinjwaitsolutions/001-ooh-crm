import { z } from 'zod';
import { SITE_TYPES, SITE_STATUSES } from './sites.model.js';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid object ID');

export const createSiteSchema = z.object({
  siteCode: z.string().trim().min(1, 'Site Code is required'),
  city: z.string().trim().min(1, 'City is required'),
  type: z.enum(SITE_TYPES),
  address: z.string().trim().min(1, 'Address is required'),
  gps: z.string().trim().optional(),
  width: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  baseCostPerDay: z.coerce.number().min(0, 'Base cost must be >= 0'),
  vendorId: objectIdSchema,
  status: z.enum(SITE_STATUSES).optional(),
  photos: z.array(z.string()).optional(),
});

export const updateSiteSchema = createSiteSchema.partial();

export const listSitesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  search: z.string().trim().optional(),
  city: z.string().trim().optional(),
  type: z.enum(SITE_TYPES).optional(),
  status: z.enum(SITE_STATUSES).optional(),
});

export const bulkImportSchema = z.object({
  sites: z.array(createSiteSchema).min(1).max(500),
});
