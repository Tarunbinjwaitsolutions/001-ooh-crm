import { NextFunction, Request, Response } from 'express';

import { ForbiddenError, UnauthorizedError } from '../errors/index.js';
import { Permission, Role, roleHasPermission } from './permissions.js';

export * from './permissions.js';

/**
 * Route guard by permission. This is the one you should reach for —
 * every route declares its permission, no route ships without one.
 *
 *   router.get('/', requireAuth, requirePermission('leads.view'), controller.list);
 */
export const requirePermission =
  (permission: Permission) => (req: Request, _res: Response, next: NextFunction) => {
    const user = req.ctx?.user;
    if (!user) {
      next(
        new UnauthorizedError('User context missing. Use requireAuth before requirePermission.'),
      );
      return;
    }

    if (!roleHasPermission(user.role, permission)) {
      next(new ForbiddenError(`Your role (${user.role}) cannot perform "${permission}"`));
      return;
    }

    next();
  };

/**
 * Route guard by role. Use only where a check genuinely is about identity
 * rather than capability — prefer `requirePermission`.
 */
export const requireRole =
  (allowedRoles: Role[]) => (req: Request, _res: Response, next: NextFunction) => {
    const user = req.ctx?.user;
    if (!user) {
      next(new UnauthorizedError('User context missing. Use requireAuth before requireRole.'));
      return;
    }

    if (!allowedRoles.includes(user.role as Role)) {
      next(new ForbiddenError(`Access denied. Required one of: ${allowedRoles.join(', ')}`));
      return;
    }

    next();
  };
