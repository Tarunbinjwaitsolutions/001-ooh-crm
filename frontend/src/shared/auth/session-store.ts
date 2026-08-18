import type { AuthUser } from './types';

/**
 * Where the session lives in the browser.
 *
 * Tokens are kept in localStorage for now, which is the simplest thing that
 * works for a single-page dashboard in development. When the app is deployed
 * behind one domain, move the refresh token to an httpOnly cookie — the only
 * file that has to change is this one.
 */

const ACCESS_TOKEN_KEY = 'mo.accessToken';
const REFRESH_TOKEN_KEY = 'mo.refreshToken';
const USER_KEY = 'mo.user';

const isBrowser = () => typeof window !== 'undefined';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const sessionStore = {
  getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  save(session: StoredSession): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  },

  saveUser(user: AuthUser): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};
