import { Request, RequestHandler } from 'express';
import { ZodType, z } from 'zod';

export interface RequestWithValidatedQuery<Q> extends Request {
  validatedQuery: Q;
}

export const validateQuery =
  <T extends ZodType>(schema: T): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ success: false, errors: result.error.flatten() });
      return;
    }
    (req as RequestWithValidatedQuery<z.infer<T>>).validatedQuery = result.data;
    next();
  };