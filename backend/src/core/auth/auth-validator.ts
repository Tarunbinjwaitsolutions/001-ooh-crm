import { z } from 'zod';

import { ROLES } from '../rbac/permissions.js';

/**
 * Server-side validation. Client-side validation is for UX only —
 * every endpoint validates here, always.
 */

const email = z.string().trim().toLowerCase().email('Enter a valid email address');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email,
  password,
  role: z.enum(ROLES).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  challengeId: z.string().trim().min(1, 'Challenge id is required'),
  code: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, 'Enter the numeric code from your email'),
});

export const resendOtpSchema = z.object({
  challengeId: z.string().trim().min(1, 'Challenge id is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().trim().min(1).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
