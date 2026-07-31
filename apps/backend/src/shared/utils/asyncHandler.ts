import { NextFunction, Request, Response, RequestHandler } from 'express';

// Wraps async controllers so any rejected promise (thrown error) is
// automatically forwarded to next() — without this, Express silently
// swallows async errors and the request just hangs.
export const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };