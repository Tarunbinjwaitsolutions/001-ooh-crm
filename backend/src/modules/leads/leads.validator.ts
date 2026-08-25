import { z } from 'zod';
import { LEAD_SOURCES, LEAD_STATUSES, LOCATION_PREFERENCES } from './leads.model.js';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid object ID');

export const leadQualificationSchema = z.object({
  city: z.string().trim().optional(),
  locationPreference: z.enum(LOCATION_PREFERENCES).optional(),
  campaignDuration: z.string().trim().optional(),
  budget: z.coerce.number().min(0).optional(),
  targetAudience: z.string().trim().optional(),
  campaignObjective: z.string().trim().optional(),
  creativeRequirements: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  lostReason: z.string().trim().optional(),
});

export const createLeadSchema = z.object({
  companyName: z.string().trim().min(1, 'Company Name is required'),
  contactPerson: z.string().trim().min(1, 'Contact Person is required'),
  mobile: z.string().trim().min(1, 'Mobile is required'),
  email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
  city: z.string().trim().min(1, 'City is required'),
  source: z.enum(LEAD_SOURCES),
  qualification: leadQualificationSchema.optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z.enum(LEAD_STATUSES).optional(),
});

export const listLeadsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  search: z.string().trim().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  city: z.string().trim().optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  assignedTo: objectIdSchema.optional(),
  assignedToMe: z.coerce.boolean().optional(),
  unassigned: z.coerce.boolean().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});
