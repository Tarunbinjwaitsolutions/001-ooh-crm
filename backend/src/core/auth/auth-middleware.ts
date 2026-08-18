import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../../config/index.js';
import '../context.js';
import { UnauthorizedError } from '../errors/index.js';
import { isRole, permissionsForRole, type Role } from '../rbac/permissions.js';

interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Verifies the access token and builds `req.ctx`. Every authenticated route
 * runs this before its permission guard.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Authentication required. No token provided.'));
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AccessTokenPayload;

    if (!isRole(decoded.role)) {
      next(new UnauthorizedError('Token carries an unknown role. Please sign in again.'));
      return;
    }

    const role: Role = decoded.role;

    req.ctx = {
      user: {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role,
        permissions: permissionsForRole(role),
      },
    };

    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
