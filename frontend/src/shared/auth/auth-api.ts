import { api } from '../api/client';
import type { AuthSessionResponse, AuthUser, LoginChallengeResponse } from './types';

/**
 * The auth endpoints. Sign-in is two steps:
 *   1. startLogin(email, password)  -> a challenge
 *   2. verifyOtp(challengeId, code) -> a session
 */
export const authApi = {
  startLogin: (email: string, password: string) =>
    api.post<LoginChallengeResponse>('/api/auth/login', { email, password }, { skipAuth: true }),

  resendOtp: (challengeId: string) =>
    api.post<LoginChallengeResponse>('/api/auth/resend-otp', { challengeId }, { skipAuth: true }),

  verifyOtp: (challengeId: string, code: string) =>
    api.post<AuthSessionResponse>(
      '/api/auth/verify-otp',
      { challengeId, code },
      { skipAuth: true },
    ),

  me: () => api.get<{ user: AuthUser }>('/api/auth/me'),

  logout: (refreshToken: string | null) =>
    api.post<{ message: string }>('/api/auth/logout', refreshToken ? { refreshToken } : {}),
};
