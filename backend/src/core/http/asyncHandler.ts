import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async controller so a rejected promise reaches the central error
 * handler instead of hanging the request.
 *
 *   router.get('/', asyncHandler(controller.list));
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
