import { z } from 'zod';
import { VENDOR_STATUSES } from './vendors.model.js';

export const createVendorSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  city: z.string().trim().min(1, 'City is required'),
  siteOwnerName: z.string().trim().min(1, 'Site Owner Name is required'),
  contactPerson: z.string().trim().min(1, 'Contact Person is required'),
  mobile: z.string().trim().min(1, 'Mobile is required'),
  email: z.string().trim().email('Invalid email').or(z.literal('')),
  address: z.string().trim().min(1, 'Address is required'),
  gstNumber: z.string().trim().optional(),
  paymentTerms: z.string().trim().optional(),
  bankAccount: z.string().trim().optional(),
  ifscCode: z.string().trim().optional(),
  status: z.enum(VENDOR_STATUSES).optional(),
});

export const updateVendorSchema = createVendorSchema.partial();

export const listVendorsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  search: z.string().trim().optional(),
  city: z.string().trim().optional(),
  status: z.enum(VENDOR_STATUSES).optional(),
});
