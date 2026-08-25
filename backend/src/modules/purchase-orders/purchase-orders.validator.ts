import { z } from 'zod';
import { PO_STATUSES } from './purchase-orders.model.js';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid object ID');

export const createPurchaseOrderSchema = z.object({
  campaignId: objectIdSchema,
  vendorId: objectIdSchema,
  sites: z.array(z.object({
    siteId: objectIdSchema,
    negotiatedRate: z.coerce.number().min(0),
  })).min(1, 'At least one site is required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(PO_STATUSES),
});

export const listPurchaseOrdersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  search: z.string().trim().optional(),
  status: z.enum(PO_STATUSES).optional(),
});
