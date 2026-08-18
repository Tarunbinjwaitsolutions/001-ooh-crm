import type { Permission, Role } from './rbac/permissions.js';

/**
 * The request context. `requireAuth` builds it once per request and every layer
 * below (services, scoping, audit) reads it instead of re-reading the token.
 */
export interface RequestContext {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    permissions: readonly Permission[];
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      ctx?: RequestContext;
    }
  }
}

export {};
