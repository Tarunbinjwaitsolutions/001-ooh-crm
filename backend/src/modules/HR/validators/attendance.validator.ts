// src/modules/attendance/attendance.validator.ts
import { z } from 'zod';

const gpsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
}).optional();

export const checkInSchema = z.object({
  gps: gpsSchema,
  workType: z.enum(['Office', 'Remote', 'Field Visit']).optional(),
  deviceInfo: z.string().optional(),
});

export const checkOutSchema = z.object({
  gps: gpsSchema,
});